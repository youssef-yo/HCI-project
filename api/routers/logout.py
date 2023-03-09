from typing import Union

from fastapi import APIRouter, Cookie, status, Response

from utils import oauth2, user_utils


router = APIRouter(
    prefix="/api/logout",
    tags=['Authorization']
)


@router.get("/", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response, X_Auth_Token: Union[str, None] = Cookie(default=None, alias="X-Auth-Token")):
    """
    Logout the user. 
    Also delete the httpOnly authorization cookie.
    """
    if not X_Auth_Token:
        return

    # Extract JWT refresh token data
    token_data = oauth2.verify_refresh_token(X_Auth_Token)

    if not token_data:
        response.delete_cookie("X-Auth-Token", httponly=True, samesite="none")
        return

    # Find user who has this token assigned
    foundUser = [user for user in user_utils.load_users() if user.refresh_token == X_Auth_Token]

    if not foundUser:
        response.delete_cookie("X-Auth-Token", httponly=True, samesite="none", secure=True)
        return

    # Erase the token
    foundUser = foundUser[0]
    foundUser.refresh_token = None
    user_utils.save_user(foundUser)

    response.delete_cookie("X-Auth-Token", httponly=True, samesite="none")
