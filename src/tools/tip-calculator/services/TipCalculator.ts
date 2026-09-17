export type Currency = 'USD' | 'EUR';

export type RoundMode = 'nearest' | 'up' | 'down';

export interface RoundingConfig {
    /** Cash denomination the total is rounded to; null means exact to the cent. */
    step: number | null;
    mode: RoundMode;
}

export interface TipResult {
    tip: number;
    total: number;
}

const CENTS = 100;

export const CURRENCY_SYMBOLS: Record<Currency, string> = { USD: '$', EUR: '€' };

/** Rounding targets per currency, mirroring the cash denominations in circulation. */
export const ROUNDING_STEPS: Record<Currency, Array<number | null>> = {
    USD: [null, 0.05, 0.1, 0.25, 1, 5],
    EUR: [null, 0.05, 0.1, 0.2, 0.5, 1, 2],
};

export const DEFAULT_ROUNDING: Record<Currency, RoundingConfig> = {
    USD: { step: 1, mode: 'up' },
    EUR: { step: 0.05, mode: 'nearest' },
};

export const DEFAULT_RATES = [10, 15, 18, 20];

export const MAX_RATES = 8;

const ROUND_MODES: RoundMode[] = ['nearest', 'up', 'down'];

export function isValidCurrency(value: unknown): value is Currency {
    return value === 'USD' || value === 'EUR';
}

export function isValidRounding(value: any, currency: Currency): value is RoundingConfig {
    return value
        && ROUNDING_STEPS[currency].includes(value.step)
        && ROUND_MODES.includes(value.mode);
}

/** "$0.05", "$1" - denomination labels shown in the rounding options. */
export function formatDenomination(step: number, currency: Currency): string {
    const amount = step < 1 ? step.toFixed(2) : String(step);
    return `${CURRENCY_SYMBOLS[currency]}${amount}`;
}

/** Parses a raw input string to integer cents; null when it is not a usable bill amount. */
export function parseAmountToCents(raw: string): number | null {
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0 || value > 9_999_999) {
        return null;
    }
    return Math.round(value * CENTS);
}

/**
 * Keeps rates valid (0 < rate <= 100, one decimal), deduped, ascending and
 * capped at MAX_RATES.
 */
export function sanitizeRates(rates: number[]): number[] {
    const cleaned = rates
        .map((rate) => Math.round(rate * 10) / 10)
        .filter((rate) => rate > 0 && rate <= 100);
    return [...new Set(cleaned)].sort((a, b) => a - b).slice(0, MAX_RATES);
}

/**
 * Computes tip and total for one rate. The rounding applies to the total, and
 * the tip is derived as total - bill, so the three amounts always add up.
 *
 * All money math happens in integer cents: bill cents times the per-mille rate
 * gives a value with at most three decimals, which keeps half-cent ties exact
 * in floating point and needs no epsilon corrections.
 */
export function computeTip(billCents: number, ratePercent: number, rounding: RoundingConfig): TipResult {
    const ratePerMille = Math.round(ratePercent * 10);
    const exactTotalCents = (billCents * (1000 + ratePerMille)) / 1000;
    const totalCents = roundTotalCents(exactTotalCents, rounding);
    return { tip: (totalCents - billCents) / CENTS, total: totalCents / CENTS };
}

function roundTotalCents(exactTotalCents: number, rounding: RoundingConfig): number {
    if (rounding.step === null) {
        return Math.round(exactTotalCents);
    }
    const stepCents = Math.round(rounding.step * CENTS);
    const units = exactTotalCents / stepCents;
    const rounded = rounding.mode === 'up' ? Math.ceil(units)
        : rounding.mode === 'down' ? Math.floor(units)
        : Math.round(units);
    return rounded * stepCents;
}
