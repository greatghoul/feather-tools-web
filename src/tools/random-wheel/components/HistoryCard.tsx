import { t } from '~/helpers/i18n';

interface HistoryCardProps {
    history: string[];
    onClear: () => void;
}

const HistoryCard = ({ history, onClear }: HistoryCardProps) => {
    return (
        <div className="card mt-4">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('random-wheel/history/title')}</span>
                <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={onClear}
                    disabled={history.length === 0}
                >
                    {t('random-wheel/button/remove_history')}
                </button>
            </div>
            <div className="card-body">
                {history.length === 0 ? (
                    <span className="text-muted small">{t('random-wheel/history/empty')}</span>
                ) : (
                    <ol className="mb-0 ps-3">
                        {history.map((item, i) => (
                            <li key={`${i}-${item}`} className="py-1">{item}</li>
                        ))}
                    </ol>
                )}
            </div>
        </div>
    );
};

export default HistoryCard;
