import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { InputFile, FileList } from '../sidebar';
import { useUploadApi } from '../../api';
import { notification } from '@allenai/varnish';

type UploadDocModalProps = {
    updateTable: () => void;
    show: boolean;
    onHide: () => void;
};

const UploadDocModal: React.FC<UploadDocModalProps> = ({ updateTable, checkAnalyzed, show, onHide }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [duplicateFiles, setDuplicateFiles] = useState<String[]>([]);
    const [errorText, setErrorText] = useState('');
    const supportedFiles = ['pdf'];

    const { uploadFile } = useUploadApi();

    const addFile = (_file: File) => {
        setFiles([...files, _file]);
    };

    const removeFile = (_fileName: string) => {
        setFiles(files.filter((file: File) => file.name !== _fileName));
        setDuplicateFiles(duplicateFiles.filter((name: string) => name !== _fileName));
    };

    const handleUploadAnalyze = async () => {
        if (files.length === 0) return;

        setIsUploading(true);

        try {
            await uploadFile(files);
            setIsUploading(false);
            onHide();
            setFiles([]);
            setDuplicateFiles([]);
            notification.info({
                message: 'Document upload in progress',
                description: 'Please wait while we analyze the document. You will be notified once the analysis is complete.',
                placement: 'bottomRight',
            });
        } catch (error: any) {
            if (error.response.status === 409) {
                setIsUploading(false);
                const duplicateFiles = error.response.data.detail;
                setDuplicateFiles(duplicateFiles);
                setErrorText('Duplicate Files');
            } else if (error.response.status === 404) {
                setErrorText('File not found');
            } else {
                setErrorText(`Error during the upload of the file`);
            }
        }

        updateTable();
        checkAnalyzed();
    };

    const handleClose = () => {
        setFiles([]);
        setDuplicateFiles([]);
        onHide();
        updateTable();
        setErrorText('');
    };

    const updateText = (msg: string) => {
        setErrorText(msg);
    }

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
                    updateText={updateText}
                ></InputFile>
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
                    onClick={handleUploadAnalyze}
                    disabled={isUploading || files.length === 0}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UploadDocModal;
