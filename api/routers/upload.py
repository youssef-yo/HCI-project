import threading
import asyncio
import mimetypes

import shutil
import tempfile
from pathlib import Path
from typing import BinaryIO
import uuid
from bson import ObjectId

from owlready2 import *
from rdflib import Graph

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    status,
    UploadFile
)
from fastapi.encoders import jsonable_encoder

from app.preprocess import preprocess

from db.database import MongoClient, get_db

from models.schemas import (
    DocumentOutResponse,
    OntoClass,
    OntoProperty,
    OntologyData
)
from models.domain import (
    DocStructureDocument,
    DocumentDocument,
    OntologyDocument,
    UserDocument
)

from services.oauth2 import get_current_admin

from typing import List
from motor.motor_asyncio import AsyncIOMotorClient
import concurrent.futures
from beanie import PydanticObjectId

router = APIRouter()

@router.post("/upload")
async def upload(
    user: UserDocument = Depends(get_current_admin),
    files: List[UploadFile] = File(...),
    db: MongoClient = Depends(get_db)
):
    # Save the files in db and get their ID
    file_ids = []
    for file in files:
        file_ids.append(await save_file_to_database(file, db))

    # Avvia il processo di elaborazione in background per ogni file
    for file, file_id in zip(files, file_ids):
        # await process_uploaded_file.delay(file.filename, file_id, db)
        # Recupera il file dal GridFS usando l'ID
        file_data = await find_document_by_id(db, file_id)
        if file_data:
            pdf = str(file.filename)
            pdf_name = Path(pdf).stem
            threading.Thread(target=upload_document_from_id, args=(pdf_name, file_id, file_data, db)).start()
            # asyncio.create_task(upload_document_from_id(file.filename, file_id, file_data, db))
        else:
            raise HTTPException(status_code=404, detail="File non trovato nel database")

    return {"message": "Operazione di upload avviata in background."}

# def between_callback(filename, file_id, file_data, db):
#     async def run_upload():
#         await upload_document_from_id(filename, file_id, file_data, db)

#     loop = asyncio.new_event_loop()
#     asyncio.set_event_loop(loop)
#     loop.run_until_complete(run_upload())
#     loop.close()


async def find_document_by_id(db, file_id):
    async for file in db.gridFS.find({"_id": ObjectId(file_id)}):
        return file


async def save_file_to_database(file: UploadFile, db: MongoClient):
    file.file.seek(0)
    file_id = await db.gridFS.upload_from_stream(
        file.filename,
        file.file,
        metadata={"contentType": file.content_type}
    )
    return file_id

def upload_document_from_id(filename: str, file_id: PydanticObjectId, file_data, db: MongoClient):
    """
    Carica un documento dal database usando l'ID del file.
    """
    def upload_sync():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        structure = loop.run_until_complete(analyze(filename, file_id, file_data))
        loop.run_until_complete(upload(filename, file_id, structure))
        loop.close()
    with concurrent.futures.ThreadPoolExecutor() as executor:
        executor.submit(upload_sync)
    
        
# async def create_document(document):
#     print('arrivo1')
#     await document.create()
#     print('Arrivo2')

async def analyze(filename: str, file_id: PydanticObjectId, file_data):
    structure = preprocess("pdfplumber", file_data)

    return structure

async def upload(filename: str, file_id: PydanticObjectId, structure):
    npages = len(structure)
    print(filename)
    print(file_id)
    print(npages)
    # file_data = find_document_by_id(db, file_id)
    # if file_data:
    #     print("Nice")
    # else:
    #     print("mae")
    document = DocumentDocument(
        name=filename,
        file_id=file_id,
        total_pages=npages,
    )
    # task_document = asyncio.create_task(document.create())
    # task_doc_structure = asyncio.create_task(doc_structure.create())
    try:
        await asyncio.wait_for(document.create(), timeout=5)
        doc_structure = DocStructureDocument(   
            doc_id=document.id,
            structure=structure
        )
        await asyncio.wait_for(doc_structure.create(), timeout=5)
    except asyncio.TimeoutError:
        print("Timeout durante l'attesa del completamento dei task.")
    

