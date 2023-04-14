from typing import List

from pydantic import BaseModel

from models.schemas.mongo import MongoBase
from models.schemas.rwschema import RWSchema

class OntoClass(BaseModel):
    id: str  # serve per il rendering nei menù, lo assegnerò dal backend
    text: str  # testo che verrà mostrato all'utente
    baseIri: str
    iri: str
    labelFromOwlready: str  # permetterà di fare i controlli con domain/range di Relation
    color: str


class OntoProperty(BaseModel):
    id: str  # serve per il rendering nei menù
    text: str  # testo che verrà mostrato all'utente
    baseIri: str
    iri: str
    labelFromOwlready: str  # permetterà di fare i controlli con domain/range di Relation
    domain: List[str]  # conterrà la lista degli IRI completi di modo poi di fare il check
    range: List[str]  # come domain. Ricorda che potrebbero essere vuote! (in questo caso la relazione
    # è 'libera')


class OntologyData(BaseModel):
    classes: List[OntoClass]
    properties: List[OntoProperty]


class Ontology(BaseModel):
    name: str
    data: OntologyData


class OntologyOutResponse(RWSchema, MongoBase):
    name: str