import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { css } from 'goober';
import { getText } from '~/helpers/utils.js';
import QRCode from 'qrcode';

const DEFAULT_URL = 'https://feather-tools.com/simple-qrcode';

const previewStyle = css`
    display: inline-block;
    max-width: 512px;
    max-height: 512px;
    margin: 0 auto;
    border: 1px solid #ddd;
    padding: 10px;
`;

const PreviewCard = ({ settings, creating, onCreated }) => {
    const [image, setImage] = useState(null);

    const url = settings.url || DEFAULT_URL;
    const options = {
        width: 256,
        margin: 0,
        color: {
            dark: settings.foreground,
            light: settings.background
        }
    };

    useEffect(() => {
        QRCode.toCanvas(url, options).then(canvas => {
            setImage(canvas.toDataURL());
            onCreated();
        });
    }, [settings]);

    const handleDownload = (filename, url) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleDownloadPng = () => {
        handleDownload('qrcode.png', image);
    }

    const handleDownloadSvg = () => {
        QRCode.toString(url, { ...options, type: 'svg' }).then(svgString => {
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            handleDownload('qrcode.svg', URL.createObjectURL(blob));
        });
    }

    return html`
        <div class="card h-100">
            <div class="card-header">
                <h5 class="mb-0">${getText('simple-qrcode/preview/title')}</h5>
            </div>
            <div class="card-body text-center">
                <div class="d-flex justify-content-center mb-4">
                    <div id="qrcode-preview" class=${previewStyle}>
                        ${image && html`<img src=${image} />`}
                    </div>
                </div>
                <div class="btn-group">
                    <button class="btn btn-outline-success" disabled=${creating} onClick=${handleDownloadPng}>
                        <i class="bi bi-download me-1"></i> ${getText('simple-qrcode/preview/download-png')}
                    </button>
                    <button class="btn btn-outline-success" disabled=${creating} onClick=${handleDownloadSvg}>
                        <i class="bi bi-download me-1"></i> ${getText('simple-qrcode/preview/download-svg')}
                    </button>
                </div>
            </div>
        </div>
    `;
};

export default PreviewCard;
