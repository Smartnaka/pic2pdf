
export interface ImageFile {
  id: string;
  name: string;
  url: string;
  file: File;
}

// For accessing jsPDF from the window object
declare global {
  interface Window {
    jspdf: any;
  }
}
