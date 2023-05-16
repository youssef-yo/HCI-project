import React from 'react';
import { Card, Header } from '../../components/common';
import { useNavigate } from 'react-router-dom';

const HomeSummaryPage = () => {
    const navigate = useNavigate();

    return (
        <section>
            <Header>
                <h1>Home Page</h1>
            </Header>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                }}>
                <Card
                    title="Assigned Tasks"
                    subtitle="Jobs assigned to you"
                    description="View the list of tasks assigned to you. Choose any task and proceed to annotate the document. You can mark the task as completed when you are done, to let an administrator know you have finished."
                    color="#7700ff"
                    onClick={() => navigate('tasks')}
                />
            </div>
        </section>
    );
};

export default HomeSummaryPage;
