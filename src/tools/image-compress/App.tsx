import { useEffect, useState } from 'react';
import ResultCard from './components/ResultCard';
import InputCard from './components/InputCard';
import { DEFAULT_COMPRESS_SETTING, type CompressSetting, type UploadedImage } from './types';

const ImageCompressApp = () => {
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [setting, setSetting] = useState<CompressSetting>(DEFAULT_COMPRESS_SETTING);
    const [processingKey, setProcessingKey] = useState(0);

    useEffect(() => {
        if (images.length > 0) {
            setProcessingKey((prev) => prev + 1);
        }
    }, [images]);

    return (
        <div className="row mb-3">
            <div className="col-md-6 col-lg-4">
                <InputCard
                    images={images}
                    setting={setting}
                    onImagesChange={setImages}
                    onSettingChange={setSetting}
                />
            </div>
            <div className="col-md-6 col-lg-8">
                <ResultCard
                    images={images}
                    setting={setting}
                    processingKey={processingKey}
                />
            </div>
        </div>
    );
};

export default ImageCompressApp;
