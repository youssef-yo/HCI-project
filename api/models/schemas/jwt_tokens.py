from models.schemas.rwschema import RWSchema


class UserInfo(RWSchema):
    _id: str
    username: str
    role: str


class AccessToken(RWSchema):
    access_token: str
    token_type: str

    class Config:
        schema_extra = {
            "example": {
                "accessToken": "token",
                "tokenType": "bearer"
            }
        }


class AccessTokenData(RWSchema):
    user_info: UserInfo


class RefreshTokenData(RWSchema):
    username: str
