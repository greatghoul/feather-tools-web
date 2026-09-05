import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

const SettingsCard = ({ onSettingsChange, onDedup }) => {
    const [ignoreLeading, setIgnoreLeading] = useState(true);
    const [ignoreTrailing, setIgnoreTrailing] = useState(true);

    useEffect(() => {
        if (onSettingsChange) {
            onSettingsChange({
                ignoreLeading,
                ignoreTrailing,
            });
        }
    }, [ignoreLeading, ignoreTrailing, onSettingsChange]);

    return html`
        <div class="card">
            <div class="card-header bg-light">
                <h5 class="mb-0">${getText('text-dedup/options/options')}</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h6 class="mb-2">${getText('text-dedup/options/line_options')}</h6>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="ignoreLeading" checked=${ignoreLeading} onchange=${(e) => setIgnoreLeading(e.target.checked)} />
                            <label class="form-check-label" for="ignoreLeading">${getText('text-dedup/options/ignore_leading_whitespace')}</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="ignoreTrailing" checked=${ignoreTrailing} onchange=${(e) => setIgnoreTrailing(e.target.checked)} />
                            <label class="form-check-label" for="ignoreTrailing">${getText('text-dedup/options/ignore_trailing_whitespace')}</label>
                        </div>
                    </div>
                </div>
                <div class="d-flex gap-2 mt-3">
                    <button class="btn btn-primary" onClick=${onDedup}>${getText('text-dedup/button/remove_duplicates')}</button>
                </div>
            </div>
        </div>
    `;
};

export default SettingsCard;