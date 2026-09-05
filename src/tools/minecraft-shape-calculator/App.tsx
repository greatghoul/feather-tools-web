import { useState, useEffect } from 'react';
import { calculateShape } from './services/ShapeCalculator';
import SettingsCard from './components/SettingsCard';
import ResultCard from './components/ResultCard';

const App = () => {
    const [shape, setShape] = useState('circle');
    const [mode, setMode] = useState('outline');
    const [diameter, setDiameter] = useState(31);
    const [width, setWidth] = useState(31);
    const [height, setHeight] = useState(31);
    const [cornerRadius, setCornerRadius] = useState(4);
    const [thickness, setThickness] = useState(1);
    const [result, setResult] = useState<any>(null);

    // The maximum usable outline thickness: the circle radius (diameter / 2)
    // or the rounded-rectangle corner radius.
    const rawMax = shape === 'circle'
        ? Math.floor(Number(diameter) / 2)
        : Math.floor(Number(cornerRadius));
    const maxThickness = Number.isFinite(rawMax) && rawMax >= 1 ? rawMax : 1;

    // The maximum usable corner radius: half of the smaller side, minus 0.5,
    // so that 2 * radius + 1 does not exceed either side.
    const rawMaxCorner = Math.floor((Math.min(Number(width), Number(height)) - 1) / 2);
    const maxCornerRadius = Number.isFinite(rawMaxCorner) && rawMaxCorner >= 1 ? rawMaxCorner : 1;

    // Keep the thickness within the valid range when the shape or size changes.
    useEffect(() => {
        setThickness((prev) => (prev > maxThickness ? maxThickness : prev));
    }, [shape, diameter, cornerRadius, maxThickness]);

    // Keep the corner radius within the valid range when the size changes.
    useEffect(() => {
        setCornerRadius((prev) => (prev > maxCornerRadius ? maxCornerRadius : prev));
    }, [width, height, maxCornerRadius]);

    const handleCalculate = () => {
        const params = shape === 'circle'
            ? { diameter }
            : { width, height, cornerRadius };
        setResult(calculateShape(shape, params, mode, thickness));
    };

    // Run a calculation once on load with the default values.
    useEffect(() => {
        handleCalculate();
    }, []);

    return (
<>

        <div className="minecraft-shape-calculator-container">
            <div className="row g-4">
                <div className="col-md-6 col-lg-4">
                    <SettingsCard shape={shape} onShapeChange={setShape} mode={mode} onModeChange={setMode} diameter={diameter} onDiameterChange={setDiameter} width={width} onWidthChange={setWidth} height={height} onHeightChange={setHeight} cornerRadius={cornerRadius} maxCornerRadius={maxCornerRadius} onCornerRadiusChange={setCornerRadius} thickness={thickness} maxThickness={maxThickness} onThicknessChange={setThickness} onCalculate={handleCalculate} />
                </div>
                <div className="col-md-6 col-lg-8">
                    <ResultCard result={result} />
                </div>
            </div>
        </div>
    
</>
);
};

export default App;
