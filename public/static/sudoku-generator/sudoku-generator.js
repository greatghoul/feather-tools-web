import { html } from 'htm/preact';
import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';

import SettingsCard from '@/components/SettingsCard.js';
import PreviewPanel from '@/components/PreviewPanel.js';
import SudokuGenerator from '@/services/SudokuGenerator.js';
import SudokuRenderer from '@/services/SudokuRenderer.js';

const SudokuGeneratorApp = () => {
    const [difficulty, setDifficulty] = useState('easy');
    const [perRow, setPerRow] = useState(3);
    const [isGenerating, setIsGenerating] = useState(false);
    const [puzzles, setPuzzles] = useState([]);

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

    return html`
        <div class="row">
            <div class="col-md-4">
                <${SettingsCard}
                    difficulty=${difficulty}
                    perRow=${perRow}
                    isGenerating=${isGenerating}
                    onDifficultyChange=${setDifficulty}
                    onPerRowChange=${setPerRow}
                    onGenerate=${generate}
                />
            </div>
            <div class="col-md-8">
                <${PreviewPanel}
                    puzzles=${puzzles}
                    perRow=${perRow}
                />
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${SudokuGeneratorApp} />`, document.getElementById('app'));
});
