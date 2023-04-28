from fastapi import (
    HTTPException,
    status
)

from models.domain import OntologyDocument
from models.schemas import (
    PydanticObjectId
)


async def get_onto_by_id(
        id: PydanticObjectId, 
        assert_exists: bool = False
) -> OntologyDocument:
    """
    Gets the ontology with the specified identifier.
    If it does not exist, and the assertion flag has been set,
    it raises an HTTPException.
    """
    onto = await OntologyDocument.get(id)
    if not onto and assert_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ontology with ID {id} not found."
        )
    
    return onto
