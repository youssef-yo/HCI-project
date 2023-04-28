from fastapi import (
    HTTPException,
    status
)

from models.domain import UserDocument
from models.schemas import (
    PydanticObjectId
)


async def get_user_by_id(
        id: PydanticObjectId,
        assert_exists: bool = False
) -> UserDocument:
    """
    Gets the user with the specified identifier.
    If it does not exist, and the assertion flag has been set,
    it raises an HTTPException.
    """
    user = await UserDocument.get(id)
    if not user and assert_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {id} not found."
        )

    return user
