/**
 * Triggers a file download from a blob object
 *
 * @param blob - The blob to download
 * @param filename - The name for the downloaded file
 */
export function downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export interface FileFormat {
    format: string;
    mimeType: string;
}

/**
 * Extracts file format information from a File object
 *
 * @param file - The file to analyze
 */
export const getFileFormat = (file: File): FileFormat => {
    const formatFromName = file.name.split('.').pop()!.toLowerCase();
    const mimeType = file.type;
    let format = formatFromName;
    if (mimeType) {
        const mimeParts = mimeType.split('/');
        if (mimeParts.length > 1) {
            format = mimeParts[1].toLowerCase();
        }
    }
    return { format, mimeType };
};
