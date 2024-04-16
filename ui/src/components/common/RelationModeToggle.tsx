import React, { useContext, useEffect, useState } from 'react';
import { AnnotationStore } from '../../context';
import { notification, Switch } from '@allenai/varnish';
import styled from 'styled-components';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
// import styled from 'styled-components';
// import { AnnotationStore } from '../../context';
// import { Switch } from '@allenai/varnish';
// import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

interface RelationModeProps {
    onToggle: () => void;
}

const RelationModeToggle = ({ onToggle }: RelationModeProps) => {
    const annotationStore = useContext(AnnotationStore);
    const [showNotification, setShowNotification] = useState<boolean>(false);

    const handleChangeRelationMode = () => {
        annotationStore.setRelationMode(!annotationStore.relationMode);
        setShowNotification(!showNotification);
        onToggle();
    };
    useEffect(() => {
        if (showNotification === true) {
            notification.info({
                message: 'Relation Mode activated',
                description:
                    'Now you can select the annotations that you to want to be involved ' +
                    'in the relation.' +
                    ' Max annotations tha can be selected is 2.',
            });
        } else {
            notification.info({
                message: 'Relation Mode is disactivated',
            });
        }
    }, [showNotification]);
    // const annotationStore = useContext(AnnotationStore);

    // const onToggle = () => {
    //     annotationStore.toggleFreeFormAnnotations(!annotationStore.freeFormAnnotations);
    // };

    return (
        <>
            <Container>
                <ToggleLabel>
                    <ToggleText>Relation Mode</ToggleText>
                    <ToggleSwitch
                        size="small"
                        onChange={handleChangeRelationMode}
                        checked={annotationStore.RelationMode}
                        checkedIcon={<CheckOutlined />}
                        uncheckedIcon={<CloseOutlined />}
                    />
                </ToggleLabel>
            </Container>
        </>
    );
};

export default RelationModeToggle;

const ToggleSwitch = styled(Switch)`
    .rc-switch-checked {
        background-color: #4caf50; /* Colore di sfondo quando è attivo */
        border-color: #4caf50; /* Colore del bordo quando è attivo */
    }
    .rc-switch-inner {
        transition: none; /* Rimuove l'animazione di transizione */
    }
`;

const Container = styled.div`
    display: flex;
    align-items: center;
    margin-top: ${({ theme }) => theme.spacing.sm};
`;

const ToggleLabel = styled.label`
    display: flex;
    align-items: center;
    cursor: pointer;
`;

const ToggleText = styled.p`
    color: #333; /* Colore del testo */
    margin: 0;
    margin-right: 8px; /* Spazio tra il testo e il pulsante */
`;
