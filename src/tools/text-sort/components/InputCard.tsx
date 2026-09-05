import { t } from '~/helpers/i18n';

interface InputCardProps {
    text: string;
    onTextChange: (value: string) => void;
    onClear: () => void;
    onLoadExample: () => void;
    onSort: () => void;
    sortBy: string;
    setSortBy: (value: string) => void;
    sortOrder: string;
    setSortOrder: (value: string) => void;
}

const InputCard = ({
    text,
    onTextChange,
    onClear,
    onLoadExample,
    onSort,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
}: InputCardProps) => {
    const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value);
        setSortOrder('ascending');
    };

    return (
        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('text-sort/input/title')}</span>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-info" onClick={onLoadExample}>
                        Example
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={onClear}>
                        {t('text-sort/button/clear')}
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                <textarea
                    className="form-control border-0"
                    style={{ minHeight: '200px', resize: 'vertical' }}
                    placeholder={t('text-sort/input/placeholder')}
                    value={text}
                    onChange={(e) => onTextChange(e.target.value)}
                />
            </div>
            <div className="card-footer bg-light">
                <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                        <label className="form-label small mb-1">{t('text-sort/options/sort_by')}</label>
                        <select className="form-select form-select-sm" value={sortBy} onChange={handleSortByChange}>
                            <option value="alphabetically">{t('text-sort/options/alphabetically')}</option>
                            <option value="numerically">{t('text-sort/options/numerically')}</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small mb-1">{t('text-sort/options/sort_order')}</label>
                        <select
                            className="form-select form-select-sm"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="ascending">{t('text-sort/options/ascending')}</option>
                            <option value="descending">{t('text-sort/options/descending')}</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <button className="btn btn-primary w-100" onClick={onSort}>
                            {t('text-sort/button/sort')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InputCard;
