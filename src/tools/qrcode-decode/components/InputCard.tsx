import ImageUploadZone from '~/components/ImageUploadZone';
import ImageList from '~/components/ImageList';
import { t } from '~/helpers/i18n';

const InputCard = ({ images, onImagesChange, onAppendImages }) => {
    return (
<>

        <div className="card mb-3">
            <div className="card-header">
                <i className="bi bi-images me-1"></i>
                {t('qrcode-decode/input/images')}
            </div>
            <div className="card-body">
                <ImageUploadZone disabled={undefined} onChange={onAppendImages} />
            </div>
            <ImageList images={images} disabled={false} onChange={onImagesChange} itemBadge={undefined} />
        </div>
    
</>
);
};

export default InputCard;
