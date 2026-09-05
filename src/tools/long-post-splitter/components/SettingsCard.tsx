import { useMemo } from 'react';
import { t } from '~/helpers/i18n';
import { xTextSplitter } from '../services/XTextSplitter';

const SettingsCard = ({
    text,
    onSplit,
    charLimit,
    setCharLimit,
    customLimit,
    setCustomLimit,
    splitMode,
    setSplitMode,
    numberingFormat,
    setNumberingFormat,
    numberingBreak,
    setNumberingBreak,
    segments,
}) => {
    const charInfo = useMemo(() => {
        return xTextSplitter.countChars(text);
    }, [text]);

    const effectiveLimit = charLimit === 'custom'
        ? (customLimit || 280)
        : parseInt(charLimit);

    const estimatedSegments = useMemo(() => {
        if (!text.trim() || effectiveLimit <= 0) return 0;
        return Math.max(1, Math.ceil(charInfo.weighted / effectiveLimit));
    }, [charInfo.weighted, effectiveLimit, text]);

    const overLimit = charInfo.weighted > effectiveLimit;

    return (
<>

        <div className="card">
            <div className="card-header bg-light">
                <span>{t('long-post-splitter/settings/title')}</span>
            </div>
            <div className="card-body">
                <div className="row g-3">
                    <div className="col-md-3">
                        <label className="form-label small mb-1">{t('long-post-splitter/options/limit')}</label>
                        <select className="form-select form-select-sm" value={charLimit} onChange={(e) => setCharLimit(e.target.value)}>
                            <option value="280">280 - {t('long-post-splitter/options/limit_x_post')}</option>
                            <option value="custom">{t('long-post-splitter/options/limit_custom')}</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small mb-1">{t('long-post-splitter/options/split_mode')}</label>
                        <select className="form-select form-select-sm" value={splitMode} onChange={(e) => setSplitMode(e.target.value)}>
                            <option value="paragraph">{t('long-post-splitter/options/split_paragraph')}</option>
                            <option value="sentence">{t('long-post-splitter/options/split_sentence')}</option>
                            <option value="word">{t('long-post-splitter/options/split_word')}</option>
                            <option value="char">{t('long-post-splitter/options/split_char')}</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small mb-1">{t('long-post-splitter/options/numbering_format')}</label>
                        <select className="form-select form-select-sm" value={numberingFormat} onChange={(e) => setNumberingFormat(e.target.value)}>
                            <option value="none">{t('long-post-splitter/options/numbering_none')}</option>
                            <option value="prefix">{t('long-post-splitter/options/numbering_prefix')}</option>
                            <option value="paren">{t('long-post-splitter/options/numbering_paren')}</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small mb-1">{t('long-post-splitter/options/numbering_break')}</label>
                        <select className="form-select form-select-sm" value={numberingBreak} onChange={(e) => setNumberingBreak(e.target.value)} disabled={numberingFormat === 'none'}>
                            <option value="none">{t('long-post-splitter/options/numbering_break_none')}</option>
                            <option value="break">{t('long-post-splitter/options/numbering_break_newline')}</option>
                            <option value="break-blank">{t('long-post-splitter/options/numbering_break_blank')}</option>
                        </select>
                    </div>
                    {charLimit === 'custom' ? (
<>

                        <div className="col-md-3">
                            <label className="form-label small mb-1">{t('long-post-splitter/options/custom_limit')}</label>
                            <input type="number" className="form-control form-control-sm" min="10" max="25000" value={customLimit} onInput={(e) => setCustomLimit(parseInt((e.target as HTMLInputElement).value) || 0)} />
                        </div>
                    
</>
) : null}
                </div>
            </div>
            <div className="card-footer bg-light">
                <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center gap-2">
                    <div className="row g-2 text-muted small">
                        <div className="col-6 col-md-auto">
                            {t('long-post-splitter/stats/weighted')}:
                            <span className={overLimit ? 'text-danger ms-1' : 'text-success ms-1'}>{charInfo.weighted}</span>/{effectiveLimit}
                        </div>
                        <div className="col-6 col-md-auto">
                            {t('long-post-splitter/stats/urls')}: {charInfo.urls}
                        </div>
                        <div className="col-6 col-md-auto">
                            {t('long-post-splitter/stats/estimated_segments')}:
                            <span className="ms-1">{estimatedSegments}</span>
                        </div>
                        {segments && segments.length > 0 ? (
<>

                            <div className="col-6 col-md-auto">
                                {t('long-post-splitter/stats/actual_segments')}:
                                <span className="ms-1 text-primary">{segments.length}</span>
                            </div>
                        
</>
) : null}
                    </div>
                    <div className="d-grid d-md-block">
                        <button className="btn btn-primary btn-sm" onClick={onSplit} disabled={!text.trim()}>
                            {t('long-post-splitter/button/split')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    
</>
);
};

export default SettingsCard;
