import { useState, useContext } from 'react';
import { Modal, Button } from 'react-bootstrap';
import styled from 'styled-components';
import { FullscreenOutlined } from '@ant-design/icons';
import { Tag } from '@allenai/varnish';
import { RelationInfo } from './sidebar/RelationInfo';
import { AnnotationStore, RelationGroup } from '../context';
import { MdArrowDropDown, MdArrowRight } from 'react-icons/md';

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
            <ToggleIcon onClick={() => setShowRelationGroup(!showRelationGroup)}>
                {showRelationGroup ? <MdArrowDropDown /> : <MdArrowRight />}
            </ToggleIcon>
            <SmallTag title={property} color={'lightgrey'}>
                {property}
            </SmallTag>
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
    const [relationState, setRelationState] = useState({});
    const infoR = pdfAnnotations.getAnnotationsOfRelation(relation);
    const selectedRelation = relationState[relation.id] || null;
    const show = selectedRelation !== null;
    const handleClose = () => updateRelationState(relation, null);
    const [showRel, setShowRel] = useState<boolean>(true);

    // Aggiungi una funzione per gestire lo stato delle relazioni
    const updateRelationState = (relation, newState) => {
        setRelationState((prevState) => ({
            ...prevState,
            [relation.id]: newState,
        }));
    };

    const deleteRelation = (relation) => {
        setPdfAnnotations(pdfAnnotations.deleteRelation(relation));
        handleClose();
    };

    const handleShowModal = (relation) => {
        return () => {
            updateRelationState(relation, true);
        };
    };

    return (
        <div key={`${property}-${index}`}>
            {infoR &&
            infoR.sourceAnnotation !== undefined &&
            infoR.targetAnnotation !== undefined &&
            infoR.sourceAnnotation.text !== null &&
            infoR.targetAnnotation.text !== null ? (
                <>
                    <ToggleIcon style={{ marginLeft: '20px' }} onClick={() => setShowRel(!showRel)}>
                        {showRel ? <MdArrowDropDown /> : <MdArrowRight />}
                    </ToggleIcon>
                    <SmallerTag color={'white'}>
                        {property} - {index}
                    </SmallerTag>
                    {showRel && (
                        <>
                            <div>
                                <Overflow title={infoR.sourceAnnotation?.text}>
                                    {infoR.sourceAnnotation?.text}
                                </Overflow>
                                <br />
                                <Overflow title={infoR.targetAnnotation?.text}>
                                    {infoR.targetAnnotation?.text}
                                </Overflow>
                                <FullscreenOutlined onClick={handleShowModal(relation)} />
                            </div>
                            <Modal show={show} onHide={handleClose}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Manage Relation</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    {selectedRelation && <RelationInfo info={infoR} />}
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="danger" onClick={deleteRelation}>
                                        Delete Relation
                                    </Button>
                                    <Button variant="secondary" onClick={handleClose}>
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
    margin-left: 40px;
`;

const ToggleIcon = styled.span`
    cursor: pointer;
`;
