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

    if (result.type === 'error') {
        return (
<>

            <div className="alert alert-danger" role="alert">
                <i className="bi bi-x-circle"></i> {result.message}
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
