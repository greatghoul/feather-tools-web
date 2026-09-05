import { useState } from 'react';
import TextCard from './components/TextCard';
import SettingCard from './components/SettingCard';

const App = () => {
    const [inputText, setInputText] = useState('');

    const processText = (text, settings) => {
        let processedText = text;

        // Full Text Options
        if (settings.trimFullLeading) {
            processedText = processedText.replace(/^\s+/, '');
        }
        if (settings.trimFullTrailing) {
            processedText = processedText.replace(/\s+$/, '');
        }

        // Split into lines for line-by-line processing
        let lines = processedText.split('\n');

        // Line Options
        if (settings.trimLineLeading || settings.trimLineTrailing) {
            lines = lines.map(line => {
                if (settings.trimLineLeading) {
                    line = line.replace(/^\s+/, '');
                }
                if (settings.trimLineTrailing) {
                    line = line.replace(/\s+$/, '');
                }
                return line;
            });
        }

        // Blank Line Options
        if (settings.blankLineOption === 'remove') {
            lines = lines.filter(line => line.trim().length > 0);
        } else if (settings.blankLineOption === 'merge') {
            const mergedLines: any[] = [];
            let lastWasEmpty = false;
            for (const line of lines) {
                const isEmpty = line.trim().length === 0;
                if (!isEmpty || !lastWasEmpty) {
                    mergedLines.push(line);
                }
                lastWasEmpty = isEmpty;
            }
            lines = mergedLines;
        }

        // Remove Chinese whitespace
        if (settings.removeChineseWhitespace) {
            lines = lines.map(line => line.replace(/　/g, ''));
        }

        return lines.join('\n');
    };

    const handleSubmit = (settings) => {
        const processedResult = processText(inputText, settings);
        setInputText(processedResult);
    };

    const handleTextChange = (newText) => {
        setInputText(newText);
    };

    return (
<>

        <div>
            <TextCard text={inputText} onTextChange={handleTextChange} />
            <SettingCard onSubmit={handleSubmit} />
        </div>
    
</>
);
};

export default App;
