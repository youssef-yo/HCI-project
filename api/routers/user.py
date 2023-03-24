from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from db.database import get_users_repo
from db.repositories.users import UserRepository

from models.domain.users import UserInDB
from models.schemas.users import (
    UserInCreate,
    UserOutResponse
)

from services.security import hash_password
from services.oauth2 import get_current_user as get_current_auth_user


router = APIRouter(
    prefix="/api/user",
    tags=['User']
)


@router.get("/", response_model=List[UserOutResponse])
def get_users(
    user_repo: UserRepository = Depends(get_users_repo)
) -> List[UserOutResponse]:
    """
    Returns all the users currently created.
    """
    return user_repo.find_all()


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=UserOutResponse)
def create_user(
    user: UserInCreate,
    user_repo: UserRepository = Depends(get_users_repo)
) -> UserOutResponse:
    """
    Creates a new user, if another one with the same email does not already exist.
    """
    stored_user = user_repo.find_by_email(user.email)

    if stored_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User {user.email} already exists."
        )

    if not user.role:
        user.role = "Annotator"

    hashed_password = hash_password(user.password)

    new_user = UserInDB(
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        hashed_password=hashed_password
    )

    return user_repo.create(new_user)


@router.get("/me", response_model=UserOutResponse)
def get_current_user(user: str = Depends(get_current_auth_user)) -> UserOutResponse:
    """
    Returns the user that is currently logged in.
    """
    return user


@router.get("/{email}", response_model=UserOutResponse)
def get_user(
    email: str,
    user_repo: UserRepository = Depends(get_users_repo)
) -> UserOutResponse:
    """
    Returns the user with the given email, if exists.
    """
    user = user_repo.find_by_email(email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {email} not found."
        )
    
    return user
