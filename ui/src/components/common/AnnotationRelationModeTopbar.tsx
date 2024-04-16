import React, { useContext } from 'react';
import { StyledRelationModeTopbar } from './Topbar.styled';
import Button from 'react-bootstrap/Button';
import { AnnotationStore } from '../../context';
import { notification } from '@allenai/varnish';

export type AnnotationTopbarProps = {
    height: string;
    leftOffset?: string;
};

const AnnotationRelationModeTopbar: React.FC<AnnotationTopbarProps> = ({ height, leftOffset }) => {
    const annotationStore = useContext(AnnotationStore);
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
            <Button variant="success" className="btn m-1" onClick={handelCreationRelation}>
                done
            </Button>
        </StyledRelationModeTopbar>
    );
};

export default AnnotationRelationModeTopbar;
