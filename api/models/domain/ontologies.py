from typing import Optional

from beanie import Document, PydanticObjectId

from core.config import get_settings

from models.schemas.ontologies import OntologyData


class OntologyDocument(Document):
    name: str
    file_id: Optional[PydanticObjectId]
    data: OntologyData

    class Settings:
        name = get_settings().ontos_collection