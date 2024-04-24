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
    const uploadOntology = async (files: []) => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        await axiosPrivate({
            method: 'post',
            url: '/api/upload/ontology',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    };

    /**
     * Uploads a paper document.
     *
     * @param file Paper document
     * @returns Promise
     */
    const uploadDocument = async (file: FormData) => {
        try {
            const response = await axiosPrivate({
                method: 'post',
                url: '/api/upload/doc',
                data: file,
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    };

    const uploadFile = async (files: []) => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        await axiosPrivate({
            method: 'post',
            url: '/api/upload/upload',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    };

    return { uploadDocument, uploadOntology, uploadFile };
};

export default useUploadApi;
