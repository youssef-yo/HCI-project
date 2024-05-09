import React, { useContext } from 'react';
import { SidebarItem, SidebarItemTitle } from './common';
import { Annotation, RelationGroup, AnnotationStore } from '../../context';
import RelationList from '../RelationsByProperty';
import { CiCircleQuestion } from "react-icons/ci";
import CustomTooltip from '../common/CustomTooltip';

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
                Hold down the Shift key and left-click on an annotation in the PDF.
            </p>
        </>
     );

    // relations.map((relation) =>
    //     console.log('Relation info: ', pdfAnnotations.getAnnotationsOfRelation(relation))
    // );

    return (
        <>
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
        </>
    );
};

export default Relations;