@router.post("/upload_analyze")
async def pre_upload(
    user: UserDocument = Depends(get_current_admin),
    file: UploadFile = File(...),
    db: MongoClient = Depends(get_db)
):

    def upload_analyze_document(
        temp_file_path: str,  # Passa il percorso del file temporaneo anziché il file stesso
        original_filename: str,  # Passa il nome del file originale
        db: MongoClient
    ):
        # Apri il file temporaneo in modalità lettura binaria
        with open(temp_file_path, 'rb') as temp_file:
            pdf_name = Path(original_filename).stem

            # Processa il file temporaneo
            #TODO: PROBLEMA è qua
            structure = preprocess("pdfplumber", temp_file)

            npages = len(structure)

            # Resetta il puntatore del file all'inizio
            temp_file.seek(0)

            # Ottieni il tipo di contenuto del file
            content_type, _ = mimetypes.guess_type(original_filename)

            document = DocumentDocument(
                name=pdf_name,
                file_id=file_id,
                total_pages=npages,
            )
            
            # Upload del file dal file temporaneo
            file_id = asyncio.run(db.gridFS.upload_from_stream(
                original_filename,  # Usa il nome del file originale
                temp_file,
                metadata={"contentType": content_type}
            ))

            
            asyncio.run(document.create())

            doc_structure = DocStructureDocument(
                doc_id=document.id,
                structure=structure
            )
            asyncio.run(doc_structure.create())

    # Utilizza threading per eseguire l'operazione in un thread separato
    def run_upload_analyze_document(file: UploadFile, db: MongoClient):
        # Crea una copia del file
        copied_file_path = f"copy_{file.filename}"
        with open(copied_file_path, 'wb') as copied_file:
            copied_file.write(file.file.read())

            # Esegui l'analisi del documento in un thread separato
            threading.Thread(target=upload_analyze_document, args=(copied_file_path, file.filename, db)).start()

    run_upload_analyze_document(file, db)
    
    # Ritorna una risposta immediata
    return {"message": "Operazione di upload avviata in un thread separato."}

@router.post("/doc", response_model=DocumentOutResponse)
async def upload_document(
    user: UserDocument = Depends(get_current_admin),
    file: UploadFile = File(...),
    db: MongoClient = Depends(get_db)
) -> DocumentOutResponse:
    """
    Uploads a PDF file.
    It also extracts the PDF structure (pages and tokens) for later use.
    """
    # TODO: Use transactions to ensure atomicity
    # TODO: Maybe implement a progress tracker... this operation can take long
    pdf = str(file.filename)
    pdf_name = Path(pdf).stem

    print(f"File: {file.filename}")
    print(f"Content Type: {file.content_type}")
    print(f"Size: {file.size}")
    print(f"Headers: {file.headers}")

    structure = preprocess("pdfplumber", file.file)
    npages = len(structure)

    # Upload the document file with GridFS
    file.file.seek(0)
    file_id = await db.gridFS.upload_from_stream(
        file.filename,
        file.file,
        metadata={"contentType": file.content_type}
    )

    # Upload the document data
    document = DocumentDocument(
        name=pdf_name,
        file_id=file_id,
        total_pages=npages,
    )
    await document.create()

    # Upload the PDF structure in a separate collection (maybe in future in GridFS).
    # This is because the structure can be quite large, and could hinder the
    # performance for simpler document queries that do not involve the structure itself.
    doc_structure = DocStructureDocument(
        doc_id=document.id,
        structure=structure
    )
    await doc_structure.create()

    return document


@router.post("/ontology", response_model=OntologyData)
async def upload_ontology(
    user: UserDocument = Depends(get_current_admin),
    file: UploadFile = File(...),
    db: MongoClient = Depends(get_db)
) -> OntologyData:
    """
    Uploads an ontology file.
    It also extracts the ontology data (classes and properties) for later use.
    """
    # TODO: Use transactions to ensure atomicity
    onto = str(file.filename)
    onto_name = Path(onto).stem
    stored_onto = await OntologyDocument.find_one(OntologyDocument.name == onto_name)

    if stored_onto:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ontology {onto_name} already exists."
        )

    print(f"File: {file.filename}")
    print(f"Content Type: {file.content_type}")
    print(f"Size: {file.size}")
    print(f"Headers: {file.headers}")

    # Analyzing the contents of the uploaded ontology file
    result = analyze_ontology(file.file)

    # Upload the ontology file with GridFS
    file.file.seek(0)
    file_id = await db.gridFS.upload_from_stream(
        file.filename,
        file.file,
        metadata={"contentType": file.content_type}
    )

    # Store the ontology document in the database
    ontology = OntologyDocument(
        name=onto_name,
        file_id=ObjectId(file_id),
        data=result
    )
    await ontology.create()

    return result



