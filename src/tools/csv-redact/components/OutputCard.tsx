import { useState, useMemo } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';
import { downloadFile } from '~/helpers/files';
import MaskService from '../services/MaskService';

const OutputCard = ({ headers, rows, outputViewMode, setOutputViewMode, delimiter, ruleCount, isLarge }) => {
    const [isCopying, setIsCopying] = useState(false);

    const textOutput = useMemo(() => MaskService.toCsv(headers, rows, delimiter), [headers, rows, delimiter]);

    const hasContent = rows.length > 0 || headers.length > 0;

    const handleCopy = () => {
        if (!hasContent || isCopying) return;
        setIsCopying(true);
        navigator.clipboard.writeText(textOutput).then(() => {
            notify(t('csv-redact/message/copied'), '', 'success');
            setTimeout(() => setIsCopying(false), 1000);
        });
    };

    const handleDownload = () => {
        if (!hasContent) return;
        const blob = new Blob([textOutput], { type: 'text/csv;charset=utf-8' });
        downloadFile(blob, 'masked.csv');
        notify(t('csv-redact/message/downloaded'), '', 'success');
    };

    const displayHeaders = headers.length > 0
        ? headers
        : (rows.length > 0 ? Array.from({ length: rows[0].length }, (_, i) => `${i + 1}`) : []);

    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span>{t('csv-redact/output/title')}</span>
                <div className="d-flex gap-2 flex-wrap justify-content-end">
                    <div className="btn-group btn-group-sm">
                        <button className={`btn btn-sm ${outputViewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setOutputViewMode('table')} disabled={!hasContent}>{t('csv-redact/view/table')}</button>
                        <button className={`btn btn-sm ${outputViewMode === 'text' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setOutputViewMode('text')} disabled={!hasContent}>{t('csv-redact/view/text')}</button>
                    </div>
                    <button className="btn btn-sm btn-outline-primary" onClick={handleCopy} disabled={!hasContent || isCopying}>{t('csv-redact/button/copy')}</button>
                    <button className="btn btn-sm btn-outline-primary" onClick={handleDownload} disabled={!hasContent}>{t('csv-redact/button/download')}</button>
                </div>
            </div>
            <div className="card-body p-0">
                {!hasContent
                    ? (
<>

                        <div className="p-3 text-muted text-center" style={{ minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isLarge ? t('csv-redact/output/click_to_redact') : t('csv-redact/output/no_data')}
                        </div>
                    
</>
)
                    : outputViewMode === 'table'
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
                                        {rows.map((row) => (
<>

                                            <tr>
                                                {row.map((cell) => (
<>

                                                    <td className="font-monospace small" style={{ whiteSpace: 'pre-wrap' }}>{cell !== '' ? cell : (
<>
<span className="text-muted fst-italic">{t('csv-redact/view/empty')}</span>
</>
)}</td>
                                                
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
            {hasContent && ruleCount > 0 ? (
<>

                <div className="card-footer bg-light small text-muted">
                    {t('csv-redact/stats/title')}: {ruleCount} {t('csv-redact/stats/rules_count')}, {rows.length} {t('csv-redact/stats/rows_count')}
                </div>
            
</>
) : ''}
        </div>
    
</>
);
};

export default OutputCard;
