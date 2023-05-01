import { MdAssignmentAdd, MdOpenInNew } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Task, User, useTaskApi, useUserApi } from '../../api';
import { Button, Header, IconButton, Table } from '../../components/common';

const UserPage = () => {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<User>();
    const [tasks, setTasks] = useState<Task[]>([]);

    const { getUserByID } = useUserApi();
    const { getTasks } = useTaskApi();
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) {
            // TODO
            console.error('No user has been selected!');
            return;
        }

        getUserByID(userId)
            .then((user) => setUser(user))
            .catch((_) => console.error('User not found!'));

        getTasks({ userId: userId })
            .then((tasks) => setTasks(tasks))
            .catch((err) => console.error(err));
    }, [userId]);

    return (
        <section>
            <Header>
                <h1>User Information</h1>
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
                    icon={<MdAssignmentAdd />}
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
                        <th>Description</th>
                        <th style={{ textAlign: 'center' }}>Pages</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task) => (
                        <tr key={task._id}>
                            <td>{task.description}</td>
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
        </section>
    );
};

export default UserPage;
