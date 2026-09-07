import { t } from '~/helpers/i18n';

export interface HistoryEntry {
    item: string;
    time: string;
}

interface HistoryCardProps {
    history: HistoryEntry[];
    onClear: () => void;
}

const HistoryCard = ({ history, onClear }: HistoryCardProps) => {
    return (
        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <a className="nav-link active" href="#" onClick={(e) => e.preventDefault()}>
                            {t('random-wheel/history/title')}
                        </a>
                    </li>
                </ul>
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
                    <ul className="list-unstyled mb-0">
                        {history.map((entry, i) => (
                            <li
                                key={`${i}-${entry.item}`}
                                className="d-flex justify-content-between align-items-baseline gap-2 py-1"
                            >
                                <span className="text-break">{entry.item}</span>
                                <span className="text-muted small text-nowrap">{entry.time}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default HistoryCard;
