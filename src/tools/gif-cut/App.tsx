import { useState, useRef, useCallback, useEffect } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';
import GifUpload from './components/GifUpload';
import CutControls from './components/CutControls';
import ResultCard from './components/ResultCard';
import { parseGifFile, cutGifByFrame, cutGifByTime } from './services/GifCutter';

const App = () => {
    const [gifFile, setGifFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [frameThumbnails, setFrameThumbnails] = useState<any[]>([]);

    const [mode, setMode] = useState('frame');
    const [startFrame, setStartFrame] = useState(0);
    const [endFrame, setEndFrame] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);

    const processingRef = useRef(false);

    const handleFileLoad = useCallback(async (file) => {
        if (!file) return;
        if (file.type !== 'image/gif' && !file.name.toLowerCase().endsWith('.gif')) {
            setError(t('gif-cut/message/error'));
            return;
        }

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        if (result) {
            URL.revokeObjectURL(result.url);
            setResult(null);
        }

        const url = URL.createObjectURL(file);
        setGifFile(file);
        setPreviewUrl(url);
        setError('');
        setIsProcessing(true);
        setParsedData(null);
        setStartFrame(0);
        setEndFrame(0);
        setStartTime(0);
        setEndTime(0);
        setFrameThumbnails([]);

        try {
            const data = await parseGifFile(file);
            setParsedData(data);
            const lastFrame = data.totalFrames - 1;
            setEndFrame(lastFrame);
            setEndTime(data.totalDuration / 1000);

            const thumbHeight = 60;
            const thumbs = data.frames.map((f) => {
                const full = document.createElement('canvas');
                full.width = data.width;
                full.height = data.height;
                const fullCtx = full.getContext('2d', { willReadFrequently: true })!;
                fullCtx.putImageData(f.imageData, 0, 0);
                const thumb = document.createElement('canvas');
                const ratio = data.width / data.height;
                thumb.width = Math.round(thumbHeight * ratio);
                thumb.height = thumbHeight;
                const thumbCtx = thumb.getContext('2d')!;
                thumbCtx.drawImage(full, 0, 0, thumb.width, thumb.height);
                return { thumbnail: thumb.toDataURL() };
            });
            setFrameThumbnails(thumbs);
            setIsProcessing(false);
        } catch (e) {
            setError(t('gif-cut/message/error'));
            setIsProcessing(false);
        }
    }, [previewUrl, result]);

    const handleCut = useCallback(async () => {
        if (!parsedData || !gifFile || processingRef.current) return;
        if (mode === 'frame' && startFrame >= endFrame) return;
        if (mode === 'second' && startTime >= endTime) return;

        processingRef.current = true;
        setIsProcessing(true);
        setError('');

        if (result) {
            URL.revokeObjectURL(result.url);
            setResult(null);
        }

        try {
            const fn = mode === 'frame' ? cutGifByFrame : cutGifByTime;
            const cutResult = await fn(
                parsedData,
                mode === 'frame' ? startFrame : startTime,
                mode === 'frame' ? endFrame : endTime,
                gifFile.name
            );
            setResult(cutResult);
            notify(t('gif-cut/message/complete'), '', 'success');
        } catch (e) {
            setError(t('gif-cut/message/error'));
        }

        processingRef.current = false;
        setIsProcessing(false);
    }, [parsedData, gifFile, mode, startFrame, endFrame, startTime, endTime, result]);

    const handleClear = useCallback(() => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        if (result) URL.revokeObjectURL(result.url);
        setGifFile(null);
        setParsedData(null);
        setPreviewUrl('');
        setStartFrame(0);
        setEndFrame(0);
        setStartTime(0);
        setEndTime(0);
        setResult(null);
        setError('');
        setFrameThumbnails([]);
        setMode('frame');
        setIsProcessing(false);
    }, [previewUrl, result]);

    const handleDownload = useCallback(() => {
        if (!result) return;
        const a = document.createElement('a');
        a.href = result.url;
        a.download = result.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, [result]);

    const handleModeChange = useCallback((newMode) => {
        setMode(newMode);
    }, []);

    return (
<>

        <div className="gif-cut-container">
            <div className="row g-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                            <span>{t('gif-cut/preview/title')}</span>
                            {previewUrl ? (
<>

                                <button className="btn btn-sm btn-outline-danger" onClick={handleClear} disabled={isProcessing}>
                                    {t('gif-cut/button/clear')}
                                </button>
                            
</>
) : null}
                        </div>
                        <div className="card-body p-0">
                            {!previewUrl ? (
<>

                                <GifUpload onFileLoad={handleFileLoad} />
                            
</>
) : (
<>

                                <div className="text-center p-3">
                                    <img src={previewUrl} alt="GIF preview" className="img-fluid" style={{ maxHeight: '350px' }} />
                                </div>
                            
</>
)}
                        </div>
                    </div>
                </div>

                {parsedData ? (
<>

                    <div className="col-12">
                        <CutControls mode={mode} onModeChange={handleModeChange} totalFrames={parsedData.totalFrames} totalDuration={parsedData.totalDuration} startFrame={startFrame} endFrame={endFrame} startTime={startTime} endTime={endTime} onStartFrameChange={setStartFrame} onEndFrameChange={setEndFrame} onStartTimeChange={setStartTime} onEndTimeChange={setEndTime} onCut={handleCut} isProcessing={isProcessing} />
                    </div>
                
</>
) : null}

                {isProcessing && !parsedData ? (
<>

                    <div className="col-12">
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary mb-2" role="status"></div>
                            <p className="text-muted">{t('gif-cut/message/processing')}</p>
                        </div>
                    </div>
                
</>
) : null}

                {result ? (
<>

                    <div className="col-12">
                        <ResultCard resultUrl={result.url} fileName={result.name} fileSize={result.size} onDownload={handleDownload} onClear={() => {
                                URL.revokeObjectURL(result.url);
                                setResult(null);
                            }} />
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
        </div>
    
</>
);
};

export default App;
