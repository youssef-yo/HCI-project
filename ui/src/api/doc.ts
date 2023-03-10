import axios from 'axios';
import { Annotation, PdfAnnotations, RelationGroup } from '../context';
import { PageTokens } from './schemas';

function docURL(sha: string): string {
    return `/api/doc/${sha}`;
}

export function pdfURL(sha: string): string {
    return `${docURL(sha)}/pdf`;
}

export async function getTokens(sha: string): Promise<PageTokens[]> {
    return axios.get(`${docURL(sha)}/tokens`).then((r) => r.data);
}

export async function setPdfComment(sha: string, comments: string) {
    return axios.post(`/api/doc/${sha}/comments`, comments);
}

export async function setPdfFinished(sha: string, finished: boolean) {
    return axios.post(`/api/doc/${sha}/finished`, finished);
}

export async function setPdfJunk(sha: string, junk: boolean) {
    return axios.post(`/api/doc/${sha}/junk`, junk);
}

export function saveAnnotations(sha: string, pdfAnnotations: PdfAnnotations): Promise<any> {
    // console.log('pdfAnnotations.annotations: ', pdfAnnotations.annotations);
    // console.log('pdfAnnotations.relations: ', pdfAnnotations.relations);
    return axios.post(`/api/doc/${sha}/annotations`, {
        annotations: pdfAnnotations.annotations,
        relations: pdfAnnotations.relations,
    });
}

export async function getAnnotations(sha: string): Promise<PdfAnnotations> {
    return axios.get(`/api/doc/${sha}/annotations`).then((response) => {
        const ann: PdfAnnotations = response.data;
        const annotations = ann.annotations.map((a) => Annotation.fromObject(a));
        const relations = ann.relations.map((r) => RelationGroup.fromObject(r));

        return new PdfAnnotations(annotations, relations);
    });
}
