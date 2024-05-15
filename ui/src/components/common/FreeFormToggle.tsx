import React, { useContext } from 'react';
import styled from 'styled-components';
import { AnnotationStore } from '../../context';
import { Switch } from '@allenai/varnish';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const FreeFormToggle: React.FC = () => {
    const annotationStore = useContext(AnnotationStore);

    const onToggle = () => {
        annotationStore.toggleFreeFormAnnotations(!annotationStore.freeFormAnnotations);
    };

    return (
        <Container>
            <ToggleLabel>
                <ToggleText disabled={annotationStore.relationMode}>Free Form</ToggleText>
                <ToggleSwitch
                    size="small"
                    onChange={onToggle}
                    checked={annotationStore.freeFormAnnotations}
                    checkedIcon={<CheckOutlined />}
                    uncheckedIcon={<CloseOutlined />}
                    disabled={annotationStore.relationMode}
                />
            </ToggleLabel>
        </Container>
    );
};

export default FreeFormToggle;

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
`;

const ToggleLabel = styled.label`
    display: flex;
    align-items: center;
    cursor: pointer;
`;

const ToggleText = styled.p`
    color: ${(props) => (props.disabled ? '#999' : '#333')}; /* Colore del testo */
    margin: 0;
    margin-right: 8px; /* Spazio tra il testo e il pulsante */
    opacity: ${(props) => (props.disabled ? 0.5 : 1)}; /* Opacità del testo quando è disabilitato */
`;
