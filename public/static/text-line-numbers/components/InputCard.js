import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

const InputCard = ({ 
    text, onTextChange, onClear, onLoadExample, onGenerate, 
    onOpenFile, options, updateOption
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    
    // 根据文本行数计算最小补零位数
    const getMinPadding = (textContent, opts) => {
        const lines = textContent.split('\n');
        const totalLines = opts.skipEmpty
            ? lines.filter(l => l.trim() !== '').length
            : lines.length;
        if (totalLines <= 0) return 1;
        const lastNumber = opts.start + (totalLines - 1) * opts.step;
        return Math.max(1, Math.ceil(Math.log10(lastNumber + 1)));
    };

    const minPadding = getMinPadding(text, options);

    const handlePaddingToggle = (checked) => {
        if (checked) {
            updateOption('padding', minPadding);
        } else {
            updateOption('padding', 0);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // 验证文件类型
        if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
            alert('Please open a .txt file');
            return;
        }
        
        // 验证文件大小 (限制为10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size should be less than 10MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => onOpenFile(e.target.result);
        reader.readAsText(file);
        
        // 重置文件输入
        e.target.value = '';
    };

    const handleOpenFileClick = () => {
        document.getElementById('file-upload').click();
    };

    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span>${getText('text-line-numbers/input/title')}</span>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-info" onClick=${handleOpenFileClick}>
                        <i class="bi bi-folder2-open"></i> ${getText('text-line-numbers/button/upload')}
                    </button>
                    <input type="file" id="file-upload" class="d-none" 
                           accept=".txt,text/plain" 
                           onChange=${handleFileChange} />
                    <button class="btn btn-sm btn-outline-info" onClick=${onLoadExample}>
                        <i class="bi bi-file-earmark-text"></i> ${getText('text-line-numbers/button/example')}
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onClick=${onClear}>
                        <i class="bi bi-x-circle"></i> ${getText('text-line-numbers/button/clear')}
                    </button>
                </div>
            </div>
            <div class="card-body p-0">
                <textarea
                    class="form-control border-0"
                    style="min-height: 200px; resize: vertical; white-space: nowrap; overflow-x: auto;"
                    placeholder=${getText('text-line-numbers/input/placeholder')}
                    value=${text}
                    onInput=${(e) => onTextChange(e.target.value)}
                ></textarea>
            </div>
            <div class="card-footer bg-light">
                <!-- 第一行：行号类型 + 生成按钮 -->
                <div class="row g-3 mb-3">
                    <div class="col-md-9">
                        <label class="form-label small mb-1">
                            ${getText('text-line-numbers/options/line_type')}
                        </label>
                        <div class="d-flex gap-3">
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="lineType" id="type-number"
                                       value="number" checked=${options.type === 'number'}
                                       onChange=${(e) => updateOption('type', e.target.value)} />
                                <label class="form-check-label small" for="type-number">
                                    ${getText('text-line-numbers/options/number')}
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="lineType" id="type-letter"
                                       value="letter" checked=${options.type === 'letter'}
                                       onChange=${(e) => updateOption('type', e.target.value)} />
                                <label class="form-check-label small" for="type-letter">
                                    ${getText('text-line-numbers/options/letter')}
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="lineType" id="type-roman"
                                       value="roman" checked=${options.type === 'roman'}
                                       onChange=${(e) => updateOption('type', e.target.value)} />
                                <label class="form-check-label small" for="type-roman">
                                    ${getText('text-line-numbers/options/roman')}
                                </label>
                            </div>
                            ${(options.type === 'letter' || options.type === 'roman') && html`
                                <div class="form-check form-switch ms-3">
                                    <input class="form-check-input" type="checkbox" role="switch"
                                           id="uppercase-switch"
                                           checked=${options.uppercase}
                                           onChange=${(e) => updateOption('uppercase', e.target.checked)} />
                                    <label class="form-check-label small" for="uppercase-switch">
                                        ${getText('text-line-numbers/options/uppercase')}
                                    </label>
                                </div>
                            `}
                        </div>
                    </div>
                    <div class="col-md-3 d-flex align-items-end">
                         <button class="btn btn-primary w-100" onClick=${onGenerate}>
                             ${getText('text-line-numbers/button/generate')}
                         </button>
                    </div>
                </div>
                
                <div class="mt-3">
                    <button class="btn btn-sm btn-outline-secondary w-100" 
                            onClick=${() => setShowAdvanced(!showAdvanced)}
                            style="border-style: dashed;">
                        ${showAdvanced ? '▲' : '▼'} ${getText('text-line-numbers/options/advanced_settings')}
                    </button>
                </div>
                
                ${showAdvanced && html`
                <div class="row g-3 mt-2">
                    <div class="col-6 col-md-3">
                        <label class="form-label small mb-1">
                            ${getText('text-line-numbers/options/prefix')}
                        </label>
                        <input type="text" class="form-control form-control-sm" 
                               value=${options.prefix}
                               onInput=${(e) => updateOption('prefix', e.target.value)}
                               placeholder="" />
                    </div>
                    <div class="col-6 col-md-3">
                        <label class="form-label small mb-1">
                            ${getText('text-line-numbers/options/suffix')}
                        </label>
                        <input type="text" class="form-control form-control-sm" 
                               value=${options.suffix}
                               onInput=${(e) => updateOption('suffix', e.target.value)}
                               placeholder="" />
                    </div>
                    <div class="col-6 col-md-3">
                        <label class="form-label small mb-1">
                            ${getText('text-line-numbers/options/start')}
                        </label>
                        <input type="number" class="form-control form-control-sm" 
                               value=${options.start}
                               onInput=${(e) => updateOption('start', parseInt(e.target.value) || 1)}
                               min="1" />
                    </div>
                    <div class="col-6 col-md-3">
                        <label class="form-label small mb-1">
                            ${getText('text-line-numbers/options/step')}
                        </label>
                        <input type="number" class="form-control form-control-sm" 
                               value=${options.step}
                               onInput=${(e) => updateOption('step', parseInt(e.target.value) || 1)}
                               min="1" />
                    </div>
                </div>
                
                <!-- 第三行：额外开关 -->
                <div class="row g-3 mt-2">
                    <div class="col-6 col-md-3">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" 
                                   id="reverse-switch" 
                                   checked=${options.reverse}
                                   onChange=${(e) => updateOption('reverse', e.target.checked)} />
                            <label class="form-check-label small" for="reverse-switch">
                                ${getText('text-line-numbers/options/reverse')}
                            </label>
                        </div>
                    </div>
                    
                    <div class="col-6 col-md-3">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" 
                                   id="skip-empty-switch" 
                                   checked=${options.skipEmpty}
                                   onChange=${(e) => updateOption('skipEmpty', e.target.checked)} />
                            <label class="form-check-label small" for="skip-empty-switch">
                                ${getText('text-line-numbers/options/skip_empty')}
                            </label>
                        </div>
                    </div>
                    
                    ${options.type === 'number' && html`
                        <div class="col-6 col-md-3">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" role="switch" 
                                       id="padding-switch" 
                                       checked=${options.padding > 0}
                                       onChange=${(e) => handlePaddingToggle(e.target.checked)} />
                                <label class="form-check-label small" for="padding-switch">
                                    ${getText('text-line-numbers/options/padding')}
                                </label>
                            </div>
                        </div>
                    `}
                    ${options.padding > 0 && html`
                        <div class="col-6 col-md-3">
                            <select class="form-select form-select-sm" 
                                    value=${options.padding}
                                    onChange=${(e) => updateOption('padding', parseInt(e.target.value))}>
                                ${[1, 2, 3, 4, 5, 6].map(d => html`
                                    <option value=${d} disabled=${d < minPadding}>${d}位</option>
                                `)}
                            </select>
                        </div>
                    `}
                </div>
                `}
            </div>
        </div>
    `;
};

export default InputCard;