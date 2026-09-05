import { useRef, useEffect, useState } from 'react';
import { getFileFormat } from '~/helpers/files';
import { t } from '~/helpers/i18n';
import styles from './ImageUploadZone.module.css';

const ImageUploadZone = ({ disabled, onChange }) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const dropZoneRef = useRef<HTMLDivElement | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFiles = async (files) => {
        if (!files || files.length === 0) return;

        const validFiles = Array.from(files as ArrayLike<File>).filter(file =>
            file.type.startsWith('image/')
        );

        const imageLoaders = validFiles.map(file => {
            const url = URL.createObjectURL(file);
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    const { format, mimeType } = getFileFormat(file);
                    resolve({
                        id: Date.now() + Math.random(),
                        name: file.name,
                        url: url,
                        file: file,
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                        format: format,
                        mimeType: mimeType
                    });
                };
                img.src = url;
            });
        });
        
        const newImages = await Promise.all(imageLoaders);
        onChange(newImages);
    };

    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const files: any[] = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
                files.push(items[i].getAsFile());
            }
        }
        if (files.length > 0) {
            handleFiles(files);
        }
    };

    const handleUploadClick = () => {
        if (disabled) return;
        fileInputRef.current?.click();
    };

    const handleFileInput = (e) => {
        handleFiles(e.target.files);
        e.target.value = '';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        handleFiles(e.dataTransfer.files);
    };

    useEffect(() => {
        document.addEventListener('paste', handlePaste);
        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    }, []);

    const privacyHtml = { __html: t('common/upload/privacy_notice') };

    return (
<>

        <div className={`${styles.uploadZoneStyle} ${isDragOver ? styles.dragover : ''} ${disabled ? 'opacity-50 pe-none' : ''}`} ref={dropZoneRef} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={handleUploadClick}>
            <div className={`${styles.uploadContentStyle}`}>
                <p className="mt-1 mb-1">{t('common/upload/click_drop_paste')}</p>
                <small className="text-muted">{t('common/upload/formats')}</small>
            </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileInput} multiple accept="image/jpeg,image/jpg, image/png,image/webp" style={{ display: 'none' }} disabled={disabled} />
        <div className="alert alert-success mb-0 p-2 h-100">
            <small>
                <i className="bi bi-shield-fill-check me-1"></i>
                <span dangerouslySetInnerHTML={privacyHtml} />
            </small>
        </div>
    
</>
);
};

export default ImageUploadZone;
