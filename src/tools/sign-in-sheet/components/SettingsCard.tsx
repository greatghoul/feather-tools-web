import { t } from '~/helpers/i18n';
import type { SignMode } from '../services/SheetRenderer';

const SettingsCard = ({
    title, onTitleChange,
    date, onDateChange,
    location, onLocationChange,
    signMode, onSignModeChange,
    maskPhone, onMaskPhoneChange, maskPhoneEnabled,
    maskEmail, onMaskEmailChange, maskEmailEnabled,
    blankRows, onBlankRowsChange,
    onGenerate,
    onPrint, onDownloadPdf, isExporting,
}) => {
    return (
<>

        <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t('sign-in-sheet/settings/card_title')}</h5>
                <button className="btn btn-sm invisible" tabIndex={-1}>&nbsp;</button>
            </div>
            <div className="card-body">
                <div className="mb-3">
                    <label className="form-label" htmlFor="sisTitle">{t('sign-in-sheet/settings/title')}</label>
                    <input type="text" id="sisTitle" className="form-control" value={title} onInput={(e) => onTitleChange((e.target as HTMLInputElement).value)} />
                </div>

                <div className="row">
                    <div className="col-6 mb-3">
                        <label className="form-label" htmlFor="sisDate">{t('sign-in-sheet/settings/date')}</label>
                        <input type="text" id="sisDate" className="form-control" value={date} onInput={(e) => onDateChange((e.target as HTMLInputElement).value)} placeholder={t('sign-in-sheet/settings/date_placeholder')} />
                    </div>
                    <div className="col-6 mb-3">
                        <label className="form-label" htmlFor="sisLocation">{t('sign-in-sheet/settings/location')}</label>
                        <input type="text" id="sisLocation" className="form-control" value={location} onInput={(e) => onLocationChange((e.target as HTMLInputElement).value)} placeholder={t('sign-in-sheet/settings/location_placeholder')} />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label mb-2 d-block">{t('sign-in-sheet/settings/sign_mode')}</label>
                    <div className="d-flex gap-3">
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="sisSignMode" id="sisSignModeSignature" value="signature" checked={signMode === 'signature'} onChange={() => onSignModeChange('signature')} />
                            <label className="form-check-label" htmlFor="sisSignModeSignature">{t('sign-in-sheet/settings/sign_mode_signature')}</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="sisSignMode" id="sisSignModeCheck" value="check" checked={signMode === 'check'} onChange={() => onSignModeChange('check')} />
                            <label className="form-check-label" htmlFor="sisSignModeCheck">{t('sign-in-sheet/settings/sign_mode_check')}</label>
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label mb-2 d-block">{t('sign-in-sheet/settings/privacy')}</label>
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="sisMaskPhone" checked={maskPhone} disabled={!maskPhoneEnabled} onChange={(e) => onMaskPhoneChange(e.target.checked)} />
                        <label className="form-check-label" htmlFor="sisMaskPhone">{t('sign-in-sheet/settings/mask_phone')}</label>
                    </div>
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="sisMaskEmail" checked={maskEmail} disabled={!maskEmailEnabled} onChange={(e) => onMaskEmailChange(e.target.checked)} />
                        <label className="form-check-label" htmlFor="sisMaskEmail">{t('sign-in-sheet/settings/mask_email')}</label>
                    </div>
                </div>

                <div className="mb-1">
                    <label className="form-label" htmlFor="sisBlankRows">{t('sign-in-sheet/settings/blank_rows')}</label>
                    <input type="number" id="sisBlankRows" className="form-control" min={0} max={500} value={blankRows} onInput={(e) => onBlankRowsChange(Math.max(0, Math.min(500, Number((e.target as HTMLInputElement).value) || 0)))} />
                    <div className="text-muted mt-1" style={{ fontSize: '0.82rem' }}>{t('sign-in-sheet/settings/blank_rows_hint')}</div>
                </div>
            </div>
            <div className="card-footer bg-light">
                <button className="btn btn-primary w-100" onClick={onGenerate}>
                    <i className="bi bi-magic me-1"></i>{t('sign-in-sheet/button/generate')}
                </button>
            </div>
        </div>

        <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary flex-fill" onClick={onDownloadPdf} disabled={isExporting}>
                {isExporting ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-download me-1"></i>}
                {t('sign-in-sheet/button/download_pdf')}
            </button>
            <button className="btn btn-primary flex-fill" onClick={onPrint}>
                <i className="bi bi-printer me-1"></i>{t('common/print')}
            </button>
        </div>

</>
    );
};

export default SettingsCard;
