from typing import Optional

from fastapi import (
    APIRouter,
    Cookie,
    Depends,
    HTTPException,
    status,
    Response
)
from fastapi.security.oauth2 import OAuth2PasswordRequestForm

from models.domain import UserDocument
from models.schemas import AccessToken

from services.security import verify_password
from services.oauth2 import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token
)


router = APIRouter()


@router.post("/auth", response_model=AccessToken)
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends()
) -> AccessToken:
    """
    Login the user if the given credentials are valid. 
    Also return a JWT access token and a httpOnly authorization cookie.
    """
    user = await UserDocument.find_one(UserDocument.email == form_data.username)

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
    update_query = {"$set": {"refresh_token": refresh_token}}
    await user.update(update_query)

    # Set response httpOnly cookie (in production should also be added secure=True)
    response.set_cookie("X-Auth-Token", value=refresh_token, httponly=True,
                        samesite='none', secure=True, max_age=24 * 60 * 60 * 365)

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    X_Auth_Token: Optional[str] = Cookie(default=None, alias="X-Auth-Token")
):
    """
    Logout the user. 
    Also delete the httpOnly authorization cookie.
    """
    if not X_Auth_Token:
        return

    # Extract JWT refresh token data
    token_data = verify_refresh_token(X_Auth_Token)

    if not token_data:
        response.delete_cookie("X-Auth-Token", httponly=True, samesite="none", secure=True)
        return

    # Find user who has this token assigned
    foundUser = await UserDocument.find_one(UserDocument.refresh_token == X_Auth_Token)

    if not foundUser:
        response.delete_cookie("X-Auth-Token", httponly=True, samesite="none", secure=True)
        return

    # Erase the token
    update_query = {"$set": {"refresh_token": None}}
    await foundUser.update(update_query)

    response.delete_cookie("X-Auth-Token", httponly=True, samesite="none", secure=True)


@router.get("/refresh", response_model=AccessToken)
async def refresh(
    X_Auth_Token: Optional[str] = Cookie(default=None, alias="X-Auth-Token")
) -> AccessToken:
    """
    Returns a new JWT access token, if the refresh token is valid.
    """
    if not X_Auth_Token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized"
        )

    # Find user who has this token assigned
    found_user = await UserDocument.find_one(UserDocument.refresh_token == X_Auth_Token)

    if not found_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )

    # Verify JWT refresh token
    token_data = verify_refresh_token(X_Auth_Token)

    if not token_data or found_user.email != token_data.username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )

    # Create JWT access token
    access_token = create_access_token(data={
        "userInfo": {
            "username": found_user.email,
            "role": found_user.role
        }
    })

    return {"access_token": access_token, "token_type": "bearer"}
