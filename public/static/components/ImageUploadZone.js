import { useRef, useEffect, useState } from 'preact/hooks';
import { html } from 'htm/preact';
import { css } from 'goober';
import { getFileFormat } from '~/helpers/files.js';
import { getText } from '~/helpers/utils.js';

const uploadZoneStyle = css`
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: #f8f9fa;
    padding: 1rem 0;
    margin-bottom: 1rem;
    
    &:hover {
        border-color: #0d6efd;
        background-color: #f0f7ff;
    }
    
    &.dragover {
        border-color: #0d6efd;
        background-color: #e7f3ff;
    }
`;

const uploadContentStyle = css`
    pointer-events: none;
`;

const ImageUploadZone = ({ disabled, onChange }) => {
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFiles = async (files) => {
        if (!files || files.length === 0) return;

        const validFiles = Array.from(files).filter(file => 
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

        const files = [];
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

    const privacyHtml = { __html: getText('common/upload/privacy_notice') };

    return html`
        <div 
            class="${uploadZoneStyle} ${isDragOver ? 'dragover' : ''} ${disabled ? 'opacity-50 pe-none' : ''}"
            ref=${dropZoneRef}
            onDragOver=${handleDragOver}
            onDragLeave=${handleDragLeave}
            onDrop=${handleDrop}
            onClick=${handleUploadClick}
        >
            <div class="${uploadContentStyle}">
                <p class="mt-1 mb-1">${getText('common/upload/click_drop_paste')}</p>
                <small class="text-muted">${getText('common/upload/formats')}</small>
            </div>
        </div>
        <input 
            type="file" 
            ref=${fileInputRef}
            onChange=${handleFileInput}
            multiple 
            accept="image/jpeg,image/jpg, image/png,image/webp"
            style="display: none"
            disabled=${disabled}
        />
        <div class="alert alert-success mb-0 p-2 h-100">
            <small>
                <i class="bi bi-shield-fill-check me-1"></i>
                <span dangerouslySetInnerHTML=${privacyHtml} />
            </small>
        </div>
    `;
};

export default ImageUploadZone;
