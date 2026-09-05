import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const labelOf = (content, key) => (content && content[key] && content[key].text) ? content[key].text : key;

const cellKey = (egg, potion) => `${egg}|${potion}`;

const isValidCombo = (content, egg, potion) => Boolean(content && content.petInfo && content.petInfo[`${egg}-${potion}`]);

const computeBudget = (inventory, selected) => {
    const eggUsed = {};
    const potionUsed = {};
    for (const key of selected) {
        const sep = key.indexOf('|');
        const egg = key.slice(0, sep);
        const potion = key.slice(sep + 1);
        eggUsed[egg] = (eggUsed[egg] || 0) + 1;
        potionUsed[potion] = (potionUsed[potion] || 0) + 1;
    }
    return { eggUsed, potionUsed };
};

const isSelectable = (content, inventory, egg, potion, eggUsed, potionUsed) => {
    if (!isValidCombo(content, egg, potion)) {
        return false;
    }
    const petKey = `${egg}-${potion}`;
    if ((inventory.pets[petKey] || 0) > 0) {
        return false;
    }
    if ((eggUsed[egg] || 0) >= inventory.eggs[egg]) {
        return false;
    }
    if ((potionUsed[potion] || 0) >= inventory.potions[potion]) {
        return false;
    }
    return true;
};

