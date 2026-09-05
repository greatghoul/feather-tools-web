import { useState, useMemo } from 'react';
import PrepareCard from './components/PrepareCard';
import ProcessCard from './components/ProcessCard';
import { DEFAULT_SETTINGS } from './components/SettingsForm';

const MergeImages = () => {
    const [images, setImages] = useState<any[]>([]);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    const sizes = useMemo(() => {
        if (images.length === 0) {
            return { minWidth: 0, maxWidth: 0, minHeight: 0, maxHeight: 0 };
        }
        const widths = images.map(img => img.width);
        const heights = images.map(img => img.height);
        return {
            minWidth: Math.min(...widths),
            maxWidth: Math.max(...widths),
            minHeight: Math.min(...heights),
            maxHeight: Math.max(...heights),
        };
    }, [images]);

    const handleImagesAdd = (newImages) => {
        setImages(prev => [...prev, ...newImages]);
    };

    const handleImagesReorder = (newImages) => {
        setImages(newImages);
    };

    const handleSettingsChange = (newSettings) => {
        setSettings(newSettings);
    };

    const handleDownload = (dataURL) => {
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'merged-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
<>

        <div className="row">
            <div className="col-md-6 col-lg-4">
                <PrepareCard images={images} settings={settings} sizes={sizes} onImagesAdd={handleImagesAdd} onImagesReorder={handleImagesReorder} onSettingsChange={handleSettingsChange} />
            </div>
            <div className="col-md-6 col-lg-8">
                <ProcessCard images={images} settings={settings} sizes={sizes} onDownload={handleDownload} />
            </div>
        </div>
    
</>
);
};

export default MergeImages;
