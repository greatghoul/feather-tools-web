import { render } from 'preact';
import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import InputCard from '@/components/InputCard.js';
import OutputCard from '@/components/OutputCard.js';
import TruncateService from '@/services/TruncateService.js';

const App = () => {
    const [inputText, setInputText] = useState('');
    const [outputLines, setOutputLines] = useState([]);
    const [maxLength, setMaxLength] = useState(40);
    const [ellipsis, setEllipsis] = useState('...');

    const handleClear = () => {
        setInputText('');
        setOutputLines([]);
    };

    const handleLoadExample = () => {
        const isChinese = window.LOCALE === 'zh';
        const exampleText = isChinese
            ? [
                '敏捷的棕色狐狸跳过了懒狗',
                '千里之行始于足下，这是一句古老的中国谚语',
                '生存还是毁灭，这是一个值得思考的问题',
                '闪光的不一定都是金子，这是一个常见的误解，很多人都明白这个道理，但真正能做到的人却很少',
                '有志者事竟成，这句话激励了无数人奋勇前行，成为他们人生的座右铭，鼓舞着一代又一代人',
                '事实胜于雄辩'
            ].join('\n')
            : [
                'The quick brown fox jumps over the lazy dog',
                'A journey of a thousand miles begins with a single step',
                'To be or not to be, that is the question',
                'All that glitters is not gold',
                'Where there is a will, there is a way',
                'Actions speak louder than words'
            ].join('\n');
        setInputText(exampleText);
        setOutputLines([]);
    };

    const handleTruncate = () => {
        if (!inputText.trim()) {
            setOutputLines([]);
            return;
        }

        const lines = inputText.split('\n');
        const result = TruncateService.truncateLines(lines, maxLength, ellipsis);
        setOutputLines(result);
    };

    return html`
        <div class="text-truncate-container">
            <div class="row g-4">
                <div class="col-12">
                    <${InputCard}
                        text=${inputText}
                        onTextChange=${setInputText}
                        onClear=${handleClear}
                        onLoadExample=${handleLoadExample}
                        onTruncate=${handleTruncate}
                        maxLength=${maxLength}
                        setMaxLength=${setMaxLength}
                        ellipsis=${ellipsis}
                        setEllipsis=${setEllipsis}
                    />
                </div>
                <div class="col-12">
                    <${OutputCard} lines=${outputLines} />
                </div>
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
