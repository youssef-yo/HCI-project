import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { InputFile, FileList } from '../sidebar';
import { useUploadApi } from '../../api';

type UploadOntoModalProps = {
    updateTable: () => void;
    show: boolean;
    onHide: () => void;
};

const UploadOntoModal: React.FC<UploadOntoModalProps> = ({ updateTable, show, onHide }) => {
    const [files, setFiles] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [duplicateFiles, setDuplicateFiles] = useState<String[]>([]);
    const [errorText, setErrorText] = useState('');
    const supportedFiles = 'N-Triples, RDF/XML, OWL/XML';

    // const { deleteOntology } = useOntologyApi();
    const { uploadOntology } = useUploadApi();

    const changeStateFileIsUploading = (value: boolean) => {
        setIsUploading(value);
    };


    const addFile = (_file: string) => {
        setFiles([...files, _file]);
    };


    const removeFile = (_filename: string) => {
        setFiles(files.filter((file: any) => file.name !== _filename));
        setDuplicateFiles(duplicateFiles.filter((name: string) => name !== _filename));
    };

    const handleUploadOnto = async () => {
        if (files.length === 0) return;

        changeStateFileIsUploading(true);
        try {
            await uploadOntology(files);
            changeStateFileIsUploading(false);
            onHide();
            setFiles([]);
            setDuplicateFiles([]);
        } catch (error: any) {
            if (error.response.status === 409) {
                setIsUploading(false);
                const duplicateFiles = error.response.data.detail;
                setDuplicateFiles(duplicateFiles);
                setErrorText('Duplicate Ontology');
            } else if (error.response.status === 404) {
                setErrorText('Ontology not found');
            } else {
                setErrorText(`Error during the upload of the Ontology`);
            }
        }

        updateTable();
    }
    
    const handleClose = () => {
        setFiles([]);
        setDuplicateFiles([]);
        onHide();
        updateTable();
    };

    const updateText = (msg: string) => {
        setErrorText(msg);
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Upload Ontology</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <InputFile
                    files={files}
                    addFile={addFile}
                    supportedFiles={supportedFiles}
                    updateText={updateText}>
                </InputFile>
                {<p style={{ color: 'red' }}> {errorText} </p>}
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <FileList
                            files={files}
                            removeFile={removeFile}
                            duplicateFiles={duplicateFiles}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button 
                    variant="primary"
                    onClick={handleUploadOnto}
                    disabled={isUploading || files.length === 0}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UploadOntoModal;
