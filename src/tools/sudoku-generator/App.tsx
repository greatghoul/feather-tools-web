import { useState, useEffect } from 'react';

import SettingsCard from './components/SettingsCard';
import PreviewPanel from './components/PreviewPanel';
import SudokuGenerator from './services/SudokuGenerator';
import SudokuRenderer from './services/SudokuRenderer';

const SudokuGeneratorApp = () => {
    const [difficulty, setDifficulty] = useState('easy');
    const [perRow, setPerRow] = useState(3);
    const [isGenerating, setIsGenerating] = useState(false);
    const [puzzles, setPuzzles] = useState<any[]>([]);

    const generate = () => {
        setIsGenerating(true);
        // Yield to the event loop so the button state updates before the
        // potentially expensive generation runs.
        setTimeout(() => {
            const layout = SudokuRenderer.computeLayout(perRow);
            const items = SudokuGenerator.generateSet(difficulty, layout.count);
            setPuzzles(items);
            setIsGenerating(false);
        }, 30);
    };

    useEffect(() => {
        generate();
    }, []);

    return (
<>

        <div className="row">
            <div className="col-md-4">
                <SettingsCard difficulty={difficulty} perRow={perRow} isGenerating={isGenerating} onDifficultyChange={setDifficulty} onPerRowChange={setPerRow} onGenerate={generate} />
            </div>
            <div className="col-md-8">
                <PreviewPanel puzzles={puzzles} perRow={perRow} />
            </div>
        </div>
    
</>
);
};

export default SudokuGeneratorApp;
