import React, { useState, useContext, useEffect } from 'react';
import { Annotation, PDFStore, AnnotationStore } from '../context';
import { Tag } from '@allenai/varnish';
import styled from 'styled-components';
import { MdArrowDropDown, MdArrowRight, MdOutlineClose } from 'react-icons/md';
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

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
            <div style={{ display: 'flex', alignItems: 'center' }} >
                <ToggleIcon onClick={() => setShowAnnotations(!showAnnotations)}>
                    {showAnnotations ? <MdArrowDropDown /> : <MdArrowRight />}
                </ToggleIcon>
                <SmallTag title={annotations[0].ontoClass.text} color={annotations[0].ontoClass.color}>
                    {ontoClass}
                </SmallTag>
            </div>
            {showAnnotations &&
                annotations.map((annotation) => (
                    <AnnotationSummary key={annotation.id} annotation={annotation} />
                ))}
        </div>
    );
};

export const AnnotationSummary = ({
    annotation,
}: {
    annotation: Annotation;
}) => {
    const pdfStore = useContext(PDFStore);
    const { pdfAnnotations, setPdfAnnotations } = useContext(AnnotationStore);
    const [showAnnotation, setShowAnnotation] = useState<boolean>(true);

    const onDelete = () => {
        setPdfAnnotations(pdfAnnotations.deleteAnnotation(annotation));
    };

    const onChangeShowAnnotation = () => {
        const updatedPdfAnnotations = pdfAnnotations.updateAnnotation(annotation, { show: showAnnotation });
        setPdfAnnotations(updatedPdfAnnotations);
    };

    const handleScrolling = () => {
        if (!pageInfo) return;
        const divPage = document.getElementById(pageInfo.page.pageNumber.toString());
        divPage?.scrollIntoView({ behavior: 'smooth' });
    };

    if (!pdfStore.pages) {
        return null;
    }

    useEffect(() => {
        annotation.setShow(showAnnotation);
        onChangeShowAnnotation();
    }, [showAnnotation]);

    // Since the starting page might differ from the very first of the PDF,
    // we must filter the page info based on the page index,
    // not based on the array position.
    const pageInfo = pdfStore.pages.find((pInfo) => annotation.page === pInfo.page.pageNumber - 1);
    if (!pageInfo) return null;

    const text =
        annotation.tokens === null
            ? annotation.text
            : annotation.tokens.map((t) => pageInfo.tokens[t.tokenIndex].text).join(' ');
    
    console.log(annotation);
    
    return (
        <PaddedRow className={annotation.show ? '' : 'opaco'}>
            <ClickableText onClick={handleScrolling} title={text}>
                {text}
            </ClickableText>
            <DeleteIcon onClick={onDelete} />
            {annotation.show ? (
                <OpenEyeIcon onClick={() => setShowAnnotation(!showAnnotation)} />
            ) : (
                <ClosedEyeIcon onClick={() => setShowAnnotation(!showAnnotation)} />
            )}
        </PaddedRow>
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

const PaddedRow = styled.div`
    padding: 4px 0;
    border-radius: 2px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) min-content min-content min-content;

    &.opaco {
        opacity: 0.5;
    }
`;

const Overflow = styled.span`
    line-height: 1;
    font-size: 0.8rem;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: black;
    margin-left: 20px;
`;

const ClickableText = styled(Overflow)`
    cursor: pointer;
`;

const DeleteIcon = styled(MdOutlineClose)`
    cursor: pointer;
`;

const OpenEyeIcon = styled(IoEyeOutline)`
    cursor: pointer;
`;

const ClosedEyeIcon = styled(IoEyeOffOutline)`
    cursor: pointer;
`;
