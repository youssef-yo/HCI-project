import axios from 'axios';
import { Ontology } from './schemas';
import useAxiosPrivate from './useAxiosPrivate';

/**
 * Ontology API entry points.
 *
 * @returns API functions
 */
const useOntologyApi = () => {
    const axiosPrivate = useAxiosPrivate();

    const deleteOntology = async (id: string) => {
        axiosPrivate
            .delete(`/api/ontology/${id}`)
            .then((res) => {
                console.log(res);
            })
            .catch((err) => console.error(err));
    };

    /**
     * Gets the ontologies that have been uploaded.
     *
     * @returns Promise with ontologies
     */
    const getOntologiesList: () => Promise<Ontology[]> = async () => {
        return await axios
            .get('/api/ontology/names')
            .then((r) => r.data)
            .catch((err) => console.log(err));
    };

    /**
     * Gets the ontologies classes.
     *
     * @param _ontologiesIds Ontologies IDs
     * @returns Ontologies classes
     */
    const getClasses = async (_ontologiesIds: string[]) => {
        try {
            const response = await axios({
                method: 'post',
                url: '/api/ontology/classes',
                data: _ontologiesIds,
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
     * @param _ontologiesIds Ontologies IDs
     * @returns Ontologies properties
     */
    const getProperties = async (_ontologiesIds: string[]) => {
        try {
            const response = await axios({
                method: 'post',
                url: '/api/ontology/properties',
                data: _ontologiesIds,
            });
            // console.log('response data: ', response.data);
            return response.data;
        } catch (error) {
            console.log(error);
        }
    };

    return { deleteOntology, getOntologiesList, getClasses, getProperties };
};

export default useOntologyApi;
