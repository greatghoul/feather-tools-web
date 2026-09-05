import { html } from 'htm/preact';
import { css } from 'goober';
import { getText } from '~/helpers/utils.js';
import InputNumber from '~/components/InputNumber.js';
import { TOOL_LABELS } from '../services/AnnotationEngine.js';

const narrowInputStyle = css`
    input.form-control {
        flex: none !important;
        width: 50px !important;
    }
`;

const fillSwitchStyle = css`
    padding-left: 0 !important;
    .form-check-input {
        width: 2.5em !important;
        height: 1.3em !important;
        margin-left: 0 !important;
        margin-top: 0 !important;
    }
`;

const Toolbar = ({
    tool,
    toolKeys,
    strokeColor,
    strokeWidth,
    fillEnabled,
    fillOpacity,
    cornerRadius,
    blockSize,
    isShapeTool,
    onToolChange,
    onStrokeColorChange,
    onStrokeWidthChange,
    onFillEnabledChange,
    onFillOpacityChange,
    onCornerRadiusChange,
    onBlockSizeChange,
    imageId,
}) => {
    return html`
        <div class="col-12 col-md-2 d-flex flex-column gap-2 bg-light rounded p-2" style="min-width:200px;">
            <div style="display:grid;grid-template-columns:repeat(3,auto);gap:4px;" class="pb-2">
                ${toolKeys.map((tKey) => {
                    const isSelect = tKey === 'select';
                    const btnClass = tool === tKey
                        ? 'btn-primary'
                        : 'btn-outline-secondary';
                    const icon = isSelect ? 'bi-cursor' : TOOL_LABELS[tKey]?.icon || 'bi-circle';
                    const titleKey = isSelect
                        ? 'image-annotation/toolbar/select'
                        : TOOL_LABELS[tKey]?.key || '';
                    return html`
                        <button
                            key=${tKey}
                            class="btn btn-sm ${btnClass}"
                            onClick=${() => onToolChange(tKey)}
                            title=${getText(titleKey)}
                            style="padding: 0.2rem 0.4rem;"
                        >
                            <i class="bi ${icon}"></i>
                        </button>
                    `;
                })}
            </div>
            <div class="d-flex flex-column gap-2">
                <div class="d-flex align-items-center justify-content-between">
                    <small class="text-muted text-nowrap" style="font-size:0.7rem;">${getText('image-annotation/toolbar/color')}</small>
                    <div style="position:relative;width:28px;height:28px;flex-shrink:0;">
                        <div style="width:28px;height:28px;border-radius:4px;background:${strokeColor};border:1px solid #adb5bd;cursor:pointer;pointer-events:none;"></div>
                        <input
                            type="color"
                            value=${strokeColor}
                            onChange=${(e) => onStrokeColorChange(e.target.value)}
                            style="position:absolute;left:0;top:0;width:28px;height:28px;padding:0;border:none;opacity:0;cursor:pointer;"
                        />
                    </div>
                </div>
                <div class="d-flex align-items-center justify-content-between">
                    <small class="text-muted text-nowrap" style="font-size:0.7rem;">${getText('image-annotation/toolbar/stroke_width')}</small>
                    <div class=${narrowInputStyle}>
                        <${InputNumber}
                            value=${strokeWidth}
                            min=${1}
                            max=${20}
                            step=${1}
                            onChange=${onStrokeWidthChange}
                        />
                    </div>
                </div>
                ${tool === 'roundedRect' && html`
                    <div class="d-flex align-items-center justify-content-between">
                        <small class="text-muted text-nowrap" style="font-size:0.7rem;">${getText('image-annotation/toolbar/corner_radius')}</small>
                        <div class=${narrowInputStyle}>
                            <${InputNumber}
                                value=${cornerRadius}
                                min=${5}
                                max=${100}
                                step=${5}
                                onChange=${onCornerRadiusChange}
                            />
                        </div>
                    </div>
                `}
                ${isShapeTool && tool !== 'highlighter' && html`
                    <div class="d-flex align-items-center justify-content-between form-switch ${fillSwitchStyle}">
                        <small class="text-muted text-nowrap" style="font-size:0.7rem;">${getText('image-annotation/settings/fill')}</small>
                        <input
                            class="form-check-input"
                            type="checkbox"
                            id="fill-${imageId}"
                            checked=${fillEnabled}
                            onChange=${() => onFillEnabledChange(!fillEnabled)}
                            style="cursor:pointer;margin-top:0;"
                        />
                    </div>
                    ${fillEnabled && html`
                        <div class="d-flex align-items-center justify-content-between">
                            <small class="text-muted text-nowrap" style="font-size:0.7rem;">${getText('image-annotation/settings/fill_opacity')}</small>
                            <div class=${narrowInputStyle}>
                                <${InputNumber}
                                    value=${fillOpacity}
                                    min=${0}
                                    max=${100}
                                    step=${5}
                                    onChange=${onFillOpacityChange}
                                />
                            </div>
                        </div>
                    `}
                `}
                ${tool === 'mosaic' && html`
                    <div class="d-flex align-items-center justify-content-between">
                        <small class="text-muted text-nowrap" style="font-size:0.7rem;">${getText('image-annotation/toolbar/block_size')}</small>
                        <div class=${narrowInputStyle}>
                            <${InputNumber}
                                value=${blockSize}
                                min=${5}
                                max=${60}
                                step=${5}
                                onChange=${onBlockSizeChange}
                            />
                        </div>
                    </div>
                `}
            </div>
        </div>
    `;
};

export default Toolbar;
