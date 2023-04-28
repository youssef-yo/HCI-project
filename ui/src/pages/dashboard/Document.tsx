import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../../components/common';
import { Doc, useDocumentApi } from '../../api';

const DocumentPage = () => {
    const { docId } = useParams<{ docId: string }>();
    const [doc, setDoc] = useState<Doc>();

    const { getDocumentByID } = useDocumentApi();

    useEffect(() => {
        if (!docId) {
            // TODO
            console.error('No document has been selected!');
            return;
        }

        getDocumentByID(docId)
            .then((doc) => setDoc(doc))
            .catch((err) => console.error(err));
    }, [docId]);

    return (
        <section>
            <Header>
                <h1>Document Information</h1>
            </Header>

            <div className="docInfo">
                <p>
                    <b>ID:</b> {doc?._id}
                </p>
                <p>
                    <b>Name:</b> {doc?.name}
                </p>
                <p>
                    <b>Pages:</b> {doc?.totalPages}
                </p>
            </div>
        </section>
    );
};

export default DocumentPage;
