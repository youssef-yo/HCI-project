from typing import Union

from fastapi import APIRouter, Cookie, HTTPException, status

from schemas.jwt_tokens import AccessToken

from utils import oauth2, user_utils


router = APIRouter(
    prefix="/api/refresh",
    tags=['Authorization']
)

@router.get("/", response_model=AccessToken)
def refresh(X_Auth_Token: Union[str, None] = Cookie(default=None, alias="X-Auth-Token")) -> AccessToken:
    """
    Returns a new JWT access token, if the refresh token is valid.
    """
    if not X_Auth_Token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized"
        )
    
    # Find user who has this token assigned
    foundUser = [user for user in user_utils.load_users() if user.refresh_token == X_Auth_Token]

    if not foundUser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )
    
    foundUser = foundUser[0]

    # Verify JWT refresh token
    token_data = oauth2.verify_refresh_token(X_Auth_Token)

    if not token_data or foundUser.email != token_data.username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )

    # Create JWT access token
    access_token = oauth2.create_access_token(data={
        "userInfo": {
            "username": foundUser.email,
            "role": foundUser.role
        }
    })

    return {"accessToken": access_token, "tokenType": "bearer"}
