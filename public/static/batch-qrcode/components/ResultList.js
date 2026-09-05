import { html } from 'htm/preact';
import { css } from 'goober';
import { getText } from '~/helpers/utils.js';
import JSZip from 'jszip';

const tableContainerStyle = css`
    overflow-x: auto;
`;

const previewStyle = css`
    width: 100px;
    height: 100px;
    object-fit: contain;
`;

const ResultList = ({ results }) => {
    if (!results || results.length === 0) return null;

    const downloadSingle = (result) => {
        const link = document.createElement('a');
        link.href = result.dataUrl;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadAll = async () => {
        const zip = new JSZip();
        
        // Add images
        results.forEach(result => {
            // Remove data:image/png;base64, header
            const data = result.dataUrl.split(',')[1];
            zip.file(result.filename, data, { base64: true });
        });

        // Create index.html
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${getText('batch-qrcode/results/title')}</title>
    <style>
        body { font-family: sans-serif; padding: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        img { width: 100px; height: 100px; }
    </style>
</head>
<body>
    <h1>${getText('batch-qrcode/results/title')}</h1>
    <table>
        <thead>
            <tr>
                <th>${getText('batch-qrcode/results/url')}</th>
                <th>${getText('batch-qrcode/results/preview')}</th>
                <th>${getText('batch-qrcode/results/filename')}</th>
            </tr>
        </thead>
        <tbody>
            ${results.map(r => `
            <tr>
                <td><a href="${r.url}" target="_blank">${r.url}</a></td>
                <td><img src="${r.filename}" alt="QR Code"></td>
                <td><a href="${r.filename}">${r.filename}</a></td>
            </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;
        
        zip.file("index.html", htmlContent);

        // Generate and download zip
        const blob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "qrcodes.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    return html`
        <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">${getText('batch-qrcode/results/title')}</h5>
                <button class="btn btn-success btn-sm" onClick=${downloadAll}>
                    <i class="bi bi-download me-1"></i>
                    ${getText('batch-qrcode/results/download_all')}
                </button>
            </div>
            <div class="card-body p-0">
                <div class="${tableContainerStyle}">
                    <table class="table table-striped table-hover mb-0">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">${getText('batch-qrcode/results/url')}</th>
                                <th scope="col">${getText('batch-qrcode/results/preview')}</th>
                                <th scope="col">${getText('batch-qrcode/results/filename')}</th>
                                <th scope="col">${getText('batch-qrcode/results/download')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${results.map((result, index) => html`
                                <tr>
                                    <th scope="row">${index + 1}</th>
                                    <td class="text-break" style="max-width: 300px;">${result.url}</td>
                                    <td>
                                        <img src="${result.dataUrl}" class="${previewStyle}" />
                                    </td>
                                    <td>${result.filename}</td>
                                    <td>
                                        <button 
                                            class="btn btn-outline-primary btn-sm" 
                                            onClick=${() => downloadSingle(result)}
                                            title="${getText('batch-qrcode/results/download')}"
                                        >
                                            <i class="bi bi-download"></i>
                                        </button>
                                    </td>
                                </tr>
                            `)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

export default ResultList;
