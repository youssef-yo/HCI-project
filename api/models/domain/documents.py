from typing import Optional

from beanie import Document, Indexed, PydanticObjectId

from core.config import get_settings


class DocumentDocument(Document):
    name: Indexed(str)
    file_id: Optional[PydanticObjectId]
    total_pages: int
    commit: Optional[PydanticObjectId] = None
    analyzed: bool = False

    class Settings:
        name = get_settings().docs_collection
