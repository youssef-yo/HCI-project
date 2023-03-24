from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Response
)
from fastapi.security.oauth2 import OAuth2PasswordRequestForm

from db.database import get_users_repo
from db.repositories.users import UserRepository

from models.schemas.jwt_tokens import AccessToken

from services.security import verify_password
from services.oauth2 import (
    create_access_token,
    create_refresh_token
)


router = APIRouter(
    prefix="/api/auth",
    tags=['Authorization']
)


@router.post("/", response_model=AccessToken)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_repo: UserRepository = Depends(get_users_repo)
) -> AccessToken:
    """
    Login the user if the given credentials are valid. 
    Also return a JWT access token and a httpOnly authorization cookie.
    """
    user = user_repo.find_by_email(form_data.username)

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Credentials"
        )

    # Create JWT access and refresh tokens
    access_token = create_access_token(data={
        "userInfo": {
            "username": user.email,
            "role": user.role
        }
    })

    refresh_token = create_refresh_token(data={
        "username": user.email
    })

    # Store refresh token with user
    user.refresh_token = refresh_token
    user_repo.update(user)

    # Set response httpOnly cookie (in production should also be added secure=True)
    response.set_cookie("X-Auth-Token", value=refresh_token, httponly=True,
                        samesite='none', secure=True, max_age=24 * 60 * 60 * 365)

    return {"access_token": access_token, "token_type": "bearer"}
