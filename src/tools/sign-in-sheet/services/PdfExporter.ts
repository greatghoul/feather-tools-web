export default class PdfExporter {
    /** Compose one A4 portrait PDF page per canvas and trigger a download. */
    static async export(canvases: HTMLCanvasElement[], filename: string): Promise<void> {
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

        canvases.forEach((canvas, i) => {
            if (i > 0) pdf.addPage('a4', 'portrait');
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297);
        });

        pdf.save(filename);
    }
}
