import { useState } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';

const OutputCard = ({ collected, onClear }) => {
    const [isCopying, setIsCopying] = useState(false);

    const handleCopyAll = () => {
        if (collected && !isCopying) {
            setIsCopying(true);
            navigator.clipboard.writeText(collected).then(() => {
                notify(t('emoji-picker/message/copied_all'), '', 'success');
                setTimeout(() => setIsCopying(false), 1000);
            });
        }
    };

    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('emoji-picker/output/title')}</span>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={handleCopyAll} disabled={!collected || isCopying}>{t('emoji-picker/output/copy_all')}</button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={onClear} disabled={!collected}>{t('emoji-picker/output/clear')}</button>
                </div>
            </div>
            <div className="card-body p-0">
                <textarea className="form-control border-0" style={{ minHeight: '120px', resize: 'vertical', fontSize: '1.5rem' }} placeholder={t('emoji-picker/output/placeholder')} value={collected} readOnly></textarea>
            </div>
        </div>
    
</>
);
};

export default OutputCard;
