import React, { useContext, useState } from 'react';
import { StyledRelationModeTopbar } from './Topbar.styled';
import Button from 'react-bootstrap/Button';
import { AnnotationStore } from '../../context';
import { notification } from '@allenai/varnish';
import { DropdownOntoProperties } from '../sidebar';
import { OntoProperty } from '../api';

export type AnnotationTopbarProps = {
    height: string;
    leftOffset?: string;
};

const AnnotationRelationModeTopbar: React.FC<AnnotationTopbarProps> = ({ height, leftOffset }) => {
    const annotationStore = useContext(AnnotationStore);
    const [propertiesCompatible] = useState<OntoProperty[]>(annotationStore.ontoProperties);

    const handelCreationRelation = () => {
        const numberAnn = annotationStore.selectedAnnotations.length;
        if (numberAnn !== 2) {
            notification.warning({
                message: 'Can not create the relation',
                description:
                    'Remember that currently you can create a relation' +
                    ' beetween exactly 2 annotations',
            });
        }
    };
    return (
        <StyledRelationModeTopbar height={height} leftOffset={leftOffset}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ marginRight: '20px', color: 'black' }}>Property:</label>
                <DropdownOntoProperties ontoProperties={propertiesCompatible} />
                <label style={{ marginRight: '20px', marginLeft: '20px', color: 'black' }}>
                    Source:
                </label>
                <div
                    style={{
                        border: '1px solid lightgray',
                        marginRight: '20px',
                        padding: '5px',
                        color: 'lightgray',
                        width: '225px',
                    }}>
                    ctrl+shift+click to select
                </div>
                <label style={{ marginRight: '20px', color: 'black' }}>Destination:</label>
                <div
                    style={{
                        border: '1px solid lightgray',
                        marginRight: '20px',
                        padding: '5px',
                        color: 'lightgray',
                        width: '225px',
                    }}>
                    ctrl+shift+click to select
                </div>
                <Button variant="success" className="btn m-1" onClick={handelCreationRelation}>
                    create
                </Button>
            </div>
        </StyledRelationModeTopbar>
    );
};

export default AnnotationRelationModeTopbar;
