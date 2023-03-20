import axios from 'axios';
import { OntologiesNames } from './schemas';

/**
 * Ontology API entry points.
 *
 * @returns API functions
 */
const useOntologyApi = () => {
    const deleteFile = async (filename: string) => {
        axios
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
    const getNamesOfOntologiesAlreadyUploaded: () => Promise<OntologiesNames> = async () => {
        return await axios
            .get('/api/ontology/names')
            .then((r) => r.data)
            .catch((err) => console.log(err));
    };

    return { deleteFile, getNamesOfOntologiesAlreadyUploaded };
};

export default useOntologyApi;
