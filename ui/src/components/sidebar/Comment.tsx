import React, { useState } from 'react';
import styled from 'styled-components';
import { Input } from '@allenai/varnish';

import { SidebarItem, SidebarItemTitle } from './common';
import { Task, useTaskApi } from '../../api';

interface CommentProps {
    taskId: string;
    activeTask: Task;
}

const Comment: React.FC<CommentProps> = ({ taskId, activeTask }) => {
    const [comment, setComment] = useState<string>(activeTask.comments);

    const { setTaskComment } = useTaskApi();

    return (
        <SidebarItem>
            <SidebarItemTitle>Comments</SidebarItemTitle>
            <DarkTextArea
                defaultValue={activeTask.comments}
                onChange={(e) => setComment(e.target.value)}
                onBlur={() => setTaskComment(taskId, comment)}
                autoSize={{ minRows: 6 }}
            />
        </SidebarItem>
    );
};

export default Comment;

const DarkTextArea = styled(Input.TextArea)`
    color: black;
    padding: 2px 2px;
    background: lightgrey;
    font-size: 0.8rem;
`;
