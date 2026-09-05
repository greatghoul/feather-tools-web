import { t } from '~/helpers/i18n';

interface ItemsCardProps {
    text: string;
    onTextChange: (value: string) => void;
    itemsCount: number;
    truncated: boolean;
    disabled: boolean;
}

const ItemsCard = ({ text, onTextChange, itemsCount, truncated, disabled }: ItemsCardProps) => {
    return (
        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('random-wheel/input/title')}</span>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => onTextChange(t('random-wheel/input/example'))}
                        disabled={disabled}
                    >
                        {t('random-wheel/button/load_example')}
                    </button>
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => onTextChange('')}
                        disabled={disabled}
                    >
                        {t('random-wheel/button/clear')}
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                <textarea
                    className="form-control border-0"
                    style={{ minHeight: '180px', resize: 'vertical' }}
                    placeholder={t('random-wheel/input/placeholder')}
                    value={text}
                    onChange={(e) => onTextChange(e.target.value)}
                    disabled={disabled}
                />
            </div>
            <div className="card-footer bg-light d-flex justify-content-between gap-2">
                <span className="text-muted small">
                    {t('random-wheel/input/items_count')}: {itemsCount}
                </span>
                {truncated && <span className="text-warning small">{t('random-wheel/input/limit')}</span>}
            </div>
        </div>
    );
};

export default ItemsCard;
