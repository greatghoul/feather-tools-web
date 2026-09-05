import { useMemo, useEffect } from 'react';
import { getLayoutConfig, printDebugInfo } from '../config/layouts';
import styles from './PreviewPanel.module.css';

// Development debugging: print layout config info
// printDebugInfo();

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
        return (
<>

            <style>{`
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
            `}</style>
        
</>
);
    }, [config, density]);

    return (
<>

        <div className={styles.previewWrapStyle}>
            <div className="preview-wrap">
                <section className="a4-page" id="a4Page">
                    {dynamicStyles}
                    <div className="a4-inner">
                        <header className={`todo-header ${hasTitle ? '' : 'hidden'}`}>
                            <h2>{title}</h2>
                        </header>
                        <div className={`groups-panel ${density === 'compact' ? 'compact' : ''}`}>
                            {Array.from({ length: config.groupCount }).map((_, index) => (
<>

                                <div className="group-card" key={index}>
                                    {Array.from({ length: taskPerGroup }).map((_, taskIndex) => {
                                        const isMinor = effectiveMinorCount > 0 && taskIndex >= taskPerGroup - effectiveMinorCount;
                                        return (
<>

                                            <div className={`task-item ${isMinor ? 'minor' : ''}`}>
                                                <div className="task-box"></div>
                                                <div className="task-text"></div>
                                            </div>
                                        
</>
);
                                    })}
                                </div>
                            
</>
))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    
</>
);
};

export default PreviewPanel;
