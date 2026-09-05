import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const ControlsCard = ({
    onPlay,
    onStop,
    isSpeaking,
    rate,
    onRateChange,
    pitch,
    onPitchChange,
    voiceIndex,
    onVoiceChange,
    voices,
    voicesReady,
    commonVoiceIndices,
    supported,
    paragraphs,
    currentParagraph,
    estimatedDuration,
}) => {
    if (!supported) {
        return html`
            <div class="card">
                <div class="card-body text-center text-danger py-4">
                    ${getText('text-to-speech/message/not_supported')}
                </div>
            </div>
        `;
    }

    const showPlay = !isSpeaking;
    const hasText = paragraphs.length > 0;

    const formatDuration = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    const commonIndicesSet = new Set(commonVoiceIndices);

    const commonOptions = [];
    const otherOptions = [];
    voices.forEach((v, i) => {
        const opt = html`<option value=${i}>${v.name} (${v.lang})</option>`;
        if (commonIndicesSet.has(i)) {
            commonOptions.push(opt);
        } else {
            otherOptions.push(opt);
        }
    });

    return html`
        <div class="card">
            <div class="card-header bg-light">
                <div class="row g-2 align-items-center">
                    <div class="col-md-3">
                        <label class="small mb-0 d-block">${getText('text-to-speech/controls/voice')}</label>
                        <select class="form-select form-select-sm" value=${voiceIndex} onChange=${onVoiceChange} disabled=${!voicesReady}>
                            ${commonOptions.length > 0 ? html`
                                <optgroup label="Common">
                                    ${commonOptions}
                                </optgroup>
                            ` : null}
                            ${otherOptions.length > 0 ? html`
                                <optgroup label="Other">
                                    ${otherOptions}
                                </optgroup>
                            ` : null}
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="small mb-0 d-block">${getText('text-to-speech/controls/rate')}: ${rate.toFixed(2)}</label>
                        <input type="range" class="form-range" min="0.5" max="2" step="0.1" value=${rate} onInput=${onRateChange} />
                    </div>
                    <div class="col-md-3">
                        <label class="small mb-0 d-block">${getText('text-to-speech/controls/pitch')}: ${pitch.toFixed(2)}</label>
                        <input type="range" class="form-range" min="0" max="2" step="0.1" value=${pitch} onInput=${onPitchChange} />
                    </div>
                    <div class="col-md-3">
                        <div class="d-grid gap-1">
                            ${showPlay ? html`
                                <button class="btn btn-sm btn-primary" onClick=${onPlay} disabled=${!hasText}>
                                    <i class="bi bi-play-fill"></i> ${getText('text-to-speech/controls/play')}
                                </button>
                            ` : html`
                                <button class="btn btn-sm btn-danger" onClick=${onStop}>
                                    <i class="bi bi-stop-fill"></i> ${getText('text-to-speech/controls/stop')}
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-body" style="max-height: 300px; overflow-y: auto;">
                ${paragraphs.length === 0 ? html`
                    <p class="text-muted text-center mb-0 py-3">${getText('text-to-speech/status/no_text')}</p>
                ` : html`
                    <div class="list-group list-group-flush">
                        ${paragraphs.map((p, i) => html`
                            <div class="list-group-item border-0 py-2"
                                style="border-left: 3px solid ${i === currentParagraph ? 'var(--bs-primary)' : 'transparent'} !important; background: ${i === currentParagraph ? 'var(--bs-primary-bg-subtle)' : 'transparent'};">
                                <span class=${i === currentParagraph ? 'fw-medium' : ''}>
                                    ${p.length > 120 ? p.slice(0, 120) + '...' : p}
                                </span>
                            </div>
                        `)}
                    </div>
                `}
            </div>
            <div class="card-footer bg-light text-muted small d-flex justify-content-between align-items-center">
                <span>${paragraphs.length} ${getText('text-to-speech/body/paragraphs')}</span>
                <span>${getText('text-to-speech/status/duration')}: ${formatDuration(estimatedDuration)}</span>
            </div>
        </div>
    `;
};

export default ControlsCard;