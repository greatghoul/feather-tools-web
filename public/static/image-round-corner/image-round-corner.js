import { render, h } from 'preact';
import { useState, useEffect } from "preact/hooks";
import { html } from 'htm/preact';
import { setup } from 'goober';
import ResultCard from '@/components/ResultCard.js';
import InputCard from '@/components/InputCard.js';
import { DEFAULT_ROUND_CORNER_SETTING } from '@/components/RoundCornerSetting.js';

setup(h);

const ImageRoundCorner = () => {
    const [images, setImages] = useState([]);
    const [setting, setSetting] = useState(DEFAULT_ROUND_CORNER_SETTING);
    const [autoProcess, setAutoProcess] = useState(false);
    const [processingKey, setProcessingKey] = useState(0);

    useEffect(() => {
        if (images.length > 0 && !autoProcess) {
            setAutoProcess(true);
            setProcessingKey(prev => prev + 1);
        }
    }, [images]);

    return html`
        <div class="row">
            <div class="col-md-6 col-lg-4">
                <${InputCard}
                    images=${images}
                    setting=${setting}
                    onImagesChange=${setImages}
                    onSettingChange=${setSetting}
                />
            </div>
            <div class="col-md-6 col-lg-8">
              <${ResultCard} 
                  images=${images} 
                  setting=${setting} 
                  autoProcess=${autoProcess}
                  processingKey=${processingKey}
              />
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${ImageRoundCorner} />`, document.getElementById('app'));
});