const HatchMatrixCard = ({
    content,
    inventory,
    loading,
    selected,
    onSetSelected,
    running,
    cellStatus,
    disabled,
    pending,
    onHatch,
    onConfirm,
    onCancel,
    onLoad
}) => {
    const eggs = inventory
        ? Object.keys(inventory.eggs).sort((a, b) => labelOf(content.eggs, a).localeCompare(labelOf(content.eggs, b)))
        : [];
    const potions = inventory
        ? Object.keys(inventory.potions).sort((a, b) => labelOf(content.hatchingPotions, a).localeCompare(labelOf(content.hatchingPotions, b)))
        : [];
    const { eggUsed, potionUsed } = inventory
        ? computeBudget(inventory, selected)
        : { eggUsed: {}, potionUsed: {} };
    const selectedCount = selected.size;

    const handleToggle = (egg, potion) => {
        const key = cellKey(egg, potion);
        const next = new Set(selected);
        if (next.has(key)) {
            next.delete(key);
        } else if (isSelectable(content, inventory, egg, potion, eggUsed, potionUsed)) {
            next.add(key);
        }
        onSetSelected(next);
    };

    const handleSelectAll = () => {
        const next = new Set(selected);
        const usedEgg = { ...eggUsed };
        const usedPotion = { ...potionUsed };
        for (const egg of eggs) {
            for (const potion of potions) {
                if (isSelectable(content, inventory, egg, potion, usedEgg, usedPotion)) {
                    const key = cellKey(egg, potion);
                    if (!next.has(key)) {
                        next.add(key);
                        usedEgg[egg] = (usedEgg[egg] || 0) + 1;
                        usedPotion[potion] = (usedPotion[potion] || 0) + 1;
                    }
                }
            }
        }
        onSetSelected(next);
    };

    const handleClearSelection = () => {
        onSetSelected(new Set());
    };

    const renderCell = (egg, potion) => {
        const key = cellKey(egg, potion);
        const isSelected = selected.has(key);
        const petKey = `${egg}-${potion}`;
        const owned = (inventory.pets[petKey] || 0) > 0;
        const invalid = !isValidCombo(content, egg, potion);
        const failed = cellStatus[key] === true;
        const selectable = isSelectable(content, inventory, egg, potion, eggUsed, potionUsed);

        if (running && isSelected) {
            return html`
                <td class="p-0 text-center">
                    <button class="btn btn-primary btn-sm w-100"
                            style="min-height: 32px;"
                            disabled>
                        <span class="spinner-border spinner-border-sm"></span>
                    </button>
                </td>
            `;
        }

        if (owned) {
            return html`
                <td class="p-0 text-center">
                    <button class="btn btn-sm w-100 border-0 text-success"
                            style="min-height: 32px; cursor: default;"
                            title=${getText('habitica-egg-hatcher/matrix/owned')}
                            disabled>
                        <i class="bi bi-check-circle"></i>
                    </button>
                </td>
            `;
        }

        if (isSelected) {
            return html`
                <td class="p-0 text-center">
                    <button class="btn btn-primary btn-sm w-100"
                            style="min-height: 32px;"
                            onClick=${() => handleToggle(egg, potion)}
                            disabled=${disabled}>
                        <i class="bi bi-check-lg"></i>
                    </button>
                </td>
            `;
        }

        if (failed) {
            return html`
                <td class="p-0 text-center">
                    <button class="btn btn-sm w-100 btn-outline-danger"
                            style="min-height: 32px;"
                            title=${getText('habitica-egg-hatcher/message/failed')}
                            onClick=${() => handleToggle(egg, potion)}
                            disabled=${disabled}>
                        <i class="bi bi-x-lg"></i>
                    </button>
                </td>
            `;
        }

        if (invalid) {
            return html`
                <td class="p-0 text-center">
                    <button class="btn btn-sm w-100 border-0 text-muted"
                            style="min-height: 32px; cursor: default; opacity: 0.45;"
                            title=${getText('habitica-egg-hatcher/matrix/invalid')}
                            disabled>
                        <i class="bi bi-ban"></i>
                    </button>
                </td>
            `;
        }

        return html`
            <td class="p-0 text-center">
                <button class="btn btn-sm w-100 ${selectable ? 'btn-outline-primary' : 'btn-outline-secondary'}"
                        style="min-height: 32px;"
                        onClick=${() => handleToggle(egg, potion)}
                        disabled=${disabled || !selectable}>
                    <i class="bi bi-plus-lg"></i>
                </button>
            </td>
        `;
    };

    return html`
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <a class="nav-link active" href="#">
                            <i class="bi bi-grid me-1"></i>${getText('habitica-egg-hatcher/matrix/title')}
                        </a>
                    </li>
                </ul>
                <div class="d-flex align-items-center gap-1">
                    ${inventory && html`
                        <button class="btn btn-sm btn-outline-info" onClick=${handleSelectAll} disabled=${disabled || eggs.length === 0}>
                            <i class="bi bi-check2-square me-1"></i>${getText('habitica-egg-hatcher/button/select_all')}
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onClick=${handleClearSelection} disabled=${disabled || selectedCount === 0}>
                            <i class="bi bi-x-circle me-1"></i>${getText('habitica-egg-hatcher/button/clear_selection')}
                        </button>
                        <button class="btn btn-sm btn-outline-primary" onClick=${onLoad} disabled=${disabled || loading}>
                            ${loading
                                ? html`<span class="spinner-border spinner-border-sm me-1"></span>`
                                : html`<i class="bi bi-arrow-repeat me-1"></i>`}
                            ${getText('habitica-egg-hatcher/button/refresh')}
                        </button>
                    `}
                </div>
            </div>

            <div class="card-body p-2">
                ${loading && html`
                    <div class="text-center py-4 text-muted small">
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        ${getText('habitica-egg-hatcher/message/loading_inventory')}
                    </div>
                `}

                ${!loading && !inventory && html`
                    <div class="text-center py-4">
                        <div class="text-muted small mb-3">
                            <i class="bi bi-info-circle me-1"></i>
                            ${getText('habitica-egg-hatcher/message/inventory_empty')}
                        </div>
                        <button class="btn btn-primary" onClick=${onLoad} disabled=${disabled}>
                            ${loading
                                ? html`<span class="spinner-border spinner-border-sm me-1"></span>`
                                : html`<i class="bi bi-box-seam me-1"></i>`}
                            ${getText('habitica-egg-hatcher/button/load_inventory')}
                        </button>
                    </div>
                `}

                ${!loading && inventory && html`
                    <div class="habitica-egg-matrix-wrap">
                        <table class="table table-sm align-middle mb-0 habitica-egg-matrix">
                            <thead>
                                <tr>
                                    <th class="habitica-egg-matrix-corner">${getText('habitica-egg-hatcher/matrix/potions')}</th>
                                    ${eggs.map((egg) => html`
                                        <th class="habitica-egg-matrix-head">
                                            <div class="habitica-egg-matrix-head-text" title=${labelOf(content.eggs, egg)}>
                                                ${labelOf(content.eggs, egg)}
                                            </div>
                                            <span class="badge text-bg-secondary">${inventory.eggs[egg]}</span>
                                        </th>
                                    `)}
                                </tr>
                            </thead>
                            <tbody>
                                ${potions.map((potion) => html`
                                    <tr>
                                        <th class="habitica-egg-matrix-row-head" scope="row">
                                            <div class="habitica-egg-matrix-row-inner">
                                                <span class="habitica-egg-matrix-row-text">${labelOf(content.hatchingPotions, potion)}</span>
                                                <span class="badge text-bg-secondary">${inventory.potions[potion]}</span>
                                            </div>
                                        </th>
                                        ${eggs.map((egg) => renderCell(egg, potion))}
                                    </tr>
                                `)}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>

            ${inventory && html`
                <div class="card-footer bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                    ${pending ? html`
                        <span class="small">
                            <i class="bi bi-exclamation-triangle me-1 text-warning"></i>
                            ${getText('habitica-egg-hatcher/message/confirm_hatch')
                                .replace('{count}', String(pending.jobs.length))
                                .replace('{eggs}', String(pending.jobs.length))
                                .replace('{potions}', String(pending.jobs.length))}
                        </span>
                        <span class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-secondary" onClick=${onCancel} disabled=${disabled}>
                                <i class="bi bi-x-circle me-1"></i>${getText('habitica-egg-hatcher/button/cancel')}
                            </button>
                            <button class="btn btn-sm btn-warning" onClick=${onConfirm} disabled=${disabled}>
                                <i class="bi bi-check-circle me-1"></i>${getText('habitica-egg-hatcher/button/confirm')}
                            </button>
                        </span>
                    ` : html`
                        <span class="small text-muted">
                            <i class="bi bi-stack me-1"></i>
                            ${selectedCount} ${getText('habitica-egg-hatcher/message/selected_count')}
                        </span>
                        <button class="btn btn-primary" onClick=${onHatch} disabled=${disabled || selectedCount === 0}>
                            ${disabled
                                ? html`<span class="spinner-border spinner-border-sm me-1"></span>`
                                : html`<i class="bi bi-fire me-1"></i>`}
                            ${getText('habitica-egg-hatcher/button/hatch')}
                        </button>
                    `}
                </div>
            `}
        </div>
    `;
};

export default HatchMatrixCard;
