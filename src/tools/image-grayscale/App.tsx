import { useState } from "react";
import ResultCard from './components/ResultCard';
import InputCard from './components/InputCard';

const ImageGrayscale = () => {
    const [images, setImages] = useState([]);

    return (
<>

        <div className="row mb-3">
            <div className="col-md-6 col-lg-4">
                <InputCard images={images} onImagesChange={setImages} />
            </div>
            <div className="col-md-6 col-lg-8">
              <ResultCard images={images} />
            </div>
        </div>
    
</>
);
};

export default ImageGrayscale;
