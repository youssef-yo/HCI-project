import { createContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Bounds } from './PDFStore';
import { OntoClass, OntoProperty } from '../api';

export interface TokenId {
    pageIndex: number;
    tokenIndex: number;
}

export interface infoRelation {
    idRelation: string;
    sourceAnnotation: Annotation | undefined;
    targetAnnotation: Annotation | undefined;
    ontoProperty: OntoProperty;
}

const getDate = () => {
    // https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-dd?page=1&tab=scoredesc#tab-top
    const date = new Date();
    const offset = date.getTimezoneOffset();
    const range = offset * 60 * 1000;
    const today = new Date(date.getTime() - range);
    return today.toISOString().split('T')[0];
};

/**
 * Class representing a committed relation group of a document.
 */
export class RelationGroup {
    public readonly id: string;
    public readonly date: string;
    constructor(
        id: string | undefined = undefined,
        public sourceIds: string[],
        public targetIds: string[],
        public ontoProperty: OntoProperty,
        date: string | undefined = undefined
    ) {
        this.id = id || uuidv4();
        this.date = date || getDate();
    }

    updateForAnnotationDeletion(a: Annotation): RelationGroup | undefined {
        const sourceEmpty = this.sourceIds.length === 0;
        const targetEmpty = this.targetIds.length === 0;

        const newSourceIds = this.sourceIds.filter((id) => id !== a.id);
        const newTargetIds = this.targetIds.filter((id) => id !== a.id);

        const nowSourceEmpty = newSourceIds.length === 0;
        const nowTargetEmpty = newTargetIds.length === 0;

        // Only target had any annotations, now it has none,
        // so delete.
        if (sourceEmpty && nowTargetEmpty) {
            return undefined;
        }
        // Only source had any annotations, now it has none,
        // so delete.
        if (targetEmpty && nowSourceEmpty) {
            return undefined;
        }
        // Source was not empty, but now it is, so delete.
        if (!sourceEmpty && nowSourceEmpty) {
            return undefined;
        }
        // Target was not empty, but now it is, so delete.
        if (!targetEmpty && nowTargetEmpty) {
            return undefined;
        }

        /* We want to return a new relation with the updated data, but with the same ID,
        otherwise the combination of committed document annotations and task annotations
        will not work.
        It took me a couple of hours to figure this out.

        Whoever put undefined as ID (thus generating a new one)... I'm inside your closet.
        Love, Mecha U.U */
        return new RelationGroup(this.id, newSourceIds, newTargetIds, this.ontoProperty);
    }

    static fromObject(obj: RelationGroup) {
        return new RelationGroup(obj.id, obj.sourceIds, obj.targetIds, obj.ontoProperty);
    }

    updateOntoProperty(delta: Partial<RelationGroup> = {}) {
        return new RelationGroup(
            this.id,
            this.sourceIds,
            this.targetIds,
            delta.ontoProperty ?? this.ontoProperty
        );
    }
}

/**
 * Class representing a committed annotations of a document.
 */
export class Annotation {
    public readonly id: string;
    public readonly date: string;

    constructor(
        public bounds: Bounds,
        public readonly page: number,
        public readonly ontoClass: OntoClass, // prima era generico: Label usato anche per Relations
        public readonly tokens: TokenId[] | null = null,
        id: string | undefined = undefined,
        public readonly text: string | null,
        date: string | undefined = undefined
    ) {
        this.id = id || uuidv4();
        this.date = date || getDate();
    }

    toString() {
        return this.id;
    }

    /**
     * Returns a deep copy of the provided Annotation with the applied
     * changes.
     */
    update(delta: Partial<Annotation> = {}) {
        return new Annotation(
            delta.bounds ?? Object.assign({}, this.bounds),
            delta.page ?? this.page,
            delta.ontoClass ?? Object.assign({}, this.ontoClass),
            delta.tokens ?? this.tokens?.map((t) => Object.assign({}, t)),
            this.id,
            delta.text ?? this.text
        );
    }

