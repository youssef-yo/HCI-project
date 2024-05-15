import React, { useContext } from 'react';
import { AnnotationStore } from '../../context';
import DropdownOntoClasses from '../sidebar/DropdownOntoClasses';
import styled from 'styled-components';

const ChoiceClass: React.FC = () => {
    const annotationStore = useContext(AnnotationStore);

    return (
        <Container>
            <LabelWrapper disabled={annotationStore.relationMode}>
                Label
            </LabelWrapper>
            <DropdownOntoClasses annotationStore={annotationStore}></DropdownOntoClasses>
        </Container>
    );
};

export default ChoiceClass;

const Container = styled.div`
    display: flex;
    align-items: center;
`;

const LabelWrapper = styled.div`
    margin-right: ${({ theme }) => theme.spacing.sm}; /* Aggiunto il margine destro */
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: ${(props) => (props.disabled ? 0.5 : 1)};
    color: ${(props) => (props.disabled ? '#999' : '#333')};
`;
