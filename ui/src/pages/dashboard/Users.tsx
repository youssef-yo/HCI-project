import { MdDeleteOutline, MdOpenInNew, MdOutlineEdit, MdOutlinePersonAddAlt } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { User, useUserApi } from '../../api';
import { Button, Header, IconButton, Table } from '../../components/common';
import { EditUserModal } from '../../components/dashboard';
import { useNavigate } from 'react-router-dom';

const UsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);

    const [userModal, setUserModal] = useState<boolean>(false);
    const [editedUser, setEditedUser] = useState<string>('');

    const { getUsers, deleteUser } = useUserApi();
    const navigate = useNavigate();

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

    const onDeleteUser = async (id: string) => {
        await deleteUser(id)
            .then((_) => setUsers(users.filter((user) => user._id !== id)))
            .catch((err) => {
                console.error(err);
            });
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
                                <IconButton title="Edit User" onClick={() => onEditUser(user._id)}>
                                    <MdOutlineEdit />
                                </IconButton>
                                <IconButton
                                    title="Delete User"
                                    onClick={() => onDeleteUser(user._id)}>
                                    <MdDeleteOutline />
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
