import styled from 'styled-components';
import { useEffect, useRef, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Input, InputType } from '../common';
import { User, useUserApi } from '../../api';

type EditUserModalProps = {
    show: boolean;
    onHide: () => void;
    userID: string;
    onUpdate: (user: User) => void;
};

const EditUserModal: React.FC<EditUserModalProps> = ({ show, onHide, userID, onUpdate }) => {
    const [email, setEmail] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [role, setRole] = useState<string>('');

    const [errorMsg, setErrorMsg] = useState<string>('');
    const errorRef = useRef<HTMLParagraphElement>(null);

    const { getUserByID, updateUser } = useUserApi();

    useEffect(() => {
        if (!show || !userID) return;

        getUserByID(userID)
            .then((user) => {
                setEmail(user.email);
                setFullName(user.fullName);
                setRole(user.role);
            })
            .catch((err) => {
                if (!err?.response) {
                    setErrorMsg('Server Unavailable.');
                } else if (err.response?.status === 404) {
                    setErrorMsg(`User with ID ${userID} not found.`);
                } else {
                    setErrorMsg(`Something went wrong...`);
                    console.error(err);
                }
            });
    }, [show, userID]);

    const handleClose = () => {
        setErrorMsg('');
        setFullName('');
        setRole('');
        onHide();
    };

    const onEditUser = async () => {
        const userUpdate = {
            fullName: fullName,
            role: role,
        };

        updateUser(userID, userUpdate)
            .then((user) => {
                onUpdate(user);
                handleClose();
            })
            .catch((err) => {
                if (!err?.response) {
                    setErrorMsg('Server Unavailable.');
                } else {
                    setErrorMsg('Something went wrong...');
                }
            });
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit User [{email}]</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {errorMsg && (
                        <p className="errorMsg" ref={errorRef}>
                            {errorMsg}
                        </p>
                    )}

                    <Input
                        type="text"
                        variant={InputType.STANDARD}
                        color="secondary"
                        id="fullName"
                        placeholder="Full Name"
                        onChange={(e) => setFullName(e.target.value)}
                        value={fullName}
                        required
                    />

                    <Input
                        type="text"
                        variant={InputType.STANDARD}
                        color="secondary"
                        id="role"
                        placeholder="Role"
                        onChange={(e) => setRole(e.target.value)}
                        value={role}
                        required
                    />
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Discard Changes
                </Button>
                <Button variant="primary" onClick={onEditUser}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditUserModal;

const Form = styled.form`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 25px;

    .errorMsg {
        position: relative;
        width: 100%;
        padding: 15px 7.5px;
        margin-bottom: 0;
        border: 2px solid rgba(191, 11, 11, 1);
        border-radius: 4px;
        background: rgba(191, 11, 11, 0.15);
        color: #bf3f3f;
        font-size: 0.8em;
    }
`;