    static fromObject(obj: Annotation) {
        return new Annotation(obj.bounds, obj.page, obj.ontoClass, obj.tokens, obj.id, obj.text);
    }
}

/**
 * Class containing document committed annotations.
 */
export class DocAnnotations {
    constructor(
        public readonly annotations: Annotation[],
        public readonly relations: RelationGroup[],
        public readonly unsavedChanges: boolean = false
    ) {}

    saved(): DocAnnotations {
        return new DocAnnotations(this.annotations, this.relations, false);
    }

    withNewAnnotation(a: Annotation): DocAnnotations {
        return new DocAnnotations(this.annotations.concat([a]), this.relations, true);
    }

    withNewRelation(r: RelationGroup): DocAnnotations {
        return new DocAnnotations(this.annotations, this.relations.concat([r]), true);
    }

    updateAnnotation(a: Annotation, delta: Partial<Annotation>): DocAnnotations {
        const updatedAnnotations = this.annotations.map((ann) =>
            ann.id === a.id ? ann.update(delta) : ann
        );
        return new DocAnnotations(updatedAnnotations, this.relations, true);
    }

    updateRelation(r: RelationGroup, delta: Partial<RelationGroup>): DocAnnotations {
        const updatedRelations = this.relations.map((rel) =>
            rel.id === r.id ? rel.updateOntoProperty(delta) : rel
        );
        return new DocAnnotations(this.annotations, updatedRelations, true);
    }

    deleteAnnotation(a: Annotation): DocAnnotations {
        const newAnnotations = this.annotations.filter((ann) => ann.id !== a.id);
        const deletedRelations: RelationGroup[] = [];

        const newRelations = this.relations
            .map((r) => {
                const relation = r.updateForAnnotationDeletion(a);
                if (!relation) deletedRelations.push(r);
                return relation;
            })
            .filter((r) => r !== undefined);

        console.log('Deleted Relations: ', deletedRelations);

        return new DocAnnotations(newAnnotations, newRelations as RelationGroup[], true);
    }

    deleteRelation(r: RelationGroup): DocAnnotations {
        const newRelations = this.relations.filter((rel) => rel.id !== r.id);
        return new DocAnnotations(this.annotations, newRelations as RelationGroup[], true);
    }

    undoAnnotation(): DocAnnotations {
        const popped = this.annotations.pop();
        if (!popped) {
            // No annotations, nothing to update
            return this;
        }
        const newRelations = this.relations
            .map((r) => r.updateForAnnotationDeletion(popped))
            .filter((r) => r !== undefined);

        return new DocAnnotations(this.annotations, newRelations as RelationGroup[], true);
    }

    anticipateDeletedRelations(a: Annotation): RelationGroup[] {
        const deletedRelations: RelationGroup[] = [];

        this.relations.forEach((r) => {
            const relation = r.updateForAnnotationDeletion(a);
            if (!relation) deletedRelations.push(r);
        });

        return deletedRelations;
    }

    getAnnotationsOfRelation(r: RelationGroup): infoRelation {
        const sourceAnnotation: Annotation | undefined = this.annotations.find(
            (annotation) => annotation.id === r.sourceIds[0]
            // just the first element because for now we let the creation of a relation
            // between exactly 2 annotatios
        );
        const targetAnnotation: Annotation | undefined = this.annotations.find(
            (annotation) => annotation.id === r.targetIds[0]
        );

        const result: infoRelation = {
            idRelation: r.id,
            sourceAnnotation: sourceAnnotation,
            targetAnnotation: targetAnnotation,
            ontoProperty: r.ontoProperty,
        };
        return result;
    }

    getRelationFromId(id: string): RelationGroup | undefined {
        const relation = this.relations.find((iR) => iR.id === id);
        return relation;
    }

    static empty(): DocAnnotations {
        return new DocAnnotations([], []);
    }
}

/**
 * The statuses both delta annotations and relations can represent.
 */
