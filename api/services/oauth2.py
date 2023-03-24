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

from db.database import get_users_repo
from db.repositories.users import UserRepository

from models.domain.users import UserInDB
from models.schemas.jwt_tokens import (
    AccessTokenData,
    RefreshTokenData
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/", scheme_name="JWT")


# This are default development values, the real values must be set in a .env file
# to get a string like this run:
# openssl rand -hex 32
ACCESS_TOKEN_SECRET = os.getenv(
    "ACCESS_TOKEN_SECRET", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
REFRESH_TOKEN_SECRET = os.getenv(
    "REFRESH_TOKEN_SECRET", "7eeef6cceaba350ddc132e676c2f60941fc89b4d60870dc5ca11f36722aca1c7")

ALGORITHM = os.getenv("ALGORITHM", "HS256")

ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 20)
REFRESH_TOKEN_EXPIRE_DAYS = os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 30)


def create_access_token(data: dict) -> str:
    """
    Creates a new JWT access token.
    """
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, ACCESS_TOKEN_SECRET, algorithm=ALGORITHM)

    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """
    Creates a new JWT refresh token.
    """
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, REFRESH_TOKEN_SECRET, algorithm=ALGORITHM)

    return encoded_jwt


def verify_access_token(token: str, credentials_exception: HTTPException) -> AccessTokenData:
    """
    Checks if the given JWT access token if valid.
    Returns the token data if valid, else raises the given exception.
    """
    try:
        payload = jwt.decode(token, ACCESS_TOKEN_SECRET, algorithms=[ALGORITHM])

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
        payload = jwt.decode(token, REFRESH_TOKEN_SECRET, algorithms=[ALGORITHM])

        # Conversion successful, can safely convert payload to pydantic model
        token_data = RefreshTokenData(**payload)

        # Check that username is set
        if not token_data.username:
            return None
    except JWTError:
        return None

    return token_data


def get_current_user(
        token: str = Depends(oauth2_scheme),
        user_repo: UserRepository = Depends(get_users_repo)
) -> UserInDB:
    """
    Gets the current user, related to the JWT access token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=f"Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )

    token_data = verify_access_token(token, credentials_exception)

    user = user_repo.find_by_email(token_data.user_info.username)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error."
        )

    return user
