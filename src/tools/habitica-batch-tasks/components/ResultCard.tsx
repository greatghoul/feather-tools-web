import { t } from '~/helpers/i18n';

const ResultCard = ({ result }) => {
    if (!result) {
        return (
<>
<div></div>
</>
);
    }

    if (result.type === 'validation') {
        return (
<>

            <div className="alert alert-warning" role="alert">
                <i className="bi bi-exclamation-triangle"></i> {result.message}
            </div>
        
</>
);
    }

    if (result.type === 'start' || result.type === 'running') {
        const percent = result.total ? Math.round((result.progress / result.total) * 100) : 0;
        return (
<>

            <div className="card">
                <div className="card-body">
                    <div className="d-flex justify-content-between small mb-1">
                        <span>{t('habitica-batch-tasks/message/creating')}</span>
                        <span>{result.progress} / {result.total}</span>
                    </div>
                    <div className="progress">
                        <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: `${percent}%` }}></div>
                    </div>
                </div>
            </div>
        
</>
);
    }

    if (result.type === 'done') {
        const successCount = result.results.length;
        const failureCount = result.failures.length;
        const summary = `${successCount} ${t('habitica-batch-tasks/message/success')}, ${failureCount} ${t('habitica-batch-tasks/message/failed')}`;

        return (
<>

            <div className="card">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <span><i className="bi bi-clipboard-check"></i> {summary}</span>
                </div>
                <ul className="list-group list-group-flush">
                    {result.results.map((item) => (
<>

                        <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span className="text-truncate me-2">{item.text}</span>
                            <span className="badge text-bg-success bg-success">{t('habitica-batch-tasks/message/success')}</span>
                        </li>
                    
</>
))}
                    {result.failures.map((item) => (
<>

                        <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span className="text-truncate me-2" title={item.error}>{item.text}</span>
                            <span className="badge text-bg-danger bg-danger">{t('habitica-batch-tasks/message/failed')}</span>
                        </li>
                    
</>
))}
                </ul>
            </div>
        
</>
);
    }

    return (
<>
<div></div>
</>
);
};

export default ResultCard;
