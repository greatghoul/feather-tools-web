import { html } from 'htm/preact';

const CircleShape = () => {
    return html`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" stroke="currentColor" stroke-width="2" class="shape-icon">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>
    `;
};

export default CircleShape;