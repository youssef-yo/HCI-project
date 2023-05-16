import React from 'react';
import { Card, Header } from '../../components/common';
import { useNavigate } from 'react-router-dom';

const DashSummaryPage = () => {
    const navigate = useNavigate();

    return (
        <section>
            <Header>
                <h1>Dash Summary</h1>
            </Header>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                }}>
                <Card
                    title="Users"
                    subtitle="Manage Users"
                    description="View the list of users that have access to the program. Create newer ones, update existing users or remove them. You can also assign tasks to the users."
                    color="#0088ff"
                    onClick={() => navigate('users')}
                />
                <Card
                    title="Documents"
                    subtitle="Manage Documents"
                    description="View the list of inserted documents. Upload new documents and view details about the existing ones. You can also assign tasks to the documents, view their past commits and export their annotations."
                    color="#ff7700"
                    onClick={() => navigate('docs')}
                />
                <Card
                    title="Tasks"
                    subtitle="Manage Tasks"
                    description="View the list of created tasks. Create new tasks by choosing a document and the user they should be assigned to. You can also commit or dismiss tasks, and view the work done by the annotators."
                    color="#7700ff"
                    onClick={() => navigate('tasks')}
                />
                <Card
                    title="Ontologies"
                    subtitle="Manage Ontologies"
                    description="View the list of inserted ontologies, and upload new ontologies."
                    color="#88ff00"
                    onClick={() => navigate('ontos')}
                />
            </div>
        </section>
    );
};

export default DashSummaryPage;