export enum TaskAnnotationStatus {
    CREATED = 'CREATED',
    MODIFIED = 'MODIFIED',
    DELETED = 'DELETED',
}

/**
 * Class representing the modifications the relations had during a task.
 */
export class TaskRelationGroup {
    public readonly id: string;
    public readonly date: string;
    constructor(
        id: string | undefined = undefined,
        public sourceIds: string[],
        public targetIds: string[],
        public ontoProperty: OntoProperty,
        public status: TaskAnnotationStatus,
        date: string | undefined = undefined
    ) {
        this.id = id || uuidv4();
        this.date = date || getDate();
    }

    static fromObject(obj: TaskRelationGroup) {
        return new TaskRelationGroup(
            obj.id,
            obj.sourceIds,
            obj.targetIds,
            obj.ontoProperty,
            obj.status
        );
    }

    static fromRelation(obj: RelationGroup, status: TaskAnnotationStatus) {
        return new TaskRelationGroup(
            obj.id,
            obj.sourceIds,
            obj.targetIds,
            obj.ontoProperty,
            status
        );
    }

    updateOntoProperty(delta: Partial<RelationGroup> = {}) {
        return new TaskRelationGroup(
            this.id,
            this.sourceIds,
            this.targetIds,
            delta.ontoProperty ?? this.ontoProperty,
            this.status ?? TaskAnnotationStatus.MODIFIED
        );
    }
}

/**
 * Class representing the modifications the annotations had during a task.
 */
export class TaskAnnotation {
    public readonly id: string;
    public readonly date: string;

    constructor(
        public bounds: Bounds,
        public readonly page: number,
        public readonly ontoClass: OntoClass, // prima era generico: Label usato anche per Relations
        public readonly tokens: TokenId[] | null = null,
        id: string | undefined = undefined,
        public readonly text: string | null,
        public status: TaskAnnotationStatus,
        date: string | undefined = undefined
    ) {
        this.id = id || uuidv4();
        this.date = date || getDate();
    }

    toString() {
        return this.id;
    }

    /**
     * Returns a deep copy of the provided Annotation with the applied
     * changes.
     */
    update(delta: Partial<Annotation> = {}) {
        return new TaskAnnotation(
            delta.bounds ?? Object.assign({}, this.bounds),
            delta.page ?? this.page,
            delta.ontoClass ?? Object.assign({}, this.ontoClass),
            delta.tokens ?? this.tokens?.map((t) => Object.assign({}, t)),
            this.id,
            delta.text ?? this.text,
            this.status ?? TaskAnnotationStatus.MODIFIED
        );
    }

    static fromObject(obj: TaskAnnotation) {
        return new TaskAnnotation(
            obj.bounds,
            obj.page,
            obj.ontoClass,
            obj.tokens,
            obj.id,
            obj.text,
            obj.status
        );
    }

    static fromAnnotation(obj: Annotation, status: TaskAnnotationStatus) {
        return new TaskAnnotation(
            obj.bounds,
            obj.page,
            obj.ontoClass,
            obj.tokens,
            obj.id,
            obj.text,
            status
        );
    }
}

/**
 * Class containing all the changes that happened to the committed document
 * annotations during a task.
 */
export class TaskDeltaAnnotations {
    constructor(
        public readonly annotations: TaskAnnotation[],
        public readonly relations: TaskRelationGroup[],
        public readonly unsavedChanges: boolean = false
    ) {}

    saved(): TaskDeltaAnnotations {
        return new TaskDeltaAnnotations(this.annotations, this.relations, false);
    }

    withNewAnnotation(a: Annotation): TaskDeltaAnnotations {
        const deltaAnnotation = TaskAnnotation.fromAnnotation(a, TaskAnnotationStatus.CREATED);
        return new TaskDeltaAnnotations(
            this.annotations.concat([deltaAnnotation]),
            this.relations,
            true
        );
    }

    withNewRelation(r: RelationGroup): TaskDeltaAnnotations {
        const deltaRelation = TaskRelationGroup.fromRelation(r, TaskAnnotationStatus.CREATED);
        return new TaskDeltaAnnotations(
            this.annotations,
            this.relations.concat([deltaRelation]),
            true
        );
    }

