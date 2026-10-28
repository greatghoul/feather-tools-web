import { useState } from 'react';
import { t } from '~/helpers/i18n';

import ImageUploadZone from '~/components/ImageUploadZone';
import ObjectCounter from './components/ObjectCounter';

const App = () => {
    const [images, setImages] = useState<any[]>([]);

    // The upload zone reports only the files of the current upload, so every
    // upload appends: each image keeps its own card and its own marks.
    const addImages = (newImages: any[]) => {
        setImages((current) => [...current, ...newImages]);
    };

    const removeImage = (id: number) => {
        setImages((current) => {
            const image = current.find((item) => item.id === id);
            if (image?.url) URL.revokeObjectURL(image.url);
            return current.filter((item) => item.id !== id);
        });
    };

    return (
        <div className="d-flex flex-column gap-4">
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">{t('image-object-counter/upload/title')}</h5>
                </div>
                <div className="card-body">
                    <ImageUploadZone disabled={false} onChange={addImages} />
                </div>
            </div>
            {images.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center text-muted">
                        {t('image-object-counter/counter/empty')}
                    </div>
                </div>
            ) : (
                images.map((image) => (
                    <ObjectCounter
                        key={image.id}
                        image={image}
                        onRemove={() => removeImage(image.id)}
                    />
                ))
            )}
        </div>
    );
};

export default App;
