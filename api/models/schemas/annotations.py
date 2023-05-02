from enum import Enum
from typing import Optional, List
from pydantic import BaseModel

from models.schemas.ontologies import OntoClass, OntoProperty


class Bounds(BaseModel):
    left: float
    top: float
    right: float
    bottom: float


class TokenId(BaseModel):
    pageIndex: int
    tokenIndex: int


class Annotation(BaseModel):
    id: str
    page: int
    ontoClass: OntoClass
    date: str
    bounds: Bounds
    tokens: Optional[List[TokenId]] = None
    text: str = None


class RelationGroup(BaseModel):
    id: str
    date: str
    sourceIds: List[str]
    targetIds: List[str]
    ontoProperty: OntoProperty


class PdfAnnotation(BaseModel):
    annotations: List[Annotation]
    relations: List[RelationGroup]

    @staticmethod
    def empty():
        return PdfAnnotation(
            annotations=[],
            relations=[]
        )


class TaskAnnotationStatus(str, Enum):
    created = "CREATED",
    modified = "MODIFIED",
    deleted = "DELETED"


class TaskAnnotation(Annotation):
    status: TaskAnnotationStatus


class TaskRelationGroup(RelationGroup):
    status: TaskAnnotationStatus


class TaskDeltaAnnotation(BaseModel):
    annotations: List[TaskAnnotation]
    relations: List[TaskRelationGroup]

    @staticmethod
    def empty():
        return TaskDeltaAnnotation(
            annotations=[],
            relations=[]
        )
