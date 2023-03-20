import axios from 'axios';
import useAxiosPrivate from './useAxiosPrivate';
import { Allocation, OntologiesNames } from './schemas';

/**
 * Annotation API entry points.
 *
 * @returns API functions
 */
const useAnnotationApi = () => {
    const axiosPrivate = useAxiosPrivate();

    /**
     * Gets the ontologies classes.
     *
     * @param _ontologiesNames Ontologies names
     * @returns Ontologies classes
     */
    const getClasses = async (_ontologiesNames: OntologiesNames) => {
        const ontoNames: string[] = _ontologiesNames.ontologiesNames;
        try {
            const response = await axios({
                method: 'post',
                url: '/api/annotation/classes',
                data: ontoNames,
            });
            // console.log('response data: ', response.data);
            return response.data;
        } catch (error) {
            console.log(error);
        }
    };

    /**
     * Gets the ontologies properties.
     *
     * @param _ontologiesNames Ontologies names
     * @returns Ontologies properties
     */
    const getProperties = async (_ontologiesNames: OntologiesNames) => {
        const ontoNames: string[] = _ontologiesNames.ontologiesNames;
        try {
            const response = await axios({
                method: 'post',
                url: '/api/annotation/properties',
                data: ontoNames,
            });
            // console.log('response data: ', response.data);
            return response.data;
        } catch (error) {
            console.log(error);
        }
    };

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

    return { getClasses, getProperties, getAllocatedPaperStatus, exportAnnotations };
};

export default useAnnotationApi;
