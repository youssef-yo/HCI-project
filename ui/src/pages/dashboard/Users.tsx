import { MdDeleteOutline, MdOpenInNew, MdOutlineEdit, MdOutlinePersonAddAlt } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { User, getApiError, useUserApi } from '../../api';
import { Button, Header, IconButton, Table } from '../../components/common';
import { EditUserModal } from '../../components/dashboard';
import { useNavigate } from 'react-router-dom';
import { useDialog, useAuth } from '../../hooks';
import { notification } from '@allenai/varnish';
import '../../assets/styles/Users.scss';

const UsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);

    const [userModal, setUserModal] = useState<boolean>(false);
    const [editedUser, setEditedUser] = useState<string>('');

    const { getUsers, deleteUser } = useUserApi();

    const dialog = useDialog();
    const navigate = useNavigate();

    const { auth } = useAuth();

    useEffect(() => {
        getUsers()
            .then((res) => setUsers(res))
            .catch((err) => console.error(err));
    }, []);

    const handleCloseModal = () => {
        console.log('Closing modal...');
        setUserModal(false);
    };

    const onEditUser = (id: string) => {
        setEditedUser(id);
        setUserModal(true);
    };

    const onUserUpdated = (updatedUser: User) => {
        const updatedUsers = users.map((u) => (u._id === updatedUser._id ? updatedUser : u));
        setUsers(updatedUsers);
    };

    const onDeleteUser = async (user: User) => {
        const confirm = await dialog.showConfirmation(
            'Deleting User',
            `Are you sure you want to delete the user ${user.email}? This action cannot be undone.`
        );
        if (!confirm) return;

        await deleteUser(user._id)
            .then((_) => setUsers(users.filter((u) => u._id !== user._id)))
            .catch((err) =>
                notification.error({
                    message: 'Error deleting user!',
                    description: getApiError(err),
                })
            );
    };

    return (
        <section>
            <Header>
                <h1>Users</h1>
                <Button
                    color="secondary"
                    icon={<MdOutlinePersonAddAlt />}
                    onClick={() => navigate('new')}>
                    Create User
                </Button>
            </Header>
            <Table>
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Full Name</th>
                        <th>Role</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td>{user.email}</td>
                            <td>{user.fullName}</td>
                            <td>{user.role}</td>
                            <td
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}>
                                <IconButton
                                    title="View User"
                                    onClick={() => navigate(`${user._id}`)}>
                                    <MdOpenInNew />
                                </IconButton>
                                <IconButton title="Edit User" onClick={() => onEditUser(user._id)} disabled={user.role==='Administrator' && auth?.id!==user._id}>
                                    <MdOutlineEdit className={user.role === 'Administrator' && auth?.id !== user._id ? 'icon-disabled' : ''} />
                                </IconButton>
                                <IconButton title="Delete User" onClick={() => onDeleteUser(user)} disabled={user.role==='Administrator' && auth?.id!==user._id}>
                                    <MdDeleteOutline className={user.role === 'Administrator' && auth?.id !== user._id ? 'icon-disabled' : ''} />
                                </IconButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <EditUserModal
                show={userModal}
                onHide={handleCloseModal}
                userID={editedUser}
                onUpdate={onUserUpdated}
            />
        </section>
    );
};

export default UsersPage;
