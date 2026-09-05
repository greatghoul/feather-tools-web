import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';
import CsvSampleService from '@/services/CsvSampleService.js';

const { COLUMN_TYPES, RULE_FIELDS, PERSON_TYPES } = CsvSampleService;

const PERSON_GROUP_OPTIONS = [
    { value: 0, labelKey: 'csv-sample/person_group/none' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
];

const DATE_FORMAT_CUSTOM = '__custom__';
const DATE_FORMAT_PRESETS = RULE_FIELDS.dateFormat.options;
const DATE_FORMAT_TOKENS = [
    { token: 'YYYY', key: 'csv-sample/date_format/token_year' },
    { token: 'MM', key: 'csv-sample/date_format/token_month' },
    { token: 'DD', key: 'csv-sample/date_format/token_day' },
    { token: 'HH', key: 'csv-sample/date_format/token_hour' },
    { token: 'mm', key: 'csv-sample/date_format/token_minute' },
    { token: 'ss', key: 'csv-sample/date_format/token_second' },
];

const DateFormatField = ({ column, onUpdate }) => {
    const isCustom = column.dateFormatMode === 'custom';
    const selectValue = isCustom ? DATE_FORMAT_CUSTOM : column.dateFormat;

    const handleSelect = (value) => {
        if (value === DATE_FORMAT_CUSTOM) {
            onUpdate({
                dateFormatMode: 'custom',
                dateFormat: column.dateFormat || 'YYYY-MM-DD',
            });
        } else {
            onUpdate({ dateFormatMode: 'preset', dateFormat: value });
        }
    };

    return html`
        <label class="form-label small mb-1 fw-bold">
            ${getText('csv-sample/rules/date_format')}
            <span class="csv-sample-help-icon" tabindex="0">
                <i class="bi bi-question-circle"></i>
                <span class="csv-sample-help-tooltip csv-sample-help-tooltip-wide">
                    <table class="table table-sm table-dark mb-0 csv-sample-format-table">
                        <tbody>
                            ${DATE_FORMAT_TOKENS.map((t) => html`
                                <tr>
                                    <td class="font-monospace text-nowrap">${t.token}</td>
                                    <td>${getText(t.key)}</td>
                                </tr>
                            `)}
                        </tbody>
                    </table>
                </span>
            </span>
        </label>
        <div class="d-flex gap-1">
            <select
                class="form-select form-select-sm flex-fill"
                value=${selectValue}
                onChange=${(e) => handleSelect(e.target.value)}
            >
                ${!isCustom && !DATE_FORMAT_PRESETS.some((opt) => opt.value === column.dateFormat) ? html`
                    <option value=${column.dateFormat}>${column.dateFormat || ''}</option>
                ` : null}
                ${DATE_FORMAT_PRESETS.map((opt) => html`
                    <option value=${opt.value}>${opt.value}</option>
                `)}
                <option value=${DATE_FORMAT_CUSTOM}>${getText('csv-sample/rules/custom_format')}</option>
            </select>
            ${isCustom ? html`
                <input
                    type="text"
                    class="form-control form-control-sm flex-fill"
                    placeholder="YYYY-MM-DD"
                    value=${column.dateFormat}
                    onInput=${(e) => onUpdate({ dateFormat: e.target.value })}
                />
            ` : null}
        </div>
    `;
};

const PersonGroupField = ({ value, onUpdate }) => {
    return html`
        <label class="form-label small mb-1 fw-bold">
            ${getText('csv-sample/person_group/title')}
            <span class="csv-sample-help-icon" tabindex="0">
                <i class="bi bi-question-circle"></i>
                <span class="csv-sample-help-tooltip">${getText('csv-sample/person_group/help')}</span>
            </span>
        </label>
        <select
            class="form-select form-select-sm"
            value=${value ?? 0}
            onChange=${(e) => onUpdate(Number(e.target.value))}
        >
            ${PERSON_GROUP_OPTIONS.map((opt) => html`
                <option value=${opt.value}>${opt.label ? opt.label : getText(opt.labelKey)}</option>
            `)}
        </select>
    `;
};

const RuleInput = ({ rule, column, onUpdate }) => {
    const field = RULE_FIELDS[rule];
    const value = column[rule] ?? '';
    const placeholder = field.placeholderKey ? getText(field.placeholderKey) : (field.placeholder || '');

    if (field.type === 'number') {
        return html`
            <input
                type="number"
                class="form-control form-control-sm"
                min=${field.min ?? -1000000000}
                max=${field.max ?? 1000000000}
                step=${field.step ?? 'any'}
                placeholder=${field.placeholder || ''}
                value=${value}
                onInput=${(e) => onUpdate(rule, e.target.value)}
            />
        `;
    }

    if (field.type === 'date') {
        return html`
            <input
                type="date"
                class="form-control form-control-sm"
                value=${value}
                onInput=${(e) => onUpdate(rule, e.target.value)}
            />
        `;
    }

    if (field.type === 'select') {
        const hasValue = field.options.some((opt) => opt.value === value);
        return html`
            <select
                class="form-select form-select-sm"
                value=${value}
                onChange=${(e) => onUpdate(rule, e.target.value)}
            >
                ${!hasValue ? html`<option value=${value}>${value || ''}</option>` : null}
                ${field.options.map((opt) => html`
                    <option value=${opt.value}>${opt.label || opt.value}</option>
                `)}
            </select>
        `;
    }

    return html`
        <input
            type="text"
            class="form-control form-control-sm"
            placeholder=${placeholder}
            value=${value}
            onInput=${(e) => onUpdate(rule, e.target.value)}
        />
    `;
};

const ColumnRow = ({ column, index, total, onUpdate, onRemove, onMoveUp, onMoveDown, onInsertBefore, onInsertAfter, canRemove }) => {
    const typeDef = CsvSampleService.getTypeDef(column.type);

    const updateColumn = (patch) => {
        onUpdate(column.id, patch);
    };

    const handleTypeChange = (type) => {
        onUpdate(column.id, CsvSampleService.createColumn(column.name, type));
    };

    return html`
        <div class="csv-sample-column-row border rounded p-2 mb-2">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small fw-bold">#${index + 1}</span>
                <div class="d-flex align-items-center gap-2">
                    <div class="btn-group btn-group-sm">
                        <button
                            class="btn btn-outline-secondary"
                            title=${getText('csv-sample/columns/move_up')}
                            onClick=${onMoveUp}
                            disabled=${index === 0}
                        >
                            <i class="bi bi-chevron-up"></i>
                        </button>
                        <button
                            class="btn btn-outline-secondary"
                            title=${getText('csv-sample/columns/move_down')}
                            onClick=${onMoveDown}
                            disabled=${index === total - 1}
                        >
                            <i class="bi bi-chevron-down"></i>
                        </button>
                    </div>
                    <button
                        class="btn btn-sm btn-outline-primary"
                        title=${getText('csv-sample/columns/insert_before')}
                        onClick=${onInsertBefore}
                    >
                        <i class="bi bi-plus-lg me-1"></i>${getText('csv-sample/columns/insert_before')}
                    </button>
                    <button
                        class="btn btn-sm btn-outline-primary"
                        title=${getText('csv-sample/columns/insert_after')}
                        onClick=${onInsertAfter}
                    >
                        <i class="bi bi-plus-lg me-1"></i>${getText('csv-sample/columns/insert_after')}
                    </button>
                    <button
                        class="btn btn-sm btn-outline-danger"
                        title=${getText('csv-sample/button/remove_column')}
                        onClick=${() => onRemove(column.id)}
                        disabled=${!canRemove}
                    >\u00D7</button>
                </div>
            </div>
            <div class="row g-2 align-items-start">
                <div class="col-md-3">
                    <label class="form-label small mb-1 fw-bold">
                        ${getText('csv-sample/columns/name')}
                    </label>
                    <input
                        type="text"
                        class="form-control form-control-sm"
                        placeholder=${getText('csv-sample/columns/name_placeholder')}
                        value=${column.name}
                        onInput=${(e) => updateColumn({ name: e.target.value })}
                    />
                </div>
                <div class="col-md-3">
                    <label class="form-label small mb-1 fw-bold">
                        ${getText('csv-sample/columns/type')}
                    </label>
                    <select
                        class="form-select form-select-sm"
                        value=${column.type}
                        onChange=${(e) => handleTypeChange(e.target.value)}
                    >
                        ${COLUMN_TYPES.map((t) => html`
                            <option value=${t.value}>${getText(t.key)}</option>
                        `)}
                    </select>
                </div>
                ${PERSON_TYPES.includes(column.type) || typeDef.rules.length > 0 ? html`
                    <div class="col-md-6">
                        ${PERSON_TYPES.includes(column.type)
                            ? html`
                                <${PersonGroupField}
                                    value=${column.personGroup ?? 0}
                                    onUpdate=${(personGroup) => updateColumn({ personGroup })}
                                />
                            `
                            : html`
                                <div class="row g-2">
                                    ${typeDef.rules.map((rule) => html`
                                        <div class="${rule === 'dateFormat'
                                            ? (column.dateFormatMode === 'custom' ? 'col-12' : 'col-6')
                                            : (typeDef.rules.length === 1 ? 'col-12' : 'col-6')}">
                                            ${rule === 'dateFormat'
                                                ? html`
                                                    <${DateFormatField}
                                                        column=${column}
                                                        onUpdate=${updateColumn}
                                                    />
                                                `
                                                : html`
                                                    <label class="form-label small mb-1 fw-bold">
                                                        ${getText(RULE_FIELDS[rule].key)}
                                                    </label>
                                                    <${RuleInput}
                                                        rule=${rule}
                                                        column=${column}
                                                        onUpdate=${(rule, value) => updateColumn({ [rule]: value })}
                                                    />
                                                `
                                            }
                                        </div>
                                    `)}
                                </div>
                            `
                        }
                    </div>
                ` : null}
            </div>
        </div>
    `;
};

