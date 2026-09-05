import { t } from '~/helpers/i18n';

const GifUpload = ({ onFileLoad }) => {
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) onFileLoad(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) onFileLoad(file);
    };

    const handleClick = () => {
        document.getElementById('gif-input')!.click();
    };

    return (
<>

        <div className="gif-upload-zone d-flex flex-column align-items-center justify-content-center p-5" onDragOver={handleDragOver} onDrop={handleDrop} onClick={handleClick}>
            <p className="mb-3">
                <i className="bi bi-file-image" style={{ fontSize: '3rem' }}></i>
            </p>
            <p className="text-muted mb-3">{t('gif-cut/upload/hint')}</p>
            <p className="text-muted small mb-3">{t('gif-cut/upload/formats')}</p>
            <input type="file" accept=".gif,image/gif" style={{ display: 'none' }} id="gif-input" onChange={handleFileChange} />
            <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
                {t('gif-cut/button/load')}
            </button>
        </div>
    
</>
);
};

export default GifUpload;
