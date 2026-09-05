import { useState } from 'react';
import { StoreContext } from '~/contexts/StoreContext';
import InputCard from './components/InputCard';
import ResultCard from './components/ResultCard';
import { DEFAULT_SETTINGS } from './components/SettingForm';

const App = () => {
    const [images, setImages] = useState<any[]>([]);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const handleImagesAdd = (newImages) => {
        setImages(prev => [...prev, ...newImages]);
        setHasChanges(true);
    };

    const handleImagesChange = (changedImages) => {
        setImages(changedImages);
        setHasChanges(true);
    };

    const handleSettingsChange = (newSettings) => {
        setSettings(newSettings);
        setHasChanges(true);
    };

    const store = {
        isProcessing,
        setIsProcessing,
        hasChanges,
        setHasChanges
    };

    return (
<>

        <StoreContext.Provider value={store}>
            <div className="row mb-4">
                <div className="col-md-6 col-lg-4">
                    <InputCard images={images} settings={settings} onImagesAdd={handleImagesAdd} onImagesChange={handleImagesChange} onSettingsChange={handleSettingsChange} />
                </div>
                <div className="col-md-6 col-lg-8">
                    <ResultCard images={images} settings={settings} />
                </div>
            </div>
        </StoreContext.Provider>
    
</>
);
};

export default App;
