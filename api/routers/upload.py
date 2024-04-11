import threading
import asyncio

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


router = APIRouter()

async def upload_file_async(file_data, file_metadata, db):

    pdf = str(file_metadata["filename"])
    pdf_name = Path(pdf).stem

    print(f"File: {file_metadata['filename']}")
    print(f"Content Type: {file_metadata['content_type']}")
    print(f"Size: {file_metadata['file_size']}")
    print(f"Headers: {file_metadata['headers']}")

    # Write file_data to a temporary file
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        temp_file.write(file_data)
        temp_file.seek(0)

        # Process the temporary file
        structure = preprocess("pdfplumber", temp_file)

        npages = len(structure)

        # Reset the file pointer to the beginning
        temp_file.seek(0)

        # Upload the file from the temporary file
        file_id = await db.gridFS.upload_from_stream(
            file_metadata["filename"],
            temp_file,
            metadata={"contentType": file_metadata["content_type"]}
        )

    document = DocumentDocument(
        name=pdf_name,
        file_id=file_id,
        total_pages=npages,
    )
    await document.create()

    doc_structure = DocStructureDocument(
        doc_id=document.id,
        structure=structure
    )
    await doc_structure.create()
    
@router.post("/upload_analyze")
async def pre_upload(
    user: UserDocument = Depends(get_current_admin),
    file: UploadFile = File(...),
    db: MongoClient = Depends(get_db)
):

    def upload_analyze_document(
        file_data: bytes,
        file_metadata: dict,
        db: MongoClient
    ):
        asyncio.run(upload_file_async(file_data, file_metadata, db))

    # Utilizza threading per eseguire l'operazione in un thread separato
    def run_upload_analyze_document(file: UploadFile, db: MongoClient):
        file_data = file.file.read()
        file_metadata = {
            "filename": file.filename,
            "content_type": file.content_type,
            "file_size": file.file.seek(0, 2),  # Get file size
            "headers": file.headers
        }
        threading.Thread(target=upload_analyze_document, args=(file_data, file_metadata, db)).start()
    
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
