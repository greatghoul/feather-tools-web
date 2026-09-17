import { t } from '~/helpers/i18n';
import {
    Currency,
    formatDenomination,
    ROUNDING_STEPS,
    RoundingConfig,
    RoundMode,
    CURRENCY_SYMBOLS,
} from '../services/TipCalculator';

interface SettingsCardProps {
    amount: string;
    onAmountChange: (value: string) => void;
    currency: Currency;
    onCurrencyChange: (currency: Currency) => void;
    rounding: Record<Currency, RoundingConfig>;
    onRoundingChange: (partial: Partial<RoundingConfig>) => void;
}

const parseStep = (value: string): number | null => (value === 'null' ? null : Number(value));

const SettingsCard = ({ amount, onAmountChange, currency, onCurrencyChange, rounding, onRoundingChange }: SettingsCardProps) => {
    const current = rounding[currency];
    const symbol = CURRENCY_SYMBOLS[currency];

    return (
        <div className="card">
            <div className="card-header bg-light">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <a className="nav-link active" href="#">
                            <i className="bi bi-receipt me-1"></i>{t('tip-calculator/settings/title')}
                        </a>
                    </li>
                </ul>
            </div>
            <div className="card-body">
                <div className="row g-3">
                    <div className="col-12">
                        <label className="form-label small mb-1" htmlFor="tip-bill-amount">{t('tip-calculator/settings/amount')}</label>
                        <div className="input-group input-group-sm">
                            <span className="input-group-text">{symbol}</span>
                            <input
                                id="tip-bill-amount"
                                type="number"
                                className="form-control"
                                min="0"
                                step="0.01"
                                inputMode="decimal"
                                placeholder="0.00"
                                value={amount}
                                onInput={(e) => onAmountChange((e.target as HTMLInputElement).value)}
                            />
                        </div>
                    </div>
                    <div className="col-12">
                        <label className="form-label small mb-1" htmlFor="tip-currency">{t('tip-calculator/settings/currency')}</label>
                        <select
                            id="tip-currency"
                            className="form-select form-select-sm"
                            value={currency}
                            onChange={(e) => onCurrencyChange((e.target as HTMLSelectElement).value as Currency)}
                        >
                            <option value="USD">{t('tip-calculator/settings/currency_usd')}</option>
                            <option value="EUR">{t('tip-calculator/settings/currency_eur')}</option>
                        </select>
                    </div>
                    <div className="col-12">
                        <label className="form-label small mb-1" htmlFor="tip-rounding-step">{t('tip-calculator/settings/rounding_step')}</label>
                        <select
                            id="tip-rounding-step"
                            className="form-select form-select-sm"
                            value={String(current.step)}
                            onChange={(e) => onRoundingChange({ step: parseStep((e.target as HTMLSelectElement).value) })}
                        >
                            {ROUNDING_STEPS[currency].map((step) => (
                                <option key={String(step)} value={String(step)}>
                                    {step === null ? t('tip-calculator/settings/rounding/step/exact') : formatDenomination(step, currency)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-12">
                        <label className="form-label small mb-1" htmlFor="tip-rounding-mode">{t('tip-calculator/settings/rounding_mode')}</label>
                        <select
                            id="tip-rounding-mode"
                            className="form-select form-select-sm"
                            value={current.mode}
                            disabled={current.step === null}
                            onChange={(e) => onRoundingChange({ mode: (e.target as HTMLSelectElement).value as RoundMode })}
                        >
                            <option value="nearest">{t('tip-calculator/settings/mode/nearest')}</option>
                            <option value="up">{t('tip-calculator/settings/mode/up')}</option>
                            <option value="down">{t('tip-calculator/settings/mode/down')}</option>
                        </select>
                    </div>
                    <div className="col-12">
                        <p className="form-text small text-muted mb-0">{t('tip-calculator/settings/rounding/hint')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsCard;
