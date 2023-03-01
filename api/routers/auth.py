from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm

from schemas.users import Token

from utils import oauth2, user_utils, utils


router = APIRouter(
    prefix="/api/login",
    tags=['Authorization']
)


@router.post("/", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Token:
    user = user_utils.load_user(form_data.username)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Invalid Credentials"
        )

    if not utils.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Invalid Credentials"
        )
    
    # create token
    access_token = oauth2.create_access_token(data={"email": user.email})

    return {"access_token": access_token, "token_type": "bearer"}