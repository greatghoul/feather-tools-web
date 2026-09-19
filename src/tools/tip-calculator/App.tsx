import { useEffect, useState } from 'react';
import SettingsCard from './components/SettingsCard';
import ResultCard from './components/ResultCard';
import {
    Currency,
    DEFAULT_RATES,
    DEFAULT_ROUNDING,
    isValidCurrency,
    isValidRounding,
    parseAmountToCents,
    RoundingConfig,
    sanitizeRates,
} from './services/TipCalculator';

const STORAGE_KEY = 'tip-calculator/settings';

const defaultRounding = (): Record<Currency, RoundingConfig> => ({
    USD: { ...DEFAULT_ROUNDING.USD },
    EUR: { ...DEFAULT_ROUNDING.EUR },
});

const loadSettings = () => {
    const settings = {
        rates: [...DEFAULT_RATES],
        currency: 'USD' as Currency,
        rounding: defaultRounding(),
    };
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return settings;
        }
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.rates)) {
            settings.rates = sanitizeRates(parsed.rates.map(Number));
        }
        if (isValidCurrency(parsed.currency)) {
            settings.currency = parsed.currency;
        }
        for (const currency of ['USD', 'EUR'] as Currency[]) {
            const stored = parsed.rounding?.[currency];
            if (isValidRounding(stored, currency)) {
                settings.rounding[currency] = { step: stored.step, mode: stored.mode };
            }
        }
    } catch {
        // Ignore storage errors
    }
    return settings;
};

const App = () => {
    const [amount, setAmount] = useState('');
    const [paidAmount, setPaidAmount] = useState('');
    const [currency, setCurrency] = useState<Currency>('USD');
    const [rounding, setRounding] = useState<Record<Currency, RoundingConfig>>(defaultRounding());
    const [rates, setRates] = useState<number[]>([...DEFAULT_RATES]);

    useEffect(() => {
        const settings = loadSettings();
        setCurrency(settings.currency);
        setRounding(settings.rounding);
        setRates(settings.rates);
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ rates, currency, rounding }));
        } catch {
            // Ignore storage errors
        }
    }, [rates, currency, rounding]);

    const handleRoundingChange = (partial: Partial<RoundingConfig>) => {
        setRounding((prev) => ({ ...prev, [currency]: { ...prev[currency], ...partial } }));
    };

    const billCents = parseAmountToCents(amount);
    const paidCents = parseAmountToCents(paidAmount);

    return (
        <div className="row g-4">
            <div className="col-md-6 col-lg-4">
                <SettingsCard
                    amount={amount}
                    onAmountChange={setAmount}
                    paidAmount={paidAmount}
                    onPaidAmountChange={setPaidAmount}
                    currency={currency}
                    onCurrencyChange={setCurrency}
                    rounding={rounding}
                    onRoundingChange={handleRoundingChange}
                />
            </div>
            <div className="col-md-6 col-lg-8">
                <ResultCard
                    billCents={billCents}
                    paidCents={paidCents}
                    rates={rates}
                    currency={currency}
                    rounding={rounding[currency]}
                    onRatesChange={setRates}
                />
            </div>
        </div>
    );
};

export default App;
