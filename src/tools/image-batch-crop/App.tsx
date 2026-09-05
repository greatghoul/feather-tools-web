import { useEffect, useState } from 'react';
import InputCard from './components/InputCard';
import ResultCard from './components/ResultCard';

const DEFAULT_CROP_SIZE = {
    width: 800,
    height: 800,
};

const CROP_SIZE_STORAGE_KEY = 'image-batch-crop:global-crop-size';

const readStoredCropSize = () => {
    try {
        const raw = window.localStorage.getItem(CROP_SIZE_STORAGE_KEY);
        if (!raw) return DEFAULT_CROP_SIZE;
        const parsed = JSON.parse(raw);
        const width = Math.round(Number(parsed?.width));
        const height = Math.round(Number(parsed?.height));

        if (!Number.isFinite(width) || !Number.isFinite(height)) {
            return DEFAULT_CROP_SIZE;
        }

        return {
            width: Math.max(1, width),
            height: Math.max(1, height),
        };
    } catch (error) {
        return DEFAULT_CROP_SIZE;
    }
};

const BatchImageCrop = () => {
    const [images, setImages] = useState([]);
    const [cropSize, setCropSize] = useState(readStoredCropSize);

    useEffect(() => {
        window.localStorage.setItem(CROP_SIZE_STORAGE_KEY, JSON.stringify(cropSize));
    }, [cropSize]);

    return (
<>

        <div className="row">
            <div className="col-md-6 col-lg-4">
                <InputCard images={images} onImagesChange={setImages} />
            </div>
            <div className="col-md-6 col-lg-8">
                <ResultCard images={images} cropSize={cropSize} onCropSizeChange={setCropSize} />
            </div>
        </div>
    
</>
);
};

export default BatchImageCrop;
