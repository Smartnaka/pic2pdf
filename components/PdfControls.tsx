
import React from 'react';
import { SpinnerIcon } from './Icons';
import type { ImageFile } from '../types';

interface PdfControlsProps {
    images: ImageFile[];
    pdfFilename: string;
    setPdfFilename: (name: string) => void;
    scaleOption: 'contain' | 'cover';
    setScaleOption: (option: 'contain' | 'cover') => void;
    compressionQuality: number;
    setCompressionQuality: (quality: number) => void;
    onGeneratePdf: () => void;
    isLoading: boolean;
}

const PdfControls: React.FC<PdfControlsProps> = ({
    images,
    pdfFilename,
    setPdfFilename,
    scaleOption,
    setScaleOption,
    compressionQuality,
    setCompressionQuality,
    onGeneratePdf,
    isLoading
}) => {
    return (
        <div className="bg-base-200 p-4 sm:p-6 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                <div>
                    <label htmlFor="pdf-filename" className="block text-sm font-medium text-text-secondary mb-1">PDF Filename</label>
                    <input
                        type="text"
                        id="pdf-filename"
                        value={pdfFilename}
                        onChange={(e) => setPdfFilename(e.target.value)}
                        placeholder="Enter PDF name"
                        className="bg-base-300 text-text-primary font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors w-full"
                        aria-label="PDF Filename"
                    />
                </div>
                <div>
                    <label htmlFor="scale-option" className="block text-sm font-medium text-text-secondary mb-1">Image Scaling</label>
                    <select
                        id="scale-option"
                        value={scaleOption}
                        onChange={(e) => setScaleOption(e.target.value as 'contain' | 'cover')}
                        className="bg-base-300 text-text-primary font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors w-full"
                    >
                        <option value="contain">Fit (Contain)</option>
                        <option value="cover">Fill (Cover)</option>
                    </select>
                </div>
            </div>

            <div className="mb-6">
                <label htmlFor="compression-quality" className="block text-sm font-medium text-text-secondary mb-1">
                    Image Quality: <span className="font-semibold text-text-primary">{Math.round(compressionQuality * 100)}%</span>
                </label>
                <input
                    id="compression-quality"
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={compressionQuality}
                    onChange={(e) => setCompressionQuality(parseFloat(e.target.value))}
                    className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer range-thumb"
                    style={{'--thumb-color': '#14B8A6'} as React.CSSProperties}
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={onGeneratePdf}
                    disabled={isLoading || !pdfFilename.trim() || images.length === 0}
                    className="flex-grow bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-secondary transition-colors duration-300 shadow-xl disabled:bg-base-300 disabled:text-text-secondary disabled:cursor-not-allowed flex items-center justify-center w-full text-base sm:text-lg"
                >
                    {isLoading ? (
                        <>
                            <SpinnerIcon />
                            Generating PDF...
                        </>
                    ) : `Generate PDF (${images.length} ${images.length === 1 ? 'image' : 'images'})`}
                </button>
            </div>
        </div>
    );
};

export default PdfControls;