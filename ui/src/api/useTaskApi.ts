import useAxiosPrivate from './useAxiosPrivate';
import { Task, TaskCreate, TaskExtended } from './schemas';
import {
    Annotation,
    DocAnnotations,
    RelationGroup,
    TaskAnnotation,
    TaskDeltaAnnotations,
    TaskRelationGroup,
} from '../context';

/**
 * Task API entry points.
 *
 * @returns API functions
 */
const useTaskApi = () => {
    const axiosPrivate = useAxiosPrivate();

    interface TaskQuery {
        userId?: string;
        docId?: string;
    }

    /**
     * Gets all the tasks that match the specified criteria.
     * Parameters that are not set are not included in the query,
     * meaning that with no parameters there's no filter.
     *
     * If you don't need any parameters, just pass empty brackets {}.
     *
     * @param query Query parameters (docId and userId)
     * @returns Promise with task list
     */
    const getTasks: (query: TaskQuery) => Promise<TaskExtended[]> = (query: TaskQuery) => {
        return axiosPrivate
            .get('/api/tasks', {
                params: {
                    user_id: query.userId,
                    doc_id: query.docId,
                },
            })
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    /**
     * Gets the task with the given identifier.
     *
     * @param id Task ID
     * @returns Promise with task
     */
    const getTaskByID: (id: string) => Promise<Task> = (id: string) => {
        return axiosPrivate
            .get(`/api/tasks/${id}`)
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    /**
     * Gets the tasks of the currently logged user.
     *
     * @returns Promise with task list
     */
    const getLoggedUserTasks: () => Promise<TaskExtended[]> = () => {
        return axiosPrivate
            .get('/api/tasks/me')
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    /**
     * Creates a new task with the given properties.
     *
     * @param taskCreate Data of the task to create
     * @returns Promise with task
     */
    const createTask: (taskCreate: TaskCreate) => Promise<Task> = (taskCreate: TaskCreate) => {
        return axiosPrivate
            .post('/api/tasks', taskCreate)
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    /**
     * Commits the delta annotations applied during the selected task.
     *
     * @param id Task ID
     * @returns Empty promise
     */
    const commitTask: (id: string) => Promise<any> = (id: string) => {
        return axiosPrivate
            .post(`/api/tasks/${id}/commit`)
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    /**
     * Dismisses the selected task.
     * By dismissing a task, it cannot be committed in future, and also makes the
     * page range accessible again for new tasks.
     *
     * @param id Task ID
     * @returns Empty promise
     */
    const dismissTask: (id: string) => Promise<any> = (id: string) => {
        return axiosPrivate
            .post(`/api/tasks/${id}/dismiss`)
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    /**
     * Deletes the task with the given identifier.
     *
     * @param id Task ID
     * @returns Empty promise
     */
    const deleteTask: (id: string) => Promise<any> = (id: string) => {
        return axiosPrivate
            .delete(`/api/tasks/${id}`)
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    /**
     * Gets the annotations of the document referred by the selected task,
     * combined with the changes that happened during the task itself.
     *
     * @param id Task ID
     * @returns Promise with combined document and task annotations
     */
    const getDocumentWithTaskAnnotations: (id: string) => Promise<DocAnnotations> = (
        id: string
    ) => {
        return axiosPrivate
            .get(`/api/tasks/${id}/doc-annotations`)
            .then((res) => {
                const ann: DocAnnotations = res.data;
                const annotations = ann.annotations.map((a) => Annotation.fromObject(a));
                const relations = ann.relations.map((r) => RelationGroup.fromObject(r));

                return new DocAnnotations(annotations, relations);
            })
            .catch((err) => Promise.reject(err));
    };

    /**
     * Gets the annotations of the selected task.
     *
     * @param id Task ID
     * @returns Promise with task delta annotations
     */
    const getTaskAnnotations: (id: string) => Promise<TaskDeltaAnnotations> = (id: string) => {
        return axiosPrivate
            .get(`/api/tasks/${id}/task-annotations`)
            .then((res) => {
                const ann: TaskDeltaAnnotations = res.data;
                const annotations = ann.annotations.map((a) => TaskAnnotation.fromObject(a));
                const relations = ann.relations.map((r) => TaskRelationGroup.fromObject(r));

                return new TaskDeltaAnnotations(annotations, relations);
            })
            .catch((err) => Promise.reject(err));
    };

    /**
     * Saves the given annotations for the selected task.
     *
     * @param id Task ID
     * @param pdfAnnotations Task annotations
     * @returns Empty promise
     */
    const saveTaskAnnotations: (
        id: string,
        taskAnnotations: TaskDeltaAnnotations
    ) => Promise<any> = (id: string, taskAnnotations: TaskDeltaAnnotations) => {
        return axiosPrivate
            .put(`/api/tasks/${id}/task-annotations`, taskAnnotations)
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    /**
     * Marks the given task as complete or uncomplete (by annotator).
     *
     * @param id Task ID
     * @param complete Boolean
     * @returns Empty promise
     */
    const markTaskComplete: (id: string, complete: boolean) => Promise<any> = (
        id: string,
        complete: boolean
    ) => {
        return axiosPrivate
            .post(`/api/tasks/${id}/complete`, complete)
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    /**
     * Sets the given comments to the selected task.
     *
     * @param id Task ID
     * @param comments Comments
     * @returns Empty promise
     */
    const setTaskComment: (id: string, comments: string) => Promise<any> = (
        id: string,
        comments: string
    ) => {
        return axiosPrivate
            .post(`/api/tasks/${id}/comments`, comments)
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    return {
        getTasks,
        getTaskByID,
        getLoggedUserTasks,
        createTask,
        commitTask,
        deleteTask,
        dismissTask,
        getDocumentWithTaskAnnotations,
        getTaskAnnotations,
        saveTaskAnnotations,
        markTaskComplete,
        setTaskComment,
    };
};

export default useTaskApi;
