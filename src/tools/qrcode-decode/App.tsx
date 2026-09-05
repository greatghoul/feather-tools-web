import { useState } from 'react';
import ResultCard from './components/ResultCard';
import InputCard from './components/InputCard';

const QRCodeDecode = () => {
    const [images, setImages] = useState<any[]>([]);
    const [results, setResults] = useState({});

    const handleImagesChange = (newImages) => {
        setImages(newImages);
    };

    const handleAppendImages = (newImages) => {
        setImages((prev) => [...prev, ...newImages]);
    };

    const handleResult = (id, result) => {
        setResults((prev) => ({ ...prev, [id]: result }));
    };

    return (
<>

        <div className="row">
            <div className="col-md-6 col-lg-4">
                <InputCard images={images} onImagesChange={handleImagesChange} onAppendImages={handleAppendImages} />
            </div>
            <div className="col-md-6 col-lg-8">
                <ResultCard images={images} results={results} onResult={handleResult} />
            </div>
        </div>
    
</>
);
};

export default QRCodeDecode;
