// Output Card Component for Batch URL Cleaner
import { t } from '~/helpers/i18n';
import styles from './OutputCard.module.css';

const OutputCard = ({ 
    cleanedUrls, 
    copyButtonRef,
    onCopy,
    onDownload 
}) => {
    // Calculate dynamic rows for textarea (between 5 and 15)
    const calculateRows = () => {
        if (!cleanedUrls) return 5;
        const lineCount = cleanedUrls.split('\n').length;
        return Math.max(5, Math.min(15, lineCount));
    };

    return (
<>

        {(cleanedUrls) && (
<>

            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{t('clean-urls/output/title')}</h5>
                    {cleanedUrls && (
<>

                        <div className="btn-group">
                            <button ref={copyButtonRef} className={`btn btn-outline-primary btn-sm ${styles.btnCopyStyle}`} onClick={onCopy}>
                                <i className="bi bi-clipboard"></i> {t('clean-urls/button/copy')}
                            </button>
                            <button className="btn btn-outline-success btn-sm" onClick={onDownload}>
                                <i className="bi bi-download"></i> Download
                            </button>
                        </div>
                    
</>
)}
                </div>
                <div className="card-body">
                    {cleanedUrls && (
<>

                        <div className="results" id="output">
                            <textarea className={`form-control font-monospace ${styles.outputAreaStyle}`} rows={calculateRows()} readOnly value={cleanedUrls}></textarea>
                        </div>
                    
</>
)}
                </div>
            </div>
        
</>
)}
    
</>
);
};

export default OutputCard;
