import { useState } from 'react';
import { t } from '~/helpers/i18n';
import {
    computeTip,
    Currency,
    DEFAULT_RATES,
    formatDenomination,
    MAX_RATES,
    RoundingConfig,
    sanitizeRates,
} from '../services/TipCalculator';

interface ResultCardProps {
    billCents: number | null;
    rates: number[];
    currency: Currency;
    rounding: RoundingConfig;
    onRatesChange: (rates: number[]) => void;
}

const ratesEqual = (a: number[], b: number[]) =>
    a.length === b.length && a.every((value, index) => value === b[index]);

const localeTag = () => ((window as any).LOCALE === 'zh' ? 'zh-CN' : 'en-US');

const ResultCard = ({ billCents, rates, currency, rounding, onRatesChange }: ResultCardProps) => {
    const [newRate, setNewRate] = useState('');
    const [errorKey, setErrorKey] = useState<string | null>(null);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat(localeTag(), { style: 'currency', currency }).format(value);

    const handleAdd = () => {
        const value = Number(newRate);
        if (!Number.isFinite(value) || value <= 0 || value > 100) {
            setErrorKey('tip-calculator/message/invalid_rate');
            return;
        }
        const normalized = Math.round(value * 10) / 10;
        if (rates.includes(normalized)) {
            setErrorKey('tip-calculator/message/duplicate_rate');
            return;
        }
        if (rates.length >= MAX_RATES) {
            setErrorKey('tip-calculator/message/max_rates');
            return;
        }
        onRatesChange(sanitizeRates([...rates, normalized]));
        setNewRate('');
        setErrorKey(null);
    };

    const handleRemove = (rate: number) => {
        onRatesChange(rates.filter((existing) => existing !== rate));
        setErrorKey(null);
    };

    const showReset = !ratesEqual(rates, DEFAULT_RATES);
    const roundingNote = rounding.step !== null && billCents !== null
        ? t('tip-calculator/result/rounding_note').replace('{step}', formatDenomination(rounding.step, currency))
        : null;

    return (
        <div className="card">
            <div className="card-header bg-light">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <a className="nav-link active" href="#">
                            <i className="bi bi-clipboard-data me-1"></i>{t('tip-calculator/result/title')}
                        </a>
                    </li>
                </ul>
            </div>
            {rates.length === 0 ? (
                <div className="card-body text-muted">{t('tip-calculator/result/no_rates')}</div>
            ) : (
                <>
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th scope="col">{t('tip-calculator/result/rate')}</th>
                                <th scope="col" className="text-end">{t('tip-calculator/result/tip')}</th>
                                <th scope="col" className="text-end">{t('tip-calculator/result/total')}</th>
                                <th scope="col" className="text-end"><span className="visually-hidden">{t('tip-calculator/rates/remove')}</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rates.map((rate) => {
                                const result = billCents !== null ? computeTip(billCents, rate, rounding) : null;
                                return (
                                    <tr key={rate}>
                                        <td><span className="badge text-bg-primary">{rate}%</span></td>
                                        <td className="text-end">{result ? formatCurrency(result.tip) : '—'}</td>
                                        <td className="text-end fw-semibold">{result ? formatCurrency(result.total) : '—'}</td>
                                        <td className="text-end">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger border-0"
                                                onClick={() => handleRemove(rate)}
                                                title={t('tip-calculator/rates/remove')}
                                                aria-label={t('tip-calculator/rates/remove')}
                                            >
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="card-body border-top py-3">
                        {roundingNote && (
                            <p className="form-text small text-muted mb-2">{roundingNote}</p>
                        )}
                        <div className="d-flex flex-wrap gap-2 align-items-center">
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                style={{ width: '7.5rem' }}
                                min="0"
                                max="100"
                                step="0.5"
                                aria-label={t('tip-calculator/rates/add')}
                                placeholder={t('tip-calculator/rates/placeholder')}
                                value={newRate}
                                onChange={(e) => { setNewRate((e.target as HTMLInputElement).value); setErrorKey(null); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                            />
                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleAdd}>
                                <i className="bi bi-plus-lg me-1"></i>{t('tip-calculator/rates/add')}
                            </button>
                            {showReset && (
                                <button type="button" className="btn btn-sm btn-outline-secondary ms-auto" onClick={() => onRatesChange([...DEFAULT_RATES])}>
                                    <i className="bi bi-arrow-counterclockwise me-1"></i>{t('tip-calculator/rates/reset')}
                                </button>
                            )}
                        </div>
                        {errorKey && (
                            <div className="small text-danger mt-2">{t(errorKey)}</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ResultCard;
