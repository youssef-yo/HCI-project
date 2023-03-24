from typing import Optional

from fastapi import (
    APIRouter,
    Cookie,
    Depends,
    HTTPException,
    status
)

from db.database import get_users_repo
from db.repositories.users import UserRepository

from models.schemas.jwt_tokens import AccessToken

from services.oauth2 import (
    create_access_token,
    verify_refresh_token
)


router = APIRouter(
    prefix="/api/refresh",
    tags=['Authorization']
)

@router.get("/", response_model=AccessToken)
def refresh(
    X_Auth_Token: Optional[str] = Cookie(default=None, alias="X-Auth-Token"),
    user_repo: UserRepository = Depends(get_users_repo)
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
    found_user = user_repo.find_by_refresh_token(X_Auth_Token)

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
