import { html } from 'htm/preact';
import { render } from 'preact';
import { useState, useCallback } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

import SettingsCard from '@/components/SettingsCard.js';
import PreviewPanel from '@/components/PreviewPanel.js';

const orientationOptions = [
    { value: 'portrait', label: getText('line-paper/settings/orientation_portrait') || 'Portrait' },
    { value: 'landscape', label: getText('line-paper/settings/orientation_landscape') || 'Landscape' },
];

const marginOptions = [
    { value: 'narrow', label: getText('line-paper/settings/padding_narrow') || 'Narrow' },
    { value: 'normal', label: getText('line-paper/settings/padding_normal') || 'Normal' },
    { value: 'wide', label: getText('line-paper/settings/padding_wide') || 'Wide' },
];

const PRESET_COLORS = [
    { value: 'black', hex: '#333333', label: getText('line-paper/settings/color_black') || 'Black' },
    { value: 'blue', hex: '#1e40af', label: getText('line-paper/settings/color_blue') || 'Blue' },
    { value: 'gray', hex: '#6b7280', label: getText('line-paper/settings/color_gray') || 'Gray' },
    { value: 'red', hex: '#b91c1c', label: getText('line-paper/settings/color_red') || 'Red' },
    { value: 'green', hex: '#047857', label: getText('line-paper/settings/color_green') || 'Green' },
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

    return html`
        <div class="row">
            <div class="col-lg-4 mb-4">
                <${SettingsCard}
                    lineColor=${lineColor}
                    onLineColorChange=${setLineColor}
                    presetColors=${PRESET_COLORS}
                    lineHeight=${lineHeight}
                    onLineHeightChange=${setLineHeight}
                    paddingVertical=${paddingVertical}
                    onPaddingVerticalChange=${setPaddingVertical}
                    paddingHorizontal=${paddingHorizontal}
                    onPaddingHorizontalChange=${setPaddingHorizontal}
                    marginOptions=${marginOptions}
                    orientation=${orientation}
                    onOrientationChange=${setOrientation}
                    orientationOptions=${orientationOptions}
                />
            </div>

            <div class="col-lg-8">
                <${PreviewPanel}
                    lineColor=${lineColor}
                    lineHeight=${lineHeight}
                    paddingVertical=${paddingVertical}
                    paddingHorizontal=${paddingHorizontal}
                    orientation=${orientation}
                    onPrintReady=${handlePrintReady}
                />
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${LinePaper} />`, document.getElementById('app'));
});
