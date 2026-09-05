import { render } from 'preact';
import { html } from 'htm/preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import InputCard from '@/components/InputCard.js';
import ControlsCard from '@/components/ControlsCard.js';
import ttsService from '@/services/ttsService.js';

const STORAGE_KEY = 'text-to-speech-voice-index';
const RATE_KEY = 'text-to-speech-rate';
const PITCH_KEY = 'text-to-speech-pitch';
const USED_VOICES_KEY = 'text-to-speech-used-voices';

const splitParagraphs = (text) => {
    return text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
};

const estimateDuration = (text, rate) => {
    const charsPerSec = 5 * rate;
    const total = text.length / charsPerSec;
    return Math.ceil(total);
};

const getSavedVoiceIndex = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) return parseInt(saved, 10);
    } catch (_) {}
    return -1;
};

const getSavedNumber = (key, fallback) => {
    try {
        const saved = localStorage.getItem(key);
        if (saved !== null) return parseFloat(saved);
    } catch (_) {}
    return fallback;
};

const saveNumber = (key, value) => {
    try {
        localStorage.setItem(key, String(value));
    } catch (_) {}
};

const resolveInitialVoice = (voices) => {
    const saved = getSavedNumber(STORAGE_KEY, -1);
    if (saved >= 0 && saved < voices.length) return saved;
    for (let i = 0; i < voices.length; i++) {
        if (voices[i].lang && voices[i].lang.startsWith('en')) return i;
    }
    return 0;
};

const getUsedVoiceIndices = () => {
    try {
        const raw = localStorage.getItem(USED_VOICES_KEY);
        if (raw) return JSON.parse(raw);
    } catch (_) {}
    return [];
};

const saveUsedVoiceIndex = (index) => {
    try {
        const used = getUsedVoiceIndices();
        if (!used.includes(index)) {
            used.push(index);
            localStorage.setItem(USED_VOICES_KEY, JSON.stringify(used));
        }
    } catch (_) {}
};

const App = () => {
    const [inputText, setInputText] = useState('');
    const [rate, setRate] = useState(getSavedNumber(RATE_KEY, 1));
    const [pitch, setPitch] = useState(getSavedNumber(PITCH_KEY, 1));
    const [voiceIndex, setVoiceIndex] = useState(0);
    const [voices, setVoices] = useState([]);
    const [voicesReady, setVoicesReady] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [supported, setSupported] = useState(true);
    const [currentParagraph, setCurrentParagraph] = useState(-1);

    const paragraphsRef = useRef([]);
    const rateRef = useRef(rate);
    const pitchRef = useRef(pitch);
    const voiceIndexRef = useRef(voiceIndex);
    const currentIndexRef = useRef(-1);

    useEffect(() => {
        rateRef.current = rate;
    }, [rate]);

    useEffect(() => {
        pitchRef.current = pitch;
    }, [pitch]);

    useEffect(() => {
        voiceIndexRef.current = voiceIndex;
    }, [voiceIndex]);

    useEffect(() => {
        setSupported(ttsService.isSupported());
        if (ttsService.isSupported()) {
            ttsService.loadVoices().then((loadedVoices) => {
                setVoices(loadedVoices);
                setVoicesReady(true);
                setVoiceIndex(resolveInitialVoice(loadedVoices));
            });
        }
    }, []);

    useEffect(() => {
        const checkStatus = setInterval(() => {
            const speaking = ttsService.isSpeaking();
            setIsSpeaking(speaking);
            if (!speaking && currentIndexRef.current >= 0) {
                currentIndexRef.current = -1;
                setCurrentParagraph(-1);
            }
        }, 200);
        return () => clearInterval(checkStatus);
    }, []);

    useEffect(() => {
        return () => {
            ttsService.stop();
        };
    }, []);

    const paragraphs = splitParagraphs(inputText);
    paragraphsRef.current = paragraphs;

    const commonVoiceIndices = (() => {
        const used = getUsedVoiceIndices();
        return used.length > 0 ? used : (voices.length > 0 ? [0] : []);
    })();
    const estimatedDuration = paragraphs.length > 0 ? estimateDuration(inputText, rate) : 0;

    const speakParagraph = (index) => {
        const currentParagraphs = paragraphsRef.current;
        if (index >= currentParagraphs.length) {
            currentIndexRef.current = -1;
            setCurrentParagraph(-1);
            return;
        }
        currentIndexRef.current = index;
        setCurrentParagraph(index);
        const utterance = ttsService.configureUtterance(currentParagraphs[index], {
            rate: rateRef.current,
            pitch: pitchRef.current,
            voiceIndex: voiceIndexRef.current,
        });
        if (!utterance) return;
        utterance.onend = () => {
            speakParagraph(index + 1);
        };
        ttsService.speak(utterance);
    };

    const handleClear = () => {
        ttsService.stop();
        setInputText('');
        setCurrentParagraph(-1);
        currentIndexRef.current = -1;
    };

    const handleLoadExample = () => {
        setInputText(getText('text-to-speech/example'));
    };

    const handlePlay = () => {
        if (paragraphs.length === 0) return;
        saveUsedVoiceIndex(voiceIndexRef.current);
        speakParagraph(0);
    };

    const handleStop = () => {
        ttsService.stop();
        setCurrentParagraph(-1);
        currentIndexRef.current = -1;
    };

    const handleRateChange = (e) => {
        const v = parseFloat(e.target.value);
        setRate(v);
        saveNumber(RATE_KEY, v);
    };

    const handlePitchChange = (e) => {
        const v = parseFloat(e.target.value);
        setPitch(v);
        saveNumber(PITCH_KEY, v);
    };

    const handleVoiceChange = (e) => {
        const index = parseInt(e.target.value, 10);
        setVoiceIndex(index);
        saveNumber(STORAGE_KEY, index);
    };

    return html`
        <div class="text-to-speech-container">
            <div class="row g-4">
                <div class="col-12">
                    <${InputCard}
                        text=${inputText}
                        onTextChange=${setInputText}
                        onClear=${handleClear}
                        onLoadExample=${handleLoadExample}
                    />
                </div>
                <div class="col-12">
                    <${ControlsCard}
                        onPlay=${handlePlay}
                        onStop=${handleStop}
                        isSpeaking=${isSpeaking}
                        rate=${rate}
                        onRateChange=${handleRateChange}
                        pitch=${pitch}
                        onPitchChange=${handlePitchChange}
                        voiceIndex=${voiceIndex}
                        onVoiceChange=${handleVoiceChange}
                        voices=${voices}
                        voicesReady=${voicesReady}
                        commonVoiceIndices=${commonVoiceIndices}
                        supported=${supported}
                        paragraphs=${paragraphs}
                        currentParagraph=${currentParagraph}
                        estimatedDuration=${estimatedDuration}
                    />
                </div>
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});