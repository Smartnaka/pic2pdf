import React, { useState, useCallback, useRef } from 'react';
import type { ImageFile } from './types';
import ImagePreviewCard from './components/ImagePreviewCard';
import FileUpload from './components/FileUpload';
import PdfControls from './components/PdfControls';
import { usePdfGenerator } from './hooks/usePdfGenerator';
import { CloseIcon } from './components/Icons';

export default function App() {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [scaleOption, setScaleOption] = useState<'contain' | 'cover'>('contain');
    const [pdfFilename, setPdfFilename] = useState('Pic2PDF_Export');
    const [compressionQuality, setCompressionQuality] = useState(0.8);
    const { generatePdf, isLoading } = usePdfGenerator();

    // Ref to store the index of the item being dragged
    const dragItem = useRef<number | null>(null);
    // State to apply a visual style to the item being dragged
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleFilesAdded = (files: FileList | null) => {
        if (files) {
            const validationPromises: Promise<ImageFile>[] = [];
            const localErrors: string[] = [];

            Array.from(files).forEach((file: File) => {
                if (!['image/jpeg', 'image/png'].includes(file.type)) {
                    localErrors.push(`"${file.name}" has an unsupported file type. Please upload JPG or PNG images.`);
                    return;
                }

                const promise = new Promise<ImageFile>((resolve, reject) => {
                    const imageUrl = URL.createObjectURL(file);
                    const img = new Image();
                    img.src = imageUrl;

                    img.onload = () => {
                        resolve({
                            id: `${file.name}-${file.lastModified}-${Math.random()}`,
                            name: file.name,
                            url: imageUrl,
                            file: file
                        });
                    };

                    img.onerror = () => {
                        URL.revokeObjectURL(imageUrl);
                        reject(`"${file.name}" could not be loaded. The file may be corrupted.`);
                    };
                });
                validationPromises.push(promise);
            });

            Promise.allSettled(validationPromises).then(results => {
                const newImages: ImageFile[] = [];
                results.forEach(result => {
                    if (result.status === 'fulfilled') {
                        newImages.push(result.value);
                    } else if (result.status === 'rejected') {
                        localErrors.push(result.reason);
                    }
                });

                if (newImages.length > 0) {
                    setImages(prevImages => [...prevImages, ...newImages]);
                }
                if (localErrors.length > 0) {
                    setErrors(prevErrors => [...prevErrors, ...localErrors]);
                }
            });
        }
    };

    const handleDismissError = (indexToRemove: number) => {
        setErrors(prevErrors => prevErrors.filter((_, index) => index !== indexToRemove));
    };

    const handleRemove = useCallback((id: string) => {
        setImages(prevImages => {
            const imageToRemove = prevImages.find(img => img.id === id);
            if (imageToRemove) {
                URL.revokeObjectURL(imageToRemove.url);
            }
            return prevImages.filter(image => image.id !== id);
        });
    }, []);

    const handleDragStart = (index: number) => {
        dragItem.current = index;
        setDraggedIndex(index);
    };

    const handleDragEnter = (index: number) => {
        if (dragItem.current !== null && dragItem.current !== index) {
            setImages(prevImages => {
                const newImages = [...prevImages];
                const [draggedItemContent] = newImages.splice(dragItem.current!, 1);
                newImages.splice(index, 0, draggedItemContent);
                dragItem.current = index;
                return newImages;
            });
        }
    };

    const handleDragEnd = () => {
        dragItem.current = null;
        setDraggedIndex(null);
    };

    const handleGeneratePdf = () => {
        generatePdf(images, pdfFilename, scaleOption, compressionQuality);
    };

    return (
        <div className="min-h-screen bg-base-100 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                        Pic2PDF
                    </h1>
                    <p className="mt-2 text-lg text-text-secondary">
                        Convert your images into a single PDF, right in your browser.
                    </p>
                </header>
                
                {errors.length > 0 && (
                    <div className="my-4 space-y-2">
                        {errors.map((error, index) => (
                            <div key={index} className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg relative flex justify-between items-center" role="alert">
                                <span className="block sm:inline">{error}</span>
                                <button onClick={() => handleDismissError(index)} className="p-1 rounded-full hover:bg-red-500/20 transition-colors" aria-label="Dismiss">
                                    <CloseIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <main>
                    <FileUpload onFilesAdded={handleFilesAdded} />

                    {images.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
                                {images.map((image, index) => (
                                    <ImagePreviewCard
                                        key={image.id}
                                        image={image}
                                        index={index}
                                        onRemove={handleRemove}
                                        onDragStart={() => handleDragStart(index)}
                                        onDragEnter={() => handleDragEnter(index)}
                                        onDragEnd={handleDragEnd}
                                        isDragging={draggedIndex === index}
                                    />
                                ))}
                            </div>
                             <PdfControls
                                images={images}
                                pdfFilename={pdfFilename}
                                setPdfFilename={setPdfFilename}
                                scaleOption={scaleOption}
                                setScaleOption={setScaleOption}
                                compressionQuality={compressionQuality}
                                setCompressionQuality={setCompressionQuality}
                                onGeneratePdf={handleGeneratePdf}
                                isLoading={isLoading}
                            />
                        </>
                    ) : (
                        <div className="text-center py-12 sm:py-16">
                            <p className="text-text-secondary">Upload some images to get started!</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}