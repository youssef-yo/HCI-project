from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from core.config import Settings, get_settings

from models.domain import ( 
    UserDocument,
    TaskDocument,
)
from models.schemas import (
    PydanticObjectId,
    UserInCreate,
    UserInUpdate,
    UserOutResponse
)

from services.security import hash_password
from services.oauth2 import (
    get_current_admin,
    get_current_user as get_current_auth_user
)
from services.user import get_user_by_id


router = APIRouter()


@router.get("", response_model=List[UserOutResponse])
async def get_users(
    auth_user: UserDocument = Depends(get_current_auth_user),
) -> List[UserOutResponse]:
    """
    Returns all the users currently created.
    """
    return await UserDocument.find_all().to_list()


@router.post("", status_code=status.HTTP_201_CREATED, response_model=UserOutResponse)
async def create_user(
    user: UserInCreate,
    auth_user: UserDocument = Depends(get_current_admin),
) -> UserOutResponse:
    """
    Creates a new user, if another one with the same email does not already exist.
    """
    stored_user = await UserDocument.find_one(UserDocument.email == user.email)
    if stored_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User {user.email} already exists."
        )

    if not user.role:
        user.role = "Annotator"

    hashed_password = hash_password(user.password)

    new_user = UserDocument(
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        hashed_password=hashed_password
    )

    return await new_user.create()


@router.get("/me", response_model=UserOutResponse)
def get_current_user(
    auth_user: UserDocument = Depends(get_current_auth_user)
) -> UserOutResponse:
    """
    Returns the user that is currently logged in.
    """
    return auth_user


@router.get("/{id}", response_model=UserOutResponse)
async def get_user(
    id: PydanticObjectId,
    auth_user: UserDocument = Depends(get_current_auth_user)
) -> UserOutResponse:
    """
    Returns the user with the given ID, if exists.
    """
    user = await get_user_by_id(id, assert_exists=True)
    return user


@router.put("/{id}", response_model=UserOutResponse)
async def update_user(
    id: PydanticObjectId,
    req: UserInUpdate,
    auth_user: UserDocument = Depends(get_current_admin)
) -> UserOutResponse:
    """
    Updates the user with the specified ID, with the given updated properties.
    """
    req = {k: v for k, v in req.dict().items() if v is not None}
    update_query = {"$set": {
        field: value for field, value in req.items()
    }}

    user = await get_user_by_id(id, assert_exists=True)
    await user.update(update_query)

    return user


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    id: PydanticObjectId,
    auth_user: UserDocument = Depends(get_current_admin),
    settings: Settings = Depends(get_settings)
):
    """
    Deletes the user with the given ID, if exists.
    """
    user = await get_user_by_id(id, assert_exists=True)

    if (user.id == auth_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot delete yourself."
        )
    
    if (user.email == settings.base_admin_email):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This user cannot be deleted."
        )
    
    # Delete associated tasks
    tasks = await TaskDocument.find({"user_id": user.id}).to_list()
    for task in tasks:
        await task.delete()

    await user.delete()
