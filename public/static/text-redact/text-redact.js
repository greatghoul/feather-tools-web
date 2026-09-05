import { render } from 'preact';
import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import InputCard from '@/components/InputCard.js';
import OutputCard from '@/components/OutputCard.js';
import RedactService from '@/services/RedactService.js';

const App = () => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [stats, setStats] = useState(null);
    const [options, setOptions] = useState({
        email: true,
        phone: true,
        idCard: true,
        url: false,
        ip: false,
        enableCustom: false,
        customPattern: '',
        replacement: 'asterisk',
    });

    const updateOption = (key, value) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
    };

    const handleClear = () => {
        setInputText('');
        setOutputText('');
        setStats(null);
    };

    const handleLoadExample = () => {
        const isChinese = window.LOCALE === 'zh';
        const exampleText = isChinese
            ? [
                '联系人: 张三, 邮箱: zhangsan@example.com, 电话: 13800138000',
                '身份证号: 110101199001011234, 住址: 北京市朝阳区建国路88号',
                '如需帮助请联系客服: support@feather-tools.com 或拨打 010-88886666',
                '我的IP地址是 192.168.1.1, 个人网站是 https://zhangsan.me',
            ].join('\n')
            : [
                'Contact: John Doe, Email: john.doe@example.com, Phone: (555) 123-4567',
                'SSN: 123-45-6789, Credit Card: 4111-1111-1111-1111',
                'For support, email help@feather-tools.com or call +1-800-555-0199',
                'My IP is 192.168.1.1 and my website is https://johndoe.me',
            ].join('\n');
        setInputText(exampleText);
        setOutputText('');
        setStats(null);
    };

    const handleRedact = () => {
        if (!inputText.trim()) {
            setOutputText('');
            setStats(null);
            return;
        }

        const result = RedactService.redact(inputText, options);
        setOutputText(result.text);
        setStats(result.stats);
    };

    return html`
        <div class="text-redact-container">
            <div class="row g-4">
                <div class="col-12">
                    <${InputCard}
                        text=${inputText}
                        onTextChange=${setInputText}
                        onClear=${handleClear}
                        onLoadExample=${handleLoadExample}
                        onRedact=${handleRedact}
                        options=${options}
                        onOptionChange=${updateOption}
                    />
                </div>
                <div class="col-12">
                    <${OutputCard}
                        text=${outputText}
                        stats=${stats}
                    />
                </div>
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
