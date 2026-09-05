import { useRef, useState, useCallback } from 'react';
import { t } from '~/helpers/i18n';
import styles from './OutputCard.module.css';

const STYLE_KEYS = [
    { key: 'rounded', label: t('text-bubble/options/style_rounded') },
    { key: 'double', label: t('text-bubble/options/style_double') },
    { key: 'bold', label: t('text-bubble/options/style_bold') },
];

const BubbleCard = ({ label, text }) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        if (textareaRef.current && text) {
            textareaRef.current.select();
            navigator.clipboard.writeText(text).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    }, [text]);

    return (
<>

        <div className="card h-100">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h6 className="mb-0">{label}</h6>
                <button className="btn btn-sm btn-outline-primary" onClick={handleCopy} disabled={!text}>
                    {copied ? t('text-bubble/message/copied') : t('text-bubble/button/copy')}
                </button>
            </div>
            <div className="card-body">
                <textarea ref={textareaRef} className={`form-control ${styles.bubbleFont}`} rows={8} readOnly value={text} onClick={(e) => (e.target as HTMLTextAreaElement).select()} placeholder={t('text-bubble/output/placeholder')}></textarea>
            </div>
        </div>
    
</>
);
};

const OutputCard = ({ outputs }) => {
    return (
<>

        <div className="d-flex flex-column gap-3">
            {STYLE_KEYS.map(s => (
<>

                <BubbleCard label={s.label} text={outputs[s.key]} />
            
</>
))}
        </div>
    
</>
);
};

export default OutputCard;
