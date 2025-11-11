import { useState, useRef, useEffect } from 'react';
import type { ImageFile } from '../types';

// Function to create a worker from an external script by fetching it
// and creating a blob URL. This avoids CORS issues.
const createWorkerFromUrl = async (workerUrl: string): Promise<Worker> => {
    try {
        const response = await fetch(workerUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch worker script: ${response.statusText}`);
        }
        const workerScript = await response.text();
        const blob = new Blob([workerScript], { type: 'application/javascript' });
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
    } catch (error) {
        console.error("Failed to create worker:", error);
        throw error; // Re-throw to be caught by the caller
    }
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

            // Create a new worker using the blob URL method to bypass CORS
            // Use BASE_URL for correct pathing in production
            const workerPath = `${import.meta.env.BASE_URL || '/'}workers/pdf.worker.js`;
            workerRef.current = await createWorkerFromUrl(workerPath);

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
