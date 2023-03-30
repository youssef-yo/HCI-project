from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from models.domain.users import UserDocument
from models.schemas.users import (
    UserInCreate,
    UserOutResponse
)

from services.security import hash_password
from services.oauth2 import get_current_user as get_current_auth_user


router = APIRouter()


@router.get("", response_model=List[UserOutResponse])
async def get_users() -> List[UserOutResponse]:
    """
    Returns all the users currently created.
    """
    return await UserDocument.find_all().to_list()


@router.post("", status_code=status.HTTP_201_CREATED, response_model=UserOutResponse)
async def create_user(user: UserInCreate) -> UserOutResponse:
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
def get_current_user(user: str = Depends(get_current_auth_user)) -> UserOutResponse:
    """
    Returns the user that is currently logged in.
    """
    return user


@router.get("/{email}", response_model=UserOutResponse)
async def get_user(email: str) -> UserOutResponse:
    """
    Returns the user with the given email, if exists.
    """
    user = await UserDocument.find_one(UserDocument.email == email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {email} not found."
        )
    
    return user
