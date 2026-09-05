import { useState, useRef } from 'react';
import { t } from '~/helpers/i18n';
import styles from './InputArea.module.css';

const InputArea = ({ onGenerate, generating }) => {
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const handleInput = (e) => {
        setText(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    const handleGenerate = () => {
        if (!text.trim()) return;
        
        const urls = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
            
        if (urls.length > 0) {
            onGenerate(urls);
        }
    };

    const loadExamples = () => {
        const examples = [
            'https://www.google.com',
            'https://github.com',
            'https://stackoverflow.com',
            'https://www.wikipedia.org',
            'https://www.reddit.com'
        ].join('\n');
        setText(examples);
        
        // Adjust height after render
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            }
        }, 0);
    };

    return (
<>

        <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t('batch-qrcode/input/label')}</h5>
                <button className="btn btn-sm btn-outline-secondary" onClick={loadExamples} disabled={generating}>
                    {t('batch-qrcode/input/load_examples')}
                </button>
            </div>
            <div className="card-body">
                <div className="mb-3">
                    <textarea ref={textareaRef} className={`form-control ${styles.textareaStyle}`} value={text} onInput={handleInput} placeholder={t('batch-qrcode/input/placeholder')} disabled={generating} rows={5}></textarea>
                </div>
                <button className="btn btn-primary" onClick={handleGenerate} disabled={generating || !text.trim()}>
                    {generating ? t('batch-qrcode/input/generating') : t('batch-qrcode/input/generate')}
                </button>
            </div>
        </div>
    
</>
);
};

export default InputArea;
