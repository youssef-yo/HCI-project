from typing import List

from fastapi import APIRouter, HTTPException, status

from schemas.users import UserOut, UserDB, UserIn

from utils import user_utils, utils


router = APIRouter(
    prefix="/api/user",
    tags=['User']
)


@router.get("/", response_model=List[UserOut])
def get_users() -> List[UserOut]:
    """
    Returns all the users currently created.
    """
    return user_utils.load_users()


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=UserOut)
def create_user(user: UserIn) -> UserOut:
    """
    Creates a new user, if another one with the same email does not already exist.
    """
    stored_user = user_utils.load_user(user.email)

    if stored_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User {user.email} already exists."
        )
    
    if not user.role:
        user.role = "Annotator"

    hashed_password = utils.hash_password(user.password)
    user.password = hashed_password

    user_utils.save_user(user)

    return UserOut(**user.dict())


@router.get("/{email}", response_model=UserOut)
def get_user(email: str) -> UserOut:
    """
    Returns the user with the given email, if exists.
    """
    user = user_utils.load_user(email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {email} not found."
        )
    
    return UserOut(**user.dict())