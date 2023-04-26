from typing import List

from beanie.odm.operators.find.comparison import In

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from db.database import MongoClient, get_db

from models.domain import OntologyDocument, UserDocument
from models.schemas import (
    OntoClass,
    OntoProperty,
    OntologyInUpdate,
    OntologyOutResponse,
    PydanticObjectId
)

from services.oauth2 import get_current_user


router = APIRouter()


@router.get("", response_model=List[OntologyOutResponse])
async def get_ontologies_list():
    ontos = await OntologyDocument.find({}).to_list()
    return ontos


@router.post("/classes")
async def get_classes(
    onto_ids: List[PydanticObjectId]
) -> List[OntoClass]:
    """
    Get the labels used for annotation for this app.
    """

    ontologies = await OntologyDocument.find(
        In(OntologyDocument.id, onto_ids)
    ).to_list()

    result_classes = list()
    for onto in ontologies:
        result_classes.extend(onto.data.classes)

    return result_classes


@router.post("/properties")
async def get_properties(
    onto_ids: List[PydanticObjectId]
) -> List[OntoProperty]:
    """
    Get the relations used for annotation for this app.
    """

    ontologies = await OntologyDocument.find(
        In(OntologyDocument.id, onto_ids)
    ).to_list()

    result_properties = list()
    for onto in ontologies:
        result_properties.extend(onto.data.properties)

    return result_properties


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ontology(
    id: str,
    user: UserDocument = Depends(get_current_user),
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


@router.put("/{id}", response_model=OntologyOutResponse)
async def update_ontology(
    id: str,
    req: OntologyInUpdate,
    user: UserDocument = Depends(get_current_user)
):
    """Updates the ontology with the specified ID, with the given update properties"""
    if req.name:
        onto = await OntologyDocument.find_one(OntologyDocument.name == req.name)
        if onto:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"An ontology with name {req.name} already exists."
            )

    req = {k: v for k, v in req.dict().items() if v is not None}
    update_query = {"$set": {
        field: value for field, value in req.items()
    }}

    onto = await OntologyDocument.get(id)
    if not onto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ontology with ID {id} not found."
        )

    await onto.update(update_query)
    return onto


@router.get("/{id}", response_model=OntologyOutResponse)
async def get_ontology(
    id: str,
):
    onto = await OntologyDocument.get(id)
    if not onto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ontology with ID {id} not found."
        )

    return onto


@router.get("/{id}/classes")
async def get_ontology_classes(
    id: str,
):
    onto = await OntologyDocument.get(id)
    if not onto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ontology with ID {id} not found."
        )

    return onto.data.classes


@router.get("/{id}/properties")
async def get_ontology_classes(
    id: str,
):
    onto = await OntologyDocument.get(id)
    if not onto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ontology with ID {id} not found."
        )

    return onto.data.properties
