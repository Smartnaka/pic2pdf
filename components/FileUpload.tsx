import React, { useRef, useState } from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
    onFilesAdded: (files: FileList | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesAdded }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleTriggerUpload = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onFilesAdded(event.target.files);
        // Reset file input to allow re-uploading the same file
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);
        onFilesAdded(event.dataTransfer.files);
    };

    return (
        <div 
            className={`bg-base-200 border-2 border-dashed rounded-xl p-6 sm:p-8 text-center mb-8 transition-colors ${isDragOver ? 'border-brand-primary' : 'border-base-300'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                accept="image/jpeg, image/png"
                multiple
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
                aria-hidden="true"
            />
            <div className="flex flex-col items-center pointer-events-none">
                <UploadIcon />
                <p className="mt-4 text-text-secondary">Drag & drop your images here, or</p>
            </div>
            <button
                onClick={handleTriggerUpload}
                className="mt-4 bg-brand-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-brand-secondary transition-colors duration-300 shadow-lg"
            >
                Browse Files
            </button>
        </div>
    );
};

export default FileUpload;