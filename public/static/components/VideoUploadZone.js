import { html } from 'htm/preact';
import { useRef, useCallback } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

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
    const inputRef = useRef(null);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) onFileLoad(file);
    }, [onFileLoad]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
    }, []);

    const handleClick = useCallback(() => {
        inputRef.current.value = '';
        inputRef.current.click();
    }, []);

    const handleChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) onFileLoad(file);
    }, [onFileLoad]);

    return html`
        <div
            class="video-upload-zone d-flex flex-column align-items-center justify-content-center p-5"
            onDragOver=${handleDragOver}
            onDrop=${handleDrop}
        >
            <p class="mb-3">
                <i class="bi bi-film" style="font-size: 3rem;"></i>
            </p>
            <p class="text-muted mb-3">${getText('common/upload/video_hint')}</p>
            <input
                type="file"
                ref=${inputRef}
                accept=${accept}
                style="display: none;"
                onChange=${handleChange}
            />
            <button class="btn btn-primary" onClick=${handleClick}>
                ${loadText}
            </button>
        </div>
    `;
};

export default VideoUploadZone;