from typing import Union
from pydantic import BaseModel


class UserBase(BaseModel):
    email: str
    full_name: str
    role: Union[str, None] = None


class UserDB(UserBase):
    password: str


class UserIn(UserBase):
    password: str


class UserOut(UserBase):
    pass


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str