    updateAnnotation(a: Annotation, delta: Partial<Annotation>): TaskDeltaAnnotations {
        const deltaAnnotation = this.annotations.find((ann) => ann.id === a.id);

        // If the delta annotation is found, it means it was created by the current task,
        // so just update it.
        if (deltaAnnotation) {
            const updatedAnnotations = this.annotations.map((ann) =>
                ann.id === deltaAnnotation.id ? ann.update(delta) : ann
            );
            return new TaskDeltaAnnotations(updatedAnnotations, this.relations, true);
        }

        // Otherwise, create a new delta annotation
        const newDeltaAnnotation = TaskAnnotation.fromAnnotation(
            a.update(delta),
            TaskAnnotationStatus.MODIFIED
        );
        return new TaskDeltaAnnotations(
            this.annotations.concat([newDeltaAnnotation]),
            this.relations,
            true
        );
    }

    updateRelation(r: RelationGroup, delta: Partial<RelationGroup>): TaskDeltaAnnotations {
        const deltaRelation = this.relations.find((rel) => rel.id === r.id);

        // If the delta relation is found, it means it was created by the current task,
        // so just update it.
        if (deltaRelation) {
            const updatedRelations = this.relations.map((rel) =>
                rel.id === deltaRelation.id ? rel.updateOntoProperty(delta) : rel
            );
            return new TaskDeltaAnnotations(this.annotations, updatedRelations, true);
        }

        // Otherwise, create a new delta relation
        const newDeltaRelation = TaskRelationGroup.fromRelation(
            r.updateOntoProperty(delta),
            TaskAnnotationStatus.MODIFIED
        );
        return new TaskDeltaAnnotations(
            this.annotations,
            this.relations.concat([newDeltaRelation]),
            true
        );
    }

    deleteAnnotation(a: Annotation): TaskDeltaAnnotations {
        const deltaAnnotation = this.annotations.find((ann) => ann.id === a.id);

        // If the delta annotation is not found, it means that the annotation exists in the
        // document commit, so we have to take note of the deletion.
        if (!deltaAnnotation) {
            const newDeltaAnnotation = TaskAnnotation.fromAnnotation(
                a,
                TaskAnnotationStatus.DELETED
            );
            return new TaskDeltaAnnotations(
                this.annotations.concat([newDeltaAnnotation]),
                this.relations,
                true
            );
        }

        // If the delta annotation is found, and it has a Modified status, we need to replace it
        // with a deletion delta.
        if (deltaAnnotation.status === TaskAnnotationStatus.MODIFIED) {
            const newAnnotations = this.annotations.filter((ann) => ann.id !== deltaAnnotation.id);
            const newDeltaAnnotation = TaskAnnotation.fromAnnotation(
                a,
                TaskAnnotationStatus.DELETED
            );
            return new TaskDeltaAnnotations(
                newAnnotations.concat([newDeltaAnnotation]),
                this.relations,
                true
            );
        }

        // Otherwise, the annotation was created during the current task, so just remove it.
        const newAnnotations = this.annotations.filter((ann) => ann.id !== deltaAnnotation.id);
        return new TaskDeltaAnnotations(newAnnotations, this.relations, true);
    }

