import { html } from 'htm/preact';
import { render, h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { setup } from 'goober';
import SettingCard from '@/components/SettingCard.js';
import PreviewCard from '@/components/PreviewCard.js';

setup(h);

const DEFAULT_SETTINGS = {
    url: '',
    foreground: '#000000',
    background: '#FFFFFF'
};

const App = () => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const url = params.get('url');
        if (url) {
            setSettings(prev => ({ ...prev, url }));
        }
    }, []);

    const handleCreate = (settings) => {
        setCreating(true);
        setSettings(settings);
    }

    const handleCreated = () => setCreating(false);

    return html`
        <div class="row row-gap-4 mb-4">
            <div class="col-lg-6">
                <${SettingCard} settings=${settings} onSubmit=${handleCreate} creating=${creating} />
            </div>

            <div class="col-lg-6">
                <${PreviewCard} settings=${settings} creating=${creating} onCreated=${handleCreated} />
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
