import { html } from 'htm/preact';

const TriangleShape = () => {
    return html`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" stroke="currentColor" stroke-width="2" class="shape-icon">
            <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>
    `;
};

export default TriangleShape;