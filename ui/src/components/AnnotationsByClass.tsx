import React, { useState } from 'react';
import { Annotation } from '../context';
import { AnnotationSummary } from './AnnotationSummary';
import { Tag } from '@allenai/varnish';
import styled from 'styled-components';
import { MdArrowDropDown, MdArrowRight } from 'react-icons/md';

export const AnnotationsByClass = ({ annotations }: { annotations: Annotation[] }) => {
    // Creare un oggetto che raggruppa le annotazioni per ontoClass
    const annotationsByClass: { [ontoClass: string]: Annotation[] } = {};

    annotations.forEach((annotation) => {
        if (!annotationsByClass[annotation.ontoClass.text]) {
            annotationsByClass[annotation.ontoClass.text] = [];
        }
        annotationsByClass[annotation.ontoClass.text].push(annotation);
    });

    return (
        <div>
            {Object.keys(annotationsByClass).map((ontoClass) => (
                <AnnotationGroup
                    key={ontoClass}
                    annotations={annotationsByClass[ontoClass]}
                    ontoClass={ontoClass}
                />
            ))}
        </div>
    );
};

const AnnotationGroup = ({
    annotations,
    ontoClass,
}: {
    annotations: Annotation[];
    ontoClass: string;
}) => {
    const [showAnnotations, setShowAnnotations] = useState<boolean>(true);

    return (
        <div>
            <ToggleIcon onClick={() => setShowAnnotations(!showAnnotations)}>
                {showAnnotations ? <MdArrowDropDown /> : <MdArrowRight />}
            </ToggleIcon>
            <SmallTag title={annotations[0].ontoClass.text} color={annotations[0].ontoClass.color}>
                {ontoClass}
            </SmallTag>
            {showAnnotations &&
                annotations.map((annotation) => (
                    <AnnotationSummary key={annotation.id} annotation={annotation} />
                ))}
        </div>
    );
};

const ToggleIcon = styled.span`
    cursor: pointer;
`;

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
