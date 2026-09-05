import { html } from 'htm/preact';
import { render } from 'preact';
import { useState, useCallback } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

import SettingsCard from '@/components/SettingsCard.js';
import PreviewPanel from '@/components/PreviewPanel.js';

const styleOptions = [
    { value: 'square-grid', label: getText('hanzi-paper/settings/style_square_grid') || 'Square Grid' },
    { value: 'tian-zi-ge', label: getText('hanzi-paper/settings/style_tian_zi_ge') || 'Tian Zi Ge' },
    { value: 'mi-zi-ge', label: getText('hanzi-paper/settings/style_mi_zi_ge') || 'Mi Zi Ge' },
    { value: 'horizontal', label: getText('hanzi-paper/settings/style_horizontal') || 'Horizontal Lines' },
    { value: 'vertical', label: getText('hanzi-paper/settings/style_vertical') || 'Vertical Lines' },
];

const orientationOptions = [
    { value: 'portrait', label: getText('hanzi-paper/settings/orientation_portrait') || 'Portrait' },
    { value: 'landscape', label: getText('hanzi-paper/settings/orientation_landscape') || 'Landscape' },
];

const marginOptions = [
    { value: 'narrow', label: getText('hanzi-paper/settings/padding_narrow') || 'Narrow' },
    { value: 'normal', label: getText('hanzi-paper/settings/padding_normal') || 'Normal' },
    { value: 'wide', label: getText('hanzi-paper/settings/padding_wide') || 'Wide' },
];

const presetColors = [
    { value: 'black', hex: '#333333', label: getText('hanzi-paper/settings/color_black') || 'Black' },
    { value: 'blue', hex: '#1e40af', label: getText('hanzi-paper/settings/color_blue') || 'Blue' },
    { value: 'gray', hex: '#6b7280', label: getText('hanzi-paper/settings/color_gray') || 'Gray' },
    { value: 'red', hex: '#b91c1c', label: getText('hanzi-paper/settings/color_red') || 'Red' },
    { value: 'green', hex: '#047857', label: getText('hanzi-paper/settings/color_green') || 'Green' },
];

const HanziPaper = () => {
    const [style, setStyle] = useState('tian-zi-ge');
    const [lineColor, setLineColor] = useState('black');
    const [cellSize, setCellSize] = useState(15);
    const [paddingVertical, setPaddingVertical] = useState('normal');
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
                    style=${style}
                    onStyleChange=${setStyle}
                    lineColor=${lineColor}
                    onLineColorChange=${setLineColor}
                    presetColors=${presetColors}
                    cellSize=${cellSize}
                    onCellSizeChange=${setCellSize}
                    paddingVertical=${paddingVertical}
                    onPaddingVerticalChange=${setPaddingVertical}
                    paddingHorizontal=${paddingHorizontal}
                    onPaddingHorizontalChange=${setPaddingHorizontal}
                    marginOptions=${marginOptions}
                    orientation=${orientation}
                    onOrientationChange=${setOrientation}
                    orientationOptions=${orientationOptions}
                    styleOptions=${styleOptions}
                />
            </div>

            <div class="col-lg-8">
                <${PreviewPanel}
                    style=${style}
                    lineColor=${lineColor}
                    cellSize=${cellSize}
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
    render(html`<${HanziPaper} />`, document.getElementById('app'));
});
