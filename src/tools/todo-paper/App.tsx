import { useState, useEffect } from 'react';
import { t } from '~/helpers/i18n';

import SettingsCard from './components/SettingsCard';
import PreviewPanel from './components/PreviewPanel';

const TodoPaper = () => {
    const [title, setTitle] = useState(t('todo-paper/settings/default_title') || 'Todo List');
    const [taskPerGroup, setTaskPerGroup] = useState(5);
    const [enableMinor, setEnableMinor] = useState(false);
    const [minorCount, setMinorCount] = useState(1);
    const [density, setDensity] = useState('comfortable');

    // Calculate max minor tasks (must be at least 1, less than taskPerGroup)
    const maxMinor = Math.max(taskPerGroup - 1, 1);
    const effectiveMinorCount = enableMinor ? Math.min(Math.max(minorCount, 1), maxMinor) : 0;

    // Update minor count when taskPerGroup changes
    useEffect(() => {
        if (minorCount > maxMinor) {
            setMinorCount(maxMinor);
        } else if (minorCount < 1) {
            setMinorCount(1);
        }
    }, [taskPerGroup, maxMinor]);

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    return (
<>

        <div className="row">
            <div className="col-lg-4 mb-4">
                <SettingsCard title={title} onTitleChange={setTitle} taskPerGroup={taskPerGroup} onTaskPerGroupChange={setTaskPerGroup} enableMinor={enableMinor} onEnableMinorChange={setEnableMinor} minorCount={minorCount} onMinorCountChange={setMinorCount} maxMinor={maxMinor} density={density} onDensityChange={setDensity} onPrint={handlePrint} />
            </div>

            <div className="col-lg-8">
                <PreviewPanel title={title} taskPerGroup={taskPerGroup} effectiveMinorCount={effectiveMinorCount} density={density} />
            </div>
        </div>
    
</>
);
};

// Initialize the app when DOM is loaded

export default TodoPaper;
