import React, { useContext, useState, useEffect } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { notification } from '@allenai/varnish';
import { Modal, Button } from 'react-bootstrap';
import Select from 'react-select';

import { Bounds, TokenId, PDFPageInfo, Annotation, AnnotationStore } from '../context';
import { CloseCircleFilled, EditFilled } from '@ant-design/icons';
import { OntoClass } from '../api';
/*
function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        throw new Error('Unable to parse color.');
    }
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    };
}
*/

function getBorderWidthFromBounds(bounds: Bounds): number {
    //
    const width = bounds.right - bounds.left;
    const height = bounds.bottom - bounds.top;
    if (width < 100 || height < 100) {
        return 1;
    } else {
        return 3;
    }
}

interface SelectionBoundaryProps {
    color: string;
    bounds: Bounds;
    selected: boolean;
    children?: React.ReactNode;
    annotationId?: string;
    onClick?: () => void;
}

export const SelectionBoundary = ({
    color,
    bounds,
    children,
    onClick,
    selected,
}: SelectionBoundaryProps) => {
    const width = bounds.right - bounds.left;
    const height = bounds.bottom - bounds.top;
    const rotateY = width < 0 ? -180 : 0;
    const rotateX = height < 0 ? -180 : 0;
    // const rgbColor = hexToRgb(color);
    const border = getBorderWidthFromBounds(bounds);

    return (
        <span
            onClick={(e) => {
                // Here we are preventing the default PdfAnnotationsContainer
                // behaviour of drawing a new bounding box if the shift key
                // is pressed in order to allow users to select multiple
                // annotations and associate them together with a relation.
                if (e.shiftKey && onClick) {
                    e.stopPropagation();
                    onClick();
                }
            }}
            onMouseDown={(e) => {
                if (e.shiftKey && onClick) {
                    e.stopPropagation();
                }
            }}
            style={{
                position: 'absolute',
                left: `${bounds.left}px`,
                top: `${bounds.top}px`,
                width: `${Math.abs(width)}px`,
                height: `${Math.abs(height)}px`,
                transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
                transformOrigin: 'top left',
                border: `${border}px solid ${color}`,
                background: `rgba(${112}, ${221}, ${186}, ${selected ? 0.3 : 0.1})`,
            }}>
            {children || null}
        </span>
    );
};

interface TokenSpanProps {
    isSelected?: boolean;
}

const TokenSpan = styled.span<TokenSpanProps>(
    ({ theme, isSelected }) => `
    position: absolute;
    background: ${isSelected ? theme.color.B3 : 'none'};
    opacity: 0.2;
    border-radius: 3px;
`
);

interface SelectionTokenProps {
    pageInfo: PDFPageInfo;
    tokens: TokenId[] | null;
}
export const SelectionTokens = ({ pageInfo, tokens }: SelectionTokenProps) => {
    return (
        <>
            {tokens &&
                tokens.map((t, i) => {
                    const b = pageInfo.getScaledTokenBounds(pageInfo.tokens[t.tokenIndex]);
                    return (
                        <TokenSpan
                            key={i}
                            isSelected={true}
                            style={{
                                left: `${b.left}px`,
                                top: `${b.top}px`,
                                width: `${b.right - b.left}px`,
                                height: `${b.bottom - b.top}px`,
                                // Tokens don't respond to pointerEvents because
                                // they are ontop of the bounding boxes and the canvas,
                                // which do respond to pointer events.
                                pointerEvents: 'none',
                            }}
                        />
                    );
                })}
        </>
    );
};

interface EditLabelModalProps {
    visible: boolean;
    annotation: Annotation;
    onHide: () => void;
}

const EditLabelModal = ({ visible, annotation, onHide }: EditLabelModalProps) => {
    const annotationStore = useContext(AnnotationStore);

    const [selectedLabel, setSelectedLabel] = useState({ value: annotation.ontoClass.id, label: annotation.ontoClass.text });
    const [currentOntoClass, setCurrentOntoClass] = useState();

    // There are onMouseDown listeners on the <canvas> that handle the
    // creation of new annotations. We use this function to prevent that
    // from being triggered when the user engages with other UI elements.
    const ontoClassFromId = (id: string) => {
        return annotationStore.ontoClasses.find((ontoClass: OntoClass) => {
            return ontoClass.id === id;
        });
        
    };
    useEffect(() => {
        const onKeyPress = (e: KeyboardEvent) => {
            // Ref to https://github.com/allenai/pawls/blob/0f3e5153241502eb68e46f582ed4b28112e2f765/ui/src/components/sidebar/Labels.tsx#L20
            // Numeric keys 1-9
            if (e.keyCode >= 49 && e.keyCode <= 57) {
                const index = Number.parseInt(e.key) - 1;
                if (index < annotationStore.ontoClasses.length) {
                    const selectedLabel = annotationStore.ontoClasses[index];
                    annotationStore.setPdfAnnotations(
                        annotationStore.pdfAnnotations.updateAnnotation(annotation, {
                            ontoClass: selectedLabel,
                        })
                    );
                    onHide();
                }
            }
        };
        window.addEventListener('keydown', onKeyPress);
        return () => {
            window.removeEventListener('keydown', onKeyPress);
        };
    }, [annotationStore, annotation]);

    return (
        <Modal show={visible} onHide={onHide}>
        <Modal.Header closeButton>
            <Modal.Title>Edit class</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Select
                options={annotationStore.ontoClasses.map((ontoClass: OntoClass) => ({
                    value: ontoClass.id,
                    label: ontoClass.text
                })).sort((a, b) => a.label.localeCompare(b.label))}
                value={selectedLabel}
                onChange={(choice: any) => {
                    const resultClass: OntoClass | undefined = ontoClassFromId(choice.value);
                    setCurrentOntoClass(resultClass);
                    setSelectedLabel({ value: resultClass.id, label: resultClass.text });
                }}
                style={{  width: '100%' }}
                />
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => {
                onHide();
                annotationStore.setPdfAnnotations(
                    annotationStore.pdfAnnotations.updateAnnotation(annotation, {
                        ontoClass: currentOntoClass,
                    })
                );
                onHide();
            }}>
                Close
            </Button>
        </Modal.Footer>
    </Modal>
    );
};

