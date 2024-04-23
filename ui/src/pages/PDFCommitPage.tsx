import { Result, Progress, notification } from '@allenai/varnish';
import { QuestionCircleOutlined } from '@ant-design/icons';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocumentProxy, PDFDocumentLoadingTask } from 'pdfjs-dist/types/display/api';
import styled, { ThemeContext } from 'styled-components';
import { useContext, useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { PDF, CenterOnPage, RelationModal } from '../components';
import { WithSidebar, Sidebar, Topbar, WithTopbar } from '../components/common';
import { Labels, Relations, Logo, CommitAnnotations } from '../components/sidebar';
import {
    pdfURL,
    PageTokens,
    OntoClass,
    OntoProperty,
    useDocumentApi,
    useOntologyApi,
    Doc,
    DocCommit,
} from '../api';
import {
    PDFPageInfo,
    Annotation,
    AnnotationStore,
    PDFStore,
    RelationGroup,
    PDFAnnotations,
    TaskDeltaAnnotations,
} from '../context';

import * as listeners from '../listeners';

// This tells PDF.js the URL the code to load for it's webworker, which handles heavy-handed
// tasks in a background thread. Ideally we'd load this from the application itself rather
// than from the CDN to keep things local.
// TODO (@codeviking): Figure out how to get webpack to package up the PDF.js webworker code.
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

enum ViewState {
    LOADING,
    LOADED,
    NOT_FOUND,
    ERROR,
}

const PDFCommitPage = () => {
    const { commitId } = useParams<{ commitId: string }>();
    const [viewState, setViewState] = useState<ViewState>(ViewState.LOADING);

    const [doc, setDocument] = useState<PDFDocumentProxy>();
    const [progress, setProgress] = useState(0);
    const [pages, setPages] = useState<PDFPageInfo[]>();

    const [pdfAnnotations, setPdfAnnotations] = useState<PDFAnnotations>(PDFAnnotations.empty());

    const [selectedAnnotations, setSelectedAnnotations] = useState<Annotation[]>([]);

    const [activeCommit, setActiveCommit] = useState<DocCommit>();
    const [commitDoc, setCommitDoc] = useState<Doc>();

    const [activeOntoClass, setActiveOntoClass] = useState<OntoClass>();
    const [ontoClasses, setOntoClasses] = useState<OntoClass[]>([]);
    const [ontoProperties, setOntoProperties] = useState<OntoProperty[]>([]);
    const [activeOntoProperty, setActiveOntoProperty] = useState<OntoProperty>();
    const [freeFormAnnotations, toggleFreeFormAnnotations] = useState<boolean>(false);
    const [hideLabels, setHideLabels] = useState<boolean>(false);

    const [relationModalVisible, setRelationModalVisible] = useState<boolean>(false);
    const [ontoNames, setOntoNames] = useState<string[]>();

    const [relationMode, setRelationMode] = useState<boolean>(false);

    const { getCommitByID, getCommitAnnotations, getDocumentByID, getTokens } = useDocumentApi();
    const { getClasses, getProperties, getOntologiesList } = useOntologyApi();

    // React's Error Boundaries don't work for us because a lot of work is done by pdfjs in
    // a background task (a web worker). We instead setup a top level error handler that's
    // passed around as needed so we can display a nice error to the user when something
    // goes wrong.
    //
    // We have to use the `useCallback` hook here so that equality checks in child components
    // don't trigger unintentional rerenders.
    const onError = useCallback(
        (err: Error) => {
            console.error('Unexpected Error rendering PDF', err);
            setViewState(ViewState.ERROR);
        },
        [setViewState]
    );

    const theme = useContext(ThemeContext);

    const onRelationModalOk = (group: RelationGroup) => {
        setPdfAnnotations(pdfAnnotations.withNewRelation(group));
        setRelationModalVisible(false);
        setSelectedAnnotations([]);
    };

    const onRelationModalCancel = () => {
        setRelationModalVisible(false);
        setSelectedAnnotations([]);
    };

    useEffect(() => {
        getOntologiesList().then((ontologies) => {
            const ontologiesNames = ontologies.map((onto) => onto._id);
            setOntoNames(ontologiesNames);
        });
    }, []);

    useEffect(() => {
        if (ontoNames !== undefined && ontoNames.length > 0) {
            getClasses(ontoNames).then((ontoClasses) => {
                if (ontoClasses !== undefined) {
                    setOntoClasses(ontoClasses);
                    setActiveOntoClass(ontoClasses[0]);
                }
            });
        }
    }, [ontoNames]);

    useEffect(() => {
        if (ontoNames !== undefined && ontoNames.length > 0) {
            getProperties(ontoNames).then((ontoProperty) => {
                if (ontoProperty !== undefined) {
                    setOntoProperties(ontoProperty);
                    setActiveOntoProperty(ontoProperty[0]);
                }
            });
        }
    }, [ontoNames]);

    useEffect(() => {
        if (!commitId) {
            setViewState(ViewState.NOT_FOUND);
            return;
        }

        getCommitByID(commitId)
            .then((commit) => {
                getDocumentByID(commit.docId)
                    .then((doc) => {
                        setActiveCommit(commit);
                        setCommitDoc(doc);

                        notification.warn({
                            message: 'Read Only Mode!',
                            description: `You are currently viewing previously committed annotations of the document ${doc.name}. You can make annotations but they won't be saved.`,
                        });
                    })
                    .catch((err) => {
                        console.error(`Document with ID ${commitId} not found!`, err);
                        setViewState(ViewState.ERROR);
                    });
            })
            .catch((err) => {
                console.error(`Commit with ID ${commitId} not found!`, err);
                setViewState(ViewState.NOT_FOUND);
            });
    }, [commitId]);

    useEffect(() => {
        if (!activeCommit || !commitDoc) return;

        setDocument(undefined);
        setViewState(ViewState.LOADING);
        const loadingTask: PDFDocumentLoadingTask = pdfjs.getDocument(pdfURL(activeCommit.docId));
        loadingTask.onProgress = (p: { loaded: number; total: number }) => {
            setProgress(Math.round((p.loaded / p.total) * 50));
        };

        // TODO: Load only the needed page tokens.
        Promise.all([
            // PDF.js uses their own `Promise` type, which according to TypeScript doesn't overlap
            // with the base `Promise` interface. To resolve this we (unsafely) cast the PDF.js
            // specific `Promise` back to a generic one. This works, but might have unexpected
            // side-effects, so we should remain wary of this code.
            (loadingTask.promise as unknown) as Promise<PDFDocumentProxy>,
            getTokens(activeCommit.docId),
        ])
            .then(([doc, resp]: [PDFDocumentProxy, PageTokens[]]) => {
                setProgress(75);
                setDocument(doc);

                // Load all the pages too. In theory this makes things a little slower to startup,
                // as fetching and rendering them asynchronously would make it faster to render the
                // first, visible page. That said it makes the code simpler, so we're ok with it for
                // now.
                const loadPages: Promise<PDFPageInfo>[] = [];
                for (let i = 1; i <= commitDoc.totalPages; i++) {
                    // See line 50 for an explanation of the cast here.
                    loadPages.push(
                        (doc.getPage(i).then((p) => {
                            const pageIndex = p.pageNumber - 1;
                            const pageTokens = resp[pageIndex].tokens;
                            return new PDFPageInfo(p, pageTokens);
                        }) as unknown) as Promise<PDFPageInfo>
                    );
                }
                return Promise.all(loadPages);
            })
            .then((pages) => {
                setProgress(90);
                setPages(pages);

                // Get any existing annotations for this pdf.
                getCommitAnnotations(activeCommit._id)
                    .then((docAnnotations) => {
                        setProgress(100);
                        setPdfAnnotations(
                            new PDFAnnotations(docAnnotations, TaskDeltaAnnotations.empty())
                        );

                        setViewState(ViewState.LOADED);
                    })
                    .catch((err: any) => {
                        console.error(`Error Fetching Existing Annotations: `, err);
                        setViewState(ViewState.ERROR);
                    });
            })
            .catch((err: any) => {
                if (err instanceof Error) {
                    // We have to use the message because minification in production obfuscates
                    // the error name.
                    if (err.message === 'Request failed with status code 404') {
                        setViewState(ViewState.NOT_FOUND);
                        return;
                    }
                }
                console.error(`Error Loading PDF: `, err);
                setViewState(ViewState.ERROR);
            });
    }, [activeCommit, commitDoc]);

    const topbarHeight = '68px';
    const sidebarWidth = '300px';

    switch (viewState) {
        case ViewState.LOADING:
            return (
                <WithSidebar width={sidebarWidth}>
                    <Sidebar width={sidebarWidth}>
                        <Logo />
                    </Sidebar>
                    <WithTopbar height={topbarHeight}>
                        <Topbar height={topbarHeight} leftOffset={sidebarWidth} />
                        <CenterOnPage>
                            <Progress
                                type="circle"
                                percent={progress}
                                strokeColor={{ '0%': theme.color.T6, '100%': theme.color.G6 }}
                            />
                        </CenterOnPage>
                    </WithTopbar>
                </WithSidebar>
            );
        case ViewState.NOT_FOUND:
            return (
                <WithSidebar width={sidebarWidth}>
                    <Sidebar width={sidebarWidth}>
                        <Logo />
                    </Sidebar>
                    <WithTopbar height={topbarHeight}>
                        <Topbar height={topbarHeight} leftOffset={sidebarWidth} />
                        <CenterOnPage>
                            <Result icon={<QuestionCircleOutlined />} title="PDF Not Found" />
                        </CenterOnPage>
                    </WithTopbar>
                </WithSidebar>
            );
        case ViewState.LOADED:
            if (commitId && activeCommit && doc && pages && pdfAnnotations) {
                return (
                    <PDFStore.Provider
                        value={{
                            doc,
                            pages,
                            onError,
                        }}>
                        <AnnotationStore.Provider
                            value={{
                                ontoNames,
                                setOntoNames,
                                ontoClasses,
                                setOntoClasses,
                                activeOntoClass,
                                setActiveOntoClass,
                                ontoProperties,
                                setOntoProperties,
                                activeOntoProperty,
                                setActiveOntoProperty,
                                pdfAnnotations,
                                setPdfAnnotations,
                                selectedAnnotations,
                                setSelectedAnnotations,
                                freeFormAnnotations,
                                toggleFreeFormAnnotations,
                                hideLabels,
                                setHideLabels,
                                relationMode,
                                setRelationMode,
                            }}>
                            {/* <listeners.UndoAnnotation /> */}
                            <listeners.HideAnnotationLabels />
                            <WithSidebar width={sidebarWidth}>
                                <Sidebar width={sidebarWidth}>
                                    <Logo />
                                    <Labels />
                                    <CommitAnnotations
                                        annotations={pdfAnnotations.docAnnotations.annotations}
                                    />
                                    {activeCommit && (
                                        <Relations
                                            annotations={pdfAnnotations.docAnnotations.annotations}
                                            relations={pdfAnnotations.docAnnotations.relations}
                                        />
                                    )}
                                </Sidebar>
                                <WithTopbar height={topbarHeight}>
                                    <Topbar height={topbarHeight} leftOffset={sidebarWidth} />
                                    <PDFContainer>
                                        {activeOntoProperty && (
                                            <RelationModal
                                                visible={relationModalVisible}
                                                onClick={onRelationModalOk}
                                                onCancel={onRelationModalCancel}
                                                source={selectedAnnotations}
                                                label={activeOntoProperty}
                                            />
                                        )}
                                        <PDF />
                                    </PDFContainer>
                                </WithTopbar>
                            </WithSidebar>
                        </AnnotationStore.Provider>
                    </PDFStore.Provider>
                );
            } else {
                return null;
            }
        // eslint-disable-line: no-fallthrough
        case ViewState.ERROR:
            return (
                <WithSidebar width={sidebarWidth}>
                    <Sidebar width={sidebarWidth}>
                        <Logo />
                    </Sidebar>
                    <WithTopbar height={topbarHeight}>
                        <Topbar height={topbarHeight} leftOffset={sidebarWidth} />
                        <CenterOnPage>
                            <Result status="warning" title="Unable to Render Document" />
                        </CenterOnPage>
                    </WithTopbar>
                </WithSidebar>
            );
    }
};

export default PDFCommitPage;

const PDFContainer = styled.div(
    ({ theme }) => `
    background: ${theme.color.N4};
    padding: ${theme.spacing.sm};
`
);
