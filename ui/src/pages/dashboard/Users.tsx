import { MdDeleteOutline, MdOpenInNew } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { User, useUserApi } from '../../api';
import { useNavigate } from 'react-router-dom';

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const { getUsers, deleteUser } = useUserApi();

    const navigate = useNavigate();

    useEffect(() => {
        getUsers()
            .then((res) => setUsers(res))
            .catch((err) => console.error(err));
    }, []);

    const onDeleteUser = async (id: string) => {
        await deleteUser(id)
            .then((_) => setUsers(users.filter((user) => user._id !== id)))
            .catch((err) => {
                console.error(err);
            });
    };

    return (
        <section>
            <h1>Users</h1>
            <table>
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Full Name</th>
                        <th>Role</th>
                        <th>Actions</th>
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
                                }}>
                                <div
                                    className="iconButton"
                                    onClick={() => navigate(`info/${user._id}`)}>
                                    <MdOpenInNew />
                                </div>
                                <div className="iconButton" onClick={() => onDeleteUser(user._id)}>
                                    <MdDeleteOutline />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
};

export default Users;
