import { render } from 'preact';
import { html } from 'htm/preact';
import { useState, useCallback, useMemo, useEffect, useRef } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';
import { downloadFile } from '~/helpers/files.js';
import PrepareCard from '@/components/PrepareCard.js';
import ResultCard from '@/components/ResultCard.js';
import { DEFAULT_SETTINGS } from '@/components/GifSettings.js';
import { generateGif } from '@/services/GifMakerService.js';

const App = () => {
    const [images, setImages] = useState([]);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [result, setResult] = useState(null);
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
        setProgressLabel(getText('gif-maker/message/processing'));
        abortRef.current = false;

        try {
            const gifResult = await generateGif(
                images,
                settings,
                (pct) => {
                    setProgress(pct);
                    if (pct >= 50) {
                        setProgressLabel(getText('gif-maker/message/encoding'));
                    }
                },
                () => abortRef.current
            );

            if (abortRef.current || !gifResult) return;

            setResult(gifResult);
            notify(getText('gif-maker/message/generated'), '', 'success');
        } catch (e) {
            setError(getText('gif-maker/message/error'));
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

    return html`
        <div class="gif-maker-container">
            <div class="row">
                <div class="col-md-6 col-lg-4">
                    <${PrepareCard}
                        images=${images}
                        settings=${settings}
                        maxWidth=${maxWidth}
                        isGenerating=${isGenerating}
                        onImagesAdd=${handleImagesAdd}
                        onImagesReorder=${handleImagesReorder}
                        onSettingsChange=${handleSettingsChange}
                    />
                </div>
                <div class="col-md-6 col-lg-8">
                    <${ResultCard}
                        result=${result}
                        isGenerating=${isGenerating}
                        progress=${progress}
                        progressLabel=${progressLabel}
                        canGenerate=${canGenerate}
                        onGenerate=${handleGenerate}
                        onDownload=${handleDownload}
                    />
                    ${error ? html`
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            ${error}
                            <button type="button" class="btn-close" onClick=${() => setError('')}></button>
                        </div>
                    ` : null}
                </div>
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
