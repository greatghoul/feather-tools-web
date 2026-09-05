import { t } from '~/helpers/i18n';

import ImageUploadZone from '~/components/ImageUploadZone';

const InputCard = ({ onImagesChange }) => {
    return (
<>

        <div className="card mb-3">
            <div className="card-header">
                <h5 className="mb-0">{t('pixelate-images/button/upload_images')}</h5>
            </div>
            <div className="card-body">
                <ImageUploadZone disabled={undefined} onChange={onImagesChange} />
            </div>
        </div>
    
</>
);
};

export default InputCard;
