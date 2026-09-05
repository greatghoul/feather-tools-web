/**
 * Triggers a file download from a blob object
 * 
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The name for the downloaded file
 */
export function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Extracts file format information from a File object
 * 
 * @param {File} file - The file to analyze
 * @returns {{format: string, mimeType: string}} Object with format and mimeType
 */
export const getFileFormat = (file) => {
    const formatFromName = file.name.split('.').pop().toLowerCase();
    const mimeType = file.type;
    let format = formatFromName;
    if (mimeType) {
        const mimeParts = mimeType.split('/');
        if (mimeParts.length > 1) {
            format = mimeParts[1].toLowerCase();
        }
    }
    return {
        format,
        mimeType
    };
};
