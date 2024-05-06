import { MdAddTask, MdDeleteOutline, MdOpenInNew, MdOutlineEdit } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TaskExtended, User, getApiError, useTaskApi, useUserApi } from '../../api';
import { Button, Header, IconButton, Table } from '../../components/common';
import { useDialog, useAuth } from '../../hooks';
import { EditUserModal } from '../../components/dashboard';
import { notification } from '@allenai/varnish';

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

    const { auth } = useAuth();

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
            'Delete User',
            `Are you sure you want to delete the user ${user.email}? All the tasks associated with this user will be
            also deleted. This action cannot be undone.`
        );

        if (confirm) {
            deleteUser(user!!._id)
                .then((_) => {
                    navigate('/dash/users');
                    notification.success({
                        message: 'User deleted succesfully!',
                        placement: 'bottomRight',
                    });
                })
                .catch((err) =>
                    notification.error({
                        message: 'Error deleting user!',
                        description: getApiError(err),
                    })
                );
        }
    };

    return (
        <section>
            <Header>
                <h1>User Information</h1>

                <Button
                    color="edit"
                    icon={<MdOutlineEdit />}
                    marginLeft="auto"
                    onClick={() => setUserModal(true)}
                    disabled={user?.role==='Administrator' && auth?.id!==user?._id}>
                    Edit User
                </Button>
                <Button
                    color="delete"
                    style={{ marginLeft: '8px' }}
                    icon={<MdDeleteOutline />}
                    onClick={onDeleteUser} 
                    disabled={user?.role==='Administrator' && auth?.id!==user?._id}>
                    Delete User
                </Button>
            </Header>

            <div className="userInfo">
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
                    marginLeft="auto"
                    icon={<MdAddTask />}
                    onClick={() =>
                        navigate(`/dash/tasks/new`, {
                            state: { userId: user?._id },
                        })
                    }>
                    Create Task
                </Button>
            </Header>

            <Table color="#A3C4BC">
                <thead>
                    <tr>
                        <th>Document</th>
                        <th>Created At</th>
                        <th style={{ textAlign: 'center' }}>Pages</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center' }}>Nothing to show</td>
                        </tr>
                    ) : (tasks.map((task) => (
                            <tr key={task._id}>
                                <td>{task.document?.name}</td>
                                <td>{new Date(task.createdAt).toUTCString()}</td>
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
                        ))
                    )}
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
