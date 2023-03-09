from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security.oauth2 import OAuth2PasswordRequestForm

from schemas.jwt_tokens import AccessToken

from utils import oauth2, user_utils, utils


router = APIRouter(
    prefix="/api/auth",
    tags=['Authorization']
)


@router.post("/", response_model=AccessToken)
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()) -> AccessToken:
    """
    Login the user if the given credentials are valid. 
    Also return a JWT access token and a httpOnly authorization cookie.
    """
    user = user_utils.load_user(form_data.username)

    if not user or not utils.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Credentials"
        )

    # Create JWT access and refresh tokens
    access_token = oauth2.create_access_token(data={
        "userInfo": {
            "username": user.email,
            "role": user.role
        }
    })

    refresh_token = oauth2.create_refresh_token(data={
        "username": user.email
    })

    # Store refresh token with user
    user.refresh_token = refresh_token
    user_utils.save_user(user)

    # Set response httpOnly cookie (in production should also be added secure=True)
    response.set_cookie("X-Auth-Token", value=refresh_token, httponly=True,
                        samesite='none', secure=True, max_age=24 * 60 * 60 * 365)

    return {"accessToken": access_token, "tokenType": "bearer"}
