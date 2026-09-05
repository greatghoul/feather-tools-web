import { useState, useEffect } from 'react';
import { t } from '~/helpers/i18n';

const SettingsCard = ({ onSettingsChange, onDedup }) => {
    const [ignoreLeading, setIgnoreLeading] = useState(true);
    const [ignoreTrailing, setIgnoreTrailing] = useState(true);

    useEffect(() => {
        if (onSettingsChange) {
            onSettingsChange({
                ignoreLeading,
                ignoreTrailing,
            });
        }
    }, [ignoreLeading, ignoreTrailing, onSettingsChange]);

    return (
<>

        <div className="card">
            <div className="card-header bg-light">
                <h5 className="mb-0">{t('text-dedup/options/options')}</h5>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-6">
                        <h6 className="mb-2">{t('text-dedup/options/line_options')}</h6>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="ignoreLeading" checked={ignoreLeading} onChange={(e) => setIgnoreLeading(e.target.checked)} />
                            <label className="form-check-label" htmlFor="ignoreLeading">{t('text-dedup/options/ignore_leading_whitespace')}</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="ignoreTrailing" checked={ignoreTrailing} onChange={(e) => setIgnoreTrailing(e.target.checked)} />
                            <label className="form-check-label" htmlFor="ignoreTrailing">{t('text-dedup/options/ignore_trailing_whitespace')}</label>
                        </div>
                    </div>
                </div>
                <div className="d-flex gap-2 mt-3">
                    <button className="btn btn-primary" onClick={onDedup}>{t('text-dedup/button/remove_duplicates')}</button>
                </div>
            </div>
        </div>
    
</>
);
};

export default SettingsCard;
