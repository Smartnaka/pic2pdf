import { useState, useRef, useEffect } from 'react';
import type { ImageFile } from '../types';

// The code from workers/pdf.worker.js is now inlined here as a string.
const pdfWorkerCode = `
// Import the jsPDF library
importScripts('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

self.onmessage = async (e) => {
    const { images, scaleOption, compressionQuality } = e.data;
    const { jsPDF } = self.jspdf;

    try {
        const doc = new jsPDF('p', 'pt', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        for (let i = 0; i < images.length; i++) {
            const imageFile = images[i].file;
            
            // 1. Create an ImageBitmap from the file
            const bitmap = await createImageBitmap(imageFile);

            // 2. Use OffscreenCanvas for compression
            const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(bitmap, 0, 0);

            // 3. Get compressed image as a blob, then convert to data URL
            const blob = await canvas.convertToBlob({
                type: 'image/jpeg',
                quality: compressionQuality
            });

            const compressedImageDataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            
            // The rest of the logic is similar, but uses the compressed image
            // and the bitmap's dimensions for calculations
            const imgWidth = bitmap.width;
            const imgHeight = bitmap.height;
            bitmap.close(); // Free up memory

            let ratio = 1;
            if (scaleOption === 'contain') {
                ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
            } else { // 'cover'
                ratio = Math.max(pageWidth / imgWidth, pageHeight / imgHeight);
            }

            const finalWidth = imgWidth * ratio;
            const finalHeight = imgHeight * ratio;
            const x = (pageWidth - finalWidth) / 2;
            const y = (pageHeight - finalHeight) / 2;

            if (i > 0) {
                doc.addPage();
            }

            doc.addImage(compressedImageDataUrl, 'JPEG', x, y, finalWidth, finalHeight);
        }

        const pdfBlob = doc.output('blob');
        self.postMessage({ type: 'success', blob: pdfBlob });

    } catch (error) {
        console.error('Worker Error:', error);
        self.postMessage({ type: 'error', error: error.message });
    }
};
`;

// This function creates a worker from a string of code.
// This avoids issues with file paths in production environments.
const createInlineWorker = (code: string): Worker => {
    const blob = new Blob([code], { type: 'application/javascript' });
    const objectURL = URL.createObjectURL(blob);
    const worker = new Worker(objectURL);

    // It's good practice to release the object URL when the worker is no longer needed.
    // We can do this by wrapping the original terminate method.
    const originalTerminate = worker.terminate;
    worker.terminate = () => {
        URL.revokeObjectURL(objectURL);
        originalTerminate.call(worker);
    };

    return worker;
};


export const usePdfGenerator = () => {
    const [isLoading, setIsLoading] = useState(false);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        // Cleanup worker on component unmount
        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    const generatePdf = async (
        images: ImageFile[],
        pdfFilename: string,
        scaleOption: 'contain' | 'cover',
        compressionQuality: number
    ) => {
        if (images.length === 0 || !pdfFilename.trim()) return;

        setIsLoading(true);

        try {
            // Terminate any existing worker before starting a new one
            workerRef.current?.terminate();

            // Create a new worker by inlining the code, which is robust for production
            workerRef.current = createInlineWorker(pdfWorkerCode);

            workerRef.current.onmessage = (event: MessageEvent) => {
                const { type, blob, error } = event.data;

                if (type === 'success' && blob) {
                    let finalFilename = pdfFilename.trim();
                    if (!finalFilename.toLowerCase().endsWith('.pdf')) {
                        finalFilename += '.pdf';
                    }

                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = finalFilename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                } else if (type === 'error') {
                    console.error("Error from PDF worker:", error);
                    alert(`An error occurred while generating the PDF: ${error}`);
                }

                setIsLoading(false);
                workerRef.current?.terminate(); // Clean up worker after job is done
            };

            workerRef.current.onerror = (error) => {
                console.error("Worker error:", error);
                alert("A critical error occurred with the PDF generator. Please refresh the page and try again.");
                setIsLoading(false);
                workerRef.current?.terminate();
            };

            // We only need to send the file object, not the blob URL
            const imagePayload = images.map(({ file, name }) => ({ file, name }));

            workerRef.current.postMessage({
                images: imagePayload,
                scaleOption,
                compressionQuality
            });
        } catch (error) {
             console.error("Failed to initialize or run PDF worker:", error);
            alert("Could not start the PDF generator. Please check your connection and try again.");
            setIsLoading(false);
        }
    };

    return { generatePdf, isLoading };
};
