// Speech Recognition & Synthesis Service for Vietnamese Elderly Companion

class AudioFeedback {
  private ctx: AudioContext | null = null;

  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Soft pleasant chime when medicine is taken
  playSuccessChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(783.99, now + 0.35); // G5

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.15);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.6);
    } catch (e) {
      console.warn("Audio feedback error:", e);
    }
  }

  // Soft beep when microphone activates
  playMicStart() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn("Mic beep error:", e);
    }
  }

  // Urgent SOS warning tone
  playSOSTone() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.2);
      osc.frequency.setValueAtTime(880, now + 0.4);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {
      console.warn("SOS tone error:", e);
    }
  }
}

export const audioFeedback = new AudioFeedback();

export class SpeechService {
  private recognition: any = null;
  private isListening = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isAudioUnlocked = false;

  constructor() {
    this.initSpeechRecognition();
    this.initSpeechSynthesis();
  }

  // Unlock mobile browser audio restriction on first user gesture
  unlockAudio() {
    if (this.isAudioUnlocked) return;
    try {
      audioFeedback.getContext();
      if ('speechSynthesis' in window) {
        // Speak empty utterance to prime mobile speech synthesis
        const silentUtterance = new SpeechSynthesisUtterance(' ');
        silentUtterance.volume = 0.01;
        window.speechSynthesis.speak(silentUtterance);
      }
      this.isAudioUnlocked = true;
    } catch (e) {
      console.warn("Failed to unlock audio:", e);
    }
  }

  private initSpeechRecognition() {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.lang = 'vi-VN';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  private initSpeechSynthesis() {
    if ('speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return;

        // 1. First priority: High-quality natural Vietnamese voices
        const naturalViVoice = voices.find(v => {
          const name = v.name.toLowerCase();
          const lang = v.lang.toLowerCase();
          return (
            lang.startsWith('vi') &&
            (name.includes('natural') || name.includes('online') || name.includes('google') || name.includes('hoaimy') || name.includes('linh') || name.includes('an'))
          );
        });

        // 2. Second priority: Any voice with lang starting with 'vi'
        const anyViVoice = voices.find(v => v.lang.toLowerCase().startsWith('vi'));

        // 3. Fallback: Any voice matching Vietnam
        const viNamedVoice = voices.find(v => v.name.toLowerCase().includes('vietnam') || v.name.toLowerCase().includes('tiếng việt'));

        this.selectedVoice = naturalViVoice || anyViVoice || viNamedVoice || voices[0];
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }

  getSelectedVoiceName(): string {
    return this.selectedVoice?.name || 'Mặc định';
  }

  isSpeechRecognitionSupported(): boolean {
    return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  }

  startListening(callbacks: {
    onResult: (text: string, isFinal: boolean) => void;
    onError: (error: string) => void;
    onEnd: () => void;
  }) {
    this.unlockAudio();

    if (!this.recognition) {
      this.initSpeechRecognition();
    }

    if (!this.recognition) {
      callbacks.onError("Trình duyệt chưa hỗ trợ nhận diện giọng nói. Bác có thể bấm vào các câu hỏi gợi ý bên dưới ạ.");
      return;
    }

    if (this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    // Stop speaking while listening
    this.stopSpeaking();

    audioFeedback.playMicStart();
    this.isListening = true;

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        callbacks.onResult(finalTranscript, true);
      } else if (interimTranscript) {
        callbacks.onResult(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      console.warn("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        callbacks.onError("Vui lòng cho phép quyền micro để nói chuyện bằng giọng nói ạ.");
      } else if (event.error !== 'no-speech') {
        callbacks.onError("Cháu chưa nghe rõ, bác bấm micro nói lại nhé.");
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      callbacks.onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      this.isListening = false;
      callbacks.onError("Không thể khởi động micro lúc này.");
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }

  // Text-To-Speech with synchronized callbacks and controls
  speak(
    text: string,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
      onBoundary?: (charIndex: number) => void;
    }
  ): void {
    this.unlockAudio();

    if (!('speechSynthesis' in window)) {
      console.warn("Speech synthesis not supported");
      if (options?.onEnd) options.onEnd();
      return;
    }

    // Cancel current speech before starting new one
    this.stopSpeaking();

    // Clean text: strip markdown symbols and emojis for smoother pronunciation
    const cleanText = text
      .replace(/[*#_`~>]/g, '')
      .replace(/[\u{1F600}-\u{1F6FF}]/gu, '')
      .trim();

    if (!cleanText) {
      if (options?.onEnd) options.onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.90; // Standard clear elderly cadence
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onstart = () => {
      if (options?.onStart) options.onStart();
    };

    utterance.onboundary = (e) => {
      if (options?.onBoundary) {
        options.onBoundary(e.charIndex);
      }
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (options?.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      console.warn("TTS playback warning:", e);
      this.currentUtterance = null;
      if (options?.onEnd) options.onEnd();
    };

    this.currentUtterance = utterance;

    // Workaround for Chrome bug where speech drops on long sentences
    window.speechSynthesis.speak(utterance);
  }

  pauseSpeaking() {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }

  resumeSpeaking() {
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  isSpeaking(): boolean {
    return 'speechSynthesis' in window && window.speechSynthesis.speaking;
  }

  isPaused(): boolean {
    return 'speechSynthesis' in window && window.speechSynthesis.paused;
  }
}

export const speechService = new SpeechService();
