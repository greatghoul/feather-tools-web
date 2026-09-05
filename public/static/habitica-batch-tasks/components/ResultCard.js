import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const ResultCard = ({ result }) => {
    if (!result) {
        return html`<div></div>`;
    }

    if (result.type === 'validation') {
        return html`
            <div class="alert alert-warning" role="alert">
                <i class="bi bi-exclamation-triangle"></i> ${result.message}
            </div>
        `;
    }

    if (result.type === 'start' || result.type === 'running') {
        const percent = result.total ? Math.round((result.progress / result.total) * 100) : 0;
        return html`
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between small mb-1">
                        <span>${getText('habitica-batch-tasks/message/creating')}</span>
                        <span>${result.progress} / ${result.total}</span>
                    </div>
                    <div class="progress">
                        <div class="progress-bar progress-bar-striped progress-bar-animated"
                             style="width: ${percent}%"></div>
                    </div>
                </div>
            </div>
        `;
    }

    if (result.type === 'done') {
        const successCount = result.results.length;
        const failureCount = result.failures.length;
        const summary = `${successCount} ${getText('habitica-batch-tasks/message/success')}, ${failureCount} ${getText('habitica-batch-tasks/message/failed')}`;

        return html`
            <div class="card">
                <div class="card-header bg-light d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-clipboard-check"></i> ${summary}</span>
                </div>
                <ul class="list-group list-group-flush">
                    ${result.results.map((item) => html`
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span class="text-truncate me-2">${item.text}</span>
                            <span class="badge text-bg-success bg-success">${getText('habitica-batch-tasks/message/success')}</span>
                        </li>
                    `)}
                    ${result.failures.map((item) => html`
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span class="text-truncate me-2" title=${item.error}>${item.text}</span>
                            <span class="badge text-bg-danger bg-danger">${getText('habitica-batch-tasks/message/failed')}</span>
                        </li>
                    `)}
                </ul>
            </div>
        `;
    }

    return html`<div></div>`;
};

export default ResultCard;