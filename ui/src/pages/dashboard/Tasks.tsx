import { MdAddTask, MdOpenInNew } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { Button, Header, IconButton, Table } from '../../components/common';
import { TaskExtended, useTaskApi } from '../../api';
import { useNavigate } from 'react-router-dom';

const TasksPage = () => {
    const [tasks, setTasks] = useState<TaskExtended[]>([]);

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
                    marginLeft="auto"
                    icon={<MdAddTask />}
                    onClick={() => navigate('new')}>
                    Create Task
                </Button>
            </Header>

            <Table color="#0077B6">
                <thead>
                    <tr>
                        <th>Document</th>
                        <th>Annotator</th>
                        <th>Created At</th>
                        <th style={{ textAlign: 'center' }}>Pages</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center' }}>Nothing to show</td>
                        </tr>
                    ) : (tasks.map((task) => (
                        <tr key={task._id}>
                            <td>{task.document?.name}</td>
                            <td>{task.annotator?.email}</td>
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
                                    onClick={() => navigate(`${task._id}`)}>
                                    <MdOpenInNew />
                                </IconButton>
                            </td>
                        </tr>
                    ))
                    )}
                </tbody>
            </Table>
        </section>
    );
};

export default TasksPage;
