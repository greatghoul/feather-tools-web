import { html } from 'htm/preact';
import { css } from 'goober';

const progressFtStyle = css`
    --bs-progress-height: 5px;
    --bs-progress-border-radius: 0;
`;

const ProgressBar = ({ value = 0 }) => {
    return html`
        <div class="progress ${progressFtStyle}">
            <div 
                class="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar" 
                style="width: ${value}%"
                aria-valuenow="${value}"
                aria-valuemin="0"
                aria-valuemax="100"
            />
        </div>
    `;
};

export default ProgressBar;