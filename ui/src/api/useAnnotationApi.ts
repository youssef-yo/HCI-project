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
     * Exports the latest annotations for the specified paper.
     *
     * @param sha Paper ID
     * @returns Promise
     */
    const exportLatestAnnotations = async (sha: string) => {
        return axiosPrivate
            .get(`/api/annotation/${sha}/export`, {
                responseType: 'blob',
            })
            .catch((err) => Promise.reject(err));
    };

    /**
     * Exports the annotations from the selected commit, for the specified paper.
     *
     * @param sha Paper ID
     * @param commit Commit ID
     * @returns Promise
     */
    const exportCommitAnnotations = async (sha: string, commmitId: string) => {
        return axiosPrivate
            .get(`/api/annotation/${sha}/export/${commmitId}`, {
                responseType: 'blob',
            })
            .catch((err) => Promise.reject(err));
    };

    return { getAllocatedPaperStatus, exportLatestAnnotations, exportCommitAnnotations };
};

export default useAnnotationApi;
