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
    files_duplicate = []
    for file in files:
        pdf = str(file.filename)
        pdf_name = Path(pdf).stem
        stored_onto = await DocumentDocument.find_one(DocumentDocument.name == pdf_name)

        if stored_onto:
            files_duplicate.append(file.filename)
        else:
            file_id = await save_file_to_database(file, db)
            file_ids.append(file_id)
            # #IDEA: salvare un file con lo stesso id e nel nome in fondo ha ".LOADING"
            # #TODO: il thread dovrà rimuovere il file ".LOADING" quando finisce
            # #TODO: periodicamente si potrebbero togliere i file ".LOADING" oppure potrebbero essere dei file temporanei(?)
            await save_tmp_loading_document_to_database(file.filename, file_id)

    if files_duplicate:
        raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=files_duplicate
            )
    for file, file_id in zip(files, file_ids):
        file_data = await find_document_by_id(db, file_id)
        if file_data:
            pdf = str(file.filename)
            pdf_name = Path(pdf).stem
            threading.Thread(target=upload_document_from_id, args=(pdf_name, file_id, file_data, db, file.filename)).start()
            # TODO: quando il thread si chiude bisognerebbe fare: updateTable();
        else:
            raise HTTPException(status_code=404, detail="File non trovato nel database")

    return {"message": "Operazione di upload avviata in background."}


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

async def save_tmp_loading_document_to_database(filename: str, file_id: PydanticObjectId):
    name = filename + '.LOADING'
    document = DocumentDocument(
        name=name,
        file_id=file_id,
        total_pages=0,
    )
    await document.create()

def upload_document_from_id(pdf_name: str, file_id: PydanticObjectId, file_data, db: MongoClient, filename: str):
    """
    Carica un documento dal database usando l'ID del file.
    """
    def upload_sync():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        structure = loop.run_until_complete(analyze(pdf_name, file_id, file_data))
        loop.run_until_complete(upload(pdf_name, file_id, structure, db))
        loop.run_until_complete(delete_tmp_loading_document(filename, db))
        loop.close()
    with concurrent.futures.ThreadPoolExecutor() as executor:
        executor.submit(upload_sync)
    
async def delete_tmp_loading_document(filename: str, db: MongoClient):
    name = filename + '.LOADING'
    try:
        document = DocumentDocument.find_one(DocumentDocument.name == name)
        if document:
            try:
                await document.delete()
            except Exception as e:
                pass
    except Exception as e:
        pass


async def analyze(filename: str, file_id: PydanticObjectId, file_data):
    structure = preprocess("pdfplumber", file_data)

    return structure

async def upload(filename: str, file_id: PydanticObjectId, structure, db: MongoClient = Depends(get_db)):
    npages = len(structure)
    document = DocumentDocument(
        name=filename,
        file_id=file_id,
        total_pages=npages,
    )
    
    try:
        await document.create()
    except Exception as e:
        pass
    try:
        doc_structure = DocStructureDocument(   
            doc_id=document.id,
            structure=structure
        )
        await doc_structure.create()
    except Exception as e:
        pass

# @router.post("/doc", response_model=DocumentOutResponse)
# async def upload_document(
#     user: UserDocument = Depends(get_current_admin),
#     file: UploadFile = File(...),
#     db: MongoClient = Depends(get_db)
# ) -> DocumentOutResponse:
#     """
#     Uploads a PDF file.
#     It also extracts the PDF structure (pages and tokens) for later use.
#     """
#     # TODO: Use transactions to ensure atomicity
#     # TODO: Maybe implement a progress tracker... this operation can take long
#     pdf = str(file.filename)
#     pdf_name = Path(pdf).stem

#     print(f"File: {file.filename}")
#     print(f"Content Type: {file.content_type}")
#     print(f"Size: {file.size}")
#     print(f"Headers: {file.headers}")

#     structure = preprocess("pdfplumber", file.file)
#     npages = len(structure)

#     # Upload the document file with GridFS
#     file.file.seek(0)
#     file_id = await db.gridFS.upload_from_stream(
#         file.filename,
#         file.file,
#         metadata={"contentType": file.content_type}
#     )

#     # Upload the document data
#     document = DocumentDocument(
#         name=pdf_name,
#         file_id=file_id,
#         total_pages=npages,
#     )
#     await document.create()

#     # Upload the PDF structure in a separate collection (maybe in future in GridFS).
#     # This is because the structure can be quite large, and could hinder the
#     # performance for simpler document queries that do not involve the structure itself.
#     doc_structure = DocStructureDocument(
#         doc_id=document.id,
#         structure=structure
#     )
#     await doc_structure.create()

#     return document


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
