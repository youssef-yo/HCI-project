import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { InputFile, FileList } from '../sidebar';
import { useUploadApi } from '../../api';

type UploadDocModalProps = {
    updateTable: () => void;
    show: boolean;
    onHide: () => void;
};

const UploadDocModal: React.FC<UploadDocModalProps> = ({ updateTable, show, onHide }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [setAnyFileUploaded] = useState<boolean>(false);
    const supportedFiles = 'PDF';

    const { uploadAnalyze } = useUploadApi();

    const addFile = (_file: File) => {
        setFiles([...files, _file]);
    };

    const removeFile = (_fileName: string) => {
        setFiles(files.filter((file: File) => file.name !== _fileName));
    };

    // const changeStateFileIsUploading = (value: boolean) => {
    //     setIsUploading(value);
    //     console.log('File is uploding? ', isUploading);
    // };
    // const changeStateAnyFileUploaded = (value: boolean) => {
    //     setAnyFileUploaded(value);
    //     console.log('Any file was uploaded? ', isUploading);
    //     // if no file was uploaded then there is no need to refreshh the page after the modal is closed.
    // };

    // const updateFiles = (_file: string) => {
    //     setFiles([...files, _file]);
    //     console.log(files);
    // };

    // const removeFile = (_file: string) => {
    //     // For now it does nothing, when we'll load documents in MongoDB, we'll take care of this...
    //     // deleteOntology(_file);
    //     // setFiles(files.filter((file: any) => file.name !== _file));
    //     console.log('Tried deleting file...');
    // };

    const handleUploadAnalyze = () => {
        if (files.length === 0) return;

        setIsUploading(true);
        onHide();
        try {
            // Loop attraverso ogni file e esegui l'upload sul database
            for (const file of files) {
                var tmp = uploadFile(file);
            }
            console.log(tmp);
            setIsUploading(false);
            setAnyFileUploaded(true);
            setFiles([]);
            // onHide();
            // window.location.reload(); // Ricarica la pagina dopo l'upload
        } catch (error) {
            console.error("Errore durante l'upload dei file:", error);
            setIsUploading(false);
        }
    };

    const uploadFile = (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Effettua l'upload del file al backend per l'analisi
            return uploadAnalyze(formData);
        } catch (error) {
            console.error(`Errore durante l'upload del file ${file}:`, error);
            throw error; // Rilancia l'errore per gestirlo più avanti, se necessario
        }
    };

    const handleClose = () => {
        onHide();
        updateTable();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Upload Document</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <InputFile
                    files={files}
                    addFile={addFile}
                    supportedFiles={supportedFiles}
                    // files={files}
                    // updateFiles={updateFiles}
                    // changeStateFileIsUploading={changeStateFileIsUploading}
                    // changeStateAnyFileUploaded={changeStateAnyFileUploaded}
                    // api={(doc: any) => uploadAnalyze(doc)}
                    // supportedFiles={supportedFiles}
                ></InputFile>
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <FileList files={files} removeFile={removeFile} />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleUploadAnalyze}
                    disabled={isUploading || files.length === 0}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UploadDocModal;
