import React, { useContext } from 'react';
import { SidebarItem, SidebarItemTitle } from './common';
import { Annotation, RelationGroup, AnnotationStore } from '../../context';
import ModalPopupRelationInfo from './ModalPopupRelationInfo';

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

    // relations.map((relation) =>
    //     console.log('Relation info: ', pdfAnnotations.getAnnotationsOfRelation(relation))
    // );

    return (
        <SidebarItem>
            <SidebarItemTitle>Relations</SidebarItemTitle>
            <div>
                {relations.length === 0 ? (
                    <>None</>
                ) : (
                    <div>
                        {relations.map((relation) => (
                            <ModalPopupRelationInfo
                                key={relation.id}
                                relation={relation}></ModalPopupRelationInfo>
                        ))}
                    </div>
                )}
            </div>
        </SidebarItem>
    );
};

export default Relations;
