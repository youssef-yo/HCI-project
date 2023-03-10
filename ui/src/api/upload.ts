import axios from 'axios';

export async function uploadOntology(file: FormData) {
    console.log('File in uploadOntology: ', file);
    try {
        const response = await axios({
            method: 'post',
            url: '/api/upload/ontology',
            data: file,
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        // console.log('response: ', response);
        return response;
    } catch (error) {
        console.log(error);
    }
}

export async function uploadDocument(file: FormData) {
    console.log('File in uploadDocument: ', file);
    try {
        const response = await axios({
            method: 'post',
            url: '/api/upload/doc',
            data: file,
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response;
    } catch (error) {
        console.log(error);
    }
}
