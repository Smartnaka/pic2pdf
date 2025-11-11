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