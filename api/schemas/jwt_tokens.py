from pydantic import BaseModel


class UserInfo(BaseModel):
    username: str
    role: str


class AccessToken(BaseModel):
    accessToken: str
    tokenType: str


class AccessTokenData(BaseModel):
    userInfo: UserInfo


class RefreshTokenData(BaseModel):
    username: str