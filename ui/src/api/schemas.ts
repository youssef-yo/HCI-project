export interface JWTToken {
    accessToken: string;
    tokenType: string;
}

export interface UserInfo {
    username: string;
    role: string;
}

export interface JWTTokenData {
    userInfo: UserInfo;
}

export interface Token {
    x: number;
    y: number;
    height: number;
    width: number;
    text: string;
}

export interface Page {
    index: number;
    width: number;
    height: number;
}

export interface PageTokens {
    page: Page;
    tokens: Token[];
}

export interface OntologiesNames {
    ontologiesNames: string[];
}

export interface Ontology {
    _id: string;
    name: string;
}

export interface OntologyUpdate {
    name: string;
}

export interface Doc {
    _id: string;
    name: string;
    totalPages: number;
}

export interface PaperStatus {
    sha: string;
    name: string;
    annotations: number;
    relations: number;
    finished: boolean;
    junk: boolean;
    comments: string;
    completedAt?: Date;
}

export interface Allocation {
    papers: PaperStatus[];
    hasAllocatedPapers: boolean;
}

export interface OntoClass {
    id: string; // serve per il rendering nei menù, lo assegnerò dal backend
    text: string; // testo che verrà mostrato all'utente
    baseIri: string;
    iri: string;
    labelFromOwlready: string; // permetterà di fare i controlli con domain/range di Relation
    color: string;
}

export interface OntoProperty {
    id: string; // serve per il rendering nei menù
    text: string; // testo che verrà mostrato all'utente
    baseIri: string;
    iri: string;
    labelFromOwlready: string; // permetterà di fare i controlli con domain/range di Relation
    domain: string[]; // conterrà la lista degli IRI completi di modo poi di fare il check
    range: string[]; // come domain. Ricorda che potrebbero essere vuote! (in questo caso la relazione
    // è 'libera')
}

export interface User {
    _id: string;
    email: string;
    fullName: string;
    role: string;
}

export interface UserCreate {
    email: string;
    fullName: string;
    role: string;
    password: string;
}

export interface UserUpdate {
    fullName: string;
    role: string;
}

export interface PageRange {
    start: number;
    end: number;
}

export interface Task {
    _id: string;
    userId: string;
    docId: string;
    pageRange: PageRange;
    finished: boolean;
    junk: boolean;
    comments: string;
    completedAt?: Date;
}

export interface TaskCreate {
    userId: string;
    docId: string;
    pageRange: PageRange;
}
