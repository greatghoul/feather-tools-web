import { html } from 'htm/preact';
import { css } from 'goober';
import { getText } from '~/helpers/utils.js';

const formGroupClass = css`
    margin-bottom: 1rem;
`;

const SettingCard = ({ settings, creating, onSubmit }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newSettings = Object.fromEntries(formData);
        onSubmit(newSettings);
    };

    return html`
        <div class="card h-100">
            <div class="card-header">
                <h5 class="mb-0">${getText('simple-qrcode/settings/title')}</h5>
            </div>
            <div class="card-body">
                <form id="qrcode-form" onSubmit=${handleSubmit}>
                    <div class=${formGroupClass}>
                        <label for="url">${getText('simple-qrcode/settings/url')}</label>
                        <input type="url" class="form-control" id="url" name="url" placeholder="https://feather-tools.com/simple-qrcode" value=${settings.url} />
                    </div>
                    
                    <div class=${formGroupClass}>
                        <label for="foreground">${getText('simple-qrcode/settings/foreground')}</label>
                        <input type="color" class="form-control form-control-color" id="foreground" name="foreground" value=${settings.foreground} />
                    </div>

                    <div class=${formGroupClass}>
                        <label for="background">${getText('simple-qrcode/settings/background')}</label>
                        <input type="color" class="form-control form-control-color" id="background" name="background" value=${settings.background} />
                    </div>

                    <div class="d-grid">
                        <button type="submit" class="btn btn-primary mt-3" disabled=${creating}>${getText('simple-qrcode/settings/generate')}</button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

export default SettingCard;
