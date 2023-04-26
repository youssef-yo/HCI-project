from typing import Optional, List

from beanie import Document, Indexed, PydanticObjectId

from core.config import get_settings

from models.schemas import Page


class DocumentDocument(Document):
    name: Indexed(str)
    file_id: Optional[PydanticObjectId]
    total_pages: int
    structure: List[Page]

    class Settings:
        name = get_settings().docs_collection
