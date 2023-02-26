from pydantic import BaseModel


class UserDB(BaseModel):
    email: str
    password: str
    role: str


class UserCreate(BaseModel):
    email: str
    password: str
    role: str


class User(BaseModel):
    email: str
    role: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str