import { useState, useCallback } from 'react';
import QRCode from 'qrcode';
import InputArea from './components/InputArea';
import ResultList from './components/ResultList';

const App = () => {
    const [generating, setGenerating] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    const generateQRCodes = useCallback(async (urls) => {
        setGenerating(true);
        setResults([]);
        
        const newResults = [];
        
        try {
            // Process sequentially to not block UI too much, though Promise.all is faster.
            // Using Promise.all for better performance as generation is likely CPU bound but async
            const promises = urls.map(async (url, index) => {
                try {
                    const dataUrl = await QRCode.toDataURL(url, {
                        width: 256,
                        margin: 1,
                        errorCorrectionLevel: 'M'
                    });
                    
                    return {
                        url,
                        dataUrl,
                        filename: `qrcode_${index + 1}.png`
                    };
                } catch (error) {
                    console.error(`Error generating QR for ${url}:`, error);
                    return null;
                }
            });

            const generated = await Promise.all(promises);
            setResults(generated.filter(item => item !== null));
        } catch (error) {
            console.error("Batch generation error:", error);
        } finally {
            setGenerating(false);
        }
    }, []);

    return (
<>

        <div>
            <InputArea onGenerate={generateQRCodes} generating={generating} />
            <ResultList results={results} />
        </div>
    
</>
);
};

export default App;
