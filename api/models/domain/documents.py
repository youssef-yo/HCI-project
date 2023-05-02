from typing import Optional
from pydantic import BaseModel

from beanie import Document, Indexed, PydanticObjectId

from core.config import get_settings


class CommitPointer(BaseModel):
    current: PydanticObjectId
    previous: PydanticObjectId


class DocumentDocument(Document):
    name: Indexed(str)
    file_id: Optional[PydanticObjectId]
    total_pages: int
    commit: Optional[CommitPointer] = None

    class Settings:
        name = get_settings().docs_collection
