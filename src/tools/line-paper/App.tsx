import { useState, useCallback } from 'react';
import { t } from '~/helpers/i18n';

import SettingsCard from './components/SettingsCard';
import PreviewPanel from './components/PreviewPanel';

const orientationOptions = [
    { value: 'portrait', label: t('line-paper/settings/orientation_portrait') || 'Portrait' },
    { value: 'landscape', label: t('line-paper/settings/orientation_landscape') || 'Landscape' },
];

const marginOptions = [
    { value: 'narrow', label: t('line-paper/settings/padding_narrow') || 'Narrow' },
    { value: 'normal', label: t('line-paper/settings/padding_normal') || 'Normal' },
    { value: 'wide', label: t('line-paper/settings/padding_wide') || 'Wide' },
];

const PRESET_COLORS = [
    { value: 'black', hex: '#333333', label: t('line-paper/settings/color_black') || 'Black' },
    { value: 'blue', hex: '#1e40af', label: t('line-paper/settings/color_blue') || 'Blue' },
    { value: 'gray', hex: '#6b7280', label: t('line-paper/settings/color_gray') || 'Gray' },
    { value: 'red', hex: '#b91c1c', label: t('line-paper/settings/color_red') || 'Red' },
    { value: 'green', hex: '#047857', label: t('line-paper/settings/color_green') || 'Green' },
];

const LinePaper = () => {
    const [lineColor, setLineColor] = useState('black');
    const [lineHeight, setLineHeight] = useState(9);
    const [paddingVertical, setPaddingVertical] = useState('narrow');
    const [paddingHorizontal, setPaddingHorizontal] = useState('normal');
    const [orientation, setOrientation] = useState('portrait');
    const [printHandlers, setPrintHandlers] = useState(null);

    const handlePrintReady = useCallback((handlers) => {
        setPrintHandlers(handlers);
    }, []);

    return (
<>

        <div className="row">
            <div className="col-lg-4 mb-4">
                <SettingsCard lineColor={lineColor} onLineColorChange={setLineColor} presetColors={PRESET_COLORS} lineHeight={lineHeight} onLineHeightChange={setLineHeight} paddingVertical={paddingVertical} onPaddingVerticalChange={setPaddingVertical} paddingHorizontal={paddingHorizontal} onPaddingHorizontalChange={setPaddingHorizontal} marginOptions={marginOptions} orientation={orientation} onOrientationChange={setOrientation} orientationOptions={orientationOptions} />
            </div>

            <div className="col-lg-8">
                <PreviewPanel lineColor={lineColor} lineHeight={lineHeight} paddingVertical={paddingVertical} paddingHorizontal={paddingHorizontal} orientation={orientation} onPrintReady={handlePrintReady} />
            </div>
        </div>
    
</>
);
};

export default LinePaper;
