import { ReactNode } from 'react';
import { Button, Modal } from 'react-bootstrap';

type ConfirmationDialogProps = {
    show: boolean;
    onHide: () => void;
    title?: string;
    message?: ReactNode;
    onConfirm?: () => void;
};

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    show,
    onHide,
    title = 'Confirmation Dialog',
    message = 'Confirmation message',
    onConfirm = () => {},
}) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={onConfirm}>
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmationDialog;
