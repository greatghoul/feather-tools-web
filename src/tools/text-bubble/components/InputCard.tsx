import { t } from '~/helpers/i18n';

const InputCard = ({ text, onTextChange, onClear, onLoadExample }) => {
    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t('text-bubble/input/title')}</h5>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-info" onClick={onLoadExample}>{t('text-bubble/button/load_example')}</button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={onClear}>{t('text-bubble/button/clear')}</button>
                </div>
            </div>
            <div className="card-body">
                <textarea className="form-control" rows={6} placeholder={t('text-bubble/input/placeholder')} value={text} onInput={(e) => onTextChange((e.target as HTMLInputElement).value)}></textarea>
            </div>
        </div>
    
</>
);
};

export default InputCard;
