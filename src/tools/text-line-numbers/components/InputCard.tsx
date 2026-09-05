import { useState } from 'react';
import { t } from '~/helpers/i18n';

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
        reader.onload = (e) => onOpenFile((e.target as FileReader).result);
        reader.readAsText(file);
        
        // 重置文件输入
        e.target.value = '';
    };

    const handleOpenFileClick = () => {
        document.getElementById('file-upload')!.click();
    };

    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('text-line-numbers/input/title')}</span>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-info" onClick={handleOpenFileClick}>
                        <i className="bi bi-folder2-open"></i> {t('text-line-numbers/button/upload')}
                    </button>
                    <input type="file" id="file-upload" className="d-none" accept=".txt,text/plain" onChange={handleFileChange} />
                    <button className="btn btn-sm btn-outline-info" onClick={onLoadExample}>
                        <i className="bi bi-file-earmark-text"></i> {t('text-line-numbers/button/example')}
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={onClear}>
                        <i className="bi bi-x-circle"></i> {t('text-line-numbers/button/clear')}
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                <textarea className="form-control border-0" style={{ minHeight: '200px', resize: 'vertical', whiteSpace: 'nowrap', overflowX: 'auto' }} placeholder={t('text-line-numbers/input/placeholder')} value={text} onInput={(e) => onTextChange((e.target as HTMLInputElement).value)}></textarea>
            </div>
            <div className="card-footer bg-light">
                {/* 第一行：行号类型 + 生成按钮 */}
                <div className="row g-3 mb-3">
                    <div className="col-md-9">
                        <label className="form-label small mb-1">
                            {t('text-line-numbers/options/line_type')}
                        </label>
                        <div className="d-flex gap-3">
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="lineType" id="type-number" value="number" checked={options.type === 'number'} onChange={(e) => updateOption('type', e.target.value)} />
                                <label className="form-check-label small" htmlFor="type-number">
                                    {t('text-line-numbers/options/number')}
                                </label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="lineType" id="type-letter" value="letter" checked={options.type === 'letter'} onChange={(e) => updateOption('type', e.target.value)} />
                                <label className="form-check-label small" htmlFor="type-letter">
                                    {t('text-line-numbers/options/letter')}
                                </label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="lineType" id="type-roman" value="roman" checked={options.type === 'roman'} onChange={(e) => updateOption('type', e.target.value)} />
                                <label className="form-check-label small" htmlFor="type-roman">
                                    {t('text-line-numbers/options/roman')}
                                </label>
                            </div>
                            {(options.type === 'letter' || options.type === 'roman') && (
<>

                                <div className="form-check form-switch ms-3">
                                    <input className="form-check-input" type="checkbox" role="switch" id="uppercase-switch" checked={options.uppercase} onChange={(e) => updateOption('uppercase', e.target.checked)} />
                                    <label className="form-check-label small" htmlFor="uppercase-switch">
                                        {t('text-line-numbers/options/uppercase')}
                                    </label>
                                </div>
                            
</>
)}
                        </div>
                    </div>
                    <div className="col-md-3 d-flex align-items-end">
                         <button className="btn btn-primary w-100" onClick={onGenerate}>
                             {t('text-line-numbers/button/generate')}
                         </button>
                    </div>
                </div>
                
                <div className="mt-3">
                    <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => setShowAdvanced(!showAdvanced)} style={{ borderStyle: 'dashed' }}>
                        {showAdvanced ? '▲' : '▼'} {t('text-line-numbers/options/advanced_settings')}
                    </button>
                </div>
                
                {showAdvanced && (
<>

                <div className="row g-3 mt-2">
                    <div className="col-6 col-md-3">
                        <label className="form-label small mb-1">
                            {t('text-line-numbers/options/prefix')}
                        </label>
                        <input type="text" className="form-control form-control-sm" value={options.prefix} onInput={(e) => updateOption('prefix', (e.target as HTMLInputElement).value)} placeholder="" />
                    </div>
                    <div className="col-6 col-md-3">
                        <label className="form-label small mb-1">
                            {t('text-line-numbers/options/suffix')}
                        </label>
                        <input type="text" className="form-control form-control-sm" value={options.suffix} onInput={(e) => updateOption('suffix', (e.target as HTMLInputElement).value)} placeholder="" />
                    </div>
                    <div className="col-6 col-md-3">
                        <label className="form-label small mb-1">
                            {t('text-line-numbers/options/start')}
                        </label>
                        <input type="number" className="form-control form-control-sm" value={options.start} onInput={(e) => updateOption('start', parseInt((e.target as HTMLInputElement).value) || 1)} min="1" />
                    </div>
                    <div className="col-6 col-md-3">
                        <label className="form-label small mb-1">
                            {t('text-line-numbers/options/step')}
                        </label>
                        <input type="number" className="form-control form-control-sm" value={options.step} onInput={(e) => updateOption('step', parseInt((e.target as HTMLInputElement).value) || 1)} min="1" />
                    </div>
                </div>
                
                {/* 第三行：额外开关 */}
                <div className="row g-3 mt-2">
                    <div className="col-6 col-md-3">
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" role="switch" id="reverse-switch" checked={options.reverse} onChange={(e) => updateOption('reverse', e.target.checked)} />
                            <label className="form-check-label small" htmlFor="reverse-switch">
                                {t('text-line-numbers/options/reverse')}
                            </label>
                        </div>
                    </div>
                    
                    <div className="col-6 col-md-3">
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" role="switch" id="skip-empty-switch" checked={options.skipEmpty} onChange={(e) => updateOption('skipEmpty', e.target.checked)} />
                            <label className="form-check-label small" htmlFor="skip-empty-switch">
                                {t('text-line-numbers/options/skip_empty')}
                            </label>
                        </div>
                    </div>
                    
                    {options.type === 'number' && (
<>

                        <div className="col-6 col-md-3">
                            <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" role="switch" id="padding-switch" checked={options.padding > 0} onChange={(e) => handlePaddingToggle(e.target.checked)} />
                                <label className="form-check-label small" htmlFor="padding-switch">
                                    {t('text-line-numbers/options/padding')}
                                </label>
                            </div>
                        </div>
                    
</>
)}
                    {options.padding > 0 && (
<>

                        <div className="col-6 col-md-3">
                            <select className="form-select form-select-sm" value={options.padding} onChange={(e) => updateOption('padding', parseInt(e.target.value))}>
                                {[1, 2, 3, 4, 5, 6].map(d => (
<>

                                    <option value={d} disabled={d < minPadding}>{d}位</option>
                                
</>
))}
                            </select>
                        </div>
                    
</>
)}
                </div>
                
</>
)}
            </div>
        </div>
    
</>
);
};

export default InputCard;
