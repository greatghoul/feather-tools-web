import { useState } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';
import SegmentCard from '../components/SegmentCard';

const OutputCard = ({ segments, limit }) => {
    const [isCopyingAll, setIsCopyingAll] = useState(false);

    const handleCopyAll = () => {
        if (segments.length === 0 || !isCopyingAll) {
            setIsCopyingAll(true);
            const allText = segments
                .map((s) => s.fullText)
                .join('\n\n---\n\n');
            navigator.clipboard.writeText(allText).then(() => {
                notify(t('long-post-splitter/message/copied_all'), '', 'success');
                setTimeout(() => setIsCopyingAll(false), 1000);
            });
        }
    };

    if (segments.length === 0) return null;

    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>
                    {t('long-post-splitter/output/title')}
                    <span className="badge bg-secondary ms-2">{segments.length}</span>
                </span>
                <button className="btn btn-sm btn-outline-primary" onClick={handleCopyAll} disabled={isCopyingAll}>
                    <i className="bi bi-clipboard-plus me-1"></i>
                    {t('long-post-splitter/button/copy_all')}
                </button>
            </div>
            <div className="card-body">
                <div className="d-flex flex-column gap-3">
                    {segments.map((seg) => (
<>

                        <SegmentCard key={seg.index} segment={seg} limit={limit} />
                    
</>
))}
                </div>
            </div>
        </div>
    
</>
);
};

export default OutputCard;
