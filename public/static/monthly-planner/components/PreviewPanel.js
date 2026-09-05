import { html } from 'htm/preact';
import { css } from 'goober';
import { useMemo } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

const previewWrapStyle = css`
    .preview-wrap {
        overflow: auto;
        padding: 12px;
        border-radius: 10px;
        border: 1px solid #e5e7eb;
        background: #e5e7eb;
        display: flex;
        justify-content: center;
        align-items: flex-start;
    }

    .a4-page {
        width: 210mm;
        min-height: 297mm;
        padding: 15mm 17mm;
        background: #fff;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
        overflow: hidden;
        position: relative;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .planner-header {
        text-align: center;
        border-bottom: 2px solid #333;
        padding-bottom: 8px;
        margin-bottom: 10px;
    }

    .planner-header h2 {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        letter-spacing: 1px;
    }

    .planner-header .subtitle {
        font-size: 12px;
        color: #666;
        margin-top: 2px;
    }

    .planner-body {
        display: flex;
        gap: 12px;
    }

    .calendar-section {
        flex: 1;
    }

    .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        border: 1px solid #ccc;
        border-bottom: none;
        border-right: none;
    }

    .day-header {
        text-align: center;
        font-size: 10px;
        font-weight: 600;
        color: #555;
        padding: 4px 0;
        border-bottom: 1px solid #ccc;
        border-right: 1px solid #ccc;
        background: #f5f5f5;
        text-transform: uppercase;
    }



    .day-header.weekend {
        color: #888;
    }

    .day-cell {
        border-bottom: 1px solid #ccc;
        border-right: 1px solid #ccc;
        padding: 3px 4px;
        position: relative;
        min-height: var(--cell-height, 70px);
    }

    .day-cell.other-month {
        background: #f9f9f9;
    }

    .day-cell .day-number {
        font-size: 11px;
        font-weight: 600;
        color: #333;
        line-height: 1;
    }

    .day-cell.weekend .day-number {
        color: #888;
    }

    .day-cell.other-month .day-number {
        color: #bbb;
    }

    .day-cell .day-lines {
        margin-top: 2px;
    }

    .day-cell .day-lines .line {
        border-bottom: 1px solid #eee;
        height: 20px;
        box-sizing: border-box;
    }

    @media print {
        .preview-wrap {
            background: none;
            padding: 0;
            border: none;
        }
        .a4-page {
            box-shadow: none;
            padding: 0;
            width: 100%;
            min-height: auto;
        }
    }
`;

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

        const dayNames = [];
        const dayIndices = [];
        const WEEK_KEYS = ['common/week/sun', 'common/week/mon', 'common/week/tue', 'common/week/wed', 'common/week/thu', 'common/week/fri', 'common/week/sat'];
        for (let i = 0; i < 7; i++) {
            const idx = (i + offset) % 7;
            dayNames.push(getText(WEEK_KEYS[idx]));
            dayIndices.push(idx);
        }

        const weeks = [];
        let currentWeek = [];

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

    const monthName = getText(`common/month/${month + 1}`);

    return html`
        <div class=${previewWrapStyle}>
            <div class="preview-wrap">
                <section class="a4-page" id="a4Page">
                    <div class="planner-header">
                        <h2>${title}</h2>
                        <div class="subtitle">${monthName} ${year}</div>
                    </div>
                    <div class="planner-body">
                        <div class="calendar-section">
                            <div class="calendar-grid">
                                ${calendarData.dayNames.map((name, i) => {
                                    const isWeekend = calendarData.dayIndices[i] === 0 || calendarData.dayIndices[i] === 6;
                                    return html`
                                        <div class="day-header ${isWeekend ? 'weekend' : ''}">${name}</div>
                                    `;
                                })}
                                ${calendarData.weeks.flat().map((cell, idx) => {
                                    const cls = ['day-cell', cell.isOtherMonth ? 'other-month' : '', cell.isWeekend ? 'weekend' : ''].filter(Boolean).join(' ');
                                    return html`
                                        <div class=${cls} key=${idx} style="--cell-height: ${cellMinHeight}px">
                                            <div class="day-number">${cell.day}</div>
                                            <div class="day-lines">
                                                ${Array.from({ length: lineCount }, (_, li) => html`<div class="line" key=${li}></div>`)}
                                            </div>
                                        </div>
                                    `;
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    `;
};

export default PreviewPanel;
