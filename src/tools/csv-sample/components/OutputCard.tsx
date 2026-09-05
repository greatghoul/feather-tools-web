import { useState, useMemo } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';
import { downloadFile } from '~/helpers/files';
import CsvSampleService from '../services/CsvSampleService';

const PREVIEW_LIMIT = 100;

const OutputCard = ({ headers, rows, delimiter, viewMode, setViewMode, filenamePrefix }) => {
    const [isCopying, setIsCopying] = useState(false);

    const downloadFilename = filenamePrefix
        ? `${filenamePrefix}-sample.csv`
        : 'sample.csv';

    const textOutput = useMemo(
        () => CsvSampleService.toCsv(headers, rows, delimiter),
        [headers, rows, delimiter]
    );

    const hasContent = rows.length > 0 || headers.length > 0;
    const isLimited = rows.length > PREVIEW_LIMIT;
    const previewRows = isLimited ? rows.slice(0, PREVIEW_LIMIT) : rows;
    const displayHeaders = headers.length > 0
        ? headers
        : (rows.length > 0 ? Array.from({ length: rows[0].length }, (_, i) => `${i + 1}`) : []);

    const handleCopy = () => {
        if (!hasContent || isCopying) return;
        setIsCopying(true);
        navigator.clipboard.writeText(textOutput).then(() => {
            notify(t('csv-sample/message/copied'), '', 'success');
            setTimeout(() => setIsCopying(false), 1000);
        });
    };

    const handleDownload = () => {
        if (!hasContent) return;
        const blob = new Blob(['\uFEFF' + textOutput], { type: 'text/csv;charset=utf-8' });
        downloadFile(blob, downloadFilename);
        notify(t('csv-sample/message/downloaded'), '', 'success');
    };

    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span>{t('csv-sample/output/title')}</span>
                <div className="d-flex gap-2 flex-wrap justify-content-end">
                    <div className="btn-group btn-group-sm">
                        <button className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewMode('table')} disabled={!hasContent}>{t('csv-sample/view/table')}</button>
                        <button className={`btn btn-sm ${viewMode === 'text' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewMode('text')} disabled={!hasContent}>{t('csv-sample/view/text')}</button>
                    </div>
                    <button className="btn btn-sm btn-outline-primary" onClick={handleCopy} disabled={!hasContent || isCopying}>{t('csv-sample/button/copy')}</button>
                    <button className="btn btn-sm btn-outline-primary" onClick={handleDownload} disabled={!hasContent}>{t('csv-sample/button/download')}</button>
                </div>
            </div>
            <div className="card-body p-0">
                {!hasContent
                    ? (
<>

                        <div className="p-3 text-muted text-center" style={{ minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {t('csv-sample/output/no_data')}
                        </div>
                    
</>
)
                    : viewMode === 'table'
                        ? (
<>

                            <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                <table className="table table-bordered table-striped table-sm mb-0">
                                    {displayHeaders.length > 0 ? (
<>

                                        <thead className="table-light">
                                            <tr>
                                                {displayHeaders.map((h) => (
<>

                                                    <th className="text-nowrap">{h}</th>
                                                
</>
))}
                                            </tr>
                                        </thead>
                                    
</>
) : null}
                                    <tbody>
                                        {previewRows.map((row) => (
<>

                                            <tr>
                                                {row.map((cell) => (
<>

                                                    <td className="font-monospace small" style={{ whiteSpace: 'pre-wrap' }}>{cell}</td>
                                                
</>
))}
                                            </tr>
                                        
</>
))}
                                    </tbody>
                                </table>
                            </div>
                        
</>
)
                        : (
<>

                            <textarea className="form-control border-0 font-monospace" style={{ minHeight: '200px', resize: 'vertical' }} value={textOutput} readOnly></textarea>
                        
</>
)
                }
            </div>
            {hasContent && (isLimited || rows.length > 0) ? (
<>

                <div className="card-footer bg-light small text-muted d-flex justify-content-between flex-wrap gap-1">
                    <span>{rows.length} rows{headers.length > 0 ? ` / ${headers.length} columns` : ''}</span>
                    {isLimited ? (
<>
<span>{t('csv-sample/output/preview_limit')}</span>
</>
) : null}
                </div>
            
</>
) : ''}
        </div>
    
</>
);
};

export default OutputCard;
