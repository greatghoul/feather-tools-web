import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import ResizeSetting, { DEFAULT_RESIZE_SETTING } from '@/components/ResizeSetting.js';
import { getText } from '~/helpers/utils.js';

const SettingsForm = ({ settings, onChange }) => {
    const [formSettings, setFormSettings] = useState(settings);
    
    useEffect(() => {
        setFormSettings(settings);
    }, [settings]);
    
    const handleAddSetting = () => {
        setFormSettings([...formSettings, DEFAULT_RESIZE_SETTING]);
    };
    
    return html`
        ${formSettings.map((setting, index) => html`
            <${ResizeSetting}
                key=${index}
                setting=${setting}
                onChange=${onChange}
                index=${index}
            />
        `)}

        <div class="card-footer">
            <button class="btn btn-primary btn-xs" onClick=${handleAddSetting}>
                ${getText('resize-images/input/add_setting')}
            </button>
        </div>        
    `;
};

export default SettingsForm;