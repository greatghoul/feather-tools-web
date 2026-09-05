import { useState } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';

const OutputCard = ({ text }) => {
    const [isCopying, setIsCopying] = useState(false);

    const handleCopy = () => {
        if (text && !isCopying) {
            setIsCopying(true);
            navigator.clipboard.writeText(text).then(() => {
                notify(t('text-case-convert/message/copied'), '', 'success');
                setTimeout(() => {
                    setIsCopying(false);
                }, 1000);
            });
        }
    };

    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('text-case-convert/output/title')}</span>
                <button className="btn btn-sm btn-outline-primary" onClick={handleCopy} disabled={!text || isCopying}>
                    {t('text-case-convert/button/copy')}
                </button>
            </div>
            <div className="card-body p-0">
                <textarea className="form-control border-0" style={{ minHeight: '200px', resize: 'vertical' }} value={text} readOnly></textarea>
            </div>
        </div>
    
</>
);
};

export default OutputCard;
