import { useState } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';

const OutputCard = ({ result, onExportCSV }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!result || result.frequencies.length === 0) return;

        const text = result.frequencies
            .map(f => `${f.word}\t${f.count}\t${f.percentage}%`)
            .join('\n');

        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            notify(t('text-frequency/message/copied'), '', 'success');
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const totalWords = result?.totalWords || 0;
    const uniqueWords = result?.uniqueWords || 0;
    const frequencies = result?.frequencies || [];

    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('text-frequency/output/title')}</span>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-success" onClick={onExportCSV} disabled={frequencies.length === 0}>
                        <i className="bi bi-download"></i> {t('text-frequency/button/export_csv')}
                    </button>
                    <button className="btn btn-sm btn-outline-primary" onClick={handleCopy} disabled={frequencies.length === 0}>
                        <i className="bi bi-clipboard"></i> {copied ? t('text-frequency/message/copied') : t('text-frequency/button/copy')}
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                {frequencies.length > 0 ? (
<>

                    <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="table table-striped table-hover mb-0">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th className="ps-3">#</th>
                                    <th>{t('text-frequency/output/table/word')}</th>
                                    <th className="text-end">{t('text-frequency/output/table/frequency')}</th>
                                    <th className="text-end pe-3">{t('text-frequency/output/table/percentage')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {frequencies.map((f, i) => (
                                    <tr key={i}>
                                        <td className="ps-3 text-muted">{i + 1}</td>
                                        <td><code>{f.word}</code></td>
                                        <td className="text-end">{f.count}</td>
                                        <td className="text-end pe-3">{f.percentage}%</td>
                                    </tr>
))}
                            </tbody>
                        </table>
                    </div>
                
</>
) : (
<>

                    <div className="text-center text-muted py-4">
                        <i className="bi bi-bar-chart-line" style={{ fontSize: '2rem' }}></i>
                        <p className="mt-2 mb-0">{t('text-frequency/button/analyze')}</p>
                    </div>
                
</>
)}
            </div>
            {totalWords > 0 ? (
<>

                <div className="card-footer bg-light">
                    <div className="d-flex gap-4 small">
                        <span><strong>{t('text-frequency/output/stats/total_words')}:</strong> {totalWords}</span>
                        <span><strong>{t('text-frequency/output/stats/unique_words')}:</strong> {uniqueWords}</span>
                    </div>
                </div>
            
</>
) : ''}
        </div>
    
</>
);
};

export default OutputCard;
