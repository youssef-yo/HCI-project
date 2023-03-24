from typing import Optional

from fastapi import (
    APIRouter,
    Cookie,
    Depends,
    status,
    Response
)

from db.database import get_users_repo
from db.repositories.users import UserRepository

from services.oauth2 import verify_refresh_token


router = APIRouter(
    prefix="/api/logout",
    tags=['Authorization']
)


@router.get("/", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response, X_Auth_Token: Optional[str] = Cookie(default=None, alias="X-Auth-Token"),
    user_repo: UserRepository = Depends(get_users_repo)
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
    foundUser = user_repo.find_by_refresh_token(X_Auth_Token)

    if not foundUser:
        response.delete_cookie("X-Auth-Token", httponly=True, samesite="none", secure=True)
        return

    # Erase the token
    foundUser.refresh_token = None
    user_repo.update(foundUser)

    response.delete_cookie("X-Auth-Token", httponly=True, samesite="none", secure=True)
