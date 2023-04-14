from typing import List

from beanie.odm.operators.find.comparison import In

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from db.database import MongoClient, get_db

from models.domain import OntologyDocument
from models.schemas import (
    OntoClass,
    OntoProperty,
    OntologyOutResponse,
    PydanticObjectId
)


router = APIRouter()


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ontology(
    id: str,
    db: MongoClient = Depends(get_db)
):
    # TODO: Use transactions to ensure atomicity
    stored_onto = await OntologyDocument.get(id)
    if not stored_onto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ontology with ID {id} not found."
        )
    
    # Delete the ontology file from GridFS
    await db.gridFS.delete(stored_onto.file_id)

    # Delete the ontology document
    await stored_onto.delete()

    return "Files removed..."


@router.get("/names", response_model=List[OntologyOutResponse])
async def get_ontologies_list():
    ontos = await OntologyDocument.find({}).to_list()
    return ontos


@router.post("/classes")
async def get_classes(onto_ids: List[str]) -> List[OntoClass]:
    """
    Get the labels used for annotation for this app.
    """

    # Convert IDs to MongoDB ObjectID
    onto_ids = [PydanticObjectId(id) for id in onto_ids]

    ontologies = await OntologyDocument.find(
        In(OntologyDocument.id, onto_ids)
    ).to_list()

    result_classes = list()
    for onto in ontologies:
        result_classes.extend(onto.data.classes)

    return result_classes


@router.post("/properties")
async def get_properties(onto_ids: List[str]) -> List[OntoProperty]:
    """
    Get the relations used for annotation for this app.
    """

    # Convert IDs to MongoDB ObjectID
    onto_ids = [PydanticObjectId(id) for id in onto_ids]

    ontologies = await OntologyDocument.find(
        In(OntologyDocument.id, onto_ids)
    ).to_list()

    result_properties = list()
    for onto in ontologies:
        result_properties.extend(onto.data.properties)

    return result_properties
