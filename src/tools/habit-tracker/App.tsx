import { useState } from 'react';

import InputCard from './components/InputCard';
import OutputCard from './components/OutputCard';

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
    
    return (
<>

        <div className="row">
            <div className="col-md-6 col-lg-4">
                <InputCard onLayoutChange={handleLayoutChange} selectedLayout={printLayout} onYearChange={handleYearChange} selectedYear={selectedYear} yearType={yearType} />
            </div>
            <div className="col-md-6 col-lg-8">
                <OutputCard printLayout={printLayout} showDayInCell={true} yearType={yearType} selectedYear={selectedYear} />
            </div>
        </div>
    
</>
);
};

// Initialize the app when DOM is loaded

export default HabitTracker;
