import { html } from 'htm/preact';
import { css } from 'goober';

const containerStyle = css`
    overflow-x: auto;
    text-align: center;
    width: 100%;

    @media (max-width: 768px) {
        overflow-x: scroll;
    }
`;

const canvasStyle = css`
    border: 1px solid #dee2e6;
    background: white;
    max-width: 100%;
    display: block;
    margin: 0 auto;
`;

const CanvasPrintable = ({ canvasRef, layout = 'portrait', className = '', ...props }) => {
    return html`
        <div class=${containerStyle}>
            <canvas 
                ref=${canvasRef} 
                class="${canvasStyle} ${layout} ${className}" 
                ...${props}
            ></canvas>
        </div>
    `;
};

export default CanvasPrintable;
