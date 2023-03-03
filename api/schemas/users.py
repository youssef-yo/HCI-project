from typing import Union
from pydantic import BaseModel


class UserBase(BaseModel):
    email: str
    fullName: str
    role: Union[str, None] = None


class UserDB(UserBase):
    password: str


class UserIn(UserBase):
    password: str


class UserOut(UserBase):
    pass


class Token(BaseModel):
    role: str
    accessToken: str
    tokenType: str


class TokenData(BaseModel):
    email: str