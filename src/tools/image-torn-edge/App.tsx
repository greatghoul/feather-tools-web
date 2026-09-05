import { useState, useEffect } from 'react';
import ResultCard from './components/ResultCard';
import InputCard from './components/InputCard';
import { DEFAULT_TORN_SETTING } from './components/TornEdgeSetting';

const ImageTornEdge = () => {
    const [images, setImages] = useState([]);
    const [setting, setSetting] = useState(DEFAULT_TORN_SETTING);
    const [autoProcess, setAutoProcess] = useState(false);
    const [processingKey, setProcessingKey] = useState(0);

    useEffect(() => {
        if (images.length > 0 && !autoProcess) {
            setAutoProcess(true);
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
              <ResultCard images={images} setting={setting} autoProcess={autoProcess} processingKey={processingKey} />
            </div>
        </div>
    
</>
);
};

export default ImageTornEdge;
