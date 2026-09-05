import { useState, useCallback } from 'react';
import InputCard from './components/InputCard';
import SettingsCard from './components/SettingsCard';
import OutputCard from './components/OutputCard';
import { generateBubble } from './services/BubbleService';

const App = () => {
    const [inputText, setInputText] = useState('');
    const [arrow, setArrow] = useState('none');
    const [outputs, setOutputs] = useState({ rounded: '', double: '', bold: '' });

    const handleGenerate = useCallback(() => {
        setOutputs({
            rounded: generateBubble(inputText, 'rounded', arrow),
            double: generateBubble(inputText, 'double', arrow),
            bold: generateBubble(inputText, 'bold', arrow),
        });
    }, [inputText, arrow]);

    const handleClear = useCallback(() => {
        setInputText('');
        setOutputs({ rounded: '', double: '', bold: '' });
    }, []);

    const handleLoadExample = useCallback(() => {
        setInputText('Hello, world!\nThis is a text bubble!');
    }, []);

    return (
<>

        <div className="row row-gap-4 mb-4">
            <div className="col-lg-5">
                <div className="d-flex flex-column gap-4">
                    <InputCard text={inputText} onTextChange={setInputText} onClear={handleClear} onLoadExample={handleLoadExample} />
                    <SettingsCard arrow={arrow} onArrowChange={setArrow} onGenerate={handleGenerate} />
                </div>
            </div>
            <div className="col-lg-7">
                <OutputCard outputs={outputs} />
            </div>
        </div>
    
</>
);
};

export default App;
