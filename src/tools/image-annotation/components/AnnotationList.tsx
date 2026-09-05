import { t } from '~/helpers/i18n';
import { getAnnotationKey } from '../services/AnnotationEngine';
import styles from './AnnotationList.module.css';

const AnnotationList = ({
    annotations,
    onClearAll,
    onDelete,
    onSelect,
}) => {
    return (
<>

        <div className="col-12 col-md-2 bg-light rounded" style={{ minHeight: '400px', maxHeight: '600px' }}>
            <div className="d-flex justify-content-between align-items-center mb-1 p-2" style={{ flexShrink: '0' }}>
                <small className="text-muted">
                    {t('image-annotation/annotations/title')} ({annotations.length})
                </small>
                <button className="btn btn-sm btn-outline-warning" onClick={onClearAll} title={t('image-annotation/toolbar/clear_all')} style={{ padding: '0.1rem 0.3rem', fontSize: '0.7rem' }}>
                    <i className="bi bi-eraser"></i>
                </button>
            </div>
            {annotations.length === 0 && (
<>

                <small className="text-muted p-2">{t('image-annotation/annotations/empty')}</small>
            
</>
)}
            <div style={{ overflowY: 'auto', height: 'calc(100% - 25px)' }}>
                {annotations.map((ann, idx) => (
<>

                    <div key={ann.id} className="d-flex align-items-center justify-content-between gap-1 p-1 m-1 rounded annotation-item" style={{ cursor: 'pointer', background: '#f8f9fa', border: '1px solid #dee2e6', fontSize: '0.8rem', transition: 'background-color 0.15s', flexShrink: '0' }} onClick={() => onSelect(ann.id)}>
                        <span className="text-truncate">
                            {t(getAnnotationKey(ann.type))} {idx + 1}
                        </span>
                        <i className="bi bi-x text-danger" style={{ cursor: 'pointer', fontSize: '0.8rem', flexShrink: '0' }} onClick={(e) => {
                                e.stopPropagation();
                                onDelete(ann.id);
                            }}></i>
                    </div>
                
</>
))}
            </div>
        </div>
        <style>{`${styles.listStyle}`}</style>
    
</>
);
};

export default AnnotationList;
