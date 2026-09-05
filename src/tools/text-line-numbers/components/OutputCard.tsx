import { useState } from 'react';
import { t } from '~/helpers/i18n';

const OutputCard = ({ text, onDownload }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!text) return;
        
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };



    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('text-line-numbers/output/title')}</span>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-success" onClick={onDownload} disabled={!text}>
                        <i className="bi bi-download"></i> {t('text-line-numbers/button/download')}
                    </button>
                    <button className="btn btn-sm btn-outline-success" onClick={handleCopy} disabled={!text}>
                        <i className="bi bi-clipboard"></i> {copied ? t('text-line-numbers/message/copied') : t('text-line-numbers/button/copy')}
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                <textarea className="form-control border-0" style={{ minHeight: '200px', resize: 'vertical', whiteSpace: 'nowrap', overflowX: 'auto' }} readOnly value={text} placeholder="Generated text with line numbers will appear here..."></textarea>
            </div>
            <div className="card-footer bg-light">
                <div className="small text-muted">
                    {text ? 
                        (
<>
<span>Lines: {text.split('\n').length} | Characters: {text.length}</span>
</>
) :
                        (
<>
<span>No output generated yet</span>
</>
)
                    }
                </div>
            </div>
        </div>
    
</>
);
};

export default OutputCard;