interface SelectionProps {
    pageInfo: PDFPageInfo;
    annotation: Annotation;
    showInfo?: boolean;
    changeVisibilityModal: (value: boolean) => void;
}

export const Selection = ({ pageInfo, annotation, showInfo = true, changeVisibilityModal }: SelectionProps) => {
    const label = annotation.ontoClass;
    const theme = useContext(ThemeContext);
    const annotationStore = useContext(AnnotationStore);
    const [isEditLabelModalVisible, setIsEditLabelModalVisible] = useState(false);

    const onHide = () => {
        setIsEditLabelModalVisible(false);
        changeVisibilityModal(false);
    };

    let color;
    if (!label) {
        color = theme.color.N4.hex; // grey as the default.
    } else {
        color = label.color;
        if (color === undefined) {
            color = '#ff0000';
        }
    }

    const bounds = pageInfo.getScaledBounds(annotation.bounds);
    const border = getBorderWidthFromBounds(bounds);

    const removeAnnotation = () => {
        // redundant code in AnnotationRelationModeTopbar: removeAnnotation
        annotationStore.setSrc((prevSrc) => (prevSrc && prevSrc.id === annotation.id ? null : prevSrc));
        annotationStore.setDst((prevDst) => (prevDst && prevDst.id === annotation.id ? null : prevDst));
        const updatedSelectedAnnotations = annotationStore.selectedAnnotations.filter(
            (_annotation) => _annotation.id !== annotation.id
        );
        annotationStore.setSelectedAnnotations(updatedSelectedAnnotations);

        annotationStore.setPdfAnnotations(
            annotationStore.pdfAnnotations.deleteAnnotation(annotation)
        );
    };

    const onShiftClick = () => {
        if (annotationStore.relationMode === true) {
            const current = annotationStore.selectedAnnotations.slice(0);

            // Current contains this annotation, so we remove it.
            if (current.some((other) => other.id === annotation.id)) {
                if (annotationStore.src && annotationStore.src.id === annotation.id) {
                    annotationStore.setSrc(null);
                } else if (annotationStore.dst && annotationStore.dst.id === annotation.id) {
                    annotationStore.setDst(null);
                }
                const next = current.filter((other) => other.id !== annotation.id);
                annotationStore.setSelectedAnnotations(next);
                notification.warning({
                    message: 'Annotation unselected',
                    description: annotation.text,
                    placement: 'bottomRight',
                });
                // Otherwise we add it.
            } else {
                current.push(annotation);
                if (annotationStore.src == null) {
                    annotationStore.setSrc(annotation);
                } else if (annotationStore.src != null && annotationStore.dst == null) {
                    annotationStore.setDst(annotation);
                }
                annotationStore.setSelectedAnnotations(current);
                console.log('Aggiunta annotazione ', current);
                notification.info({
                    message: 'Annotation selected',
                    description: annotation.text,
                    placement: 'bottomRight',
                });
            }
        } else {
            notification.warning({
                message: 'Relation Mode is not activated',
                description:
                    'If you want to select an annotation for a relation you need first to ' +
                    'enable the Relation Mode.',
            });
        }
    };

    const selected = annotationStore.selectedAnnotations.includes(annotation);

    return (
        annotation.show && (
            <div id={'onPDF_' + annotation.id}>
                <SelectionBoundary
                    color={color}
                    bounds={bounds}
                    onClick={onShiftClick}
                    selected={selected}>
                    {showInfo && !annotationStore.hideLabels ? (
                        <SelectionInfo border={border} color={color}>
                            <span>{label.text}</span>
                            <EditFilled
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditLabelModalVisible(true);
                                    changeVisibilityModal(true);
                                }}
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                }}
                            />
                            <CloseCircleFilled
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeAnnotation();
                                }}
                                // We have to prevent the default behaviour for
                                // the pdf canvas here, in order to be able to capture
                                // the click event.
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                }}
                            />
                        </SelectionInfo>
                    ) : null}
                </SelectionBoundary>
                {
                    // NOTE: It's important that the parent element of the tokens
                    // is the PDF canvas, because we need their absolute position
                    // to be relative to that and not another absolute/relatively
                    // positioned element. This is why SelectionTokens are not inside
                    // SelectionBoundary.
                    annotation.tokens ? (
                        <SelectionTokens pageInfo={pageInfo} tokens={annotation.tokens} />
                    ) : null
                }
                {isEditLabelModalVisible ? (
                    <EditLabelModal
                        annotation={annotation}
                        visible={isEditLabelModalVisible}
                        onHide={onHide}
                    />
                ) : null}
            </div>
        )
    );
};

// We use transform here because we need to translate the label upward
// to sit on top of the bounds as a function of *its own* height,
// not the height of it's parent.
interface SelectionInfoProps {
    border: number;
    color: string;
}
const SelectionInfo = styled.div<SelectionInfoProps>(
    ({ border, color }) => `
        position: absolute;
        right: -${border}px;
        transform:translateY(-100%);
        border: ${border} solid  ${color};
        background: ${color};
        font-weight: bold;
        font-size: 12px;
        user-select: none;

        * {
            margin: 2px;
            vertical-align: middle;
        }
    `
);
