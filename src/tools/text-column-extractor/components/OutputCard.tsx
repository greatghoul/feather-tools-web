import { useState, useMemo } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';

const OutputCard = ({ headers, rows, outputViewMode, setOutputViewMode, delimiter }) => {
    const [isCopying, setIsCopying] = useState(false);

    const textOutput = useMemo(() => {
        const textLines: string[] = [];
        if (headers.length > 0) {
            textLines.push(headers.join(delimiter));
        }
        rows.forEach((row) => {
            textLines.push(row.join(delimiter));
        });
        return textLines.join('\n');
    }, [headers, rows, delimiter]);

    const handleCopy = () => {
        if (rows.length === 0 || isCopying) return;

        setIsCopying(true);
        navigator.clipboard.writeText(textOutput).then(() => {
            notify(t('text-column-extractor/message/copied'), '', 'success');
            setTimeout(() => setIsCopying(false), 1000);
        });
    };

    const hasContent = rows.length > 0;

    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span>{t('text-column-extractor/output/title')}</span>
                <div className="d-flex gap-2 flex-wrap justify-content-end">
                    <div className="btn-group btn-group-sm">
                        <button className={`btn btn-sm ${outputViewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setOutputViewMode('table')} disabled={!hasContent}>{t('text-column-extractor/view/table')}</button>
                        <button className={`btn btn-sm ${outputViewMode === 'text' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setOutputViewMode('text')} disabled={!hasContent}>{t('text-column-extractor/view/text')}</button>
                    </div>
                    <button className="btn btn-sm btn-outline-primary" onClick={handleCopy} disabled={!hasContent || isCopying}>
                        {t('text-column-extractor/button/copy')}
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                {!hasContent
                    ? (
<>

                        <div className="p-3 text-muted text-center" style={{ minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {t('text-column-extractor/output/no_data')}
                        </div>
                    
</>
)
                    : outputViewMode === 'table'
                        ? (
<>

                            <div className="table-responsive">
                                <table className="table table-bordered table-striped table-sm mb-0">
                                    {headers.length > 0 ? (
<>

                                        <thead className="table-light">
                                            <tr>
                                                {headers.map((h, hi) => (
                                                    <th key={hi} className="text-nowrap">{h}</th>
))}
                                            </tr>
                                        </thead>
                                    
</>
) : null}
                                    <tbody>
                                        {rows.map((row, ri) => (
                                            <tr key={ri}>
                                                {row.map((cell, ci) => (
                                                    <td key={ci} className="font-monospace" style={{ whiteSpace: 'pre-wrap' }}>{cell}</td>
))}
                                            </tr>
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
        </div>
    
</>
);
};

export default OutputCard;
