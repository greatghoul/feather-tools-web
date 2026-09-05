import { useState, useEffect } from 'react';
import ResizeSetting, { DEFAULT_RESIZE_SETTING } from '../components/ResizeSetting';
import { t } from '~/helpers/i18n';

const SettingsForm = ({ settings, onChange }) => {
    const [formSettings, setFormSettings] = useState(settings);
    
    useEffect(() => {
        setFormSettings(settings);
    }, [settings]);
    
    const handleAddSetting = () => {
        setFormSettings([...formSettings, DEFAULT_RESIZE_SETTING]);
    };
    
    return (
<>

        {formSettings.map((setting, index) => (
            <ResizeSetting key={index} setting={setting} onChange={onChange} index={index} onRemove={undefined} canRemove={undefined} />
))}

        <div className="card-footer">
            <button className="btn btn-primary btn-xs" onClick={handleAddSetting}>
                {t('resize-images/input/add_setting')}
            </button>
        </div>        
    
</>
);
};

export default SettingsForm;
