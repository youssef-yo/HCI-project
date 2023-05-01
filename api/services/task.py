from typing import Dict, List, Optional

from fastapi import (
    HTTPException,
    status
)

from models.domain import (
    DocumentDocument,
    TaskDocument
)
from models.schemas import (
    PageRange,
    PydanticObjectId,
    TaskInCreate,
    TaskStatus
)

from .doc import get_document_by_id
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
        status=TaskStatus.active
    )
    await task.create()

    return task


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
