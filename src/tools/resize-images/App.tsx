import { useState } from "react";
import ResultCard from './components/ResultCard';
import InputCard from './components/InputCard';
import { DEFAULT_RESIZE_SETTING } from './components/ResizeSetting';

const ResizeImages = () => {
    const [images, setImages] = useState([]);
    const [settings, setSettings] = useState([DEFAULT_RESIZE_SETTING]);

    return (
<>

        <div className="row">
            <div className="col-md-6 col-lg-4">
                <InputCard images={images} settings={settings} onImagesChange={setImages} onSettingsChange={setSettings} />
            </div>
            <div className="col-md-6 col-lg-8">
              <ResultCard images={images} settings={settings} />
            </div>
        </div>
    
</>
);
};

export default ResizeImages;
