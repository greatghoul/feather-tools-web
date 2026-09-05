import { useRef, useCallback } from 'react';
import { t } from '~/helpers/i18n';

export const VIDEO_ACCEPT = '.mp4,.mov,.m4v,.webm,.ogg,.ogv';

const ACCEPTED_EXTENSIONS = ['.mp4', '.mov', '.m4v', '.webm', '.ogg', '.ogv'];
const ACCEPTED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/ogg'];

export const isVideoSupported = (file) => {
    if (!file) return false;
    if (file.type && ACCEPTED_TYPES.includes(file.type)) return true;
    const name = (file.name || '').toLowerCase();
    return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
};

const VideoUploadZone = ({ loadText, onFileLoad, accept = 'video/*' }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) onFileLoad(file);
    }, [onFileLoad]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
    }, []);

    const handleClick = useCallback(() => {
        inputRef.current!.value = '';
        inputRef.current!.click();
    }, []);

    const handleChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) onFileLoad(file);
    }, [onFileLoad]);

    return (
<>

        <div className="video-upload-zone d-flex flex-column align-items-center justify-content-center p-5" onDragOver={handleDragOver} onDrop={handleDrop}>
            <p className="mb-3">
                <i className="bi bi-film" style={{ fontSize: '3rem' }}></i>
            </p>
            <p className="text-muted mb-3">{t('common/upload/video_hint')}</p>
            <input type="file" ref={inputRef} accept={accept} style={{ display: 'none' }} onChange={handleChange} />
            <button className="btn btn-primary" onClick={handleClick}>
                {loadText}
            </button>
        </div>
    
</>
);
};

export default VideoUploadZone;
