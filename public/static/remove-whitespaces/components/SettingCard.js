import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

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
  
  return html`
    <div class="card mb-4">
      <div class="card-header bg-light">
        <h5 class="mb-0">${getText('remove-whitespaces/options/text_processing_options')}</h5>
      </div>
      <div class="card-body">
        <div class="row row-cols-1 row-cols-md-2 g-2 mb-4">
          <div class="col">
            <div class="mb-3">
              <h6 class="mb-2">${getText('remove-whitespaces/options/full_text_options')}</h6>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="trimFullLeading" checked=${trimFullLeading} onchange=${(e) => setTrimFullLeading(e.target.checked)} />
                <label class="form-check-label" for="trimFullLeading">${getText('remove-whitespaces/options/remove_full_leading_whitespace')}</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="trimFullTrailing" checked=${trimFullTrailing} onchange=${(e) => setTrimFullTrailing(e.target.checked)} />
                <label class="form-check-label" for="trimFullTrailing">${getText('remove-whitespaces/options/remove_full_trailing_whitespace')}</label>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="mb-3">
              <h6 class="mb-2">${getText('remove-whitespaces/options/line_options')}</h6>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="trimLineLeading" checked=${trimLineLeading} onchange=${(e) => setTrimLineLeading(e.target.checked)} />
                <label class="form-check-label" for="trimLineLeading">${getText('remove-whitespaces/options/remove_line_leading_whitespace')}</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="trimLineTrailing" checked=${trimLineTrailing} onchange=${(e) => setTrimLineTrailing(e.target.checked)} />
                <label class="form-check-label" for="trimLineTrailing">${getText('remove-whitespaces/options/remove_line_trailing_whitespace')}</label>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="mb-3">
              <h6 class="mb-2">${getText('remove-whitespaces/options/blank_line_option')}</h6>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="blankLineOption" id="removeEmptyLines" checked=${blankLineOption === 'remove'} onchange=${() => setBlankLineOption('remove')} />
                <label class="form-check-label" for="removeEmptyLines">${getText('remove-whitespaces/options/remove_empty_lines')}</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="blankLineOption" id="mergeEmptyLines" checked=${blankLineOption === 'merge'} onchange=${() => setBlankLineOption('merge')} />
                <label class="form-check-label" for="mergeEmptyLines">${getText('remove-whitespaces/options/merge_empty_lines')}</label>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="mb-3">
              <h6 class="mb-2">${getText('remove-whitespaces/options/other_options')}</h6>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="removeChineseWhitespace" checked=${removeChineseWhitespace} onchange=${(e) => setRemoveChineseWhitespace(e.target.checked)} />
                <label class="form-check-label" for="removeChineseWhitespace">${getText('remove-whitespaces/options/remove_chinese_whitespace')}</label>
              </div>
            </div>
          </div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary" onClick=${handleSubmit}>${getText('remove-whitespaces/button/process_text')}</button>
        </div>
      </div>
    </div>
  `;
};

export default SettingCard;