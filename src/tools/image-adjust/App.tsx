import { useState, useEffect, useRef } from "react";
import ResultCard from './components/ResultCard';
import InputCard from './components/InputCard';
import { DEFAULT_ADJUST_SETTING } from './components/AdjustSetting';

const DEBOUNCE_MS = 300;

const ImageAdjust = () => {
    const [images, setImages] = useState([]);
    const [setting, setSetting] = useState(DEFAULT_ADJUST_SETTING);
    const [autoProcess, setAutoProcess] = useState(false);
    const [processingKey, setProcessingKey] = useState(0);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (images.length > 0 && !autoProcess) {
            setAutoProcess(true);
            setProcessingKey(prev => prev + 1);
        }
    }, [images]);

    useEffect(() => {
        if (!autoProcess || images.length === 0) return;

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            setProcessingKey(prev => prev + 1);
        }, DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [setting, autoProcess, images.length]);

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

export default ImageAdjust;
