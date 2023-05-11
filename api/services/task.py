from datetime import datetime
from typing import Dict, List, Optional

from fastapi import (
    HTTPException,
    status
)

from core.config import get_settings

from models.domain import (
    DocCommitDocument,
    DocumentDocument,
    TaskDocument,
    UserDocument
)
from models.schemas import (
    DocAnnotations,
    PageRange,
    PydanticObjectId,
    TaskAnnotationStatus,
    TaskDeltaAnnotations,
    TaskExtended,
    TaskInCreate,
    TaskStatus
)

from .doc import get_document_by_id, get_document_commit_by_id, get_document_commit_annotations
from .user import get_user_by_id


async def get_task_by_id(
    id: PydanticObjectId,
    assert_exists: bool = False
) -> TaskDocument:
    """
    Gets the task with the specified identifier.
    If it does not exist, and the assertion flag has been set,
    it raises an HTTPException.
    """
    task = await TaskDocument.get(id)
    if not task and assert_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {id} not found."
        )

    return task


async def find_tasks(
    user_id: Optional[PydanticObjectId] = None,
    doc_id: Optional[PydanticObjectId] = None
) -> List[TaskDocument]:
    """
    Gets all the tasks that match the specified criteria.
    """
    query = build_query(user_id, doc_id)

    tasks = await TaskDocument.find_many(query).to_list()
    return tasks


async def find_tasks_extended(
    user_id: Optional[PydanticObjectId] = None,
    doc_id: Optional[PydanticObjectId] = None
) -> List[TaskDocument]:
    """
    Gets all the tasks that match the specified criteria.
    """
    query = build_query(user_id, doc_id)

    tasks = await TaskDocument.aggregate([
        {
            "$match": query
        },
        {
            "$lookup": {
                "from": get_settings().docs_collection,
                "localField": "doc_id",
                "foreignField": "_id",
                "as": "document"
            }
        },
        {
            "$lookup": {
                "from": get_settings().users_collection,
                "localField": "user_id",
                "foreignField": "_id",
                "as": "annotator"
            }
        },
        {
            "$set": {
                "document": {"$first": "$document"},
                "annotator": {"$first": "$annotator"}
            }
        },
        {
            "$project": {
                "user_id": 0,
                "doc_id": 0,
                "delta_annotations": 0
            }
        }
    ], projection_model=TaskExtended).to_list()

    return tasks


async def create_task(task_data: TaskInCreate) -> TaskDocument:
    """
    Creates a new task with the given properties.
    """
    # Make sure the document exists, and retrieve it
    task_doc = await get_document_by_id(task_data.doc_id, assert_exists=True)

    # Make sure the user exists
    task_user = await get_user_by_id(task_data.user_id, assert_exists=True)

    await verify_valid_page_range(task_doc, task_data.page_range)

    task = TaskDocument(
        doc_id=task_data.doc_id,
        user_id=task_data.user_id,
        page_range=task_data.page_range,
        description=task_data.description,
        status=TaskStatus.active,
        commit=task_doc.commit
    )
    await task.create()

    return task


async def dismiss_task_annotations(
    task: TaskDocument
):
    """
    Dismisses the selected task.

    By dismissing a task, it cannot be committed in future, and also makes the page
    range accessible again for new tasks.
    """
    await task.update({"$set": {
        TaskDocument.status: TaskStatus.dismissed,
        TaskDocument.completed_at: datetime.now()
    }})


async def commit_task_annotations(
    task: TaskDocument
) -> DocCommitDocument:
    """
    Commits the delta annotations applied during the selected task.
    """
    task_doc = await get_document_by_id(task.doc_id, assert_exists=True)

    # If the document has already been committed, take the last committed annotations.
    # If no previous commit was made on the document, just use empty annotations.
    if task_doc.commit:
        doc_annotations = await get_document_commit_annotations(task_doc.commit)
    else:
        doc_annotations = DocAnnotations.empty()

    # Apply all delta changes (do not limit to a page range)
    combined_annotations = combine_document_task_annotations(doc_annotations, task.delta_annotations)

    # Create the new shapshot
    new_commit = DocCommitDocument(
        doc_id=task.doc_id,
        created_at=datetime.now(),
        doc_annotations=combined_annotations,
        prev_commit=task_doc.commit
    )
    await new_commit.create()

    # Update the document commit pointer
    await task_doc.update({"$set": {DocumentDocument.commit: new_commit.id}})

    # Update task status as complete
    await task.update({"$set": {
        TaskDocument.status: TaskStatus.completed,
        TaskDocument.completed_at: datetime.now()
    }})


