import { html } from 'htm/preact';

const SquareShape = () => {
    return html`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" stroke="currentColor" stroke-width="2" class="shape-icon">
            <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>
    `;
};

export default SquareShape;