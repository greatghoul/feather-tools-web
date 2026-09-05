import { render } from 'preact';
import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import InputCard from '@/components/InputCard.js';
import OutputCard from '@/components/OutputCard.js';
import ExtractService from '@/services/ExtractService.js';

const App = () => {
    const [inputText, setInputText] = useState('');
    const [groups, setGroups] = useState(null);
    const [total, setTotal] = useState(0);
    const [options, setOptions] = useState({
        email: true,
        phone: true,
        idCard: true,
        url: true,
        ip: false,
        enableCustom: false,
        customPattern: '',
    });

    const updateOption = (key, value) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
    };

    const handleClear = () => {
        setInputText('');
        setGroups(null);
        setTotal(0);
    };

    const handleLoadExample = () => {
        const isChinese = window.LOCALE === 'zh';
        const exampleText = isChinese
            ? [
                '联系人信息:',
                '张三, 邮箱: zhangsan@example.com, 电话: 13800138000',
                '李四, 邮箱: lisi@company.cn, 电话: 13912345678',
                '公司网站: https://www.feather-tools.com',
                '技术支持: support@feather-tools.com',
                '服务器 IP: 192.168.1.100, 备用 IP: 10.0.0.1',
                '身份证信息: 110101199001011234',
                '官网: https://example.com/about',
            ].join('\n')
            : [
                'Contact Information:',
                'John Doe, Email: john.doe@example.com, Phone: (555) 123-4567',
                'Jane Smith, Email: jane.smith@company.com, Phone: +1-800-555-0199',
                'Website: https://www.feather-tools.com',
                'Support: help@feather-tools.com',
                'Server IP: 192.168.1.100, Backup IP: 10.0.0.1',
                'ID: 123-45-6789',
                'Blog: https://example.com/blog',
            ].join('\n');
        setInputText(exampleText);
        setGroups(null);
        setTotal(0);
    };

    const handleExtract = () => {
        if (!inputText.trim()) {
            setGroups(null);
            setTotal(0);
            return;
        }

        const result = ExtractService.extract(inputText, options);
        setGroups(result.groups);
        setTotal(result.total);
    };

    return html`
        <div class="text-extract-container">
            <div class="row g-4">
                <div class="col-12">
                    <${InputCard}
                        text=${inputText}
                        onTextChange=${setInputText}
                        onClear=${handleClear}
                        onLoadExample=${handleLoadExample}
                        onExtract=${handleExtract}
                        options=${options}
                        onOptionChange=${updateOption}
                    />
                </div>
                <div class="col-12">
                    <${OutputCard}
                        groups=${groups}
                        total=${total}
                    />
                </div>
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