    deleteRelation(r: RelationGroup): TaskDeltaAnnotations {
        const deltaRelation = this.relations.find((rel) => rel.id === r.id);

        // If the delta relation is not found, it means that the relation exists in the
        // document commit, so we have to take note of the deletion.
        // Same if the delta relation is found, and it is modified.
        if (!deltaRelation) {
            const newDeltaRelation = TaskRelationGroup.fromRelation(
                r,
                TaskAnnotationStatus.DELETED
            );
            return new TaskDeltaAnnotations(
                this.annotations,
                this.relations.concat([newDeltaRelation]),
                true
            );
        }

        // If the delta relation is found, and it has a Modified status, we need to replace it
        // with a deletion delta.
        if (deltaRelation.status === TaskAnnotationStatus.MODIFIED) {
            const newRelations = this.relations.filter((rel) => rel.id !== deltaRelation.id);
            const newDeltaRelation = TaskRelationGroup.fromRelation(
                r,
                TaskAnnotationStatus.DELETED
            );
            return new TaskDeltaAnnotations(
                this.annotations,
                newRelations.concat([newDeltaRelation]),
                true
            );
        }

        // Otherwise, the relation was created during the current task, so just remove it.
        const newRelations = this.relations.filter((rel) => rel.id !== deltaRelation.id);
        return new TaskDeltaAnnotations(this.annotations, newRelations, true);
    }

    deleteRelations(deletedRelations: RelationGroup[]): TaskDeltaAnnotations {
        let newRelations = this.relations.filter((_) => true);

        deletedRelations.forEach((r) => {
            const deltaRelation = newRelations.find((rel) => rel.id === r.id);

            if (!deltaRelation) {
                // If the delta relation is not found, it means that the relation exists in the
                // document commit, so we have to take note of the deletion.
                // Same if the delta relation is found, and it is modified.
                const newDeltaRelation = TaskRelationGroup.fromRelation(
                    r,
                    TaskAnnotationStatus.DELETED
                );
                newRelations = newRelations.concat([newDeltaRelation]);
            } else if (deltaRelation.status === TaskAnnotationStatus.MODIFIED) {
                // If the delta relation is found, and it has a Modified status, we need to replace it
                // with a deletion delta.
                newRelations = this.relations.filter((rel) => rel.id !== deltaRelation.id);
                const newDeltaRelation = TaskRelationGroup.fromRelation(
                    r,
                    TaskAnnotationStatus.DELETED
                );
                newRelations = newRelations.concat([newDeltaRelation]);
            } else {
                // Otherwise, the relation was created during the current task, so just remove it.
                newRelations = newRelations.filter((rel) => rel.id !== deltaRelation.id);
            }
        });

        return new TaskDeltaAnnotations(this.annotations, newRelations, true);
    }

    static empty(): TaskDeltaAnnotations {
        return new TaskDeltaAnnotations([], []);
    }
}

/**
 * Orchestrator class for the visualized PDF annotations.
 * Combines both document committed annotations, and task delta annotations.
 */
export class PDFAnnotations {
    constructor(
        public readonly docAnnotations: DocAnnotations,
        public readonly taskDeltaAnnotations: TaskDeltaAnnotations,
        public readonly unsavedChanges: boolean = false
    ) {}

    saved(): PDFAnnotations {
        return new PDFAnnotations(this.docAnnotations, this.taskDeltaAnnotations, false);
    }

    withNewAnnotation(a: Annotation): PDFAnnotations {
        return new PDFAnnotations(
            this.docAnnotations.withNewAnnotation(a),
            this.taskDeltaAnnotations.withNewAnnotation(a),
            true
        );
    }

    withNewRelation(r: RelationGroup): PDFAnnotations {
        return new PDFAnnotations(
            this.docAnnotations.withNewRelation(r),
            this.taskDeltaAnnotations.withNewRelation(r),
            true
        );
    }

    updateAnnotation(a: Annotation, delta: Partial<Annotation> = {}): PDFAnnotations {
        return new PDFAnnotations(
            this.docAnnotations.updateAnnotation(a, delta),
            this.taskDeltaAnnotations.updateAnnotation(a, delta),
            true
        );
    }

    updateRelation(r: RelationGroup, delta: Partial<RelationGroup> = {}): PDFAnnotations {
        return new PDFAnnotations(
            this.docAnnotations.updateRelation(r, delta),
            this.taskDeltaAnnotations.updateRelation(r, delta),
            true
        );
    }

