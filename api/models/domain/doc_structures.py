from typing import List

from beanie import Document, Indexed, PydanticObjectId

from core.config import get_settings

from models.schemas import Page


class DocStructureDocument(Document):
    doc_id: Indexed(PydanticObjectId, unique=True)
    structure: List[Page]

    class Settings:
        name = get_settings().doc_structures_collection
