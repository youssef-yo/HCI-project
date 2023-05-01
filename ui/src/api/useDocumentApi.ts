import axios from 'axios';
import { Doc, PageTokens } from './schemas';

function docURL(sha: string): string {
    return `/api/docs/${sha}`;
}

export function pdfURL(sha: string): string {
    return `${docURL(sha)}/pdf`;
}

/**
 * Document API entry points.
 *
 * @returns API functions
 */
const useDocumentApi = () => {
    /**
     * Get all documents that have been uploaded.
     *
     * @returns Promise with document list
     */
    const getAllDocs: () => Promise<Doc[]> = () => {
        return axios
            .get('/api/docs')
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    /**
     * Get the document with the given identifier.
     *
     * @param id Document ID
     * @returns Promise with document
     */
    const getDocumentByID: (id: string) => Promise<Doc> = (id: string) => {
        return axios
            .get(`/api/docs/${id}`)
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    /**
     * Gets the selected document page structure tokens.
     *
     * @param sha Document ID
     * @returns Promise with page structure tokens
     */
    const getTokens: (sha: string) => Promise<PageTokens[]> = async (sha: string) => {
        return axios.get(`${docURL(sha)}/tokens`).then((r) => r.data);
    };

    return {
        getAllDocs,
        getDocumentByID,
        getTokens,
    };
};

export default useDocumentApi;
