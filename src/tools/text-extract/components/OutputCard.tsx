import { useState } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';

const TYPE_COLORS = {
    email: 'primary',
    phone: 'success',
    idCard: 'warning',
    url: 'info',
    ip: 'secondary',
    custom: 'dark',
};

const TYPE_LABELS = {
    email: 'text-extract/options/email',
    phone: 'text-extract/options/phone',
    idCard: 'text-extract/options/id_card',
    url: 'text-extract/options/url',
    ip: 'text-extract/options/ip',
    custom: 'text-extract/options/custom',
};

const OutputCard = ({ groups, total }) => {
    const [isCopying, setIsCopying] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const typeKeys = groups ? Object.keys(groups) : [];

    const hasContent = total > 0;

    const allItems: any[] = [];
    if (groups) {
        for (const type of typeKeys) {
            for (const item of groups[type]) {
                allItems.push({ type, value: item });
            }
        }
    }

    const displayedItems = activeTab === 'all' ? allItems : (groups[activeTab] || []);

    const handleCopy = () => {
        if (!hasContent || isCopying) return;

        setIsCopying(true);
        const text = displayedItems.map((item) => item.value || item).join('\n');
        navigator.clipboard.writeText(text).then(() => {
            notify(t('text-extract/message/copied'), '', 'success');
            setTimeout(() => setIsCopying(false), 1000);
        });
    };

    return (
<>

        <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <span>{t('text-extract/output/title')}</span>
                <button className="btn btn-sm btn-outline-primary" onClick={handleCopy} disabled={!hasContent || isCopying}>
                    {t('text-extract/button/copy')}
                </button>
            </div>
            <div className="card-body p-0">
                {hasContent ? (
<>

                    <div className="border-bottom">
                        <ul className="nav nav-tabs px-3 pt-2">
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                                    All ({total})
                                </button>
                            </li>
                            {typeKeys.map((type) => (
                                <li className="nav-item" key={type}>
                                    <button className={`nav-link ${activeTab === type ? 'active' : ''}`} onClick={() => setActiveTab(type)}>
                                        {t(TYPE_LABELS[type] || type)}
                                        <span className={`badge bg-${TYPE_COLORS[type] || 'secondary'} ms-1`} style={{ fontSize: '0.7em' }}>{groups[type].length}</span>
                                    </button>
                                </li>
))}
                        </ul>
                    </div>
                    <div className="p-0" style={{ minHeight: '200px', maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="table table-hover mb-0">
                            <tbody>
                                {activeTab === 'all'
                                    ? allItems.map((item, i) => (
                                        <tr key={i}>
                                            <td className="text-nowrap" style={{ width: '100px' }}>
                                                <span className={`badge bg-${TYPE_COLORS[item.type] || 'secondary'}`}>
                                                    {t(TYPE_LABELS[item.type] || item.type)}
                                                </span>
                                            </td>
                                            <td className="font-monospace">{item.value}</td>
                                        </tr>
))
                                    : displayedItems.map((item, i) => (
                                        <tr key={i}>
                                            <td className="font-monospace">{item}</td>
                                        </tr>
))
                                }
                            </tbody>
                        </table>
                    </div>
                
</>
) : (
<>

                    <div className="p-3 text-muted text-center" style={{ minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {t('text-extract/output/empty')}
                    </div>
                
</>
)}
            </div>
        </div>
    
</>
);
};

export default OutputCard;
