import { html } from 'htm/preact';
import { render } from 'preact';
import { useState } from 'preact/hooks';

import InputCard from '@/components/InputCard.js';
import OutputCard from '@/components/OutputCard.js';

const HabitTracker = () => {
    const [printLayout, setPrintLayout] = useState(1); // Default: 1 chart per page
    const [yearType, setYearType] = useState('not-specific');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const handleLayoutChange = (layout) => {
        setPrintLayout(layout);
    };

    const handleYearChange = ({ type, year }) => {
        setYearType(type);
        if (year) {
            setSelectedYear(year);
        }
    };
    
    return html`
        <div class="row">
            <div class="col-md-6 col-lg-4">
                <${InputCard} 
                    onLayoutChange=${handleLayoutChange} 
                    selectedLayout=${printLayout}
                    onYearChange=${handleYearChange}
                    selectedYear=${selectedYear}
                    yearType=${yearType}
                />
            </div>
            <div class="col-md-6 col-lg-8">
                <${OutputCard} 
                    printLayout=${printLayout}
                    showDayInCell=${true}
                    yearType=${yearType}
                    selectedYear=${selectedYear}
                />
            </div>
        </div>
    `;
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    render(html`<${HabitTracker} />`, document.getElementById('app'));
});