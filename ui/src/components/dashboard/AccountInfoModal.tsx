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
            <Modal.Body closeButton>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                        style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: 'blue',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '20px',
                        }}>
                        {auth?.username ? auth.username.charAt(0).toUpperCase() : ''}
                    </div>
                    <p>
                        <b> Role: </b>
                        {auth?.role}
                        <br />
                        <b> Email: </b>
                        {auth?.username}
                    </p>
                </div>
            </Modal.Body>
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
