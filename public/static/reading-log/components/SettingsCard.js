import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

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
    const options = [];
    for (let i = 3; i <= 10; i++) {
        options.push(i);
    }

    return html`
        <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">${getText('reading-log/settings/card_title')}</h5>
                <button class="btn btn-sm invisible" tabindex="-1">&nbsp;</button>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label" for="titleInput">${getText('reading-log/settings/title')}</label>
                    <div class="input-group">
                        <div class="input-group-text">
                            <input
                                type="checkbox"
                                class="form-check-input mt-0"
                                id="showTitleCheck"
                                checked=${showTitle}
                                onChange=${(e) => onShowTitleChange(e.target.checked)}
                                style="cursor: pointer;"
                                aria-label=${getText('reading-log/settings/show_log_title')}
                            />
                        </div>
                        <input
                            type="text"
                            id="titleInput"
                            class="form-control"
                            value=${title}
                            onInput=${(e) => onTitleChange(e.target.value)}
                            disabled=${!showTitle}
                        />
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label" for="bookTitleInput">${getText('reading-log/settings/book_title')}</label>
                    <input
                        type="text"
                        id="bookTitleInput"
                        class="form-control"
                        value=${bookTitle}
                        onInput=${(e) => onBookTitleChange(e.target.value)}
                        placeholder=${getText('reading-log/settings/placeholder')}
                    />
                </div>

                <div class="mb-3">
                    <label class="form-label" for="bookAuthorInput">${getText('reading-log/settings/book_author')}</label>
                    <input
                        type="text"
                        id="bookAuthorInput"
                        class="form-control"
                        value=${bookAuthor}
                        onInput=${(e) => onBookAuthorChange(e.target.value)}
                        placeholder=${getText('reading-log/settings/placeholder')}
                    />
                </div>

                <div class="mb-3">
                    <label class="form-label mb-2 d-block">${getText('reading-log/settings/columns')}</label>
                    <div class="d-flex gap-3">
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="columns" id="col1"
                                value="1" checked=${columns === 1}
                                onChange=${(e) => onColumnsChange(Number(e.target.value))} />
                            <label class="form-check-label" for="col1">${getText('reading-log/settings/column_1')}</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="columns" id="col2"
                                value="2" checked=${columns === 2}
                                onChange=${(e) => onColumnsChange(Number(e.target.value))} />
                            <label class="form-check-label" for="col2">${getText('reading-log/settings/column_2')}</label>
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label" for="cardRowsSelect">${getText('reading-log/settings/rows_per_card')}</label>
                    <select
                        id="cardRowsSelect"
                        class="form-select"
                        value=${cardRows}
                        onChange=${(e) => onCardRowsChange(Number(e.target.value))}
                    >
                        ${options.map(n => html`<option value=${n}>${n}</option>`)}
                    </select>
                    <div class="text-muted mt-1" style="font-size: 0.82rem;">
                        ${cardCount} ${getText('reading-log/settings/cards_label')}
                    </div>
                </div>
            </div>
        </div>

        <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary flex-fill" onClick=${onDownload}>
                <i class="bi bi-download me-1"></i>${getText('common/download')}
            </button>
            <button class="btn btn-primary flex-fill" onClick=${onPrint}>
                <i class="bi bi-printer me-1"></i>${getText('common/print')}
            </button>
        </div>
    `;
};

export default SettingsCard;
