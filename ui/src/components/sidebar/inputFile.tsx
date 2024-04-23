import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import '../../assets/styles/InputFile.scss';

const InputFile = ({
    files,
    addFile,
    supportedFiles,
    updateText,
}: {
    files: any;
    addFile: any;
    supportedFiles: string;
    updateText: any;
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const handleClick = () => {
        // open file input box on click of other element
        inputRef?.current?.click();
    };
    const handleFileChange = async (event: any) => {
        updateText('');
        
        event.preventDefault();
        const fileObj = event.target.files && event.target.files[0];
        if (!fileObj) {
            return;
        }

        const fileExtension = fileObj.name.split('.').pop();
        // Check if the file extension is supported
        const isSupported = supportedFiles.map(fileType => fileType.toLowerCase().includes(fileExtension.toLowerCase()));
        if (!isSupported.some(Boolean)) {
            updateText('Unsupported File Type');
            return;
        }

        const fileAlreadyUploaded = files.some((file: any) => file.name === fileObj.name);
        if (fileAlreadyUploaded) {
            // alert('Duplicate File');
            updateText('Duplicate File');
            return;
        }
        addFile(fileObj);
        // console.log('fileObj is', fileObj);
        // reset file input
        event.target.value = null;

        // is now empty
        console.log(event.target.files);

        // // can still access file object here with  fileObj and fileObj.name
        // formData.append('file', fileObj, fileObj.name);
        // api(formData)
        //     .then((result: any) => {
        //         console.log('Response after the document was uploaded', result);
        //         // TODO: Make the API return the ontology ID, and append it to the fileObj
        //         updateFiles(fileObj);
        //         fileObj.isUploading = false;
        //         changeStateFileIsUploading(false);
        //         changeStateAnyFileUploaded(true);
        //     })
        //     .catch((error: any) => {
        //         console.log('An error occured after trying to upload a file:', error);
        //         fileObj.isUploading = false;
        //         changeStateFileIsUploading(false);
        //     });
        // // da fare try catch (se uploadOntology ok => ... altrimenti catch errore)
    };

    return (
        <>
            <div className="file-card">
                <div className="file-inputs">
                    <input ref={inputRef} type="file" onChange={handleFileChange} />
                    <button onClick={handleClick}>
                        <i>
                            <FontAwesomeIcon icon={faPlus} />
                        </i>
                        Upload File
                    </button>
                </div>
                <p className="main">Supported files</p>
                <p className="info">{supportedFiles.join(', ')}</p>
                
            </div>
        </>
    );
};

export default InputFile;
