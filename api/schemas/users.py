from typing import Union
from pydantic import BaseModel


class UserBase(BaseModel):
    email: str
    fullName: str
    role: Union[str, None] = None


class UserDB(UserBase):
    password: str
    refresh_token: Union[str, None] = None


class UserIn(UserBase):
    password: str


class UserOut(UserBase):
    pass