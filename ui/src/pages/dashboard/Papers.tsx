import { MdOutlineNoteAdd } from 'react-icons/md';
import React from 'react';
import { Button, Header } from '../../components/common';

const Papers = () => {
    return (
        <section>
            <Header>
                <h1>Papers</h1>
                <Button color="secondary" icon={<MdOutlineNoteAdd />}>
                    Upload Document
                </Button>
            </Header>
        </section>
    );
};

export default Papers;
