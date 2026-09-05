import { useState, useEffect } from 'react';
import SettingCard from './components/SettingCard';
import PreviewCard from './components/PreviewCard';

const DEFAULT_SETTINGS = {
    url: '',
    foreground: '#000000',
    background: '#FFFFFF'
};

const App = () => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const url = params.get('url');
        if (url) {
            setSettings(prev => ({ ...prev, url }));
        }
    }, []);

    const handleCreate = (settings) => {
        setCreating(true);
        setSettings(settings);
    }

    const handleCreated = () => setCreating(false);

    return (
<>

        <div className="row row-gap-4 mb-4">
            <div className="col-lg-6">
                <SettingCard settings={settings} onSubmit={handleCreate} creating={creating} />
            </div>

            <div className="col-lg-6">
                <PreviewCard settings={settings} creating={creating} onCreated={handleCreated} />
            </div>
        </div>
    
</>
);
}

export default App;
