import axios from 'axios';
import { OntologiesNames } from './schemas';

export async function deleteFile(filename: string) {
    axios
        .delete(`/api/ontology/${filename}`)
        .then((res) => {
            console.log(res);
        })
        .catch((err) => console.error(err));
}

export async function getNamesOfOntologiesAlreadyUploaded(): Promise<OntologiesNames> {
    return await axios
        .get('/api/ontology/names')
        .then((r) => r.data)
        .catch((err) => console.log(err));
}
