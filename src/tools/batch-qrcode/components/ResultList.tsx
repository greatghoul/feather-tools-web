import { t } from '~/helpers/i18n';
import JSZip from 'jszip';
import styles from './ResultList.module.css';

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
    <title>${t('batch-qrcode/results/title')}</title>
    <style>
        body { font-family: sans-serif; padding: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        img { width: 100px; height: 100px; }
    </style>
</head>
<body>
    <h1>${t('batch-qrcode/results/title')}</h1>
    <table>
        <thead>
            <tr>
                <th>${t('batch-qrcode/results/url')}</th>
                <th>${t('batch-qrcode/results/preview')}</th>
                <th>${t('batch-qrcode/results/filename')}</th>
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

    return (
<>

        <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t('batch-qrcode/results/title')}</h5>
                <button className="btn btn-success btn-sm" onClick={downloadAll}>
                    <i className="bi bi-download me-1"></i>
                    {t('batch-qrcode/results/download_all')}
                </button>
            </div>
            <div className="card-body p-0">
                <div className={`${styles.tableContainerStyle}`}>
                    <table className="table table-striped table-hover mb-0">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">{t('batch-qrcode/results/url')}</th>
                                <th scope="col">{t('batch-qrcode/results/preview')}</th>
                                <th scope="col">{t('batch-qrcode/results/filename')}</th>
                                <th scope="col">{t('batch-qrcode/results/download')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((result, index) => (
                                <tr key={index}>
                                    <th scope="row">{index + 1}</th>
                                    <td className="text-break" style={{ maxWidth: '300px' }}>{result.url}</td>
                                    <td>
                                        <img src={`${result.dataUrl}`} className={`${styles.previewStyle}`} />
                                    </td>
                                    <td>{result.filename}</td>
                                    <td>
                                        <button className="btn btn-outline-primary btn-sm" onClick={() => downloadSingle(result)} title={`${t('batch-qrcode/results/download')}`}>
                                            <i className="bi bi-download"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    
</>
);
};

export default ResultList;
