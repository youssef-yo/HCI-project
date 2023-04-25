import axios from 'axios';
import { Ontology, OntologyUpdate } from './schemas';
import useAxiosPrivate from './useAxiosPrivate';

/**
 * Ontology API entry points.
 *
 * @returns API functions
 */
const useOntologyApi = () => {
    const axiosPrivate = useAxiosPrivate();

    /**
     * Deletes the ontology with the given identifier.
     *
     * @param id Ontology ID
     */
    const deleteOntology = async (id: string) => {
        axiosPrivate
            .delete(`/api/ontology/${id}`)
            .then((res) => {
                console.log(res);
            })
            .catch((err) => console.error(err));
    };

    /**
     * Updates a specific ontology, based on the given identifier, with the given data.
     *
     * @param id Ontology ID
     * @param ontoUpdate Updated data
     * @returns Promise with ontology
     */
    const updateOntology: (id: string, ontoUpdate: OntologyUpdate) => Promise<Ontology> = (
        id: string,
        ontoUpdate: OntologyUpdate
    ) => {
        return axiosPrivate
            .put(`/api/ontology/${id}`, ontoUpdate)
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    /**
     * Gets the ontology with the given identifier.
     *
     * @param id Ontology ID
     * @returns Promise with ontology
     */
    const getOntologyByID: (id: string) => Promise<Ontology> = (id: string) => {
        return axios
            .get(`/api/ontology/${id}`)
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
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

    return {
        deleteOntology,
        updateOntology,
        getOntologyByID,
        getOntologiesList,
        getClasses,
        getProperties,
    };
};

export default useOntologyApi;
