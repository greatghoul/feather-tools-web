import { useState } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';

const OutputCard = ({ lines }) => {
    const [isCopyingAll, setIsCopyingAll] = useState(false);
    const [copyingLineIndex, setCopyingLineIndex] = useState(null);

    const handleCopyAll = () => {
        if (lines.length === 0 || isCopyingAll) return;

        setIsCopyingAll(true);
        const text = lines.map((line) => line.text).join('\n');
        navigator.clipboard.writeText(text).then(() => {
            notify(t('text-truncate/message/copied'), '', 'success');
            setTimeout(() => setIsCopyingAll(false), 1000);
        });
    };

    const handleCopyLine = (index, lineText) => {
        if (copyingLineIndex !== null) return;

        setCopyingLineIndex(index);
        navigator.clipboard.writeText(lineText).then(() => {
            notify(t('text-truncate/message/copied_line'), '', 'success');
            setTimeout(() => setCopyingLineIndex(null), 1000);
        });
    };

    const hasContent = lines.length > 0;

    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('text-truncate/output/title')}</span>
                <button className="btn btn-sm btn-outline-primary" onClick={handleCopyAll} disabled={!hasContent || isCopyingAll}>
                    {t('text-truncate/button/copy_all')}
                </button>
            </div>
            <div className="card-body p-0">
                {hasContent
                    ? (
<>

                        <div className="list-group list-group-flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {lines.map((line, index) => (
<>

                                <div className="list-group-item list-group-item-action text-truncate-output-line d-flex align-items-center gap-2 py-2 px-3">
                                    <span className="text-muted small text-end" style={{ minWidth: '2rem', userSelect: 'none' }}>{index + 1}</span>
                                    <span className="flex-grow-1 font-monospace" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{line.text}</span>
                                    <button className="btn btn-sm btn-outline-secondary flex-shrink-0" onClick={() => handleCopyLine(index, line.text)} disabled={copyingLineIndex === index} title={t('text-truncate/button/copy_line')}>
                                        {t('text-truncate/button/copy_line')}
                                    </button>
                                </div>
                            
</>
))}
                        </div>
                    
</>
)
                    : (
<>

                        <div className="p-3 text-muted text-center" style={{ minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {t('text-truncate/output/title')}
                        </div>
                    
</>
)
                }
            </div>
        </div>
    
</>
);
};

export default OutputCard;
