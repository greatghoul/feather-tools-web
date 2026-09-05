import { useState } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';

interface OutputCardProps {
    text: string;
}

const OutputCard = ({ text }: OutputCardProps) => {
    const [isCopying, setIsCopying] = useState(false);

    const handleCopy = () => {
        if (text && !isCopying) {
            setIsCopying(true);
            navigator.clipboard.writeText(text).then(() => {
                notify(t('text-sort/message/copied'), '', 'success');
                setTimeout(() => {
                    setIsCopying(false);
                }, 1000);
            });
        }
    };

    return (
        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('text-sort/output/title')}</span>
                <button className="btn btn-sm btn-outline-primary" onClick={handleCopy} disabled={!text || isCopying}>
                    {t('text-sort/button/copy')}
                </button>
            </div>
            <div className="card-body p-0">
                <textarea
                    className="form-control border-0"
                    style={{ minHeight: '200px', resize: 'vertical' }}
                    value={text}
                    readOnly
                />
            </div>
        </div>
    );
};

export default OutputCard;
