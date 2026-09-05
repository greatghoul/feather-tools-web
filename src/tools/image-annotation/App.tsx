import { useState } from 'react';
import { t } from '~/helpers/i18n';

import ImageUploadZone from '~/components/ImageUploadZone';
import AnnotationCanvas from './components/AnnotationCanvas';

const App = () => {
    const [images, setImages] = useState<any[]>([]);

    return (
<>

        <div className="image-annotation-container">
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">{t('image-annotation/upload/title')}</h5>
                </div>
                <div className="card-body">
                    <ImageUploadZone disabled={undefined} onChange={setImages} />
                </div>
            </div>
            {images.length > 0 && images.map((image) => (
<>

                <AnnotationCanvas key={image.id} image={image} />
            
</>
))}
        </div>
    
</>
);
};

export default App;
