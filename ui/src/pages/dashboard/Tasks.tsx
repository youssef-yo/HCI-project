import { MdAssignmentAdd, MdOpenInNew } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { Button, Header, IconButton, Table } from '../../components/common';
import { Task, useTaskApi } from '../../api';
import { useNavigate } from 'react-router-dom';

const TasksPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);

    const { getTasks } = useTaskApi();
    const navigate = useNavigate();

    const loadTasks = () => {
        getTasks({})
            .then((tasks) => setTasks(tasks))
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        loadTasks();
    }, []);

    return (
        <section>
            <Header>
                <h1>Tasks</h1>
                <Button
                    color="secondary"
                    icon={<MdAssignmentAdd />}
                    onClick={() => navigate('new')}>
                    Create Task
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
