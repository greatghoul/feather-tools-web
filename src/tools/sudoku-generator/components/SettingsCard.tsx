import { t } from '~/helpers/i18n';

const DIFFICULTIES = [
    { value: 'easy', key: 'sudoku-generator/settings/difficulty_easy' },
    { value: 'medium', key: 'sudoku-generator/settings/difficulty_medium' },
    { value: 'hard', key: 'sudoku-generator/settings/difficulty_hard' },
];

const PER_ROW_OPTIONS = [2, 3];

const SettingsCard = ({ difficulty, perRow, isGenerating, onDifficultyChange, onPerRowChange, onGenerate }) => {
    return (
<>

        <div className="card mb-4">
            <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <a className="nav-link active" href="#"><i className="bi bi-gear me-1"></i>{t('sudoku-generator/settings/title')}</a>
                    </li>
                </ul>
            </div>
            <div className="card-body">
                <div className="form-group mb-3">
                    <label className="form-label">{t('sudoku-generator/settings/difficulty')}</label>
                    <div className="btn-group w-100" role="group">
                        {DIFFICULTIES.map((item) => (
<>

                            <input type="radio" className="btn-check" id={`difficulty-${item.value}`} name="difficulty" value={item.value} checked={difficulty === item.value} onChange={() => onDifficultyChange(item.value)} />
                            <label className="btn btn-outline-primary btn-sm" htmlFor={`difficulty-${item.value}`}>{t(item.key)}</label>
                        
</>
))}
                    </div>
                </div>

                <div className="form-group mb-3">
                    <label className="form-label">{t('sudoku-generator/settings/per_row')}</label>
                    <div className="btn-group w-100" role="group">
                        {PER_ROW_OPTIONS.map((value) => (
<>

                            <input type="radio" className="btn-check" id={`per-row-${value}`} name="perRow" value={value} checked={perRow === value} onChange={() => onPerRowChange(value)} />
                            <label className="btn btn-outline-primary btn-sm" htmlFor={`per-row-${value}`}>{value}</label>
                        
</>
))}
                    </div>
                </div>
            </div>
            <div className="card-footer">
                <button className="btn btn-primary w-100" onClick={onGenerate} disabled={isGenerating}>
                    {isGenerating ? t('sudoku-generator/message/generating') : t('sudoku-generator/button/generate')}
                </button>
            </div>
        </div>
    
</>
);
};

export default SettingsCard;
