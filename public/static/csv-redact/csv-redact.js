import { render } from 'preact';
import { html } from 'htm/preact';
import { useState, useMemo, useEffect, useRef } from 'preact/hooks';
import InputCard from '@/components/InputCard.js';
import RulesCard from '@/components/RulesCard.js';
import OutputCard from '@/components/OutputCard.js';
import MaskService from '@/services/MaskService.js';

let ruleIdCounter = 0;
const nextRuleId = () => ++ruleIdCounter;

const App = () => {
    const [inputText, setInputText] = useState('');
    const [delimiter, setDelimiter] = useState(',');
    const [customDelimiter, setCustomDelimiter] = useState('');
    const [includeHeader, setIncludeHeader] = useState(true);
    const [inputViewMode, setInputViewMode] = useState('table');
    const [outputViewMode, setOutputViewMode] = useState('table');
    const [rules, setRules] = useState([]);
    const [committed, setCommitted] = useState({ headers: [], rows: [] });
    const [isRedacting, setIsRedacting] = useState(false);
    const redactingRef = useRef(false);

    const resolveDelimiter = () => {
        if (delimiter === 'custom') return customDelimiter || ',';
        return delimiter;
    };

    const sep = resolveDelimiter();

    const parsedData = useMemo(() => {
        if (!inputText.trim()) return { headers: [], rows: [], columns: 0 };
        return MaskService.parse(inputText, sep, includeHeader);
    }, [inputText, sep, includeHeader]);

    const isLarge = parsedData.rows.length > 50;
    const hasData = parsedData.headers.length > 0 || parsedData.rows.length > 0;

    useEffect(() => {
        if (!hasData || isLarge) {
            setCommitted({ headers: [], rows: [] });
            return;
        }
        setCommitted(MaskService.mask(parsedData, rules));
    }, [parsedData, rules, isLarge, hasData]);

    const maskedColumnIndices = useMemo(
        () => [...new Set(rules.map((r) => r.column - 1))].sort((a, b) => a - b),
        [rules]
    );

    const handleClear = () => {
        setInputText('');
        setRules([]);
        setCommitted({ headers: [], rows: [] });
    };

    const handleRedact = async () => {
        if (!hasData || redactingRef.current) return;
        redactingRef.current = true;
        setIsRedacting(true);
        await new Promise((r) => setTimeout(r));
        setCommitted(MaskService.mask(parsedData, rules));
        setIsRedacting(false);
        redactingRef.current = false;
    };

    const handleLoadExample = () => {
        const isChinese = window.LOCALE === 'zh';
        const exampleText = isChinese
            ? [
                '姓名,手机号,城市,身份证号,邮箱',
                '张三,13800138000,北京,110101199001011234,zhangsan@example.com',
                '李四,13900139000,上海,310101198507152345,lisi@example.com',
                '王五,13700137000,广州,440101199203033456,wangwu@example.com',
                '赵六,13600136000,深圳,330101198811240789,zhaoliu@example.com',
            ].join('\n')
            : [
                'Name,Phone,City,ID Card,Email',
                'John Doe,(555) 123-4567,New York,1234567890123456,john.doe@example.com',
                'Jane Smith,(555) 987-6543,London,2345678901234567,jane.smith@example.com',
                'Bob Johnson,(555) 555-5555,Tokyo,3456789012345678,bob@example.com',
                'Alice Wang,(555) 321-7654,Paris,4567890123456789,alice.wang@example.com',
            ].join('\n');
        setInputText(exampleText);
        setDelimiter(',');
        setIncludeHeader(true);
        setRules([
            { id: nextRuleId(), column: 2, scheme: 'phone', param: 0 },
            { id: nextRuleId(), column: 4, scheme: 'id_card', param: 0 },
            { id: nextRuleId(), column: 5, scheme: 'email', param: 0 },
        ]);
    };

    return html`
        <div class="csv-redact-container">
            <div class="row g-4">
                <div class="col-12">
                    <${InputCard}
                        text=${inputText}
                        onTextChange=${setInputText}
                        onClear=${handleClear}
                        onLoadExample=${handleLoadExample}
                        delimiter=${delimiter}
                        setDelimiter=${setDelimiter}
                        customDelimiter=${customDelimiter}
                        setCustomDelimiter=${setCustomDelimiter}
                        includeHeader=${includeHeader}
                        setIncludeHeader=${setIncludeHeader}
                        inputViewMode=${inputViewMode}
                        setInputViewMode=${setInputViewMode}
                        parsedData=${parsedData}
                        maskedColumnIndices=${maskedColumnIndices}
                    />
                </div>
                <div class="col-12">
                    <${RulesCard}
                        rules=${rules}
                        setRules=${setRules}
                        columns=${parsedData.columns}
                        headers=${parsedData.headers}
                        nextRuleId=${nextRuleId}
                        onRedact=${handleRedact}
                        isLarge=${isLarge}
                        isRedacting=${isRedacting}
                    />
                </div>
                <div class="col-12">
                    <${OutputCard}
                        headers=${committed.headers}
                        rows=${committed.rows}
                        outputViewMode=${outputViewMode}
                        setOutputViewMode=${setOutputViewMode}
                        delimiter=${sep}
                        ruleCount=${rules.length}
                        isLarge=${isLarge}
                    />
                </div>
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
