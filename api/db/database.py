from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket

from core.config import get_settings

from models.domain import OntologyDocument, UserDocument


class MongoClient:
    """MongoDB client manager."""

    _client: AsyncIOMotorClient
    _database: str
    _gridfs: AsyncIOMotorGridFSBucket

    def __init__(self, connection_string: str, database: str) -> None:
        self._client = AsyncIOMotorClient(connection_string)
        self._database = database
        self._gridfs = AsyncIOMotorGridFSBucket(self._client[self._database])

    async def initialize(self) -> None:
        await init_beanie(database=self._client[self._database], document_models=[OntologyDocument, UserDocument])

    def close(self) -> None:
        self._client.close()

    @property
    def gridFS(self) -> AsyncIOMotorGridFSBucket:
        return self._gridfs


db = MongoClient(get_settings().mongodb_uri, get_settings().db_name)


def get_db() -> MongoClient:
    return db


async def initialize_db():
    await db.initialize()


def close_db():
    db.close()
