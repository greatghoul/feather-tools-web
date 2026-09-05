import { useState, useCallback, useRef, useMemo } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';
import { downloadFile } from '~/helpers/files';
import JSZip from 'jszip';
import { parseGifFile, frameToDataUrl, frameToBlob, downloadFrame, copyFrameToClipboard } from './services/GifFramesService';
import FrameGrid from './components/FrameGrid';
import SlideshowPlayer from './components/SlideshowPlayer';

const App = () => {
    const [gifFile, setGifFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [parsedData, setParsedData] = useState<any>(null);
    const [frameUrls, setFrameUrls] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);

    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
    const [slideshowFrames, setSlideshowFrames] = useState<any[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const frames = useMemo(() => {
        if (!parsedData) return [];
        return frameUrls.map((url, i) => ({
            url,
            delay: parsedData.frames[i]?.delay || 0,
            index: i,
        }));
    }, [parsedData, frameUrls]);

    const handleFileLoad = useCallback(async (file) => {
        if (!file) return;
        if (file.type !== 'image/gif' && !file.name.toLowerCase().endsWith('.gif')) {
            setError(t('gif-frames/message/error'));
            return;
        }

        if (previewUrl) URL.revokeObjectURL(previewUrl);

        const url = URL.createObjectURL(file);
        setGifFile(file);
        setPreviewUrl(url);
        setError('');
        setIsProcessing(true);
        setParsedData(null);
        setFrameUrls([]);
        setSelectedIndices(new Set());
        setIsSlideshowOpen(false);
        setSlideshowFrames([]);

        try {
            const data = await parseGifFile(file);
            setParsedData(data);
            const urls = data.frames.map((f) => frameToDataUrl(f, data.width, data.height));
            setFrameUrls(urls);
            setIsProcessing(false);
        } catch (e) {
            setError(t('gif-frames/message/error'));
            setIsProcessing(false);
        }
    }, [previewUrl]);

    const handleClear = useCallback(() => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setGifFile(null);
        setParsedData(null);
        setPreviewUrl('');
        setFrameUrls([]);
        setError('');
        setIsProcessing(false);
        setSelectedIndices(new Set());
        setIsSlideshowOpen(false);
        setSlideshowFrames([]);
    }, [previewUrl]);

    const handleFileSelect = useCallback((e) => {
        const file = e.target.files[0];
        if (file) handleFileLoad(file);
    }, [handleFileLoad]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileLoad(file);
    }, [handleFileLoad]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
    }, []);

    const handleDownload = useCallback((index) => {
        if (!parsedData) return;
        const frame = parsedData.frames[index];
        downloadFrame(frame, parsedData.width, parsedData.height, `${gifFile!.name.replace(/\.[^.]+$/, '')}-frame-${index + 1}.png`);
    }, [parsedData, gifFile]);

    const handleCopy = useCallback(async (index) => {
        if (!parsedData) return;
        try {
            const frame = parsedData.frames[index];
            await copyFrameToClipboard(frame, parsedData.width, parsedData.height);
            notify(t('gif-frames/message/copied'), '', 'success');
        } catch (e) {
            setError(t('gif-frames/message/error'));
        }
    }, [parsedData]);

    const handleDownloadAll = useCallback(async () => {
        if (!parsedData) return;
        const baseName = gifFile!.name.replace(/\.[^.]+$/, '');
        const zip = new JSZip();

        for (let i = 0; i < parsedData.frames.length; i++) {
            const blob = await frameToBlob(parsedData.frames[i], parsedData.width, parsedData.height);
            zip.file(`${baseName}-frame-${i + 1}.png`, blob);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        downloadFile(content, `${baseName}-frames.zip`);
    }, [parsedData, gifFile]);

    const handleToggleSelect = useCallback((index) => {
        setSelectedIndices((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        setSelectedIndices(new Set(frames.map((f) => f.index)));
    }, [frames]);

    const handleDeselectAll = useCallback(() => {
        setSelectedIndices(new Set());
    }, []);

    const handleDownloadSelected = useCallback(async () => {
        if (!parsedData || selectedIndices.size === 0) {
            notify(t('gif-frames/message/no_selection'), '', 'warning');
            return;
        }

        const baseName = gifFile!.name.replace(/\.[^.]+$/, '');
        const zip = new JSZip();

        for (const index of selectedIndices) {
            const blob = await frameToBlob(parsedData.frames[index], parsedData.width, parsedData.height);
            zip.file(`${baseName}-frame-${index + 1}.png`, blob);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        downloadFile(content, `${baseName}-frames.zip`);
        notify(t('gif-frames/message/downloaded'), '', 'success');
    }, [parsedData, gifFile, selectedIndices]);

    const handlePlaySelected = useCallback(() => {
        if (selectedIndices.size === 0) {
            notify(t('gif-frames/message/no_selection'), '', 'warning');
            return;
        }

        const selected = frames
            .filter((f) => selectedIndices.has(f.index))
            .sort((a, b) => a.index - b.index);

        setSlideshowFrames(selected);
        setIsSlideshowOpen(true);
    }, [selectedIndices, frames]);

    return (
<>

        <div className="gif-frames-container">
            <div className="row g-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                            <span>{t('gif-frames/preview/title')}</span>
                            {previewUrl ? (
<>

                                <button className="btn btn-sm btn-outline-danger" onClick={handleClear} disabled={isProcessing}>
                                    {t('gif-frames/button/clear')}
                                </button>
                            
</>
) : null}
                        </div>
                        <div className="card-body p-0">
                            {!previewUrl ? (
<>

                                <div className={`upload-zone ${dragOver ? 'dragover' : ''}`} onClick={() => fileInputRef.current!.click()} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
                                    <div className="upload-icon">📁</div>
                                    <div className="upload-hint">{t('gif-frames/upload/hint')}</div>
                                    <div className="upload-formats">{t('gif-frames/upload/formats')}</div>
                                    <input ref={fileInputRef} type="file" accept=".gif,image/gif" style={{ display: 'none' }} onChange={handleFileSelect} />
                                </div>
                            
</>
) : (
<>

                                <div className="text-center p-3">
                                    <img src={previewUrl} alt="GIF preview" className="img-fluid gif-preview" />
                                </div>
                            
</>
)}
                        </div>
                    </div>
                </div>

                {isProcessing ? (
<>

                    <div className="col-12">
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary mb-2" role="status"></div>
                            <p className="text-muted">{t('gif-frames/message/processing')}</p>
                        </div>
                    </div>
                
</>
) : null}

                {frames.length > 0 ? (
<>

                    <div className="col-12">
                        <FrameGrid frames={frames} selectedIndices={selectedIndices} onToggleSelect={handleToggleSelect} onSelectAll={handleSelectAll} onDeselectAll={handleDeselectAll} onDownloadFrame={handleDownload} onCopyFrame={handleCopy} onDownloadAll={handleDownloadAll} onDownloadSelected={handleDownloadSelected} onPlaySelected={handlePlaySelected} />
                    </div>
                
</>
) : null}

                {error ? (
<>

                    <div className="col-12">
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            {error}
                            <button type="button" className="btn-close" onClick={() => setError('')}></button>
                        </div>
                    </div>
                
</>
) : null}
            </div>

            <SlideshowPlayer frames={slideshowFrames} isOpen={isSlideshowOpen} onClose={() => setIsSlideshowOpen(false)} />
        </div>
    
</>
);
};

export default App;