    deleteAnnotation(a: Annotation): PDFAnnotations {
        const deletedRelations = this.docAnnotations.anticipateDeletedRelations(a);
        const updatedDocAnnotations = this.docAnnotations.deleteAnnotation(a);

        const updatedDeltaRelations = this.taskDeltaAnnotations
            .deleteAnnotation(a)
            .deleteRelations(deletedRelations);

        return new PDFAnnotations(updatedDocAnnotations, updatedDeltaRelations, true);
    }

    deleteRelation(r: RelationGroup): PDFAnnotations {
        return new PDFAnnotations(
            this.docAnnotations.deleteRelation(r),
            this.taskDeltaAnnotations.deleteRelation(r),
            true
        );
    }

    undoAnnotation(): PDFAnnotations {
        // TODO
        return this;
    }

    getAnnotationsOfRelation(r: RelationGroup): infoRelation {
        return this.docAnnotations.getAnnotationsOfRelation(r);
    }

    getRelationFromId(id: string): RelationGroup | undefined {
        return this.docAnnotations.getRelationFromId(id);
    }

    static empty(): PDFAnnotations {
        return new PDFAnnotations(DocAnnotations.empty(), TaskDeltaAnnotations.empty());
    }
}

interface _AnnotationStore {
    ontoNames?: string[];
    setOntoNames: (_ontoNames: string[]) => void;

    ontoClasses: OntoClass[];
    setOntoClasses: (ontoClasses: OntoClass[]) => void;
    activeOntoClass?: OntoClass;
    setActiveOntoClass: (ontoClass: OntoClass) => void;

    ontoProperties: OntoProperty[];
    setOntoProperties: (ontoProperties: OntoProperty[]) => void;
    activeOntoProperty?: OntoProperty;
    setActiveOntoProperty: (ontoProperty: OntoProperty) => void;

    pdfAnnotations: PDFAnnotations;
    setPdfAnnotations: (t: PDFAnnotations) => void;

    selectedAnnotations: Annotation[];
    setSelectedAnnotations: (t: Annotation[]) => void;

    freeFormAnnotations: boolean;
    toggleFreeFormAnnotations: (state: boolean) => void;

    hideLabels: boolean;
    setHideLabels: (state: boolean) => void;

    relationMode: boolean;
    setRelationMode: (state: boolean) => void;

    src?: Annotation | null;
    setSrc: (annotation: Annotation | null) => void;

    dst?: Annotation | null;
    setDst: (annotation: Annotation | null) => void;
}

export const AnnotationStore = createContext<_AnnotationStore>({
    pdfAnnotations: PDFAnnotations.empty(),
    ontoNames: undefined,
    setOntoNames: (_?: string[]) => {
        throw new Error('Unimplemented');
    },
    ontoClasses: [],
    setOntoClasses: (_?: OntoClass[]) => {
        throw new Error('Unimplemented');
    },
    activeOntoClass: undefined,
    setActiveOntoClass: (_?: OntoClass) => {
        throw new Error('Unimplemented');
    },
    ontoProperties: [],
    setOntoProperties: (_?: OntoProperty[]) => {
        throw new Error('Unimplemented');
    },
    activeOntoProperty: undefined,
    setActiveOntoProperty: (_?: OntoProperty) => {
        throw new Error('Unimplemented');
    },
    selectedAnnotations: [],
    setSelectedAnnotations: (_?: Annotation[]) => {
        throw new Error('Unimplemented');
    },
    setPdfAnnotations: (_: PDFAnnotations) => {
        throw new Error('Unimplemented');
    },
    freeFormAnnotations: false,
    toggleFreeFormAnnotations: (_: boolean) => {
        throw new Error('Unimplemented');
    },
    hideLabels: false,
    setHideLabels: (_: boolean) => {
        throw new Error('Unimplemented');
    },
    relationMode: false,
    setRelationMode: (_: boolean) => {
        throw new Error('Unimplemented');
    },
    src: null,
    setSrc: (_?: Annotation | null) => {
        throw new Error('Unimplemented');
    },
    dst: null,
    setDst: (_?: Annotation | null) => {
        throw new Error('Unimplemented');
    },
});
