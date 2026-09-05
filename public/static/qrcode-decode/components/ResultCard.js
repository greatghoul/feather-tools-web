import { html } from 'htm/preact';
import { useEffect, useRef } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import QRDecoder from '@/services/QRDecoder.js';

const ResultCard = ({ images = [], results = {}, onResult }) => {
    const decoderRef = useRef(new QRDecoder());

    useEffect(() => {
        images.forEach((image) => {
            if (results[image.id] !== undefined) return;
            onResult(image.id, { status: 'decoding' });
            decoderRef.current.decode(image).then((result) => {
                onResult(image.id, { status: 'done', ...result });
            }).catch(() => {
                onResult(image.id, { status: 'done', success: false, data: null, image });
            });
        });
    }, [images]);

    const handleCopyAll = async () => {
        const allTexts = [];
        for (const result of Object.values(results)) {
            if (result.status === 'done' && result.success && result.data) {
                allTexts.push(result.data);
            }
        }
        if (allTexts.length === 0) return;
        await navigator.clipboard.writeText(allTexts.join('\n'));
    };

    const handleCopy = async (text) => {
        await navigator.clipboard.writeText(text);
    };

    const renderBlankState = () => html`
        <div class="card-body text-center">
            <div class="text-muted">
                <i class="bi bi-qr-code" style="font-size: 2rem;"></i>
                <p class="mt-2 fw-semibold">${getText('qrcode-decode/result/no_images')}</p>
                <small class="text-muted">${getText('qrcode-decode/result/upload_hint')}</small>
            </div>
        </div>
    `;

    const decodedCount = Object.values(results).filter(
        (r) => r.status === 'done' && r.success && r.data
    ).length;

    return html`
        <div class="card mb-3">
            <div class="card-header d-flex align-items-center">
                <i class="bi bi-qr-code-scan me-1"></i>
                ${getText('qrcode-decode/input/images')}
                <div class="ms-auto">
                    <button
                        class="btn btn-outline-success btn-sm"
                        disabled=${decodedCount === 0}
                        onClick=${handleCopyAll}
                    >
                        <i class="bi bi-clipboard me-1"></i>
                        ${getText('qrcode-decode/result/copy_all')}
                    </button>
                </div>
            </div>
            ${images.length > 0
                ? html`
                    <div class="card-body">
                        ${images.map((image) => {
                            const result = results[image.id];
                            const isDecoding = result && result.status === 'decoding';
                            const isDone = result && result.status === 'done';
                            const isSuccess = isDone && result.success;
                            const data = isSuccess ? result.data : null;

                            return html`
                                <div class="row g-0 border rounded mb-3 overflow-hidden" key=${image.id}>
                                    <div class="col-md-4 d-flex align-items-center justify-content-center bg-light p-3">
                                        <img src=${image.url} class="img-fluid"
                                            style="max-height: 150px; object-fit: contain;" />
                                    </div>
                                    <div class="col-md-8 d-flex flex-column">
                                        <div class="p-3 flex-grow-1 d-flex flex-column">
                                            <div class="mb-1">
                                                <small class="text-muted">${image.name}</small>
                                            </div>
                                            ${isDecoding
                                                ? html`
                                                    <div class="d-flex align-items-center text-muted flex-grow-1">
                                                        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                                                        <span>${getText('qrcode-decode/result/decoding')}</span>
                                                    </div>
                                                `
                                                : isSuccess
                                                    ? html`
                                                        <div class="flex-grow-1">
                                                            <div class="d-flex align-items-center mb-2">
                                                                <i class="bi bi-check-circle-fill text-success me-1"></i>
                                                                <small class="text-success">
                                                                    ${getText('qrcode-decode/result/decode_success')}
                                                                </small>
                                                            </div>
                                                            <div class="mb-2 border-bottom pb-2">
                                                                <pre class="bg-light rounded p-2 mb-0"
                                                                    style="max-height: 80px; overflow-y: auto; font-size: 0.85rem; white-space: pre-wrap; word-break: break-all; cursor: pointer;"
                                                                    onClick=${() => handleCopy(data)}
                                                                    title=${getText('qrcode-decode/result/click_to_copy')}
                                                                >${data}</pre>
                                                                <div class="mt-1">
                                                                    <button
                                                                        class="btn btn-sm btn-outline-secondary"
                                                                        onClick=${() => handleCopy(data)}
                                                                    >
                                                                        <i class="bi bi-clipboard me-1"></i>
                                                                        ${getText('qrcode-decode/result/copied')}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    `
                                                    : html`
                                                        <div class="d-flex align-items-center text-muted flex-grow-1">
                                                            <i class="bi bi-x-circle-fill text-danger me-1"></i>
                                                            <span>${getText('qrcode-decode/result/decode_failed')}</span>
                                                        </div>
                                                    `
                                            }
                                        </div>
                                    </div>
                                </div>
                            `;
                        })}
                    </div>
                `
                : renderBlankState()
            }
        </div>
    `;
};

export default ResultCard;
