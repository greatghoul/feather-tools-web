import { useState } from 'react';
import ResultCard from './components/ResultCard';
import InputCard from './components/InputCard';

const ImageRotation = () => {
    const [images, setImages] = useState<any[]>([]);

    return (
<>

        <div className="row">
            <div className="col-md-6 col-lg-4">
                <InputCard images={images} onImagesChange={setImages} />
            </div>
            <div className="col-md-6 col-lg-8">
              <ResultCard images={images} onImagesChange={setImages} />
            </div>
        </div>
    
</>
);
};

export default ImageRotation;
