import { html } from 'htm/preact';
import { css } from 'goober';
import { useRef, useEffect } from 'preact/hooks';

const containerStyle = css``;

const inputStyle = css`
    -webkit-appearance: none !important;
    -moz-appearance: textfield !important;
    margin: 0 !important;
    
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0 !important;
    }
`;

const InputNumber = ({ value = 0, min = 0, max = 100, step = 1, onChange }) => {
    const timerRef = useRef(null);
    const valueRef = useRef(value);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    const handleDecrement = () => {
        const currentValue = valueRef.current;
        const newValue = Math.max(min, currentValue - step);
        if (newValue !== currentValue && onChange) {
            onChange(newValue);
        }
    };

    const handleIncrement = () => {
        const currentValue = valueRef.current;
        const newValue = Math.min(max, currentValue + step);
        if (newValue !== currentValue && onChange) {
            onChange(newValue);
        }
    };

    const startDecrement = () => {
        handleDecrement();
        timerRef.current = setInterval(handleDecrement, 100);
    };

    const startIncrement = () => {
        handleIncrement();
        timerRef.current = setInterval(handleIncrement, 100);
    };

    const stopChange = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleInputChange = (e) => {
        const newValue = parseInt(e.target.value, 10);
        if (!isNaN(newValue) && onChange) {
            onChange(newValue);
        }
    };

    return html`
        <div class="input-group input-group-sm ${containerStyle}">
            <button 
                class="btn btn-outline-secondary" 
                type="button" 
                onMouseDown=${startDecrement}
                onMouseUp=${stopChange}
                onMouseLeave=${stopChange}
            >-</button>
            <input 
                type="number" 
                class="form-control text-center ${inputStyle}" 
                value=${value} 
                min=${min} 
                max=${max} 
                step=${step}
                onInput=${handleInputChange}
            />
            <button 
                class="btn btn-outline-secondary" 
                type="button" 
                onMouseDown=${startIncrement}
                onMouseUp=${stopChange}
                onMouseLeave=${stopChange}
            >+</button>
        </div>
    `;
};

export default InputNumber;
