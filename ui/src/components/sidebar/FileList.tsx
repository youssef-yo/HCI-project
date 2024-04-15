import FileItem from './FileItem';
import '../../assets/styles/FileList.scss';

const FileList = ({
    files,
    removeFile,
    duplicateFiles,
}: {
    files: File[];
    removeFile: any;
    duplicateFiles: string[];
}) => {
    const deleteFileHandler = (_name: any) => {
        removeFile(_name);
        // TODO: cehcke di deleteFIle: solo se deleteFile è dato a buon fine => usa try catch
    };

    return (
        <ul className="file-list">
            {files &&
                files.map((f: any) => (
                    <FileItem
                        key={f.name}
                        file={f}
                        deleteFile={deleteFileHandler}
                        hasDuplicate={duplicateFiles.includes(f.name)}
                    />
                ))}
        </ul>
    );
};

export default FileList;
