import React from 'react';
import type { ImageFile } from '../types';
import { TrashIcon } from './Icons';

interface ImagePreviewCardProps {
    image: ImageFile;
    index: number;
    onRemove: (id: string) => void;
    onDragStart: () => void;
    onDragEnter: () => void;
    onDragEnd: () => void;
    isDragging: boolean;
}

const ImagePreviewCard: React.FC<ImagePreviewCardProps> = ({ 
    image, 
    onRemove, 
    onDragStart, 
    onDragEnter, 
    onDragEnd,
    isDragging 
}) => {
    return (
        <div 
            draggable
            onDragStart={onDragStart}
            onDragEnter={onDragEnter}
            onDragEnd={onDragEnd}
            onDragOver={(e) => e.preventDefault()} // Necessary to allow dropping
            className={`bg-base-200 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 group cursor-grab ${isDragging ? 'opacity-50 scale-105' : ''}`}
        >
            <div className="relative">
                <img src={image.url} alt={image.name} className="w-full h-36 sm:h-40 md:h-48 object-cover pointer-events-none" />
                <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onRemove(image.id)}
                        className="bg-red-500 bg-opacity-70 p-1.5 rounded-full text-white hover:bg-red-600 transition-colors"
                        aria-label="Remove image"
                    >
                        <TrashIcon />
                    </button>
                </div>
            </div>
            <div className="p-3">
                <p className="text-sm text-text-secondary truncate" title={image.name}>{image.name}</p>
            </div>
        </div>
    );
};

export default ImagePreviewCard;