import { useState, useEffect, useRef } from 'react';
import { t } from '~/helpers/i18n';
import ChartBuilder from './services/ChartBuilder';
import SettingCard from './components/SettingCard';
import CanvasPrinter from '~/services/CanvasPrinter';
import CanvasPrintable from '~/components/CanvasPrintable';

const WEEK_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const App = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [title, setTitle] = useState(t('meal-planner/settings/default_title') || 'Meal Planner');
    const [startOfWeek, setStartOfWeek] = useState('monday');
    const [meals, setMeals] = useState({
        breakfast: true,
        lunch: true,
        dinner: true,
        snack: false
    });
    const [showShoppingList, setShowShoppingList] = useState(true);
    const [showNotes, setShowNotes] = useState(false);

    const toggleMeal = (key) => {
        setMeals(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const buildChart = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const offset = startOfWeek === 'monday' ? 1 : 0;
        const dayNames: string[] = [];
        for (let i = 0; i < 7; i++) {
            const idx = (i + offset) % 7;
            dayNames.push(t(`common/week/${WEEK_KEYS[idx]}`));
        }

        new ChartBuilder(canvas, {
            title,
            dayNames,
            meals,
            showShoppingList,
            showNotes,
            mealLabels: {
                breakfast: t('meal-planner/settings/breakfast'),
                lunch: t('meal-planner/settings/lunch'),
                dinner: t('meal-planner/settings/dinner'),
                snack: t('meal-planner/settings/snack')
            },
            shoppingListLabel: t('meal-planner/section/title_shopping_list'),
            notesLabel: t('meal-planner/section/title_notes')
        }).build();
    };

    useEffect(() => buildChart(), [canvasRef]);

    useEffect(() => {
        buildChart();
    }, [title, startOfWeek, meals, showShoppingList, showNotes]);

    const handlePrint = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const printer = new CanvasPrinter(canvas, {
            pageOrientation: 'landscape',
            pageSize: 'A4'
        });
        printer.print();
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = 'meal-planner.jpg';
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
    };

    return (
<>

        <div>
            <SettingCard title={title} onTitleChange={setTitle} startOfWeek={startOfWeek} onStartOfWeekChange={setStartOfWeek} meals={meals} onToggleMeal={toggleMeal} showShoppingList={showShoppingList} onShowShoppingListChange={setShowShoppingList} showNotes={showNotes} onShowNotesChange={setShowNotes} onPrint={handlePrint} onDownload={handleDownload} />
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{t('common/chart')}</h5>
                    <div className="actions">
                        <button className="btn btn-outline-secondary me-2" onClick={handleDownload}>
                            <i className="bi bi-download me-1"></i>{t('common/download')}
                        </button>
                        <button className="btn btn-outline-primary" onClick={handlePrint}>
                            <i className="bi bi-printer me-1"></i>{t('common/print')}
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <CanvasPrintable canvasRef={canvasRef} layout="landscape" />
                </div>
            </div>
        </div>
    
</>
);
};

export default App;
