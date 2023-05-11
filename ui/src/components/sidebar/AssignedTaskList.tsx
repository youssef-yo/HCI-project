import { Switch, Tag } from '@allenai/varnish';
import { FileDoneOutlined, CloseOutlined } from '@ant-design/icons';
import { MdDoneAll, MdEdit, MdTaskAlt } from 'react-icons/md';
import styled from 'styled-components';
import { useState } from 'react';
import { SidebarItem, SidebarItemTitle, Contrast } from './common';
import { TaskExtended, TaskStatus } from '../../api';

const AssignedTaskRow = ({ task }: { task: TaskExtended }) => {
    const getStatusColour = (task: TaskExtended) => {
        if (task.status === TaskStatus.COMPLETE) {
            return '#1EC28E';
        } else if (task.markedComplete) {
            return '#d5a03a';
        }

        return '#AEB7C4';
    };

    const getStatusIcon = (task: TaskExtended) => {
        console.log(task.status);
        if (task.status === TaskStatus.COMPLETE) {
            return <MdDoneAll />;
        } else if (task.markedComplete) {
            return <MdTaskAlt />;
        }

        return <MdEdit />;
    };

    return (
        <PaddedRow>
            <Contrast key={task._id}>
                <a href={`/pdf-task/${task._id}`}>{task.document?.name}</a>
            </Contrast>
            <Contrast>
                {task.pageRange.start} - {task.pageRange.end}
            </Contrast>
            <SmallTag color={getStatusColour(task)}>{getStatusIcon(task)}</SmallTag>
        </PaddedRow>
    );
};

const AssignedTaskList = ({ tasks }: { tasks: TaskExtended[] }) => {
    const [showFinished, setShowFinished] = useState<boolean>(false);

    const unfinished = tasks.filter((t) => t.status === TaskStatus.ACTIVE);
    const finished = tasks.filter((t) => t.status !== TaskStatus.ACTIVE);
    const ordered = unfinished.concat(finished);
    const tasksToShow = showFinished ? ordered : unfinished;

    return (
        <SidebarItem>
            <SidebarItemTitle>Tasks</SidebarItemTitle>
            <ToggleDescription>Show Finished Tasks:</ToggleDescription>
            <Toggle
                size="small"
                onChange={() => setShowFinished(!showFinished)}
                checkedChildren={<FileDoneOutlined />}
                unCheckedChildren={<CloseOutlined />}
            />
            {tasks.length !== 0 ? (
                <>
                    {tasksToShow.map((task) => (
                        <AssignedTaskRow key={task._id} task={task} />
                    ))}
                </>
            ) : (
                <div>No tasks assigned!</div>
            )}
        </SidebarItem>
    );
};

export default AssignedTaskList;

const Toggle = styled(Switch)`
    margin: 4px;
`;
const ToggleDescription = styled.span`
    font-size: 0.85rem;
    color: ${({ theme }) => theme.color.N6};
`;

const PaddedRow = styled.div`
    padding: 4px 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) min-content minmax(20px, min-content);
`;

const SmallTag = styled(Tag)`
    font-size: 0.7rem;
    padding: 2px 2px;
    margin-left: 4px;
    border-radius: 4px;
    color: ${({ theme }) => theme.color.N9};
    line-height: 1;

    & > svg {
        fill: #333;
        stroke: #333;
    }
`;
