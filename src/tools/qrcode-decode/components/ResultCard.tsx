import { useEffect, useRef } from 'react';
import { t } from '~/helpers/i18n';
import QRDecoder from '../services/QRDecoder';

const ResultCard = ({ images = [] as any[], results = {} as any, onResult }) => {
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
        const allTexts: any[] = [];
        for (const result of Object.values<any>(results)) {
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

    const renderBlankState = () => (
<>

        <div className="card-body text-center">
            <div className="text-muted">
                <i className="bi bi-qr-code" style={{ fontSize: '2rem' }}></i>
                <p className="mt-2 fw-semibold">{t('qrcode-decode/result/no_images')}</p>
                <small className="text-muted">{t('qrcode-decode/result/upload_hint')}</small>
            </div>
        </div>
    
</>
);

    const decodedCount = Object.values<any>(results).filter(
        (r) => r.status === 'done' && r.success && r.data
    ).length;

    return (
<>

        <div className="card mb-3">
            <div className="card-header d-flex align-items-center">
                <i className="bi bi-qr-code-scan me-1"></i>
                {t('qrcode-decode/input/images')}
                <div className="ms-auto">
                    <button className="btn btn-outline-success btn-sm" disabled={decodedCount === 0} onClick={handleCopyAll}>
                        <i className="bi bi-clipboard me-1"></i>
                        {t('qrcode-decode/result/copy_all')}
                    </button>
                </div>
            </div>
            {images.length > 0
                ? (
<>

                    <div className="card-body">
                        {images.map((image) => {
                            const result = results[image.id];
                            const isDecoding = result && result.status === 'decoding';
                            const isDone = result && result.status === 'done';
                            const isSuccess = isDone && result.success;
                            const data = isSuccess ? result.data : null;

                            return (
                                <div className="row g-0 border rounded mb-3 overflow-hidden" key={image.id}>
                                    <div className="col-md-4 d-flex align-items-center justify-content-center bg-light p-3">
                                        <img src={image.url} className="img-fluid" style={{ maxHeight: '150px', objectFit: 'contain' }} />
                                    </div>
                                    <div className="col-md-8 d-flex flex-column">
                                        <div className="p-3 flex-grow-1 d-flex flex-column">
                                            <div className="mb-1">
                                                <small className="text-muted">{image.name}</small>
                                            </div>
                                            {isDecoding
                                                ? (
<>

                                                    <div className="d-flex align-items-center text-muted flex-grow-1">
                                                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                                        <span>{t('qrcode-decode/result/decoding')}</span>
                                                    </div>
                                                
</>
)
                                                : isSuccess
                                                    ? (
<>

                                                        <div className="flex-grow-1">
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="bi bi-check-circle-fill text-success me-1"></i>
                                                                <small className="text-success">
                                                                    {t('qrcode-decode/result/decode_success')}
                                                                </small>
                                                            </div>
                                                            <div className="mb-2 border-bottom pb-2">
                                                                <pre className="bg-light rounded p-2 mb-0" style={{ maxHeight: '80px', overflowY: 'auto', fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all', cursor: 'pointer' }} onClick={() => handleCopy(data)} title={t('qrcode-decode/result/click_to_copy')}>{data}</pre>
                                                                <div className="mt-1">
                                                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => handleCopy(data)}>
                                                                        <i className="bi bi-clipboard me-1"></i>
                                                                        {t('qrcode-decode/result/copied')}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    
</>
)
                                                    : (
<>

                                                        <div className="d-flex align-items-center text-muted flex-grow-1">
                                                            <i className="bi bi-x-circle-fill text-danger me-1"></i>
                                                            <span>{t('qrcode-decode/result/decode_failed')}</span>
                                                        </div>
                                                    
</>
)
                                            }
                                        </div>
                                    </div>
                                </div>
);
                        })}
                    </div>
                
</>
)
                : renderBlankState()
            }
        </div>
    
</>
);
};

export default ResultCard;