def analyze_ontology(file: BinaryIO) -> OntologyData:
    # https://owlready2.readthedocs.io/en/v0.37/onto.html -> Loading an ontology from OWL files

    g = Graph()

    classes_result = list()
    properties_result = list()

    # Before 3.11 SpooledTemporaryFile does not implement "seekable", so we have to use a workaround
    # https://stackoverflow.com/questions/73023050/loading-an-ontology-from-string-in-python -> Load from binary file
    with tempfile.NamedTemporaryFile() as tf:
        file.seek(0)
        shutil.copyfileobj(file, tf)

        g.parse(tf)
        tf.seek(0)

        # Must se reload as True, otherwise it will use the previously loaded ontology
        onto = get_ontology("file://").load(fileobj=tf, reload=True)

    prop_domain = {}
    prop_range = {}

    # getting all the possible domain for all properties
    q = """
        prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        prefix owl:   <http://www.w3.org/2002/07/owl#>
        prefix xsd:   <http://www.w3.org/2001/XMLSchema#>
        prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#>

        select ?p ?d where {
            ?p rdfs:domain/(owl:unionOf/rdf:rest*/rdf:first)* ?d
            filter isIri(?d)
        }
    """
    for r in g.query(q):
        if prop_domain.get(str(r["p"])) is not None:
            prop_domain.get(str(r["p"])).append(str(r["d"]))
        else:
            prop_domain[str(r["p"])] = [str(r["d"])]

    # getting all the possible range for all properties
    q = """
        prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        prefix owl:   <http://www.w3.org/2002/07/owl#>
        prefix xsd:   <http://www.w3.org/2001/XMLSchema#>
        prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#>

        select ?p ?d where {
            ?p rdfs:range/(owl:unionOf/rdf:rest*/rdf:first)* ?d
            filter isIri(?d)
        }
    """
    for r in g.query(q):
        if prop_range.get(str(r["p"])) is not None:
            prop_range.get(str(r["p"])).append(str(r["d"]))
        else:
            prop_range[str(r["p"])] = [str(r["d"])]
    ##############################################

    def extractNameFromIri(entity):
        return entity.iri.rsplit('/', 1)[-1]

    def getClasses():
        colors = ["#FF0000", "#EFDDF5", "#CEEBFC", "#FFDA77", "#A8DDA8", "#B8DE6F", "#70DDBA", "#C6CC82"]
        current_i_color = 0

        for entity in onto.classes():
            className = extractNameFromIri(entity)

            ontoClass = OntoClass(
                id=str(uuid.uuid4()),
                text=className,
                baseIri=onto.base_iri,
                iri=entity.iri,
                labelFromOwlready=str(entity),
                color=""
            )

            if current_i_color == len(colors):
                current_i_color = 0
                ontoClass.color = colors[current_i_color]
                current_i_color += 1
            else:
                ontoClass.color = colors[current_i_color]
                current_i_color += 1

            classes_result.append(ontoClass)

    def getProperties():
        for data_property in list(onto.data_properties()):
            propertyName = extractNameFromIri(data_property)

            ontoProperty = OntoProperty(
                id=str(uuid.uuid4()),
                text=propertyName,
                baseIri=onto.base_iri,
                iri=data_property.iri,
                labelFromOwlready=str(data_property),
                domain=prop_domain.get(data_property.iri, []),
                range=prop_range.get(data_property.iri, [])
            )

            properties_result.append(ontoProperty)

        for object_property in list(onto.object_properties()):
            propertyName = extractNameFromIri(object_property)

            ontoProperty = OntoProperty(
                id=str(uuid.uuid4()),
                text=propertyName,
                baseIri=onto.base_iri,
                iri=object_property.iri,
                labelFromOwlready=str(object_property),
                domain=prop_domain.get(object_property.iri, []),
                range=prop_range.get(object_property.iri, [])
            )

            properties_result.append(ontoProperty)

    getClasses()
    getProperties()

    json_classes = [jsonable_encoder(c) for c in classes_result]
    json_properties = [jsonable_encoder(p) for p in properties_result]

    return {"classes": json_classes, "properties": json_properties}
