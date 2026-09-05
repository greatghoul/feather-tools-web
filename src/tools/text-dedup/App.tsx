import { useState, useCallback } from 'react';
import TextCard from './components/TextCard';
import SettingsCard from './components/SettingsCard';

const App = () => {
    const [inputText, setInputText] = useState('');
    const [settings, setSettings] = useState({
        ignoreLeading: false,
        ignoreTrailing: false,
    });

    const handleDedup = () => {
        const lines = inputText.split('\n');
        const uniqueLines: string[] = [];
        const seen = new Set<string>();

        lines.forEach(line => {
            let processedLine = line;
            if (settings.ignoreLeading) {
                processedLine = processedLine.trimStart();
            }
            if (settings.ignoreTrailing) {
                processedLine = processedLine.trimEnd();
            }

            if (!seen.has(processedLine)) {
                seen.add(processedLine);
                uniqueLines.push(line);
            }
        });

        setInputText(uniqueLines.join('\n'));
    };
    
    const handleTextChange = useCallback((newText) => {
        setInputText(newText);
    }, []);

    const handleSettingsChange = useCallback((newSettings) => {
        setSettings(newSettings);
    }, []);

    return (
<>

        <div className="row row-gap-4 mb-4">
            <div className="col-md-12">
                <TextCard text={inputText} onTextChange={handleTextChange} settings={settings} />
            </div>

            <div className="col-md-12">
                <SettingsCard onSettingsChange={handleSettingsChange} onDedup={handleDedup} />
            </div>
        </div>
    
</>
);
};

export default App;
