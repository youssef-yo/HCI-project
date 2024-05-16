import React, { useContext, useState } from 'react';
import { StyledRelationModeTopbar } from './Topbar.styled';
import Button from 'react-bootstrap/Button';
import { AnnotationStore, RelationGroup } from '../../context';
// import { notification } from '@allenai/varnish';
import { DropdownOntoProperties } from '../sidebar';
import { OntoProperty } from '../api';
import { MdWarningAmber, MdCheckCircleOutline, MdOutlineClose } from 'react-icons/md';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import '../../assets/styles/Toast.scss';

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

    const [showNoPropertiesNotification, setShowNoPropertiesNotification] = useState<boolean>(false);
    const [showSourceTargetNotification, setShowSourceTargetNotification] = useState<boolean>(false);
    const [showRelationCreated, setShowRelationCreated] = useState<boolean>(false);
    const [showImpossibleCreate, setShowImpossibleCreate] = useState<boolean>(false);

    const relationModeTopbarHeight = '125px';

    const createRelation = () => {
        if (propertiesCompatible.length === 0) {
            setShowNoPropertiesNotification(true);
            setShowImpossibleCreate(false);
            setShowRelationCreated(false);
            setShowSourceTargetNotification(false);
            // notification.warning({
            //     message: 'There are no properties available',
            //     description:
            //         'Check if you did upload the correct ontology. You can also' +
            //         ' toogle "Show all properties" to force the creation of the relation.',
            // });
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
                setShowSourceTargetNotification(true);
                setShowNoPropertiesNotification(false);
                setShowImpossibleCreate(false);
                setShowRelationCreated(false);
                // notification.warning({
                //     message: 'You need to have a source and a target annotation',
                // });
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
                        setShowRelationCreated(true);
                        setShowImpossibleCreate(false);
                        setShowNoPropertiesNotification(false);
                        setShowSourceTargetNotification(false);

                        // notification.success({
                        //     message: 'Relation created.',
                        //     description: 'Property used: ' + label.text,
                        // });
                    }
                } else {
                    onCreate(new RelationGroup(undefined, [source.id], [target.id], label));
                    setShowRelationCreated(true);
                    setShowImpossibleCreate(false);
                    setShowNoPropertiesNotification(false);
                    setShowSourceTargetNotification(false);
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
        if (numberAnn > 2) {
            setShowImpossibleCreate(true);
            // notification.warning({
            //     message: 'Can not create the relation',
            //     description:
            //         'Remember that currently you can create a relation' +
            //         ' beetween exactly 2 annotations',
            // });
        } else {
            createRelation();
        }
    };
    return (
        <>
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
                            border: `1px solid ${!annotationStore.src ? 'lightblue' : 'lightgray'}`,
                            borderWidth: '1px', // Larghezza del bordo maggiore quando src è vuoto e dst è vuoto o src è pieno
                            boxShadow: !annotationStore.src ? '0 0 5px 2px rgba(0, 0, 255, 0.5)' : 'none', // Effetto luminoso quando src è vuoto e dst è vuoto o src è pieno
                            transition: 'border-color 0.3s ease, border-width 0.3s ease, box-shadow 0.3s ease', // Aggiunto per una transizione fluida del colore, della larghezza del bordo e dell'effetto luminoso
                            marginRight: '20px',
                            padding: '5px',
                            color: annotationStore.src ? 'black' : 'lightgray',
                            width: '225px',
                        }}
                        >
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
                                <MdOutlineClose
                                    style={{
                                        marginLeft: 'auto',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => removeAnnotation(annotationStore.src.id)}
                                />
                            </>
                        ) : (
                            'click annotation to select'
                        )}
                    </div>
                    <label style={{ marginRight: '20px', color: 'black' }}>Destination:</label>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: `1px solid ${annotationStore.src && !annotationStore.dst ? 'lightblue' : 'lightgray'}`,
                            borderWidth: '1px', // Larghezza del bordo maggiore quando src è pieno e dst è vuoto
                            boxShadow: annotationStore.src && !annotationStore.dst ? '0 0 5px 2px rgba(0, 0, 255, 0.5)' : 'none', // Effetto luminoso quando src è pieno e dst è vuoto
                            transition: 'border-color 0.3s ease, border-width 0.3s ease, box-shadow 0.3s ease', // Aggiunto per una transizione fluida del colore, della larghezza del bordo e dell'effetto luminoso
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
                                <MdOutlineClose
                                    style={{
                                        marginLeft: 'auto',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => removeAnnotation(annotationStore.dst.id)}
                                />
                            </>
                        ) : (
                            'click annotation to select'
                        )}
                    </div>
                    <Button variant="success" onClick={handleCreationRelation}>
                        create
                    </Button>
                </div>
            </StyledRelationModeTopbar>
            <ToastContainer
                    className="p-3"
                    style={{
                        position: 'fixed',
                        top: relationModeTopbarHeight,
                        left: '45%',
                        zIndex: 9999,
                    }}
            >
                <Toast
                    show={showNoPropertiesNotification}
                    onClose={() => setShowNoPropertiesNotification(false)}
                    delay={10000}
                    autohide
                    className="warning-toast"
                >
                    <Toast.Header className="text-center">
                        <strong className="mr-auto" style={{ margin: 'auto' }}>There are no properties available</strong>
                    </Toast.Header>
                    <Toast.Body style={{ textAlign: 'center' }}>
                        Check if you did upload the correct ontology. You can also  toogle "Show all properties" to force the creation of the relation.
                    </Toast.Body>
                </Toast>
                <Toast
                    show={showImpossibleCreate}
                    onClose={() => setShowImpossibleCreate(false)}
                    delay={10000}
                    autohide
                    className="warning-toast"
                >
                    <Toast.Header className="text-center">
                        <strong className="mr-auto" style={{ margin: 'auto' }}>Cannot create the relation</strong>
                    </Toast.Header>
                    <Toast.Body style={{ textAlign: 'center' }}>
                        Remember that currently you can create a relation beetween exactly 2 annotations
                    </Toast.Body>
                </Toast>
                <Toast
                    show={showSourceTargetNotification}
                    onClose={() => setShowSourceTargetNotification(false)}
                    delay={2000}
                    autohide
                    className="warning-toast"
                >
                    <Toast.Body style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <MdWarningAmber/>
                            You need to have a source and a target annotation
                        </div>
                    </Toast.Body>
                </Toast>
                <Toast
                    show={showRelationCreated}
                    onClose={() => setShowRelationCreated(false)}
                    delay={2000}
                    autohide
                    className="success-toast"
                >
                    <Toast.Body style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <MdCheckCircleOutline/>
                            Relation Created!
                        </div>
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
};

export default AnnotationRelationModeTopbar;
