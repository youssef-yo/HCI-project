import { MdAddTask, MdDeleteOutline, MdOpenInNew, MdOutlineEdit } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TaskExtended, User, useTaskApi, useUserApi } from '../../api';
import { Button, Header, IconButton, Table } from '../../components/common';
import { useDialog } from '../../hooks';
import { EditUserModal } from '../../components/dashboard';

const UserPage = () => {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<User>();
    const [tasks, setTasks] = useState<TaskExtended[]>([]);

    const [userModal, setUserModal] = useState<boolean>(false);
    const [editedUser, setEditedUser] = useState<string>('');

    const { getUserByID, deleteUser } = useUserApi();
    const { getTasks } = useTaskApi();

    const dialog = useDialog();
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) {
            // TODO
            console.error('No user has been selected!');
            return;
        }

        setEditedUser(userId);

        getUserByID(userId)
            .then((user) => setUser(user))
            .catch((_) => console.error('User not found!'));

        getTasks({ userId: userId })
            .then((tasks) => setTasks(tasks))
            .catch((err) => console.error(err));
    }, [userId]);

    const onDeleteUser = async () => {
        const confirm = await dialog.showConfirmation(
            'Deleting User',
            `Are you sure you want to delete the user ${user?.email}? This action cannot be undone.`
        );

        if (confirm) {
            deleteUser(user!!._id)
                .then((_) => navigate('/dash/users'))
                .catch((err) => console.error(err));
        }
    };

    return (
        <section>
            <Header>
                <h1>User Information</h1>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                    }}>
                    <Button
                        color="secondary"
                        icon={<MdOutlineEdit />}
                        onClick={() => setUserModal(true)}>
                        Edit User
                    </Button>
                    <Button color="secondary" icon={<MdDeleteOutline />} onClick={onDeleteUser}>
                        Delete User
                    </Button>
                </div>
            </Header>

            <div className="userInfo">
                <p>
                    <b>ID:</b> {user?._id}
                </p>
                <p>
                    <b>Email:</b> {user?.email}
                </p>
                <p>
                    <b>Full Name:</b> {user?.fullName}
                </p>
                <p>
                    <b>Role:</b> {user?.role}
                </p>
            </div>

            <hr />

            <Header>
                <h3>User Tasks</h3>
                <Button
                    color="secondary"
                    icon={<MdAddTask />}
                    onClick={() =>
                        navigate(`/dash/tasks/new`, {
                            state: { userId: user?._id },
                        })
                    }>
                    Create User Task
                </Button>
            </Header>

            <Table>
                <thead>
                    <tr>
                        <th>Document</th>
                        <th style={{ textAlign: 'center' }}>Pages</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task) => (
                        <tr key={task._id}>
                            <td>{task.document?.name}</td>
                            <td style={{ textAlign: 'center' }}>
                                {task.pageRange.start} - {task.pageRange.end}
                            </td>
                            <td style={{ textAlign: 'center' }}>{task.status}</td>
                            <td
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}>
                                <IconButton
                                    title="View Task"
                                    onClick={() => navigate(`/dash/tasks/${task._id}`)}>
                                    <MdOpenInNew />
                                </IconButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <EditUserModal
                show={userModal}
                onHide={() => setUserModal(false)}
                userID={editedUser}
                onUpdate={(updatedUser) => setUser(updatedUser)}
            />
        </section>
    );
};

export default UserPage;
