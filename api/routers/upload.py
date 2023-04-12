import json
import os
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

from app.assign import assign
from app.preprocess import preprocess

from db.database import MongoClient, get_db

from models.schemas.ontologies import OntoClass, OntoProperty, OntologyData
from models.domain.ontologies import OntologyDocument
from models.domain.users import UserDocument

from services.oauth2 import get_current_user

from core.config import Settings, get_settings


router = APIRouter()


# @router.post("/ontology", response_model=OntologyData)
# def upload_ontology(
#     user: UserDocument = Depends(get_current_user),
#     file: UploadFile = File(...),
#     settings: Settings = Depends(get_settings)
# ) -> OntologyData:
#     # l'argomento passato deve avere lo stesso nome che devinisco con
#     # formData.append('nomeArgomento', fileObj, fileObj.name);
#     # Altrimenti errore: '422 unprocessable entity fastapi'

#     file_location = os.path.join(settings.upload_ontology_directory, f"{file.filename}")

#     with open(file_location, "wb+") as buffer:
#         shutil.copyfileobj(file.file, buffer)

#     result = analyze_ontology(os.path.abspath(file_location))
#     saveOntologyDataToJson({"name": file.filename, "data": result}, file.filename)

#     return result


@router.post("/ontology", response_model=OntologyData)
async def upload_ontology(
    user: UserDocument = Depends(get_current_user),
    file: UploadFile = File(...),
    db: MongoClient = Depends(get_db)
) -> OntologyData:
    # TODO: Use transactions to ensure atomicity
    stored_onto = await OntologyDocument.find_one(OntologyDocument.name == file.filename)

    if stored_onto:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ontology {file.filename} already exists."
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
        name=file.filename,
        file_id=ObjectId(file_id),
        data=result
    )
    await ontology.create()

    return result


@router.post("/doc")
def upload_document(
    user: UserDocument = Depends(get_current_user),
    file: UploadFile = File(...),
    settings: Settings = Depends(get_settings)
):
    """
    Add a PDF to the pawls dataset (skiff_files/).
    """
    pdf = str(file.filename)

    pdf_name = Path(pdf).stem

    output_dir = os.path.join(settings.output_directory, pdf_name)

    os.umask(0)
    os.mkdir(output_dir, 0o777)
    abspath_output_dir = os.path.abspath(output_dir)
    file_location = os.path.join(abspath_output_dir, f"{file.filename}")

    with open(file_location, "wb+") as buffer:
        shutil.copyfileobj(file.file, buffer)

    npages = preprocess("pdfplumber", file_location)

    assign(settings.output_directory, user.email, pdf_name, npages, file_location)
    return "ok"


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


# def analyze_ontology(path: str) -> OntologyData:
#     # https://owlready2.readthedocs.io/en/v0.37/onto.html -> Loading an ontology from OWL files

#     g = Graph()

#     classes_result = list()
#     properties_result = list()

#     path_onto = os.path.join("file://", f"{path}")
#     onto = get_ontology(path_onto).load()

#     g.parse(path_onto)
#     prop_domain = {}
#     prop_range = {}

#     # getting all the possible domain for all properties
#     q = """
#         prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
#         prefix owl:   <http://www.w3.org/2002/07/owl#>
#         prefix xsd:   <http://www.w3.org/2001/XMLSchema#>
#         prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#>

#         select ?p ?d where {
#             ?p rdfs:domain/(owl:unionOf/rdf:rest*/rdf:first)* ?d
#             filter isIri(?d)
#         }
#     """
#     for r in g.query(q):
#         if prop_domain.get(str(r["p"])) is not None:
#             prop_domain.get(str(r["p"])).append(str(r["d"]))
#         else:
#             prop_domain[str(r["p"])] = [str(r["d"])]

#     # getting all the possible range for all properties
#     q = """
#         prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
#         prefix owl:   <http://www.w3.org/2002/07/owl#>
#         prefix xsd:   <http://www.w3.org/2001/XMLSchema#>
#         prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#>

#         select ?p ?d where {
#             ?p rdfs:range/(owl:unionOf/rdf:rest*/rdf:first)* ?d
#             filter isIri(?d)
#         }
#     """
#     for r in g.query(q):
#         if prop_range.get(str(r["p"])) is not None:
#             prop_range.get(str(r["p"])).append(str(r["d"]))
#         else:
#             prop_range[str(r["p"])] = [str(r["d"])]
#     ##############################################

#     def extractNameFromIri(entity):
#         return entity.iri.rsplit('/', 1)[-1]

#     def getClasses():
#         colors = ["#FF0000", "#EFDDF5", "#CEEBFC", "#FFDA77", "#A8DDA8", "#B8DE6F", "#70DDBA", "#C6CC82"]
#         current_i_color = 0

#         for entity in onto.classes():
#             className = extractNameFromIri(entity)

#             ontoClass = OntoClass(
#                 id=str(uuid.uuid4()),
#                 text=className,
#                 baseIri=onto.base_iri,
#                 iri=entity.iri,
#                 labelFromOwlready=str(entity),
#                 color=""
#             )

#             if current_i_color == len(colors):
#                 current_i_color = 0
#                 ontoClass.color = colors[current_i_color]
#                 current_i_color += 1
#             else:
#                 ontoClass.color = colors[current_i_color]
#                 current_i_color += 1

#             classes_result.append(ontoClass)

#     def getProperties():
#         for data_property in list(onto.data_properties()):
#             propertyName = extractNameFromIri(data_property)

#             ontoProperty = OntoProperty(
#                 id=str(uuid.uuid4()),
#                 text=propertyName,
#                 baseIri=onto.base_iri,
#                 iri=data_property.iri,
#                 labelFromOwlready=str(data_property),
#                 domain=prop_domain.get(data_property.iri, []),
#                 range=prop_range.get(data_property.iri, [])
#             )

#             properties_result.append(ontoProperty)

#         for object_property in list(onto.object_properties()):
#             propertyName = extractNameFromIri(object_property)

#             ontoProperty = OntoProperty(
#                 id=str(uuid.uuid4()),
#                 text=propertyName,
#                 baseIri=onto.base_iri,
#                 iri=object_property.iri,
#                 labelFromOwlready=str(object_property),
#                 domain=prop_domain.get(object_property.iri, []),
#                 range=prop_range.get(object_property.iri, [])
#             )

#             properties_result.append(ontoProperty)

#     getClasses()
#     getProperties()

#     json_classes = [jsonable_encoder(c) for c in classes_result]
#     json_properties = [jsonable_encoder(p) for p in properties_result]

#     return {"classes": json_classes, "properties": json_properties}


def saveOntologyDataToJson(ontology: Ontology, name: str):
    path = os.path.join(get_settings().extracted_data_from_ontology_directory, f"{name}.json")
    with open(path, "w+") as f:
        json.dump(ontology, f)
