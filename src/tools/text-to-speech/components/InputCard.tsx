import { t } from '~/helpers/i18n';

const InputCard = ({ text, onTextChange, onClear, onLoadExample }) => {
    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('text-to-speech/input/title')}</span>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-info" onClick={onLoadExample}>
{t('text-to-speech/button/example')}
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={onClear}>
                        {t('text-to-speech/button/clear')}
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                <textarea className="form-control border-0" style={{ minHeight: '180px', resize: 'vertical' }} placeholder={t('text-to-speech/input/placeholder')} value={text} onInput={(e) => onTextChange((e.target as HTMLInputElement).value)}></textarea>
            </div>
        </div>
    
</>
);
};

export default InputCard;
