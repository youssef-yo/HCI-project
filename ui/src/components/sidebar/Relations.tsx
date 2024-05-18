import React, { useContext } from 'react';
import { SidebarItem, SidebarItemTitle } from './common';
import { Annotation, RelationGroup, AnnotationStore } from '../../context';
import RelationList from '../RelationsByProperty';
import { CiCircleQuestion } from "react-icons/ci";
import CustomTooltip from '../common/CustomTooltip';
import styled from 'styled-components';

interface RelationProps {
    annotations: Annotation[];
    relations: RelationGroup[];
}

const Relations: React.FC<RelationProps> = ({ annotations, relations }) => {
    const { pdfAnnotations } = useContext(AnnotationStore);
    console.log('Annotations-document: ', annotations);
    console.log('Annotations-delta: ', pdfAnnotations.taskDeltaAnnotations.annotations);
    console.log('Relations-document: ', relations);
    console.log('Relations-delta: ', pdfAnnotations.taskDeltaAnnotations.relations);

    const tooltipText = (
        <>
            <b>How to select an annotation:</b>
            <p>
                Activate the relation mode and select two different annotations.
            </p>
        </>
     );

    // relations.map((relation) =>
    //     console.log('Relation info: ', pdfAnnotations.getAnnotationsOfRelation(relation))
    // );

    return (
        <SidebarItemWrapper>
            <div style={{ display: "flex", alignItems: "center" }}>
                <SidebarItemTitle>
                Relations
                <CustomTooltip placement="right" tooltipText={tooltipText}>
                    <div style={{ marginLeft: "10px", cursor: "pointer" }}>
                        <CiCircleQuestion size={20} />
                    </div>
                </CustomTooltip>
                </SidebarItemTitle>
            </div>
            <SidebarItem>
                <div>
                    {relations.length === 0 ? (
                        <span style={{ color: 'black' }}>No Relations Yet </span>
                    ) : (
                        <div>
                            <RelationList relations={relations} />
                        </div>
                    )}
                </div>
            </SidebarItem>
        </SidebarItemWrapper>
    );
};

const SidebarItemWrapper = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  box-sizing: border-box;
`;

export default Relations;
