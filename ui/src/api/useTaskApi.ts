import useAxiosPrivate from './useAxiosPrivate';
import { Task, TaskCreate } from './schemas';
import { PdfAnnotations } from '../context';

/**
 * Task API entry points.
 *
 * @returns API functions
 */
const useTaskApi = () => {
    const axiosPrivate = useAxiosPrivate();

    /**
     * Gets all the tasks that match the specified criteria.
     *
     * @returns Promise with task list
     */
    const getAllTasks: () => Promise<Task[]> = () => {
        return axiosPrivate
            .get('/api/tasks')
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
    const getLoggedUserTasks: () => Promise<Task[]> = () => {
        return axiosPrivate
            .get('/api/tasks/')
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
            .post('/api/tasks/', taskCreate)
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
     * Gets the annotations of the selected task.
     *
     * @param id Task ID
     * @returns Promise with task annotations
     */
    const getTaskAnnotations: (id: string) => Promise<PdfAnnotations> = (id: string) => {
        return axiosPrivate
            .get(`/api/tasks/${id}/annotations`)
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    /**
     * Saves the given annotations for the selected task.
     *
     * @param id Task ID
     * @param pdfAnnotations Task annotations
     * @returns Empty promise
     */
    const saveTaskAnnotations: (id: string, pdfAnnotations: PdfAnnotations) => Promise<any> = (
        id: string,
        pdfAnnotations: PdfAnnotations
    ) => {
        return axiosPrivate
            .put(`/api/tasks/${id}/annotations`, pdfAnnotations)
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    return {
        getAllTasks,
        getTaskByID,
        getLoggedUserTasks,
        createTask,
        deleteTask,
        getTaskAnnotations,
        saveTaskAnnotations,
    };
};

export default useTaskApi;
