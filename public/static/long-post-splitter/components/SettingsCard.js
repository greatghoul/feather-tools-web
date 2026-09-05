import { html } from 'htm/preact';
import { useMemo } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { xTextSplitter } from '@/services/XTextSplitter.js';

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

    return html`
        <div class="card">
            <div class="card-header bg-light">
                <span>${getText('long-post-splitter/settings/title')}</span>
            </div>
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-3">
                        <label class="form-label small mb-1">${getText('long-post-splitter/options/limit')}</label>
                        <select class="form-select form-select-sm" value=${charLimit} onChange=${(e) => setCharLimit(e.target.value)}>
                            <option value="280">280 - ${getText('long-post-splitter/options/limit_x_post')}</option>
                            <option value="custom">${getText('long-post-splitter/options/limit_custom')}</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label small mb-1">${getText('long-post-splitter/options/split_mode')}</label>
                        <select class="form-select form-select-sm" value=${splitMode} onChange=${(e) => setSplitMode(e.target.value)}>
                            <option value="paragraph">${getText('long-post-splitter/options/split_paragraph')}</option>
                            <option value="sentence">${getText('long-post-splitter/options/split_sentence')}</option>
                            <option value="word">${getText('long-post-splitter/options/split_word')}</option>
                            <option value="char">${getText('long-post-splitter/options/split_char')}</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label small mb-1">${getText('long-post-splitter/options/numbering_format')}</label>
                        <select class="form-select form-select-sm" value=${numberingFormat} onChange=${(e) => setNumberingFormat(e.target.value)}>
                            <option value="none">${getText('long-post-splitter/options/numbering_none')}</option>
                            <option value="prefix">${getText('long-post-splitter/options/numbering_prefix')}</option>
                            <option value="paren">${getText('long-post-splitter/options/numbering_paren')}</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label small mb-1">${getText('long-post-splitter/options/numbering_break')}</label>
                        <select class="form-select form-select-sm" value=${numberingBreak} onChange=${(e) => setNumberingBreak(e.target.value)} disabled=${numberingFormat === 'none'}>
                            <option value="none">${getText('long-post-splitter/options/numbering_break_none')}</option>
                            <option value="break">${getText('long-post-splitter/options/numbering_break_newline')}</option>
                            <option value="break-blank">${getText('long-post-splitter/options/numbering_break_blank')}</option>
                        </select>
                    </div>
                    ${charLimit === 'custom' ? html`
                        <div class="col-md-3">
                            <label class="form-label small mb-1">${getText('long-post-splitter/options/custom_limit')}</label>
                            <input
                                type="number"
                                class="form-control form-control-sm"
                                min="10"
                                max="25000"
                                value=${customLimit}
                                onInput=${(e) => setCustomLimit(parseInt(e.target.value) || 0)}
                            />
                        </div>
                    ` : null}
                </div>
            </div>
            <div class="card-footer bg-light">
                <div class="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center gap-2">
                    <div class="row g-2 text-muted small">
                        <div class="col-6 col-md-auto">
                            ${getText('long-post-splitter/stats/weighted')}:
                            <span class=${overLimit ? 'text-danger ms-1' : 'text-success ms-1'}>${charInfo.weighted}</span>/${effectiveLimit}
                        </div>
                        <div class="col-6 col-md-auto">
                            ${getText('long-post-splitter/stats/urls')}: ${charInfo.urls}
                        </div>
                        <div class="col-6 col-md-auto">
                            ${getText('long-post-splitter/stats/estimated_segments')}:
                            <span class="ms-1">${estimatedSegments}</span>
                        </div>
                        ${segments && segments.length > 0 ? html`
                            <div class="col-6 col-md-auto">
                                ${getText('long-post-splitter/stats/actual_segments')}:
                                <span class="ms-1 text-primary">${segments.length}</span>
                            </div>
                        ` : null}
                    </div>
                    <div class="d-grid d-md-block">
                        <button class="btn btn-primary btn-sm" onClick=${onSplit} disabled=${!text.trim()}>
                            ${getText('long-post-splitter/button/split')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default SettingsCard;
