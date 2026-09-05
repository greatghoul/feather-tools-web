import { useState } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';

const SegmentCard = ({ segment, limit }) => {
    const [isCopying, setIsCopying] = useState(false);

    const handleCopy = () => {
        if (segment.fullText && !isCopying) {
            setIsCopying(true);
            navigator.clipboard.writeText(segment.fullText).then(() => {
                notify(t('long-post-splitter/message/copied'), '', 'success');
                setTimeout(() => setIsCopying(false), 1000);
            });
        }
    };

    const badgeClass = segment.overLimit
        ? 'bg-danger'
        : 'bg-success';

    const showTextWeight = segment.numbering && segment.textWeight !== segment.weight;

    return (
<>

        <div className="card segment-card">
            <div className="card-header d-flex justify-content-between align-items-center py-2">
                <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary">{segment.index}/{segment.total}</span>
                    <span className={`badge ${badgeClass}`}>
                        {segment.weight}/{limit}
                    </span>
                    {showTextWeight ? (
<>

                        <span className="text-muted small">
                            {t('long-post-splitter/segment/text_weight')}: {segment.textWeight}
                        </span>
                    
</>
) : null}
                    {segment.overLimit ? (
<>

                        <span className="badge bg-warning text-dark">
                            {t('long-post-splitter/segment/over_limit')}
                        </span>
                    
</>
) : null}
                </div>
                <button className="btn btn-sm btn-outline-primary" onClick={handleCopy} disabled={isCopying}>
                    <i className="bi bi-clipboard me-1"></i>
                    {t('long-post-splitter/button/copy')}
                </button>
            </div>
            <div className="card-body">
                <pre className="segment-text mb-0">{segment.fullText}</pre>
            </div>
        </div>
    
</>
);
};

export default SegmentCard;
