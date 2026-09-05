import { useState } from 'react';
import SettingCard from './components/SettingCard';
import PreviewCard from './components/PreviewCard';

const DEFAULT_SETTINGS = {
    width: 800,
    height: 600,
    bgColor: '#CCCCCC',
    textColor: '#333333',
    text: '800 \u00d7 600',
    format: 'png',
    fontSize: '',
    borderRadius: 0,
    borderColor: '#333333',
    borderWidth: 0,
    borderStyle: 'solid',
};

const App = () => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
<>

        <div className="row row-gap-4 mb-4">
            <div className="col-lg-6">
                <SettingCard settings={settings} onChange={handleChange} />
            </div>
            <div className="col-lg-6">
                <PreviewCard settings={settings} />
            </div>
        </div>
    
</>
);
};

export default App;
