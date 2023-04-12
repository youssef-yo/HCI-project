import useAxiosPrivate from './useAxiosPrivate';
import { Allocation } from './schemas';

/**
 * Annotation API entry points.
 *
 * @returns API functions
 */
const useAnnotationApi = () => {
    const axiosPrivate = useAxiosPrivate();

    /**
     * Gets the user assigned papers.
     *
     * @returns Promise with user assigned papers
     */
    const getAllocatedPaperStatus: () => Promise<Allocation> = () => {
        return axiosPrivate.get('/api/annotation/allocation/info').then((r) => r.data);
    };

    /**
     * Exports the annotations for the specified paper.
     *
     * @param sha Paper ID
     * @returns Promise
     */
    const exportAnnotations = async (sha: string) => {
        return axiosPrivate.get(`/api/annotation/${sha}/export`, {
            responseType: 'blob',
        });
    };

    return { getAllocatedPaperStatus, exportAnnotations };
};

export default useAnnotationApi;
