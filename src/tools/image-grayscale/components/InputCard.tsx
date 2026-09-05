import ImageUploadZone from '~/components/ImageUploadZone';
import ImageList from '~/components/ImageList';
import { t } from '~/helpers/i18n';

const InputCard = ({ images, onImagesChange }) => {
    return (
<>

        <div className="card mb-3">
            <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <a className="nav-link active" href="#">
                            <i className="bi bi-images me-1"></i>
                            {t('image-grayscale/input/images')}
                        </a>
                    </li>
                </ul>
            </div>
            <div className="card-body">
                <ImageUploadZone disabled={undefined} onChange={onImagesChange} />
            </div>
            <ImageList images={images} sortable={false} disabled={undefined} onChange={onImagesChange} itemBadge={undefined} />
        </div>
    
</>
);
};

export default InputCard;
