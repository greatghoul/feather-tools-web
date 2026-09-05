import { useMemo } from 'react';
import { t } from '~/helpers/i18n';
import styles from './PreviewPanel.module.css';

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const LINE_HEIGHT = 20;
const CELL_PADDING_TOP = 3;
const CELL_PADDING_BOTTOM = 3;
const DAY_NUMBER_HEIGHT = 11;
const DAY_LINES_MARGIN_TOP = 2;
const BOTTOM_GAP = LINE_HEIGHT - CELL_PADDING_BOTTOM;

const PreviewPanel = ({ month, year, startOfWeek, lineCount, title }) => {
    const calendarData = useMemo(() => {
        const offset = startOfWeek === 'monday' ? 1 : 0;
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const prevMonthDays = ((firstDay - offset) + 7) % 7;
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

        const dayNames: string[] = [];
        const dayIndices: number[] = [];
        const WEEK_KEYS = ['common/week/sun', 'common/week/mon', 'common/week/tue', 'common/week/wed', 'common/week/thu', 'common/week/fri', 'common/week/sat'];
        for (let i = 0; i < 7; i++) {
            const idx = (i + offset) % 7;
            dayNames.push(t(WEEK_KEYS[idx]));
            dayIndices.push(idx);
        }

        const weeks: any[] = [];
        let currentWeek: any[] = [];

        for (let i = prevMonthDays - 1; i >= 0; i--) {
            const dayIdx = (prevMonthDays - 1 - i + firstDay) % 7;
            currentWeek.push({
                day: daysInPrevMonth - i,
                isOtherMonth: true,
                isWeekend: dayIdx === 0 || dayIdx === 6
            });
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dayIdx = new Date(year, month, d).getDay();
            currentWeek.push({
                day: d,
                isOtherMonth: false,
                isWeekend: dayIdx === 0 || dayIdx === 6
            });

            const nextDayIdx = new Date(year, month, d + 1).getDay();
            if (currentWeek.length === 7 || nextDayIdx === offset) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        let nextDay = 1;
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        while (currentWeek.length < 7) {
            const dayIdx = new Date(nextYear, nextMonth, nextDay).getDay();
            currentWeek.push({
                day: nextDay,
                isOtherMonth: true,
                isWeekend: dayIdx === 0 || dayIdx === 6
            });
            nextDay++;
        }
        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        // Remove trailing week if all cells belong to next month
        if (weeks.length > 0) {
            const lastWeek = weeks[weeks.length - 1];
            if (lastWeek.every(cell => cell.isOtherMonth)) {
                weeks.pop();
            }
        }

        return { dayNames, dayIndices, weeks };
    }, [month, year, startOfWeek]);

    const cellMinHeight = CELL_PADDING_TOP + DAY_NUMBER_HEIGHT + DAY_LINES_MARGIN_TOP + lineCount * LINE_HEIGHT + BOTTOM_GAP + CELL_PADDING_BOTTOM;

    const monthName = t(`common/month/${month + 1}`);

    return (
<>

        <div className={styles.previewWrapStyle}>
            <div className="preview-wrap">
                <section className="a4-page" id="a4Page">
                    <div className="planner-header">
                        <h2>{title}</h2>
                        <div className="subtitle">{monthName} {year}</div>
                    </div>
                    <div className="planner-body">
                        <div className="calendar-section">
                            <div className="calendar-grid">
                                {calendarData.dayNames.map((name, i) => {
                                    const isWeekend = calendarData.dayIndices[i] === 0 || calendarData.dayIndices[i] === 6;
                                    return (
<>

                                        <div className={`day-header ${isWeekend ? 'weekend' : ''}`}>{name}</div>
                                    
</>
);
                                })}
                                {calendarData.weeks.flat().map((cell, idx) => {
                                    const cls = ['day-cell', cell.isOtherMonth ? 'other-month' : '', cell.isWeekend ? 'weekend' : ''].filter(Boolean).join(' ');
                                    return (
<>

                                        <div className={cls} key={idx} style={{ '--cell-height': `${cellMinHeight}px` } as any}>
                                            <div className="day-number">{cell.day}</div>
                                            <div className="day-lines">
                                                {Array.from({ length: lineCount }, (_, li) => (
<>
<div className="line" key={li}></div>
</>
))}
                                            </div>
                                        </div>
                                    
</>
);
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    
</>
);
};

export default PreviewPanel;
