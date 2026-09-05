import { useState } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';

const OutputCard = ({ text, stats }) => {
    const [isCopying, setIsCopying] = useState(false);

    const handleCopy = () => {
        if (!text || isCopying) return;

        setIsCopying(true);
        navigator.clipboard.writeText(text).then(() => {
            notify(t('text-redact/message/copied'), '', 'success');
            setTimeout(() => setIsCopying(false), 1000);
        });
    };

    const hasContent = text && text.length > 0;

    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('text-redact/output/title')}</span>
                <button className="btn btn-sm btn-outline-primary" onClick={handleCopy} disabled={!hasContent || isCopying}>
                    {t('text-redact/button/copy')}
                </button>
            </div>
            <div className="card-body p-0">
                {hasContent ? (
<>

                    <textarea className="form-control border-0 font-monospace" style={{ minHeight: '200px', resize: 'vertical' }} readOnly value={text}></textarea>
                
</>
) : (
<>

                    <div className="p-3 text-muted text-center" style={{ minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {t('text-redact/output/title')}
                    </div>
                
</>
)}
            </div>
            {hasContent && stats ? (
<>

                <div className="card-footer bg-light small text-muted">
                    {t('text-redact/stats/title')}: {stats.total} {t('text-redact/stats/redacted_count')}
                    {stats.details && stats.details.length > 0 ? (
<>

                        ({stats.details.map((d) => (
<>

                            <span className="badge bg-secondary me-1">{t(d.label)}: {d.count}</span>
                        
</>
))})
                    
</>
) : ''}
                </div>
            
</>
) : ''}
        </div>
    
</>
);
};

export default OutputCard;
