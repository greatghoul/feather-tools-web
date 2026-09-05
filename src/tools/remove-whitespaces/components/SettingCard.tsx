import { useState } from 'react';
import { t } from '~/helpers/i18n';

const SettingCard = ({ onSubmit }) => {
  const handleSubmit = () => {
    const settings = {
      trimFullLeading: trimFullLeading,
      trimFullTrailing: trimFullTrailing,
      trimLineLeading: trimLineLeading,
      trimLineTrailing: trimLineTrailing,
      blankLineOption: blankLineOption,
      removeChineseWhitespace: removeChineseWhitespace
    };
    onSubmit(settings);
  };
  const [trimFullLeading, setTrimFullLeading] = useState(true);
  const [trimFullTrailing, setTrimFullTrailing] = useState(true);
  const [trimLineLeading, setTrimLineLeading] = useState(true);
  const [trimLineTrailing, setTrimLineTrailing] = useState(true);
  const [blankLineOption, setBlankLineOption] = useState('merge'); // 'none', 'remove', 'merge'
  const [removeChineseWhitespace, setRemoveChineseWhitespace] = useState(false);
  
  return (
<>

    <div className="card mb-4">
      <div className="card-header bg-light">
        <h5 className="mb-0">{t('remove-whitespaces/options/text_processing_options')}</h5>
      </div>
      <div className="card-body">
        <div className="row row-cols-1 row-cols-md-2 g-2 mb-4">
          <div className="col">
            <div className="mb-3">
              <h6 className="mb-2">{t('remove-whitespaces/options/full_text_options')}</h6>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="trimFullLeading" checked={trimFullLeading} onChange={(e) => setTrimFullLeading(e.target.checked)} />
                <label className="form-check-label" htmlFor="trimFullLeading">{t('remove-whitespaces/options/remove_full_leading_whitespace')}</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="trimFullTrailing" checked={trimFullTrailing} onChange={(e) => setTrimFullTrailing(e.target.checked)} />
                <label className="form-check-label" htmlFor="trimFullTrailing">{t('remove-whitespaces/options/remove_full_trailing_whitespace')}</label>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="mb-3">
              <h6 className="mb-2">{t('remove-whitespaces/options/line_options')}</h6>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="trimLineLeading" checked={trimLineLeading} onChange={(e) => setTrimLineLeading(e.target.checked)} />
                <label className="form-check-label" htmlFor="trimLineLeading">{t('remove-whitespaces/options/remove_line_leading_whitespace')}</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="trimLineTrailing" checked={trimLineTrailing} onChange={(e) => setTrimLineTrailing(e.target.checked)} />
                <label className="form-check-label" htmlFor="trimLineTrailing">{t('remove-whitespaces/options/remove_line_trailing_whitespace')}</label>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="mb-3">
              <h6 className="mb-2">{t('remove-whitespaces/options/blank_line_option')}</h6>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="blankLineOption" id="removeEmptyLines" checked={blankLineOption === 'remove'} onChange={() => setBlankLineOption('remove')} />
                <label className="form-check-label" htmlFor="removeEmptyLines">{t('remove-whitespaces/options/remove_empty_lines')}</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="blankLineOption" id="mergeEmptyLines" checked={blankLineOption === 'merge'} onChange={() => setBlankLineOption('merge')} />
                <label className="form-check-label" htmlFor="mergeEmptyLines">{t('remove-whitespaces/options/merge_empty_lines')}</label>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="mb-3">
              <h6 className="mb-2">{t('remove-whitespaces/options/other_options')}</h6>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="removeChineseWhitespace" checked={removeChineseWhitespace} onChange={(e) => setRemoveChineseWhitespace(e.target.checked)} />
                <label className="form-check-label" htmlFor="removeChineseWhitespace">{t('remove-whitespaces/options/remove_chinese_whitespace')}</label>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={handleSubmit}>{t('remove-whitespaces/button/process_text')}</button>
        </div>
      </div>
    </div>
  
</>
);
};

export default SettingCard;
