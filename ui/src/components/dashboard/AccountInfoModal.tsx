import { Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth, useLogout } from '../../hooks';

type AccountInfoModalProps = {
    show: boolean;
    onHide: () => void;
};

const AccountInfoModal: React.FC<AccountInfoModalProps> = ({ show, onHide }) => {
    const logout = useLogout();
    const navigate = useNavigate();
    const { auth } = useAuth();

    const handleClose = () => {
        onHide();
    };

    const onLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {auth?.username}
                </div>
            </Modal.Header>
            <Modal.Footer>
                <Button variant="primary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="danger" onClick={onLogout}>
                    Logout
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AccountInfoModal;
