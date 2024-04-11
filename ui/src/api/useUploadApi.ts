import useAxiosPrivate from './useAxiosPrivate';

/**
 * Upload API entry points.
 *
 * @returns API functions
 */
const useUploadApi = () => {
    const axiosPrivate = useAxiosPrivate();

    /**
     * Uploads an ontology file.
     *
     * @param file Ontology file
     * @returns Promise
     */
    const uploadOntology = async (file: FormData) => {
        console.log('File in uploadOntology: ', file);
        try {
            const response = await axiosPrivate({
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
    };

    /**
     * Uploads a paper document.
     *
     * @param file Paper document
     * @returns Promise
     */
    const uploadDocument = async (file: FormData) => {
        console.log('File in uploadDocument: ', file);
        try {
            const response = await axiosPrivate({
                method: 'post',
                url: '/api/upload/doc',
                data: file,
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('FINISH');
            return response;
        } catch (error) {
            console.log(error);
        }
    };

    // const uploadAnalyze = async (file: FormData) => {
    //     console.log('File in uploadDocument: ', file);
    //     try {
    //         const response = await axiosPrivate({
    //             method: 'post',
    //             url: '/api/upload/upload_analyze',
    //             data: file,
    //             headers: { 'Content-Type': 'multipart/form-data' },
    //         });
    //         console.log('FINISH');
    //         return response;
    //     } catch (error) {
    //         console.log('ERROR');
    //         console.log(error);
    //     }
    // };
    const uploadAnalyze = async (file: FormData) => {
        console.log('File in uploadDocument: ', file);
        try {
            axiosPrivate({
                method: 'post',
                url: '/api/upload/upload_analyze',
                data: file,
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Upload avviato in background.');
            return 'Upload';
        } catch (error) {
            console.log('ERROR');
            console.log(error);
            return 'errore';
        }
    };

    return { uploadDocument, uploadOntology, uploadAnalyze };
};

export default useUploadApi;
