import { useState } from 'react';
import { t } from '~/helpers/i18n';
import type { SplitMode } from '../services/types';

interface Props {
    onApplyMode: (mode: SplitMode) => void;
    onApplyPosition: (position: number) => void;
    onRotateAll: (delta: number) => void;
    onResetRotationAll: () => void;
    onResetAll: () => void;
    cutPageCount: number;
}

const MODES: Array<{ mode: SplitMode; icon: string; key: string }> = [
    { mode: 'none', icon: 'bi-file-earmark', key: 'pdf-page-splitter/settings/mode_none' },
    { mode: 'horizontal', icon: 'bi-distribute-horizontal', key: 'pdf-page-splitter/settings/mode_horizontal' },
    { mode: 'vertical', icon: 'bi-distribute-vertical', key: 'pdf-page-splitter/settings/mode_vertical' },
];

const SettingsCard = ({
    onApplyMode,
    onApplyPosition,
    onRotateAll,
    onResetRotationAll,
    onResetAll,
    cutPageCount,
}: Props) => {
    const [mode, setMode] = useState<SplitMode>('none');
    const [position, setPosition] = useState(50);

    const applyMode = (next: SplitMode) => {
        setMode(next);
        onApplyMode(next);
    };

    return (
        <div className="card mb-3">
            <div className="card-header">
                <h2 className="h6 mb-0">
                    <i className="bi bi-sliders me-1" aria-hidden="true" />
                    {t('pdf-page-splitter/settings/title')}
                </h2>
            </div>
            <div className="card-body">
                <p className="text-muted small">{t('pdf-page-splitter/settings/hint')}</p>

                <label className="form-label small fw-semibold mb-1">
                    {t('pdf-page-splitter/settings/apply_mode_all')}
                </label>
                <div className="btn-group w-100 mb-3" role="group">
                    {MODES.map(({ mode: value, icon, key }) => (
                        <button
                            key={value}
                            type="button"
                            className={`btn btn-sm ${mode === value ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => applyMode(value)}
                        >
                            <i className={`bi ${icon} me-1`} aria-hidden="true" />
                            {t(key)}
                        </button>
                    ))}
                </div>

                <label className="form-label small fw-semibold mb-1 d-flex justify-content-between">
                    <span>{t('pdf-page-splitter/settings/apply_position_all')}</span>
                    <span className="text-muted fw-normal">{position}%</span>
                </label>
                <div className="d-flex align-items-center gap-2 mb-3">
                    <input
                        type="range"
                        className="form-range"
                        min={5}
                        max={95}
                        step={1}
                        value={position}
                        onChange={(event) => setPosition(Number(event.target.value))}
                    />
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary text-nowrap"
                        onClick={() => onApplyPosition(position / 100)}
                    >
                        {t('pdf-page-splitter/settings/apply')}
                    </button>
                </div>

                <label className="form-label small fw-semibold mb-1">
                    {t('pdf-page-splitter/settings/apply_rotation_all')}
                </label>
                <div className="d-flex flex-wrap gap-2 mb-3">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => onRotateAll(-90)}
                    >
                        <i className="bi bi-arrow-counterclockwise me-1" aria-hidden="true" />
                        {t('pdf-page-splitter/settings/rotate_left')}
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => onRotateAll(90)}
                    >
                        <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
                        {t('pdf-page-splitter/settings/rotate_right')}
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={onResetRotationAll}
                    >
                        {t('pdf-page-splitter/settings/rotation_reset')}
                    </button>
                </div>

                <div className="d-flex align-items-center justify-content-between border-top pt-3">
                    <span className="small text-muted">
                        {t('pdf-page-splitter/settings/cut_pages')}: {cutPageCount}
                    </span>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={onResetAll}>
                        {t('pdf-page-splitter/settings/reset_all')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsCard;
