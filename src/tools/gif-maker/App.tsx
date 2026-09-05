import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';
import { downloadFile } from '~/helpers/files';
import PrepareCard from './components/PrepareCard';
import ResultCard from './components/ResultCard';
import { DEFAULT_SETTINGS } from './components/GifSettings';
import { generateGif } from './services/GifMakerService';

const App = () => {
    const [images, setImages] = useState<any[]>([]);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [result, setResult] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState('');
    const [error, setError] = useState('');

    const abortRef = useRef(false);
    const resultUrlRef = useRef('');

    useEffect(() => { resultUrlRef.current = result ? result.url : ''; }, [result]);

    useEffect(() => {
        return () => {
            abortRef.current = true;
            if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
        };
    }, []);

    const maxWidth = useMemo(() => {
        if (images.length === 0) return 0;
        return Math.max(...images.map((img) => img.width));
    }, [images]);

    const handleImagesAdd = useCallback((newImages) => {
        setImages((prev) => [...prev, ...newImages]);
    }, []);

    const handleImagesReorder = useCallback((newImages) => {
        setImages(newImages);
        if (newImages.length === 0) {
            if (result) URL.revokeObjectURL(result.url);
            setResult(null);
        }
    }, [result]);

    const handleSettingsChange = useCallback((newSettings) => {
        setSettings(newSettings);
    }, []);

    const handleGenerate = useCallback(async () => {
        if (images.length === 0 || isGenerating) return;

        if (result) URL.revokeObjectURL(result.url);
        setResult(null);
        setError('');
        setIsGenerating(true);
        setProgress(0);
        setProgressLabel(t('gif-maker/message/processing'));
        abortRef.current = false;

        try {
            const gifResult = await generateGif(
                images,
                settings,
                (pct) => {
                    setProgress(pct);
                    if (pct >= 50) {
                        setProgressLabel(t('gif-maker/message/encoding'));
                    }
                },
                () => abortRef.current
            );

            if (abortRef.current || !gifResult) return;

            setResult(gifResult);
            notify(t('gif-maker/message/generated'), '', 'success');
        } catch (e) {
            setError(t('gif-maker/message/error'));
        } finally {
            setIsGenerating(false);
            setProgressLabel('');
        }
    }, [images, settings, result, isGenerating]);

    const handleDownload = useCallback(() => {
        if (!result) return;
        downloadFile(result.blob, 'gif-maker.gif');
    }, [result]);

    const canGenerate = images.length > 0 && !isGenerating;

    return (
<>

        <div className="gif-maker-container">
            <div className="row">
                <div className="col-md-6 col-lg-4">
                    <PrepareCard images={images} settings={settings} maxWidth={maxWidth} isGenerating={isGenerating} onImagesAdd={handleImagesAdd} onImagesReorder={handleImagesReorder} onSettingsChange={handleSettingsChange} />
                </div>
                <div className="col-md-6 col-lg-8">
                    <ResultCard result={result} isGenerating={isGenerating} progress={progress} progressLabel={progressLabel} canGenerate={canGenerate} onGenerate={handleGenerate} onDownload={handleDownload} />
                    {error ? (
<>

                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            {error}
                            <button type="button" className="btn-close" onClick={() => setError('')}></button>
                        </div>
                    
</>
) : null}
                </div>
            </div>
        </div>
    
</>
);
};

export default App;
