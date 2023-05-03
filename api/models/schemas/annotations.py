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


class DocAnnotations(BaseModel):
    annotations: List[Annotation]
    relations: List[RelationGroup]

    @staticmethod
    def empty():
        return DocAnnotations(
            annotations=[],
            relations=[]
        )
    
    def add_annotation(self, annotation: Annotation):
        self.annotations.append(annotation)

    def add_relation(self, relation: RelationGroup):
        self.relations.append(relation)

    def update_annotation(self, annotation: Annotation):
        updated_annotations = map(lambda ann: annotation if ann.id == annotation.id else ann, self.annotations)
        self.annotations = list(updated_annotations)

    def update_relation(self, relation: RelationGroup):
        updated_relations = map(lambda rel: relation if rel.id == relation.id else rel, self.relations)
        self.relations = list(updated_relations)

    def remove_annotation(self, annotation: Annotation):
        updated_annotations = filter(lambda ann: ann.id != annotation.id, self.annotations)
        self.annotations = list(updated_annotations)

    def remove_relation(self, relation: RelationGroup):
        updated_relations = filter(lambda rel: rel.id != relation.id, self.relations)
        self.relations = list(updated_relations)


class TaskAnnotationStatus(str, Enum):
    created = "CREATED",
    modified = "MODIFIED",
    deleted = "DELETED"


class TaskAnnotation(Annotation):
    status: TaskAnnotationStatus

    def to_annotation(self) -> Annotation:
        return Annotation(**self.dict())


class TaskRelationGroup(RelationGroup):
    status: TaskAnnotationStatus

    def to_relation(self) -> RelationGroup:
        return RelationGroup(**self.dict())


class TaskDeltaAnnotations(BaseModel):
    annotations: List[TaskAnnotation]
    relations: List[TaskRelationGroup]

    @staticmethod
    def empty():
        return TaskDeltaAnnotations(
            annotations=[],
            relations=[]
        )
