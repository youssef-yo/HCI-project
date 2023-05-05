import axios from 'axios';
import { Doc, DocCommit, PageTokens } from './schemas';
import { Annotation, DocAnnotations, RelationGroup } from '../context';

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
     * Gets the commits that have been created so far for the specified document.
     *
     * @param id Document ID
     * @returns Promise with commit list
     */
    const getDocumentCommits: (id: string) => Promise<DocCommit[]> = (id: string) => {
        return axios
            .get(`/api/docs/${id}/commits`)
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    /**
     * Gets a specific commit that has been created.
     *
     * @param id Commit ID
     * @returns Promise with commit
     */
    const getCommitByID: (id: string) => Promise<DocCommit> = (id: string) => {
        return axios
            .get(`/api/docs/commits/${id}`)
            .then((res) => res.data)
            .catch((err) => Promise.reject(err));
    };

    /**
     * Gets the annotations of the specified commit, belonging to a document.
     *
     * @param id Commit ID
     * @returns Promise with document annotations
     */
    const getCommitAnnotations: (id: string) => Promise<DocAnnotations> = (id: string) => {
        return axios
            .get(`/api/docs/commits/${id}/annotations`)
            .then((res) => {
                const ann: DocAnnotations = res.data;
                const annotations = ann.annotations.map((a) => Annotation.fromObject(a));
                const relations = ann.relations.map((r) => RelationGroup.fromObject(r));

                return new DocAnnotations(annotations, relations);
            })
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
        getDocumentCommits,
        getCommitByID,
        getCommitAnnotations,
        getDocumentByID,
        getTokens,
    };
};

export default useDocumentApi;
