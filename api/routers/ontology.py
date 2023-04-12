from typing import List

from beanie.odm.operators.find.comparison import In

from fastapi import (
    APIRouter,
    Depends,
    status
)

from db.database import MongoClient, get_db

from models.domain.ontologies import OntologyDocument
from models.schemas.ontologies import (
    OntoClass,
    OntoProperty
)


router = APIRouter()


@router.delete("/{filename}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ontology(
    filename: str,
    db: MongoClient = Depends(get_db)
):
    # TODO: Use transactions to ensure atomicity
    stored_onto = await OntologyDocument.find_one(OntologyDocument.name == filename)
    if not stored_onto:
        return
    
    # Delete the ontology file from GridFS
    await db.gridFS.delete(stored_onto.file_id)

    # Delete the ontology document
    await stored_onto.delete()

    return "Files removed..."


@router.get("/names")
async def get_ontologies_names():
    ontoNames = await OntologyDocument.find({}).to_list()
    return {"ontologiesNames": [onto.name for onto in ontoNames]}


@router.post("/classes")
async def get_classes(ontoNames: List[str]) -> List[OntoClass]:
    """
    Get the labels used for annotation for this app.
    """
    ontologies = await OntologyDocument.find(
        In(OntologyDocument.name, ontoNames)
    ).to_list()

    result_classes = list()
    for onto in ontologies:
        result_classes.extend(onto.data.classes)

    return result_classes


@router.post("/properties")
async def get_properties(ontoNames: List[str]) -> List[OntoProperty]:
    """
    Get the relations used for annotation for this app.
    """
    ontologies = await OntologyDocument.find(
        In(OntologyDocument.name, ontoNames)
    ).to_list()

    result_properties = list()
    for onto in ontologies:
        result_properties.extend(onto.data.properties)

    return result_properties
