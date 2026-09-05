import { render } from 'preact';
import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import InputCard from '@/components/InputCard.js';
import OutputCard from '@/components/OutputCard.js';

const App = () => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [sortBy, setSortBy] = useState('alphabetically');
    const [sortOrder, setSortOrder] = useState('ascending');

    const handleClear = () => {
        setInputText('');
        setOutputText('');
    };

    const handleLoadExample = () => {
        let exampleText = '';
        if (sortBy === 'alphabetically') {
            exampleText = 'The quick brown fox jumps over the lazy dog\nA journey of a thousand miles begins with a single step\nTo be or not to be, that is the question\nAll that glitters is not gold\nWhere there is a will, there is a way\nActions speak louder than words';
        } else {
            exampleText = 'Chapter 10: The Final Battle\nChapter 2: The Beginning\nChapter 1: Introduction\nChapter 25: Epilogue\nChapter 7: The Twist\nChapter 15: The Revelation';
        }
        setInputText(exampleText);
        setOutputText('');
    };

    const handleSort = () => {
        if (!inputText.trim()) {
            setOutputText('');
            return;
        }

        const lines = inputText.split('\n');
        let sortedLines = [...lines];

        if (sortBy === 'alphabetically') {
            sortedLines.sort((a, b) => a.localeCompare(b));
        } else if (sortBy === 'numerically') {
            sortedLines.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        }

        if (sortOrder === 'descending') {
            sortedLines.reverse();
        }

        setOutputText(sortedLines.join('\n'));
    };

    return html`
        <div class="text-sort-container">
            <div class="row g-4">
                <div class="col-12">
                    <${InputCard}
                        text=${inputText}
                        onTextChange=${setInputText}
                        onClear=${handleClear}
                        onLoadExample=${handleLoadExample}
                        onSort=${handleSort}
                        sortBy=${sortBy}
                        setSortBy=${setSortBy}
                        sortOrder=${sortOrder}
                        setSortOrder=${setSortOrder}
                    />
                </div>
                <div class="col-12">
                    <${OutputCard} text=${outputText} />
                </div>
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
