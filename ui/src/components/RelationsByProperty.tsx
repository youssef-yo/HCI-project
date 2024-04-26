import { useState, useContext, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import styled from 'styled-components';
import { Tag } from '@allenai/varnish';
import { RelationInfo } from './sidebar/RelationInfo';
import { AnnotationStore, RelationGroup } from '../context';
import { MdArrowDropDown, MdArrowRight } from 'react-icons/md';
import { IoEyeOutline, IoEyeOffOutline, IoInformationCircleOutline } from "react-icons/io5";
import { useDialog } from '../hooks';

export const RelationList = ({ relations }) => {
    const groupedRelations = {};

    if (relations && relations.length > 0) {
        relations.forEach((relation) => {
            const propertyName = relation.ontoProperty.text;
            if (!groupedRelations[propertyName]) {
                groupedRelations[propertyName] = [];
            }
            groupedRelations[propertyName].push({
                ...relation,
                index: groupedRelations[propertyName].length + 1,
            });
        });
    }

    return (
        <div>
            {Object.entries(groupedRelations).map(([property, relations]) => (
                <RelGroup property={property} relations={relations} />
            ))}
        </div>
    );
};

const RelGroup = ({ property, relations }: { property: string[]; relations: RelationGroup[] }) => {
    const [showRelationGroup, setShowRelationGroup] = useState<boolean>(true);
    
    return (
        <div key={property}>
            <div style={{ display: 'flex', alignItems: 'center' }} >
                <ToggleIcon onClick={() => setShowRelationGroup(!showRelationGroup)}>
                    {showRelationGroup ? <MdArrowDropDown /> : <MdArrowRight />}
                </ToggleIcon>
                <SmallTag title={property} color={'lightgrey'}>
                    {property}
                </SmallTag>
            </div>
            {showRelationGroup &&
                relations.map((relation, index) => (
                    <RelationSummary property={property} relation={relation} index={index} />
                ))}
        </div>
    );
};

const RelationSummary = ({
    property,
    relation,
    index,
}: {
    property: string[];
    relation: RelationGroup;
    index: number;
}) => {
    const { pdfAnnotations, setPdfAnnotations } = useContext(AnnotationStore);
    const infoR = pdfAnnotations.getAnnotationsOfRelation(relation);
    const [showModal, setShowModal] = useState(false);
    const [showRel, setShowRel] = useState<boolean>(true);
    const [showSrc, setShowSrc] = useState<boolean>(true);
    const [showDst, setShowDst] = useState<boolean>(true);
    const dialog = useDialog();

    const handleClose = () => {
        setShowModal(false);
    };
    const handleShowModal = () => {
        setShowModal(true);
    };

    const deleteRelation = async () => {
        handleClose();
        const confirm = await dialog.showConfirmation(
            'Delete relation',
            `Are you sure you want to delete this relation?`
        );
        
        if (confirm) {
            setPdfAnnotations(pdfAnnotations.deleteRelation(relation));
        } else {
            handleShowModal();
        }        
    };

    const onChangeShowSrcAnnotation = () => {
        const updatedPdfAnnotations = pdfAnnotations.updateAnnotation(infoR.sourceAnnotation, { show: showSrc });
        setPdfAnnotations(updatedPdfAnnotations);
    };

    const onChangeShowDstAnnotation = () => {
        const updatedPdfAnnotations = pdfAnnotations.updateAnnotation(infoR.targetAnnotation, { show: showDst });
        setPdfAnnotations(updatedPdfAnnotations);
    };

    useEffect(() => {
        infoR.sourceAnnotation.setShow(showSrc);
        onChangeShowSrcAnnotation();
    }, [showSrc]);

    useEffect(() => {
        infoR.targetAnnotation.setShow(showDst);
        onChangeShowDstAnnotation();
    }, [showDst]);

    return (
        <div key={`${property}-${index}`}>
            {infoR &&
            infoR.sourceAnnotation !== undefined &&
            infoR.targetAnnotation !== undefined &&
            infoR.sourceAnnotation.text !== null &&
            infoR.targetAnnotation.text !== null ? (
                <>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <ToggleIcon style={{ marginLeft: '15px' }} onClick={() => setShowRel(!showRel)}>
                            {showRel ? <MdArrowDropDown /> : <MdArrowRight />}
                        </ToggleIcon>
                        <SmallerTag color={'white'}>
                            {property} - {index}
                        </SmallerTag>
                        <IoInformationCircleOutline
                            style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', marginTop: '3px' }}
                            onClick={() => handleShowModal()}
                        />
                    </div>
                    {showRel && (
                        <>
                            <PaddedRow className={infoR.sourceAnnotation.show ? '' : 'opaco'}>
                                <Overflow title={infoR.sourceAnnotation?.text}>
                                    <strong>src:</strong> {infoR.sourceAnnotation?.text}
                                </Overflow>
                                {infoR.sourceAnnotation.show ? (
                                    <OpenEyeIcon onClick={() => setShowSrc(!showSrc)} />
                                ) : (
                                    <ClosedEyeIcon onClick={() => setShowSrc(!showSrc)} />
                                )}
                            </PaddedRow>
                            <PaddedRow  className={infoR.targetAnnotation.show ? '' : 'opaco'}>
                                <Overflow title={infoR.targetAnnotation?.text}>
                                    <strong>dst:</strong> {infoR.targetAnnotation?.text}
                                </Overflow>
                                {infoR.targetAnnotation.show ? (
                                    <OpenEyeIcon onClick={() => setShowDst(!showDst)} />
                                ) : (
                                    <ClosedEyeIcon onClick={() => setShowDst(!showDst)} />
                                )}
                            </PaddedRow>
                            <Modal show={showModal} onHide={handleClose}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Manage Relation</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <RelationInfo info={infoR} />
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="danger" onClick={() => deleteRelation()}>
                                        Delete Relation
                                    </Button>
                                    <Button variant="secondary" onClick={() => handleClose()}>
                                        Close
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </>
                    )}
                </>
            ) : (
                <></>
            )}
        </div>
    );
};

export default RelationList;

// const PaddedRow = styled.div`
//     padding: 4px 0;
//     border-radius: 2px;
//     display: grid;
//     grid-template-columns: minmax(0, 1fr) min-content min-content min-content;
// `;

const SmallTag = styled(Tag)`
    font-size: 0.95rem;
    padding: 2px 2px;
    border-radius: 4px;
    color: black;
    line-height: 1;
    max-width: 40ch;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
`;

const SmallerTag = styled(Tag)`
    font-size: 0.95rem;
    padding: 2px 2px;
    color: black;
`;

const Overflow = styled.span`
    line-height: 1;
    font-size: 0.8rem;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: black;
    margin-left: 35px;
`;

const ToggleIcon = styled.span`
    cursor: pointer;
`;

const PaddedRow = styled.div`
    padding: 4px 0;
    border-radius: 2px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) min-content min-content min-content;

    &.opaco {
        opacity: 0.5;
    }
`;

const OpenEyeIcon = styled(IoEyeOutline)`
    cursor: pointer;
`;

const ClosedEyeIcon = styled(IoEyeOffOutline)`
    cursor: pointer;
`;
