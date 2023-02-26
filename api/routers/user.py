from fastapi import APIRouter, HTTPException, status

from schemas.users import User, UserDB, UserCreate

from utils import user_utils, utils


router = APIRouter(
    prefix="/api/user",
    tags=['User']
)


@router.get("/{email}")
def get_user(email: str) -> User:
    user = user_utils.load_user(email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {email} not found."
        )
    
    return User(**user.dict())


@router.post("/")
def create_user(user: UserCreate) -> User:
    stored_user = user_utils.load_user(user.email)

    if stored_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User {user.email} already exists."
        )

    hashed_password = utils.hash_password(user.password)
    user.password = hashed_password

    user_utils.save_user(user)

    return User(**user.dict())
