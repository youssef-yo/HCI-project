import React, { useContext, useState } from 'react';
import { StyledRelationModeTopbar } from './Topbar.styled';
import Button from 'react-bootstrap/Button';
import { AnnotationStore, RelationGroup } from '../../context';
import { notification } from '@allenai/varnish';
import { DropdownOntoProperties } from '../sidebar';
import { OntoProperty } from '../api';
import { MdCancel } from 'react-icons/md';

export type AnnotationTopbarProps = {
    onCreate: (group: RelationGroup) => void;
    height: string;
    leftOffset?: string;
};

const AnnotationRelationModeTopbar: React.FC<AnnotationTopbarProps> = ({
    onCreate,
    height,
    leftOffset,
}) => {
    const annotationStore = useContext(AnnotationStore);
    const [propertiesCompatible] = useState<OntoProperty[]>(annotationStore.ontoProperties);

    const createRelation = () => {
        if (propertiesCompatible.length === 0) {
            notification.warning({
                message: 'There are no properties available',
                description:
                    'Check if you did upload the correct ontology. You can also' +
                    ' toogle "Show all properties" to force the creation of the relation.',
            });
        } else {
            // const sourceClasses = source
            //     .filter((s) => !targetKeys.some((k) => k === s.id))
            //     .map((s) => s.ontoClass.iri);
            // const targetClasses = source
            //     .filter((t) => targetKeys.some((k) => k === t.id))
            //     .map((t) => t.ontoClass.iri);
            // const sourceIds = source
            //     .filter((s) => !targetKeys.some((k) => k === s.id))
            //     .map((s) => s.id);

            if (annotationStore.src === null || annotationStore.dst === null) {
                notification.warning({
                    message: 'You need to have a source and a target annotation',
                });
            } else {
                const label = annotationStore.activeOntoProperty;
                const source = annotationStore.src;
                const target = annotationStore.dst;
                if (
                    !checkCompatibilityWithProperty(
                        label,
                        [source.ontoClass.iri],
                        [target.ontoClass.iri]
                    )
                ) {
                    const text =
                        'Property selected: ' +
                        label.text +
                        '. ' +
                        'Are you sure you want to create an invalid relation?';
                    if (confirm(text) === true) {
                        onCreate(new RelationGroup(undefined, [source.id], [target.id], label));

                        notification.success({
                            message: 'Relation created.',
                            description: 'Property used: ' + label.text,
                        });
                    }
                } else {
                    onCreate(new RelationGroup(undefined, [source.id], [target.id], label));
                }
            }
        }
    };

    const checkCompatibilityWithProperty = (
        p: OntoProperty,
        sourceClasses: string[],
        targetClasses: string[]
    ) => {
        return (
            (p.domain.includes(sourceClasses[0]) && p.range.includes(targetClasses[0])) ||
            (p.domain.includes(sourceClasses[0]) && p.range.length === 0) ||
            (p.domain.length === 0 && p.range.includes(targetClasses[0])) ||
            (p.domain.length === 0 && p.range.length === 0)
        );
    };

    const removeAnnotation = (id) => {
        annotationStore.setSrc((prevSrc) => (prevSrc && prevSrc.id === id ? null : prevSrc));
        annotationStore.setDst((prevDst) => (prevDst && prevDst.id === id ? null : prevDst));
        const updatedSelectedAnnotations = annotationStore.selectedAnnotations.filter(
            (annotation) => annotation.id !== id
        );
        annotationStore.setSelectedAnnotations(updatedSelectedAnnotations);
    };

    const handleCreationRelation = () => {
        const numberAnn = annotationStore.selectedAnnotations.length;
        if (numberAnn !== 2) {
            notification.warning({
                message: 'Can not create the relation',
                description:
                    'Remember that currently you can create a relation' +
                    ' beetween exactly 2 annotations',
            });
        } else {
            createRelation();
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
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid lightgray',
                        marginRight: '20px',
                        padding: '5px',
                        color: annotationStore.src ? 'black' : 'lightgray',
                        width: '225px',
                    }}>
                    {annotationStore.src ? (
                        <>
                            <span
                                style={{
                                    marginRight: '5px',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    width: '90%',
                                }}
                                title={annotationStore.src.text}
                            >
                                {annotationStore.src.text}
                            </span>
                            <MdCancel
                                style={{
                                    marginLeft: 'auto',
                                    cursor: 'pointer',
                                }}
                                onClick={() => removeAnnotation(annotationStore.src.id)}
                            />
                        </>
                    ) : (
                        'shift+click to select'
                    )}
                </div>
                <label style={{ marginRight: '20px', color: 'black' }}>Destination:</label>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid lightgray',
                        marginRight: '20px',
                        padding: '5px',
                        color: annotationStore.dst ? 'black' : 'lightgray',
                        width: '225px',
                    }}>
                    {annotationStore.dst ? (
                        <>
                            <span
                                style={{
                                    marginRight: '5px',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    width: '90%',
                                }}
                                title={annotationStore.dst.text}
                            >
                                {annotationStore.dst.text}
                            </span>
                            <MdCancel
                                style={{
                                    marginLeft: 'auto',
                                    cursor: 'pointer',
                                }}
                                onClick={() => removeAnnotation(annotationStore.dst.id)}
                            />
                        </>
                    ) : (
                        'shift+click to select'
                    )}
                </div>
                <Button variant="success" onClick={handleCreationRelation}>
                    create
                </Button>
            </div>
        </StyledRelationModeTopbar>
    );
};

export default AnnotationRelationModeTopbar;
