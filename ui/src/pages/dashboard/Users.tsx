import { MdDeleteOutline, MdOpenInNew } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { User, useUserApi } from '../../api';
import { useNavigate } from 'react-router-dom';

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const { getUsers } = useUserApi();

    const navigate = useNavigate();

    useEffect(() => {
        getUsers()
            .then((res) => setUsers(res))
            .catch((err) => console.error(err));
    }, []);

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
                        <tr key={user.email}>
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
                                    onClick={() => navigate(`info/${user.email}`)}>
                                    <MdOpenInNew />
                                </div>
                                <div className="iconButton">
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
