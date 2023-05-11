import { MdOpenInNew } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { Header, IconButton, Table } from '../../components/common';
import { TaskExtended, useTaskApi } from '../../api';
import { useNavigate } from 'react-router-dom';

const TasksPage = () => {
    const [tasks, setTasks] = useState<TaskExtended[]>([]);

    const { getLoggedUserTasks } = useTaskApi();
    const navigate = useNavigate();

    const loadTasks = () => {
        getLoggedUserTasks()
            .then((tasks) => setTasks(tasks))
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        loadTasks();
    }, []);

    return (
        <section>
            <Header>
                <h1>Assigned Tasks</h1>
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
                                    onClick={() => navigate(`${task._id}`)}>
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

export default TasksPage;
