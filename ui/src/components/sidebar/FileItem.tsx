import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons';
import '../../assets/styles/FileItem.scss';

const FileItem = ({
    file,
    deleteFile,
    hasDuplicate,
}: {
    file: File;
    deleteFile: any;
    hasDuplicate: boolean;
}) => {
    return (
        <li className={`file-item ${hasDuplicate ? 'duplicate' : ''}`} key={file.name}>
            <FontAwesomeIcon icon={faFileAlt} />
            <p>{file.name}</p>
            <div className="actions">
                <div className="loading"></div>
                {file.isUploading && (
                    <FontAwesomeIcon
                        icon={faSpinner}
                        className="fa-spin"
                        onClick={() => deleteFile(file.name)}
                    />
                )}
                {!file.isUploading && (
                    <FontAwesomeIcon icon={faTrash} onClick={() => deleteFile(file.name)} />
                )}
            </div>
        </li>
    );
};

export default FileItem;
