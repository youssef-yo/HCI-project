import React, { useContext } from 'react';
import { Annotation, PDFStore, AnnotationStore } from '../context';
import styled from 'styled-components';
import { DeleteFilled, RightCircleOutlined } from '@ant-design/icons';

interface AnnotationSummaryProps {
    annotation: Annotation;
}

export const AnnotationSummary = ({ annotation }: AnnotationSummaryProps) => {
    const pdfStore = useContext(PDFStore);
    const { pdfAnnotations, setPdfAnnotations } = useContext(AnnotationStore);

    const onDelete = () => {
        setPdfAnnotations(pdfAnnotations.deleteAnnotation(annotation));
    };
    const handleScrolling = () => {
        if (!pageInfo) return;
        const divPage = document.getElementById(pageInfo.page.pageNumber.toString());
        divPage?.scrollIntoView({ behavior: 'smooth' });
    };

    if (!pdfStore.pages) {
        return null;
    }

    // Since the starting page might differ from the very first of the PDF,
    // we must filter the page info based on the page index,
    // not based on the array position.
    const pageInfo = pdfStore.pages.find((pInfo) => annotation.page === pInfo.page.pageNumber - 1);
    if (!pageInfo) return null;

    const text =
        annotation.tokens === null
            ? 'Freeform'
            : annotation.tokens.map((t) => pageInfo.tokens[t.tokenIndex].text).join(' ');
    return (
        <PaddedRow>
            <Overflow title={text}>{text}</Overflow>
            <DeleteFilled onClick={onDelete} />
            <RightCircleOutlined onClick={handleScrolling} />
        </PaddedRow>
    );
};

const PaddedRow = styled.div`
    padding: 4px 0;
    border-radius: 2px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) min-content min-content min-content;
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
