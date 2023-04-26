import { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { InputFile, FileList } from '../sidebar';
import { useUploadApi } from '../../api';

type UploadDocModalProps = {
    show: boolean;
    onHide: () => void;
};

const UploadDocModal: React.FC<UploadDocModalProps> = ({ show, onHide }) => {
    const [files, setFiles] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [anyFileUploaded, setAnyFileUploaded] = useState<boolean>(false);
    const supportedFiles = 'PDF';

    const { uploadDocument } = useUploadApi();

    const changeStateFileIsUploading = (value: boolean) => {
        setIsUploading(value);
        console.log('File is uploding? ', isUploading);
    };
    const changeStateAnyFileUploaded = (value: boolean) => {
        setAnyFileUploaded(value);
        console.log('Any file was uploaded? ', isUploading);
        // if no file was uploaded then there is no need to refreshh the page after the modal is closed.
    };

    const updateFiles = (_file: string) => {
        setFiles([...files, _file]);
        console.log(files);
    };

    const removeFile = (_file: string) => {
        // For now it does nothing, when we'll load documents in MongoDB, we'll take care of this...
        // deleteOntology(_file);
        // setFiles(files.filter((file: any) => file.name !== _file));
        console.log('Tried deleting file...');
    };

    const handleClose = () => {
        if (anyFileUploaded && !isUploading) {
            onHide();
            window.location.reload();
        }
        if (!anyFileUploaded && !isUploading) {
            onHide();
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Upload Document</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <InputFile
                    files={files}
                    updateFiles={updateFiles}
                    changeStateFileIsUploading={changeStateFileIsUploading}
                    changeStateAnyFileUploaded={changeStateAnyFileUploaded}
                    api={(doc: any) => uploadDocument(doc)}
                    supportedFiles={supportedFiles}></InputFile>
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <FileList files={files} removeFile={removeFile} />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleClose}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UploadDocModal;
