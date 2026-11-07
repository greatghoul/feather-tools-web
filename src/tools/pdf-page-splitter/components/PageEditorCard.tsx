import { t } from '~/helpers/i18n';
import type { LoadedPdf, PageSetting, Rotation, SplitMode } from '../services/types';
import CutOverlay from './CutOverlay';
import PdfCanvas from './PdfCanvas';
import styles from './PageEditorCard.module.css';

interface Props {
    pdf: LoadedPdf;
    page: PageSetting;
    onChange: (patch: Partial<PageSetting>) => void;
    onSelectPage: (index: number) => void;
}

const MODES: Array<{ mode: SplitMode; icon: string; key: string }> = [
    { mode: 'none', icon: 'bi-file-earmark', key: 'pdf-page-splitter/settings/mode_none' },
    { mode: 'horizontal', icon: 'bi-distribute-horizontal', key: 'pdf-page-splitter/settings/mode_horizontal' },
    { mode: 'vertical', icon: 'bi-distribute-vertical', key: 'pdf-page-splitter/settings/mode_vertical' },
];

const PageEditorCard = ({ pdf, page, onChange, onSelectPage }: Props) => {
    const rotate = (delta: number) => {
        onChange({ rotation: (((page.rotation + delta) % 360 + 360) % 360) as Rotation });
    };

    const positionPercent = Math.round(page.position * 100);

    return (
        <div className="card mb-3">
            <div className="card-header d-flex align-items-center justify-content-between gap-2">
                <h2 className="h6 mb-0">
                    <i className="bi bi-scissors me-1" aria-hidden="true" />
                    {t('pdf-page-splitter/editor/title')}
                </h2>
                <div className="d-flex align-items-center gap-2">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => onSelectPage(page.index - 1)}
                        disabled={page.index <= 0}
                        title={t('pdf-page-splitter/editor/prev')}
                    >
                        <i className="bi bi-chevron-left" aria-hidden="true" />
                    </button>
                    <span className="small text-muted text-nowrap">
                        {t('pdf-page-splitter/editor/page_prefix')} {page.index + 1} / {pdf.pageCount}{' '}
                        {t('pdf-page-splitter/editor/page_suffix')}
                    </span>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => onSelectPage(page.index + 1)}
                        disabled={page.index >= pdf.pageCount - 1}
                        title={t('pdf-page-splitter/editor/next')}
                    >
                        <i className="bi bi-chevron-right" aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div className="card-body">
                <div className={styles.stage}>
                    <div className={styles.canvasWrap}>
                        <PdfCanvas
                            doc={pdf.doc}
                            pageIndex={page.index}
                            rotation={page.rotation}
                            maxWidth={880}
                            maxHeight={640}
                            className={styles.canvas}
                        />
                        {page.mode !== 'none' && (
                            <CutOverlay
                                mode={page.mode}
                                position={page.position}
                                onChange={(position) => onChange({ position })}
                            />
                        )}
                    </div>
                </div>

                {page.mode !== 'none' && (
                    <p className="text-muted small text-center mt-2 mb-3">
                        <i className="bi bi-hand-index-thumb me-1" aria-hidden="true" />
                        {t('pdf-page-splitter/editor/drag_hint')}
                    </p>
                )}

                <div className="row g-3">
                    <div className="col-12 col-md-6">
                        <label className="form-label small fw-semibold mb-1">
                            {t('pdf-page-splitter/settings/split_mode')}
                        </label>
                        <div className="btn-group w-100" role="group">
                            {MODES.map(({ mode, icon, key }) => (
                                <button
                                    key={mode}
                                    type="button"
                                    className={`btn btn-sm ${page.mode === mode ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => onChange({ mode })}
                                >
                                    <i className={`bi ${icon} me-1`} aria-hidden="true" />
                                    {t(key)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <label className="form-label small fw-semibold mb-1">
                            {t('pdf-page-splitter/settings/rotation')}
                        </label>
                        <div className="d-flex align-items-center gap-2">
                            <div className="btn-group btn-group-sm">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => rotate(-90)}
                                    title={t('pdf-page-splitter/settings/rotate_left')}
                                >
                                    <i className="bi bi-arrow-counterclockwise" aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => rotate(90)}
                                    title={t('pdf-page-splitter/settings/rotate_right')}
                                >
                                    <i className="bi bi-arrow-clockwise" aria-hidden="true" />
                                </button>
                            </div>
                            <span className="small text-muted text-nowrap">{page.rotation}°</span>
                            <button
                                type="button"
                                className="btn btn-sm btn-link text-decoration-none ms-auto"
                                onClick={() => onChange({ rotation: 0 })}
                                disabled={page.rotation === 0}
                            >
                                {t('pdf-page-splitter/settings/rotation_reset')}
                            </button>
                        </div>
                    </div>

                    <div className="col-12">
                        <label className="form-label small fw-semibold mb-1 d-flex justify-content-between">
                            <span>
                                {t('pdf-page-splitter/settings/position')}
                                <span className="text-muted fw-normal ms-1">
                                    ({t('pdf-page-splitter/settings/position_hint')})
                                </span>
                            </span>
                            <span className="text-muted">{positionPercent}%</span>
                        </label>
                        <input
                            type="range"
                            className="form-range"
                            min={5}
                            max={95}
                            step={1}
                            value={positionPercent}
                            disabled={page.mode === 'none'}
                            onChange={(event) => onChange({ position: Number(event.target.value) / 100 })}
                        />
                    </div>
                </div>

                <div className="d-flex justify-content-end mt-2">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => onChange({ mode: 'none', position: 0.5, rotation: 0 })}
                        disabled={page.mode === 'none' && page.position === 0.5 && page.rotation === 0}
                    >
                        <i className="bi bi-arrow-counterclockwise me-1" aria-hidden="true" />
                        {t('pdf-page-splitter/editor/reset_page')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PageEditorCard;
