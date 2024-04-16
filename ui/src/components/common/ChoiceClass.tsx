import React, { useContext } from 'react';
import { AnnotationStore } from '../../context';
import DropdownOntoClasses from '../sidebar/DropdownOntoClasses';
import styled from 'styled-components';

const ChoiceClass: React.FC = () => {
    const annotationStore = useContext(AnnotationStore);

    return (
        <Container>
            <LabelWrapper>
                <p style={{ color: 'black', margin: 0 }}>Label</p>
            </LabelWrapper>
            <DropdownOntoClasses annotationStore={annotationStore}></DropdownOntoClasses>
        </Container>
    );
};

export default ChoiceClass;

const Container = styled.div`
    display: flex;
    align-items: center;
    margin-top: ${({ theme }) => theme.spacing.sm};
`;

const LabelWrapper = styled.div`
    margin-right: ${({ theme }) => theme.spacing.sm}; /* Aggiunto il margine destro */
    display: flex;
    justify-content: center;
    align-items: center;
`;
