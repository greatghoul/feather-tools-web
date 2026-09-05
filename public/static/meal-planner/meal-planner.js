import { html } from 'htm/preact';
import { render } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import ChartBuilder from '@/services/ChartBuilder.js';
import SettingCard from '@/components/SettingCard.js';
import CanvasPrinter from '~/services/CanvasPrinter.js';
import CanvasPrintable from '~/components/CanvasPrintable.js';

const WEEK_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const App = () => {
    const canvasRef = useRef(null);
    const [title, setTitle] = useState(getText('meal-planner/settings/default_title') || 'Meal Planner');
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
        const dayNames = [];
        for (let i = 0; i < 7; i++) {
            const idx = (i + offset) % 7;
            dayNames.push(getText(`common/week/${WEEK_KEYS[idx]}`));
        }

        new ChartBuilder(canvas, {
            title,
            dayNames,
            meals,
            showShoppingList,
            showNotes,
            mealLabels: {
                breakfast: getText('meal-planner/settings/breakfast'),
                lunch: getText('meal-planner/settings/lunch'),
                dinner: getText('meal-planner/settings/dinner'),
                snack: getText('meal-planner/settings/snack')
            },
            shoppingListLabel: getText('meal-planner/section/title_shopping_list'),
            notesLabel: getText('meal-planner/section/title_notes')
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

    return html`
        <div>
            <${SettingCard}
                title=${title}
                onTitleChange=${setTitle}
                startOfWeek=${startOfWeek}
                onStartOfWeekChange=${setStartOfWeek}
                meals=${meals}
                onToggleMeal=${toggleMeal}
                showShoppingList=${showShoppingList}
                onShowShoppingListChange=${setShowShoppingList}
                showNotes=${showNotes}
                onShowNotesChange=${setShowNotes}
                onPrint=${handlePrint}
                onDownload=${handleDownload}
            />
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">${getText('common/chart')}</h5>
                    <div class="actions">
                        <button class="btn btn-outline-secondary me-2" onClick=${handleDownload}>
                            <i class="bi bi-download me-1"></i>${getText('common/download')}
                        </button>
                        <button class="btn btn-outline-primary" onClick=${handlePrint}>
                            <i class="bi bi-printer me-1"></i>${getText('common/print')}
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <${CanvasPrintable} canvasRef=${canvasRef} layout="landscape" />
                </div>
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
