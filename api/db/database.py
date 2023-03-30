from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from core.config import get_settings

from models.domain.users import UserDocument


class MongoClient:
    """MongoDB client manager."""

    _client: AsyncIOMotorClient
    _database: str

    def __init__(self, connection_string: str, database: str) -> None:
        self._client = AsyncIOMotorClient(connection_string)
        self._database = database

    async def initialize(self) -> None:
        await init_beanie(database=self._client[self._database], document_models=[UserDocument])

    def close(self) -> None:
        self._client.close()


db = MongoClient(get_settings().mongodb_uri, get_settings().db_name)


async def initialize_db():
    await db.initialize()


def close_db():
    db.close()
