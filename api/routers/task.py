from typing import List, Optional

from fastapi import (
    APIRouter,
    Body,
    Depends,
    HTTPException,
    status
)

from db.database import MongoClient, get_db

from models.domain import (
    DocumentDocument,
    TaskDocument,
    UserDocument
)
from models.schemas import (
    PdfAnnotation,
    PydanticObjectId,
    TaskInCreate,
    TaskDeltaAnnotation,
    TaskOutResponse
)

from services.oauth2 import get_current_user
from services.task import (
    create_task,
    find_tasks,
    get_task_by_id
)


router = APIRouter()


@router.get("", response_model=List[TaskOutResponse])
async def get_tasks(
    user_id: Optional[PydanticObjectId] = None,
    doc_id: Optional[PydanticObjectId] = None,
    auth_user: UserDocument = Depends(get_current_user)
):
    """
    Gets all tasks.
    It's possible to filter by user ID and document ID.
    """
    tasks = await find_tasks(user_id, doc_id)
    return tasks


@router.post("", response_model=TaskOutResponse)
async def create_document_task(
    task_data: TaskInCreate,
    auth_user: UserDocument = Depends(get_current_user)
):
    task = await create_task(task_data)
    return task


@router.get("/me", response_model=List[TaskOutResponse])
async def get_own_tasks(
    user: UserDocument = Depends(get_current_user)
):
    """Gets the tasks that are assigned to the user making the request."""
    tasks = await find_tasks(user_id=user.id)
    return tasks


@router.get("/{task_id}", response_model=TaskOutResponse)
async def get_task(
    task_id: PydanticObjectId,
    auth_user: UserDocument = Depends(get_current_user)
):
    """Gets the task with the specified ID."""
    task = await get_task_by_id(task_id, assert_exists=True)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: PydanticObjectId,
    auth_user: UserDocument = Depends(get_current_user)
):
    """Deletes the task with the specified ID."""
    task = await get_task_by_id(task_id, assert_exists=True)
    await task.delete()


@router.get("/{task_id}/doc-annotations", response_model=PdfAnnotation)
async def get_document_with_task_annotations(
    task_id: PydanticObjectId,
    auth_user: UserDocument = Depends(get_current_user)
):
    """
    Gets the annotations of the document referred by the selected task,
    combined with the changes that happened during the task itself.
    """
    task = await get_task_by_id(task_id, assert_exists=True)

    # If no commit is referred by the task, it means the task was created when
    # no commits had already been done, so we just return the converted task annotations.
    if not task.commit:
        return PdfAnnotation.empty()
    
    # TODO: If commit, combine committed document annotations and task delta annotations.
    return PdfAnnotation.empty()
    


@router.get("/{task_id}/task-annotations", response_model=TaskDeltaAnnotation)
async def get_task_annotations(
    task_id: PydanticObjectId,
    auth_user: UserDocument = Depends(get_current_user)
):
    """Gets the delta annotations and relations tied to the specified task."""
    task = await get_task_by_id(task_id, assert_exists=True)
    return task.task_annotations


@router.put("/{task_id}/task-annotations", status_code=status.HTTP_204_NO_CONTENT)
async def update_task_annotations(
    task_id: PydanticObjectId,
    annotations: TaskDeltaAnnotation,
    auth_user: UserDocument = Depends(get_current_user)
):
    """Updates the delta annotations and relations tied to the specified task."""
    task = await get_task_by_id(task_id, assert_exists=True)
    
    # Check if the user that wants to update is the same that has the task assigned
    if task.user_id != auth_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden."
        )
    
    await task.update({"$set": {TaskDocument.task_annotations: annotations}})


@router.post("/{task_id}/comments", status_code=status.HTTP_204_NO_CONTENT)
async def set_task_comments(
    task_id: PydanticObjectId,
    comments: str = Body(...),
    auth_user: UserDocument = Depends(get_current_user)
):
    """Marks the selected task as complete or not complete (by the annotator)."""
    task = await get_task_by_id(task_id, assert_exists=True)
    
    # Check if the user that wants to update is the same that has the task assigned
    if task.user_id != auth_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden."
        )
    
    await task.update({"$set": {TaskDocument.comments: comments}})


@router.post("/{task_id}/commit", status_code=status.HTTP_204_NO_CONTENT)
async def commit_task(
    task_id: PydanticObjectId,
    auth_user: UserDocument = Depends(get_current_user)
):
    """Commits the task, by saving a new commit with the updated document annotations."""
    # TODO
    pass


@router.post("/{task_id}/complete", status_code=status.HTTP_204_NO_CONTENT)
async def set_task_complete(
    task_id: PydanticObjectId,
    complete: bool = Body(...),
    auth_user: UserDocument = Depends(get_current_user)
):
    """Marks the selected task as complete or not complete (by the annotator)."""
    task = await get_task_by_id(task_id, assert_exists=True)
    
    # Check if the user that wants to update is the same that has the task assigned
    if task.user_id != auth_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden."
        )
    
    await task.update({"$set": {TaskDocument.marked_complete: complete}})