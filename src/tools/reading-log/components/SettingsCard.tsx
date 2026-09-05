import { t } from '~/helpers/i18n';

const SettingsCard = ({
    showTitle, onShowTitleChange,
    title, onTitleChange,
    bookTitle, onBookTitleChange,
    bookAuthor, onBookAuthorChange,
    columns, onColumnsChange,
    cardRows, onCardRowsChange,
    cardCount,
    onPrint,
    onDownload
}) => {
    const options: number[] = [];
    for (let i = 3; i <= 10; i++) {
        options.push(i);
    }

    return (
<>

        <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t('reading-log/settings/card_title')}</h5>
                <button className="btn btn-sm invisible" tabIndex={-1}>&nbsp;</button>
            </div>
            <div className="card-body">
                <div className="mb-3">
                    <label className="form-label" htmlFor="titleInput">{t('reading-log/settings/title')}</label>
                    <div className="input-group">
                        <div className="input-group-text">
                            <input type="checkbox" className="form-check-input mt-0" id="showTitleCheck" checked={showTitle} onChange={(e) => onShowTitleChange(e.target.checked)} style={{ cursor: 'pointer' }} aria-label={t('reading-log/settings/show_log_title')} />
                        </div>
                        <input type="text" id="titleInput" className="form-control" value={title} onInput={(e) => onTitleChange((e.target as HTMLInputElement).value)} disabled={!showTitle} />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="bookTitleInput">{t('reading-log/settings/book_title')}</label>
                    <input type="text" id="bookTitleInput" className="form-control" value={bookTitle} onInput={(e) => onBookTitleChange((e.target as HTMLInputElement).value)} placeholder={t('reading-log/settings/placeholder')} />
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="bookAuthorInput">{t('reading-log/settings/book_author')}</label>
                    <input type="text" id="bookAuthorInput" className="form-control" value={bookAuthor} onInput={(e) => onBookAuthorChange((e.target as HTMLInputElement).value)} placeholder={t('reading-log/settings/placeholder')} />
                </div>

                <div className="mb-3">
                    <label className="form-label mb-2 d-block">{t('reading-log/settings/columns')}</label>
                    <div className="d-flex gap-3">
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="columns" id="col1" value="1" checked={columns === 1} onChange={(e) => onColumnsChange(Number(e.target.value))} />
                            <label className="form-check-label" htmlFor="col1">{t('reading-log/settings/column_1')}</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="columns" id="col2" value="2" checked={columns === 2} onChange={(e) => onColumnsChange(Number(e.target.value))} />
                            <label className="form-check-label" htmlFor="col2">{t('reading-log/settings/column_2')}</label>
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="cardRowsSelect">{t('reading-log/settings/rows_per_card')}</label>
                    <select id="cardRowsSelect" className="form-select" value={cardRows} onChange={(e) => onCardRowsChange(Number(e.target.value))}>
                        {options.map(n => (
                            <option key={n} value={n}>{n}</option>
))}
                    </select>
                    <div className="text-muted mt-1" style={{ fontSize: '0.82rem' }}>
                        {cardCount} {t('reading-log/settings/cards_label')}
                    </div>
                </div>
            </div>
        </div>

        <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary flex-fill" onClick={onDownload}>
                <i className="bi bi-download me-1"></i>{t('common/download')}
            </button>
            <button className="btn btn-primary flex-fill" onClick={onPrint}>
                <i className="bi bi-printer me-1"></i>{t('common/print')}
            </button>
        </div>
    
</>
);
};

export default SettingsCard;
