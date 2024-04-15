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
    const [isUploading] = useState<boolean>(false);
    const supportedFiles = 'PDF';

    const { uploadFile } = useUploadApi();

    const addFile = (_file: File) => {
        setFiles([...files, _file]);
    };

    const removeFile = (_fileName: string) => {
        setFiles(files.filter((file: File) => file.name !== _fileName));
    };

    // const handleUploadAnalyze = () => {
    //     if (files.length === 0) return;

    //     // setIsUploading(true);
    //     onHide();
    //     try {
    //         // Loop attraverso ogni file e esegui l'upload sul database
    //         for (const file of files) {
    //             uploadFile(file);
    //         }
    //         // setIsUploading(false);
    //         // setAnyFileUploaded(true);
    //         setFiles([]);
    //         // onHide();
    //         // window.location.reload(); // Ricarica la pagina dopo l'upload
    //     } catch (error) {
    //         console.error("Errore durante l'upload dei file:", error);
    //         // setIsUploading(false);
    //     }
    // };

    // const uploadFile = (file: File) => {
    //     const formData = new FormData();
    //     formData.append('file', file);

    //     try {
    //         // Effettua l'upload del file al backend per l'analisi
    //         return uploadAnalyze(formData);
    //     } catch (error) {
    //         console.error(`Errore durante l'upload del file ${file}:`, error);
    //         throw error; // Rilancia l'errore per gestirlo più avanti, se necessario
    //     }
    // };

    const handleUploadAnalyze = async () => {
        if (files.length === 0) return;

        onHide();
        try {
            await uploadFile(files);
            setFiles([]);
        } catch (error) {
            console.error("Errore durante l'upload dei file:", error);
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
