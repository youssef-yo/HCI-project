import os
from datetime import datetime, timedelta
from typing import Union

from fastapi import (
    Depends,
    HTTPException,
    status
)
from fastapi.security import OAuth2PasswordBearer

from jose import JWTError, jwt

from core.config import get_settings

from models.domain import UserDocument
from models.schemas import (
    AccessTokenData,
    RefreshTokenData
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/", scheme_name="JWT")


def create_access_token(data: dict) -> str:
    """
    Creates a new JWT access token.
    """
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=get_settings().access_token_expire_minutes)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, get_settings().access_token_secret, algorithm=get_settings().jwt_algorithm)

    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """
    Creates a new JWT refresh token.
    """
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(days=get_settings().refresh_token_expire_days)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, get_settings().refresh_token_secret,
                             algorithm=get_settings().jwt_algorithm)

    return encoded_jwt


def verify_access_token(token: str, credentials_exception: HTTPException) -> AccessTokenData:
    """
    Checks if the given JWT access token if valid.
    Returns the token data if valid, else raises the given exception.
    """
    try:
        payload = jwt.decode(token, get_settings().access_token_secret, algorithms=[get_settings().jwt_algorithm])

        # Conversion successful, can safely convert payload to pydantic model
        token_data = AccessTokenData(**payload)

        # Check that username is set
        if not token_data.user_info.username:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    return token_data


def verify_refresh_token(token: str) -> Union[RefreshTokenData, None]:
    """
    Checks if the given JWT refresh token if valid.
    Returns the token data if valid, else None.
    """
    try:
        payload = jwt.decode(token, get_settings().refresh_token_secret, algorithms=[get_settings().jwt_algorithm])

        # Conversion successful, can safely convert payload to pydantic model
        token_data = RefreshTokenData(**payload)

        # Check that username is set
        if not token_data.username:
            return None
    except JWTError:
        return None

    return token_data


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserDocument:
    """
    Gets the current user, related to the JWT access token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=f"Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )

    token_data = verify_access_token(token, credentials_exception)

    user = await UserDocument.find_one(UserDocument.email == token_data.user_info.username)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error."
        )

    return user


async def get_current_admin(user: UserDocument = Depends(get_current_user)) -> UserDocument:
    """
    Gets the current user, and verifies that the user is an admin.

    NOTE: In future, you might want to swap over to checking permissions, not roles.
    Check https://fastapi.tiangolo.com/pt/advanced/security/oauth2-scopes/
    """
    if user.role != "Administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Not enough permissions."
        )
    
    return user
    

async def get_current_annotator(user: UserDocument = Depends(get_current_user)) -> UserDocument:
    """
    Gets the current user, and verifies that the user is an annotator.

    NOTE: In future, you might want to swap over to checking permissions, not roles.
    Check https://fastapi.tiangolo.com/pt/advanced/security/oauth2-scopes/
    """
    if user.role != "Annotator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Not enough permissions."
        )
    
    return user
