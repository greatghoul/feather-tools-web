import { useState } from 'react';
import { t } from '~/helpers/i18n';

import ImageUploadZone from '~/components/ImageUploadZone';
import ObjectCounter from './components/ObjectCounter';

const App = () => {
    const [images, setImages] = useState<any[]>([]);

    // Marks belong to one image, so the counter always works on the latest upload.
    const image = images.length > 0 ? images[images.length - 1] : null;

    return (
        <div className="row g-4">
            <div className="col-lg-4">
                <div className="card h-100">
                    <div className="card-header">
                        <h5 className="mb-0">{t('image-object-counter/upload/title')}</h5>
                    </div>
                    <div className="card-body">
                        <ImageUploadZone disabled={false} onChange={setImages} />
                        <small className="text-muted d-block mt-2">
                            {t('image-object-counter/upload/note')}
                        </small>
                    </div>
                </div>
            </div>
            <div className="col-lg-8">
                <ObjectCounter image={image} />
            </div>
        </div>
    );
};

export default App;
