import axios from 'axios';
import { Allocation, OntologiesNames } from './schemas';

export async function getClasses(_ontologiesNames: OntologiesNames) {
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
}

export async function getProperties(_ontologiesNames: OntologiesNames) {
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
}

export async function getAllocatedPaperStatus(): Promise<Allocation> {
    return axios.get('/api/annotation/allocation/info').then((r) => r.data);
}

export async function exportAnnotations(sha: string) {
    return axios.get(`/api/annotation/${sha}/export`, {
        responseType: 'blob',
        /* 
            headers: {
            Authorization: 'Bearer <token>', // add authentication information as required by the backend APIs.
            },
        */
    });
}
