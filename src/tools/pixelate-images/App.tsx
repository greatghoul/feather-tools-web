import { useState, useCallback } from 'react';

// Local Components
import InputCard from './components/InputCard';
import EditorCard from './components/EditorCard';

const App = () => {
    const [images, setImages] = useState<any[]>([]);
    const settings = { blockSize: 20 };

    const handleDownload = useCallback((dataURL, imageName) => {
        const a = document.createElement('a');
        a.href = dataURL;
        const filename = imageName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
        a.download = `pixelated-${filename}`;
        document.body.appendChild(a);
        document.body.removeChild(a);
    }, []);

    return (
<>

        <div className="pixelate-images-container">
            <InputCard onImagesChange={setImages} />
            {images.length > 0 && (
<>

                {images.map(image => (
                    <EditorCard key={image.id} image={image} settings={settings} onDownload={handleDownload} />
))}
            
</>
)}
        </div>
    
</>
);
};

export default App;
