import styled from 'styled-components';
import { useEffect, useRef, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Input, InputType, Option } from '../common';
import { User, getApiError, useUserApi } from '../../api';
import { ROLES } from '../../config/roles';

type EditUserModalProps = {
    show: boolean;
    onHide: () => void;
    userID: string;
    onUpdate: (user: User) => void;
};

const EditUserModal: React.FC<EditUserModalProps> = ({ show, onHide, userID, onUpdate }) => {
    const [email, setEmail] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');

    const [roleOption, setRoleOption] = useState<Option<string>>();

    const [errorMsg, setErrorMsg] = useState<string>('');
    const errorRef = useRef<HTMLParagraphElement>(null);

    const { getUserByID, updateUser } = useUserApi();

    useEffect(() => {
        if (!show || !userID) return;

        const options = buildRoleOptions([ROLES.Admin, ROLES.Annotator]);

        getUserByID(userID)
            .then((user) => {
                setEmail(user.email);
                setFullName(user.fullName);

                const option = options.find((o) => o.value === user.role);
                setRoleOption(option);
            })
            .catch((err) => {
                if (!err?.response) {
                    setErrorMsg('Server Unavailable.');
                } else {
                    setErrorMsg(err.response?.data?.detail);
                    console.error(err);
                }
            });
    }, [show, userID]);

    const buildRoleOptions = (roles: string[]) => {
        const roleOptions: Option<string>[] = roles.map((role) => {
            return {
                label: role,
                value: role,
            };
        });
        return roleOptions;
    };

    const handleClose = () => {
        setErrorMsg('');
        setFullName('');
        onHide();
    };

    const onEditUser = async () => {
        if (fullName.trim().length === 0) {
            setErrorMsg('The user name must be specified!');
            return;
        }
        if (!roleOption) {
            setErrorMsg('A user role must be selected!');
            return;
        }

        const userUpdate = {
            fullName: fullName,
            role: roleOption.value,
        };

        updateUser(userID, userUpdate)
            .then((user) => {
                onUpdate(user);
                handleClose();
            })
            .catch((err) => setErrorMsg(getApiError(err)));
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

                    {/* <Select
                        placeHolder="Select Role"
                        options={roleOptions}
                        value={roleOption}
                        onChange={(role) => setRoleOption(role)}
                        isSearchable
                    /> */}
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
