import { html } from 'htm/preact';
import { css } from 'goober';
import { useMemo, useEffect } from 'preact/hooks';
import { getLayoutConfig, printDebugInfo } from '@/config/layouts.js';

// Development debugging: print layout config info
// printDebugInfo();

const previewWrapStyle = css`
    .preview-wrap {
        overflow: auto;
        padding: 12px;
        border-radius: 10px;
        border: 1px solid #e5e7eb;
        background: #e5e7eb;
        display: flex;
        justify-content: center;
        align-items: flex-start;
    }

    .a4-page {
        width: 210mm;
        height: 297mm;
        padding: 20mm;
        background: #fff;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
        overflow: hidden;
        position: relative;
        box-sizing: border-box;
    }

    .a4-inner {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .todo-header {
        text-align: center;
        border-bottom: 1px solid #333;
        padding-bottom: 10px;
        flex-shrink: 0;
    }

    .todo-header h2 {
        margin: 0;
        font-size: 28px;
        line-height: 1.2;
        font-weight: 600;
    }

    .todo-header.hidden {
        display: none;
    }

    .groups-panel {
        flex: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-auto-rows: min-content;
        align-content: start;
        overflow: hidden;
    }

    .groups-panel.compact {
        grid-template-columns: 1fr 1fr 1fr;
    }

    .group-card {
        border: 1px solid #d9d9d9;
        overflow: hidden;
        display: block;
    }

    .task-item {
        display: flex;
        align-items: flex-start;
        border-bottom: 1px solid #eee;
    }

    .task-item:last-child {
        border-bottom: none;
    }

    .task-item.minor {
        background: #f5f5f5;
    }

    .task-box {
        border: 2px solid #888;
        border-radius: 3px;
        flex-shrink: 0;
        background: #fff;
    }

    .task-text {
        flex: 1;
    }
`;

const PreviewPanel = ({ title, taskPerGroup, effectiveMinorCount, density }) => {
    const hasTitle = title.trim().length > 0;

    // Get current layout config
    const config = useMemo(() => {
        return getLayoutConfig(taskPerGroup, density, hasTitle);
    }, [taskPerGroup, density, hasTitle]);

    // Debug output
    useEffect(() => {
        console.log('Todo Paper Config:', {
            taskPerGroup,
            density,
            hasTitle,
            groupCount: config.groupCount,
            debug: config._debug
        });
    }, [config, taskPerGroup, density, hasTitle]);

    // 计算动态样式
    const dynamicStyles = useMemo(() => {
        return html`
            <style>
                .todo-header {
                    margin-bottom: ${config.rowGap}px;
                }
                .groups-panel {
                    column-gap: ${config.columnGap}px;
                    row-gap: ${config.rowGap}px;
                }
                .task-item {
                    padding: ${config.taskItemPadding};
                }
                .task-box {
                    width: ${config.taskBoxSize.width}px;
                    height: ${config.taskBoxSize.height}px;
                    margin-right: ${density === 'compact' ? '6px' : '8px'};
                    margin-top: ${density === 'compact' ? '2px' : '2px'};
                }
                .task-text {
                    font-size: ${config.taskFontSize};
                    line-height: ${config.taskLineHeight};
                }
            </style>
        `;
    }, [config, density]);

    return html`
        <div class=${previewWrapStyle}>
            <div class="preview-wrap">
                <section class="a4-page" id="a4Page">
                    ${dynamicStyles}
                    <div class="a4-inner">
                        <header class="todo-header ${hasTitle ? '' : 'hidden'}">
                            <h2>${title}</h2>
                        </header>
                        <div class="groups-panel ${density === 'compact' ? 'compact' : ''}">
                            ${Array.from({ length: config.groupCount }).map((_, index) => html`
                                <div class="group-card" key=${index}>
                                    ${Array.from({ length: taskPerGroup }).map((_, taskIndex) => {
                                        const isMinor = effectiveMinorCount > 0 && taskIndex >= taskPerGroup - effectiveMinorCount;
                                        return html`
                                            <div class="task-item ${isMinor ? 'minor' : ''}">
                                                <div class="task-box"></div>
                                                <div class="task-text"></div>
                                            </div>
                                        `;
                                    })}
                                </div>
                            `)}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    `;
};

export default PreviewPanel;
