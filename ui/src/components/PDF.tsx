import React, { useContext, useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { PDFPageProxy } from 'pdfjs-dist/types/display/api';

import {
    PDFPageInfo,
    AnnotationStore,
    PDFStore,
    Bounds,
    normalizeBounds,
    getNewAnnotation,
} from '../context';
import { Selection } from '../components';
import { SelectionBoundary, SelectionTokens } from './Selection';

class PDFPageRenderer {
    private currentRenderTask?: ReturnType<PDFPageProxy['render']>;
    constructor(
        readonly page: PDFPageProxy,
        readonly canvas: HTMLCanvasElement,
        readonly onError: (e: Error) => void
    ) {}

    cancelCurrentRender() {
        if (this.currentRenderTask === undefined) {
            return;
        }
        this.currentRenderTask.promise.then(
            () => {},
            (err: any) => {
                if (err instanceof Error && err.message.indexOf('Rendering cancelled') !== -1) {
                    // Swallow the error that's thrown when the render is canceled.
                    return;
                }
                const e = err instanceof Error ? err : new Error(err);
                this.onError(e);
            }
        );
        this.currentRenderTask.cancel();
    }

    render(scale: number) {
        const viewport = this.page.getViewport({ scale });

        this.canvas.height = viewport.height;
        this.canvas.width = viewport.width;

        const canvasContext = this.canvas.getContext('2d');
        if (canvasContext === null) {
            throw new Error('No canvas context');
        }
        this.currentRenderTask = this.page.render({ canvasContext, viewport });
        return this.currentRenderTask;
    }

    rescaleAndRender(scale: number) {
        this.cancelCurrentRender();
        return this.render(scale);
    }
}

function getPageBoundsFromCanvas(canvas: HTMLCanvasElement): Bounds {
    if (canvas.parentElement === null) {
        throw new Error('No canvas parent');
    }
    const parent = canvas.parentElement;
    const parentStyles = getComputedStyle(canvas.parentElement);

    const leftPadding = parseFloat(parentStyles.paddingLeft || '0');
    const left = parent.offsetLeft + leftPadding;

    const topPadding = parseFloat(parentStyles.paddingTop || '0');
    const top = parent.offsetTop + topPadding;

    const parentWidth =
        parent.clientWidth - leftPadding - parseFloat(parentStyles.paddingRight || '0');
    const parentHeight =
        parent.clientHeight - topPadding - parseFloat(parentStyles.paddingBottom || '0');
    return {
        left,
        top,
        right: left + parentWidth,
        bottom: top + parentHeight,
    };
}

interface PageProps {
    pageInfo: PDFPageInfo;
    onError: (_err: Error) => void;
}

const Page = ({ pageInfo, onError }: PageProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [scale, setScale] = useState<number>(1);

    const annotationStore = useContext(AnnotationStore);

    const containerRef = useRef<HTMLDivElement>(null);
    const [selection, setSelection] = useState<Bounds>();

    const [isEditLabelModalVisible, setIsEditLabelModalVisible] = useState(false);

    const annotations = annotationStore.pdfAnnotations.docAnnotations.annotations.filter(
        (a) => a.page === pageInfo.page.pageNumber - 1
    );

    useEffect(() => {
        try {
            const determinePageVisiblity = () => {
                if (canvasRef.current !== null) {
                    const windowTop = 0;
                    const windowBottom = window.innerHeight;
                    const rect = canvasRef.current.getBoundingClientRect();
                    setIsVisible(
                        // Top is in within window
                        (windowTop < rect.top && rect.top < windowBottom) ||
                            // Bottom is in within window
                            (windowTop < rect.bottom && rect.bottom < windowBottom) ||
                            // top is negative and bottom is +ve
                            (rect.top < windowTop && rect.bottom > windowTop)
                    );
                }
            };

            if (canvasRef.current === null) {
                onError(new Error('No canvas element'));
                return;
            }

            pageInfo.bounds = getPageBoundsFromCanvas(canvasRef.current);
            const renderer = new PDFPageRenderer(pageInfo.page, canvasRef.current, onError);
            renderer.render(pageInfo.scale);

            determinePageVisiblity();

            const handleResize = () => {
                if (canvasRef.current === null) {
                    onError(new Error('No canvas element'));
                    return;
                }
                pageInfo.bounds = getPageBoundsFromCanvas(canvasRef.current);
                renderer.rescaleAndRender(pageInfo.scale);
                setScale(pageInfo.scale);
                determinePageVisiblity();
            };
            console.log('Is visible: ', isVisible);
            window.addEventListener('resize', handleResize);
            window.addEventListener('scroll', determinePageVisiblity);
            return () => {
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('scroll', determinePageVisiblity);
            };
        } catch (e) {
            onError(e);
        }
    }, [pageInfo, onError]); // We deliberately only run this once.

    return (
        <PageAnnotationsContainer
            ref={containerRef}
            id={pageInfo.page.pageNumber.toString()}
            onMouseDown={(event) => {
                if (isEditLabelModalVisible) return;

                if (containerRef.current === null) {
                    throw new Error('No Container');
                }

                // console.log(
                //     `===Current===\n[Event] Page-X: ${event.pageX}\n[Event] Page-Y: ${
                //         event.pageY
                //     }\n[ContainerRef] Offset-Left: ${
                //         containerRef.current.getBoundingClientRect().left
                //     }\n[ContainerRef] Offset-Top: ${containerRef.current.offsetTop}`
                // );

                if (!selection) {
                    const left = event.pageX - containerRef.current.getBoundingClientRect().left;
                    const top = event.pageY - containerRef.current.offsetTop;
                    setSelection({
                        left,
                        top,
                        right: left,
                        bottom: top,
                    });
                }
            }}
            onMouseMove={
                selection
                    ? (event) => {
                        if (containerRef.current === null) {
                            throw new Error('No Container');
                        }

                        //   console.log(
                        //       `===Current===\n[Event] Page-X: ${event.pageX}\n[Event] Page-Y: ${
                        //           event.pageY
                        //       }\n[ContainerRef] Offset-Left: ${
                        //           containerRef.current.getBoundingClientRect().left
                        //       }\n[ContainerRef] Offset-Top: ${containerRef.current.offsetTop}`
                        //   );

                        setSelection({
                            ...selection,
                            right:
                                event.pageX - containerRef.current.getBoundingClientRect().left,
                            bottom: event.pageY - containerRef.current.offsetTop,
                        });
                    }
                    : undefined
            }
            onMouseUp={
                selection
                    ? () => {
                        if (annotationStore.activeOntoClass) {
                            const newAnnotation = getNewAnnotation(
                                // TODO(Mark): Change
                                pageInfo,
                                selection,
                                annotationStore.activeOntoClass,
                                annotationStore.freeFormAnnotations
                            );
                            if (newAnnotation) {
                                annotationStore.setPdfAnnotations(
                                    annotationStore.pdfAnnotations.withNewAnnotation(
                                        newAnnotation
                                    )
                                );
                            }
                        }
                        setSelection(undefined);
                    }
                    : undefined
            }>
            <PageCanvas ref={canvasRef} />
            {
                // We only render the tokens if the page is visible, as rendering them all makes the
                // page slow and/or crash.
                // quando si preme su un'annotazione nella sidebar per visualizzare la pagina in cui
                // si trova, le annotazioni in quelle pagina non vengono visualizzate finchè non si
                // un minimo scrolling con il mouse
                scale &&
                    isVisible &&
                    annotations.map((annotation) => (
                        <Selection
                            pageInfo={pageInfo}
                            annotation={annotation}
                            key={annotation.toString()}
                            changeVisibilityModal={(value) => setIsEditLabelModalVisible(value)}
                        />
                    ))
            }
            {selection && annotationStore.activeOntoClass
                ? (() => {
                      if (selection && annotationStore.activeOntoClass) {
                          const annotation = pageInfo.getAnnotationForBounds(
                              normalizeBounds(selection),
                              annotationStore.activeOntoClass
                          );
                          const tokens =
                              annotation &&
                              annotation.tokens &&
                              !annotationStore.freeFormAnnotations
                                  ? annotation.tokens
                                  : null;

                          return (
                              <>
                                  <SelectionBoundary
                                      color={'#70DDBA'}
                                      bounds={selection}
                                      selected={false}
                                  />
                                  <SelectionTokens pageInfo={pageInfo} tokens={tokens} />
                              </>
                          );
                      }
                  })()
                : null}
        </PageAnnotationsContainer>
    );
};

export const PDF = () => {
    const pdfStore = useContext(PDFStore);

    // TODO (@codeviking): Use error boundaries to capture these.
    if (!pdfStore.doc) {
        throw new Error('No Document');
    }
    if (!pdfStore.pages) {
        throw new Error('Document without Pages');
    }

    return (
        <>
            {pdfStore.pages.map((p) => {
                return <Page key={p.page.pageNumber} pageInfo={p} onError={pdfStore.onError} />;
            })}
        </>
    );
};

const PageAnnotationsContainer = styled.div(
    ({ theme }) => `
    position: relative;
    box-shadow: 2px 2px 4px 0 rgba(0, 0, 0, 0.2);
    margin: 0 0 ${theme.spacing.xs};

    &:last-child {
        margin-bottom: 0;
    }
`
);

const PageCanvas = styled.canvas`
    display: block;
`;
