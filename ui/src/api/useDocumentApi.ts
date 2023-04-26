import axios from 'axios';
import { Annotation, PdfAnnotations, RelationGroup } from '../context';
import useAxiosPrivate from './useAxiosPrivate';
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
    const axiosPrivate = useAxiosPrivate();

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

    /**
     * Sets the given comments to the selected document.
     *
     * @param sha Document ID
     * @param comments Comments
     * @returns Promise
     */
    const setPdfComment = async (sha: string, comments: string) => {
        return axiosPrivate.post(`/api/docs/${sha}/comments`, comments);
    };

    /**
     * Sets the selected document as finished or unfinished.
     *
     * @param sha Document ID
     * @param finished Boolean
     * @returns Promise
     */
    const setPdfFinished = async (sha: string, finished: boolean) => {
        return axiosPrivate.post(`/api/docs/${sha}/finished`, finished);
    };

    /**
     * Sets the selected document as junk or not.
     *
     * @param sha DocumentID
     * @param junk Boolean
     * @returns Promise
     */
    const setPdfJunk = async (sha: string, junk: boolean) => {
        return axiosPrivate.post(`/api/docs/${sha}/junk`, junk);
    };

    /**
     * Saves the given annotations for the selected document.
     *
     * @param sha Document ID
     * @param pdfAnnotations Document annotations
     * @returns Promise
     */
    const saveAnnotations: (sha: string, pdfAnnotations: PdfAnnotations) => Promise<any> = (
        sha: string,
        pdfAnnotations: PdfAnnotations
    ) => {
        // console.log('pdfAnnotations.annotations: ', pdfAnnotations.annotations);
        // console.log('pdfAnnotations.relations: ', pdfAnnotations.relations);
        return axiosPrivate.post(`/api/docs/${sha}/annotations`, {
            annotations: pdfAnnotations.annotations,
            relations: pdfAnnotations.relations,
        });
    };

    /**
     * Gets the annotations of the selected document.
     *
     * @param sha Document ID
     * @returns Promise with document annotations
     */
    const getAnnotations: (sha: string) => Promise<PdfAnnotations> = async (sha: string) => {
        return axiosPrivate.get(`/api/docs/${sha}/annotations`).then((response) => {
            const ann: PdfAnnotations = response.data;
            const annotations = ann.annotations.map((a) => Annotation.fromObject(a));
            const relations = ann.relations.map((r) => RelationGroup.fromObject(r));

            return new PdfAnnotations(annotations, relations);
        });
    };

    return {
        getAllDocs,
        getDocumentByID,
        getTokens,
        setPdfComment,
        setPdfFinished,
        setPdfJunk,
        getAnnotations,
        saveAnnotations,
    };
};

export default useDocumentApi;
