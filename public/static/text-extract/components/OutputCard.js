import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';

const TYPE_COLORS = {
    email: 'primary',
    phone: 'success',
    idCard: 'warning',
    url: 'info',
    ip: 'secondary',
    custom: 'dark',
};

const TYPE_LABELS = {
    email: 'text-extract/options/email',
    phone: 'text-extract/options/phone',
    idCard: 'text-extract/options/id_card',
    url: 'text-extract/options/url',
    ip: 'text-extract/options/ip',
    custom: 'text-extract/options/custom',
};

const OutputCard = ({ groups, total }) => {
    const [isCopying, setIsCopying] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const typeKeys = groups ? Object.keys(groups) : [];

    const hasContent = total > 0;

    const allItems = [];
    if (groups) {
        for (const type of typeKeys) {
            for (const item of groups[type]) {
                allItems.push({ type, value: item });
            }
        }
    }

    const displayedItems = activeTab === 'all' ? allItems : (groups[activeTab] || []);

    const handleCopy = () => {
        if (!hasContent || isCopying) return;

        setIsCopying(true);
        const text = displayedItems.map((item) => item.value || item).join('\n');
        navigator.clipboard.writeText(text).then(() => {
            notify(getText('text-extract/message/copied'), '', 'success');
            setTimeout(() => setIsCopying(false), 1000);
        });
    };

    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span>${getText('text-extract/output/title')}</span>
                <button
                    class="btn btn-sm btn-outline-primary"
                    onClick=${handleCopy}
                    disabled=${!hasContent || isCopying}
                >
                    ${getText('text-extract/button/copy')}
                </button>
            </div>
            <div class="card-body p-0">
                ${hasContent ? html`
                    <div class="border-bottom">
                        <ul class="nav nav-tabs px-3 pt-2">
                            <li class="nav-item">
                                <button
                                    class="nav-link ${activeTab === 'all' ? 'active' : ''}"
                                    onClick=${() => setActiveTab('all')}
                                >
                                    All (${total})
                                </button>
                            </li>
                            ${typeKeys.map((type) => html`
                                <li class="nav-item" key=${type}>
                                    <button
                                        class="nav-link ${activeTab === type ? 'active' : ''}"
                                        onClick=${() => setActiveTab(type)}
                                    >
                                        ${getText(TYPE_LABELS[type] || type)}
                                        <span class="badge bg-${TYPE_COLORS[type] || 'secondary'} ms-1" style="font-size:0.7em">${groups[type].length}</span>
                                    </button>
                                </li>
                            `)}
                        </ul>
                    </div>
                    <div class="p-0" style="min-height: 200px; max-height: 400px; overflow-y: auto;">
                        <table class="table table-hover mb-0">
                            <tbody>
                                ${activeTab === 'all'
                                    ? allItems.map((item, i) => html`
                                        <tr key=${i}>
                                            <td class="text-nowrap" style="width: 100px;">
                                                <span class="badge bg-${TYPE_COLORS[item.type] || 'secondary'}">
                                                    ${getText(TYPE_LABELS[item.type] || item.type)}
                                                </span>
                                            </td>
                                            <td class="font-monospace">${item.value}</td>
                                        </tr>
                                    `)
                                    : displayedItems.map((item, i) => html`
                                        <tr key=${i}>
                                            <td class="font-monospace">${item}</td>
                                        </tr>
                                    `)
                                }
                            </tbody>
                        </table>
                    </div>
                ` : html`
                    <div class="p-3 text-muted text-center" style="min-height: 100px; display: flex; align-items: center; justify-content: center;">
                        ${getText('text-extract/output/empty')}
                    </div>
                `}
            </div>
        </div>
    `;
};

export default OutputCard;