async def get_combined_doc_task_annotations(
    task: TaskDocument
) -> DocAnnotations:
    """
    Combines the annotations from the previously committed document annotations,
    referred by the selected task, with the annotation deltas (changes) of the task itself.

    If no commit is referred by the task, the initial document annotations are
    considered to be none, and simply applies the deltas.

    If the page range is set, the returned document is limited.
    """

    # If no commit is referred by the task, it means the task was created when
    # no commits had already been done, so we just return the converted task annotations.
    if not task.commit:
        return combine_document_task_annotations(
            DocAnnotations.empty(),
            task.delta_annotations
        )

    # If commit, combine committed document annotations and task delta annotations.
    doc_annotations = await get_document_commit_annotations(task.commit)

    # Page ranges need to be decreased by 1, the indexing of pages is zero-based
    page_range = PageRange(
        start=task.page_range.start - 1,
        end=task.page_range.end - 1
    )

    return combine_document_task_annotations(
        doc_annotations,
        task.delta_annotations,
        page_range
    )


def combine_document_task_annotations(
        doc_annotations: DocAnnotations,
        task_annotations: TaskDeltaAnnotations,
        page_range: PageRange = None
) -> DocAnnotations:
    """
    Combines the annotations from the previously committed document annotations,
    referred by the selected task, with the annotation deltas (changes) of the task itself.

    If no commit is referred by the task, the initial document annotations are
    considered to be none, and simply applies the deltas.

    If the page range is set, the returned document is limited.
    """
    doc_annotations = apply_annotation_deltas(doc_annotations, task_annotations)
    return validate_annotations(doc_annotations, page_range)


def apply_annotation_deltas(
        doc_annotations: DocAnnotations,
        delta_annotations: TaskDeltaAnnotations
) -> DocAnnotations:
    """
    Combines the annotations from the selected document annotations,
    with the annotation deltas (changes).
    """
    # print('Delta Annotations: ', delta_annotations.annotations)
    # print('Delta Relations: ', delta_annotations.annotations)

    for dt_annotation in delta_annotations.annotations:
        if dt_annotation.status == TaskAnnotationStatus.created:
            doc_annotations.add_annotation(dt_annotation.to_annotation())
        elif dt_annotation.status == TaskAnnotationStatus.modified:
            doc_annotations.update_annotation(dt_annotation.to_annotation())
        elif dt_annotation.status == TaskAnnotationStatus.deleted:
            doc_annotations.remove_annotation(dt_annotation.to_annotation())

    for dt_relation in delta_annotations.relations:
        if dt_relation.status == TaskAnnotationStatus.created:
            doc_annotations.add_relation(dt_relation.to_relation())
        elif dt_relation.status == TaskAnnotationStatus.modified:
            doc_annotations.update_relation(dt_relation.to_relation())
        elif dt_relation.status == TaskAnnotationStatus.deleted:
            doc_annotations.remove_relation(dt_relation.to_relation())

    # print('PDF Annotations: ', doc_annotations.annotations)
    # print('PDF Relations: ', doc_annotations.relations)

    return doc_annotations


def validate_annotations(
        doc_annotations: DocAnnotations,
        page_range: PageRange
) -> DocAnnotations:
    """
    Extracts only the annotations that belong to the page range.

    Relations that refer to annotations outside the page range are left out.
    """
    limited_annotations = DocAnnotations.empty()
    filtered_annotation_ids: List[str] = []

    def all_filtered_annotations(ids: List[str], filtered_ids: List[str]) -> bool:
        for id in ids:
            if id not in filtered_ids:
                return False

        return True

    if page_range:
        def predicate(ann): return page_range.is_within(ann.page)
    else:
        def predicate(ann): return True

    # Filter annotations that are within the page range
    for annotation in doc_annotations.annotations:
        if predicate(annotation):
            limited_annotations.add_annotation(annotation)
            filtered_annotation_ids.append(annotation.id)

    # Filter relations whose annotations all belong to the page range
    for relation in doc_annotations.relations:
        if all_filtered_annotations(relation.sourceIds, filtered_annotation_ids) and all_filtered_annotations(relation.targetIds, filtered_annotation_ids):
            limited_annotations.add_relation(relation)

    return limited_annotations


def build_query(
    user_id: Optional[PydanticObjectId] = None,
    doc_id: Optional[PydanticObjectId] = None
) -> Dict:
    """Builds the task query."""
    query: Dict = {}

    if user_id:
        query["user_id"] = user_id
    if doc_id:
        query["doc_id"] = doc_id

    return query


async def verify_valid_page_range(document: DocumentDocument, page_range: PageRange):
    """
    Checks if the page range of the new task, for the given document, is valid.

    The range is valid if:
        1. The starting page is positive.
        2. The starting page is smaller or equal to the final page.
        3. The final page is not greater than the document total pages.
        4. The range does not overlap with any range of other currently active tasks of the same document.
    """
    if page_range.start < 1 or page_range.start > page_range.end or page_range.end > document.total_pages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid page range."
        )

    # Check for range overlap with other active tasks of same document
    active_tasks = await find_tasks(doc_id=document.id)
    for task in active_tasks:
        if task.status == TaskStatus.active and task.page_range.overlaps(page_range):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"The selected page range overlaps with a page range of an active task, for the selected document."
            )


async def verify_can_update_task(task: TaskDocument, user: UserDocument):
    """
    Check if the user that wants to update is the same that has the task assigned.
    """
    if task.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden."
        )
