import { useState } from 'react';
import InputCard from './components/InputCard';
import SettingsCard from './components/SettingsCard';
import OutputCard from './components/OutputCard';
import { xTextSplitter } from './services/XTextSplitter';

const EXAMPLE_EN = `In the beginning God created the heaven and the earth. And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.

And God said, Let there be light: and there was light. And God saw the light, that it was good: and God divided the light from the darkness. And God called the light Day, and the darkness he called Night.

And the evening and the morning were the first day. And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters. And God made the firmament, and it was so.`;

const EXAMPLE_ZH = `话说东胜神洲傲来国海中有一座花果山，山上有一块仙石。那仙石自开天辟地以来，受天真地秀，日精月华，内育仙胞。一日迸裂，产一石卵，化作一个石猴，五官俱备，四肢皆全。

那石猴在山中，却会行走跳跃，食草木，饮涧泉，采山花，觅树果。与狼虫为伴，虎豹为群，獐鹿为友，猕猿为亲。夜宿石崖之下，朝游峰洞之中，真是山中无甲子，寒尽不知年。

一朝天气炎热，与群猴避暑，都在松阴之下顽耍。一群猴子耍了一会，却去那山涧中洗澡。见那股涧水奔流，众猴都道：今日且赶闹顽耍，明日再来。遂一齐奔去，顺涧爬山，直至源流之处。`;

const App = () => {
    const [inputText, setInputText] = useState('');
    const [segments, setSegments] = useState<any[]>([]);
    const [charLimit, setCharLimit] = useState('280');
    const [customLimit, setCustomLimit] = useState(280);
    const [splitMode, setSplitMode] = useState('paragraph');
    const [numberingFormat, setNumberingFormat] = useState('prefix');
    const [numberingBreak, setNumberingBreak] = useState('none');

    const effectiveLimit = charLimit === 'custom'
        ? (customLimit || 280)
        : parseInt(charLimit);

    const handleClear = () => {
        setInputText('');
        setSegments([]);
    };

    const handleLoadExample = () => {
        const example = window.LOCALE === 'zh' ? EXAMPLE_ZH : EXAMPLE_EN;
        setInputText(example);
        setSegments([]);
    };

    const handleSplit = () => {
        if (!inputText.trim()) {
            setSegments([]);
            return;
        }
        const result = xTextSplitter.split(
            inputText,
            effectiveLimit,
            splitMode,
            numberingFormat,
            numberingBreak
        );
        setSegments(result);
    };

    return (
<>

        <div className="long-post-splitter-container">
            <div className="row g-4">
                <div className="col-12">
                    <InputCard text={inputText} onTextChange={setInputText} onClear={handleClear} onLoadExample={handleLoadExample} />
                </div>
                <div className="col-12">
                    <SettingsCard text={inputText} onSplit={handleSplit} charLimit={charLimit} setCharLimit={setCharLimit} customLimit={customLimit} setCustomLimit={setCustomLimit} splitMode={splitMode} setSplitMode={setSplitMode} numberingFormat={numberingFormat} setNumberingFormat={setNumberingFormat} numberingBreak={numberingBreak} setNumberingBreak={setNumberingBreak} segments={segments} />
                </div>
                {segments.length > 0 ? (
<>

                    <div className="col-12">
                        <OutputCard segments={segments} limit={effectiveLimit} />
                    </div>
                
</>
) : null}
            </div>
        </div>
    
</>
);
};

export default App;
