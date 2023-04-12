import axios from 'axios';
import { OntologiesNames } from './schemas';
import useAxiosPrivate from './useAxiosPrivate';

/**
 * Ontology API entry points.
 *
 * @returns API functions
 */
const useOntologyApi = () => {
    const axiosPrivate = useAxiosPrivate();

    const deleteOntology = async (filename: string) => {
        axiosPrivate
            .delete(`/api/ontology/${filename}`)
            .then((res) => {
                console.log(res);
            })
            .catch((err) => console.error(err));
    };

    /**
     * Gets the names of the ontologies that have been uploaded.
     *
     * @returns Promise with ontologies names
     */
    const getOntologiesNames: () => Promise<OntologiesNames> = async () => {
        return await axios
            .get('/api/ontology/names')
            .then((r) => r.data)
            .catch((err) => console.log(err));
    };

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
                url: '/api/ontology/classes',
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
                url: '/api/ontology/properties',
                data: ontoNames,
            });
            // console.log('response data: ', response.data);
            return response.data;
        } catch (error) {
            console.log(error);
        }
    };

    return { deleteOntology, getOntologiesNames, getClasses, getProperties };
};

export default useOntologyApi;
