import { useState } from 'react';
import ImageUploadZone from '~/components/ImageUploadZone';
import ResultCard from './components/ResultCard';

const App = () => {
    const [image, setImage] = useState(null);

    const handleImageChange = (images) => {
        if (images.length > 0) {
            setImage(images[0]);
        }
    };

    return (
<>

        <div className="shape-image-app mb-3">
            {image ? (
<>

                <ResultCard image={image} onClear={() => setImage(null)} />
            
</>
) : (
<>

                <ImageUploadZone disabled={undefined} onChange={handleImageChange} />
            
</>
)}
        </div>
    
</>
);
};

export default App;