const ColumnEditor = ({ columns, setColumns }) => {
    const updateColumn = (id, patch) => {
        setColumns(columns.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    };

    const removeColumn = (id) => {
        setColumns(columns.filter((c) => c.id !== id));
    };

    const moveColumn = (id, direction) => {
        const index = columns.findIndex((c) => c.id === id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= columns.length) return;
        const next = [...columns];
        [next[index], next[target]] = [next[target], next[index]];
        setColumns(next);
    };

    const insertColumnAt = (index, offset) => {
        const position = index + offset;
        const newColumn = CsvSampleService.createColumn(`column${columns.length + 1}`, 'fullName');
        const next = [...columns];
        next.splice(position, 0, newColumn);
        setColumns(next);
    };

    const addColumn = () => {
        const index = columns.length + 1;
        setColumns([...columns, CsvSampleService.createColumn(`column${index}`, 'fullName')]);
    };

    const canRemove = columns.length > 1;

    return html`
        <div>
            ${columns.length === 0
                ? html`
                    <div class="text-muted text-center py-4">
                        ${getText('csv-sample/columns/empty')}
                    </div>
                `
                : columns.map((column, index) => html`
                    <${ColumnRow}
                        key=${column.id}
                        column=${column}
                        index=${index}
                        total=${columns.length}
                        onUpdate=${updateColumn}
                        onRemove=${removeColumn}
                        onMoveUp=${() => moveColumn(column.id, -1)}
                        onMoveDown=${() => moveColumn(column.id, 1)}
                        onInsertBefore=${() => insertColumnAt(index, 0)}
                        onInsertAfter=${() => insertColumnAt(index, 1)}
                        canRemove=${canRemove}
                    />
                `)
            }
            <button class="btn btn-sm btn-outline-primary w-100 mt-2" onClick=${addColumn}>
                <i class="bi bi-plus-lg me-1"></i>${getText('csv-sample/button/add_column')}
            </button>
        </div>
    `;
};

export default ColumnEditor;
