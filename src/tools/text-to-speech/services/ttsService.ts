const SUPPORTED =
    typeof window !== 'undefined' &&
    typeof window.speechSynthesis !== 'undefined';
const SYNC = SUPPORTED ? window.speechSynthesis : null;
const Utterance = SUPPORTED ? window.SpeechSynthesisUtterance : null;

class TtsService  {

    private voices: any;
        private voicesReady: any;
        private _currentUtterance: any;

    constructor() {
        this.voices = [];
        this.voicesReady = false;
        this._currentUtterance = null;
    }

    isSupported() {
        return SUPPORTED;
    }

    loadVoices() {
        return new Promise<any[]>((resolve) => {
            if (!SUPPORTED) {
                resolve([]);
                return;
            }
            const voices = SYNC!.getVoices();
            if (voices.length > 0) {
                this.voices = voices;
                this.voicesReady = true;
                resolve(voices);
            } else {
                SYNC!.addEventListener('voiceschanged', () => {
                    this.voices = SYNC!.getVoices();
                    this.voicesReady = true;
                    resolve(this.voices);
                }, { once: true });
            }
        });
    }

    configureUtterance(text, options: any = {}) {
        if (!SUPPORTED || !text) return null;

        const { rate = 1, pitch = 1, voiceIndex = -1 } = options;

        const utterance = new Utterance!(text);
        utterance.rate = rate;
        utterance.pitch = pitch;

        if (voiceIndex >= 0 && voiceIndex < this.voices.length) {
            utterance.voice = this.voices[voiceIndex];
        } else if (this.voices.length > 0) {
            utterance.voice = this.voices[0];
        }

        return utterance;
    }

    speak(utterance) {
        if (!SUPPORTED || !utterance) return;
        SYNC!.cancel();
        this._currentUtterance = utterance;
        SYNC!.speak(utterance);
    }

    pause() {
        if (SUPPORTED) {
            SYNC!.pause();
        }
    }

    resume() {
        if (SUPPORTED) {
            SYNC!.resume();
        }
    }

    stop() {
        if (SUPPORTED) {
            SYNC!.cancel();
            this._currentUtterance = null;
        }
    }

    isSpeaking() {
        return SUPPORTED && SYNC!.speaking;
    }

    isPaused() {
        return SUPPORTED && SYNC!.paused;
    }
}

export default new TtsService();
