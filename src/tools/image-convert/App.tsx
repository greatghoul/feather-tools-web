import { useState, useEffect } from 'react';
import ResultCard from './components/ResultCard';
import InputCard from './components/InputCard';
import { DEFAULT_CONVERT_SETTING } from './components/ConvertSetting';

const ImageConvert = () => {
    const [images, setImages] = useState<any[]>([]);
    const [setting, setSetting] = useState(DEFAULT_CONVERT_SETTING);
    const [processingKey, setProcessingKey] = useState(0);

    useEffect(() => {
        if (images.length > 0) {
            setProcessingKey(prev => prev + 1);
        }
    }, [images]);

    return (
<>

        <div className="row mb-3">
            <div className="col-md-6 col-lg-4">
                <InputCard images={images} setting={setting} onImagesChange={setImages} onSettingChange={setSetting} />
            </div>
            <div className="col-md-6 col-lg-8">
                <ResultCard images={images} setting={setting} processingKey={processingKey} />
            </div>
        </div>
    
</>
);
};

export default ImageConvert;
