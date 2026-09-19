// Speech Recognition & Natural Vietnamese TTS Service for Elderly Companion

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
  private currentAudio: HTMLAudioElement | null = null;
  private isAudioUnlocked = false;
  private isSpeakingActive = false;
  private isPausedState = false;

  constructor() {
    this.initSpeechRecognition();
    this.initSpeechSynthesis();
  }

  // Unlock mobile browser audio restriction on first user touch
  unlockAudio() {
    if (this.isAudioUnlocked) return;
    try {
      audioFeedback.getContext();
      if ('speechSynthesis' in window) {
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

        // Look for true Vietnamese voices
        const viVoice = voices.find(v => {
          const name = v.name.toLowerCase();
          const lang = v.lang.toLowerCase();
          return lang.startsWith('vi') || name.includes('vietnam') || name.includes('tiếng việt') || name.includes('hoaimy') || name.includes('linh') || name.includes('an');
        });

        this.selectedVoice = viVoice || null;
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }

  hasNativeVietnameseVoice(): boolean {
    return this.selectedVoice !== null;
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
      callbacks.onError("Trình duyệt chưa hỗ trợ nhận diện giọng nói. Bác có thể chạm vào các câu hỏi gợi ý bên dưới ạ.");
      return;
    }

    if (this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    // Stop previous audio playback before listening
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

  // Speak with 100% guaranteed natural Vietnamese voice
  speak(
    text: string,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    }
  ): void {
    this.unlockAudio();
    this.stopSpeaking();

    const cleanText = text
      .replace(/[*#_`~>]/g, '')
      .replace(/[\u{1F600}-\u{1F6FF}]/gu, '')
      .trim();

    if (!cleanText) {
      if (options?.onEnd) options.onEnd();
      return;
    }

    // Always prefer the dedicated natural Vietnamese TTS stream from backend /api/tts
    // This solves the issue where Windows/English devices don't have a Vietnamese voice installed
    try {
      const ttsUrl = `/api/tts?text=${encodeURIComponent(cleanText.slice(0, 380))}`;
      const audio = new Audio(ttsUrl);
      this.currentAudio = audio;
      this.isSpeakingActive = true;
      this.isPausedState = false;

      audio.onplay = () => {
        this.isSpeakingActive = true;
        this.isPausedState = false;
        if (options?.onStart) options.onStart();
      };

      audio.onended = () => {
        this.isSpeakingActive = false;
        this.isPausedState = false;
        this.currentAudio = null;
        if (options?.onEnd) options.onEnd();
      };

      audio.onerror = (e) => {
        console.warn("Audio TTS stream error, falling back to Web Speech:", e);
        this.currentAudio = null;
        this.speakWithWebSpeech(cleanText, options);
      };

      audio.play().catch((err) => {
        console.warn("Audio play blocked or failed, falling back to Web Speech:", err);
        this.currentAudio = null;
        this.speakWithWebSpeech(cleanText, options);
      });
    } catch (e) {
      this.speakWithWebSpeech(cleanText, options);
    }
  }

  // Fallback to browser Web Speech API
  private speakWithWebSpeech(
    cleanText: string,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    }
  ) {
    if (!('speechSynthesis' in window)) {
      this.isSpeakingActive = false;
      if (options?.onEnd) options.onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.90;
    utterance.pitch = 1.0;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onstart = () => {
      this.isSpeakingActive = true;
      this.isPausedState = false;
      if (options?.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.isSpeakingActive = false;
      this.isPausedState = false;
      if (options?.onEnd) options.onEnd();
    };

    utterance.onerror = () => {
      this.isSpeakingActive = false;
      this.isPausedState = false;
      if (options?.onEnd) options.onEnd();
    };

    this.isSpeakingActive = true;
    window.speechSynthesis.speak(utterance);
  }

  pauseSpeaking() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.isPausedState = true;
    } else if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      this.isPausedState = true;
    }
  }

  resumeSpeaking() {
    if (this.currentAudio) {
      this.currentAudio.play().catch(() => {});
      this.isPausedState = false;
    } else if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.isPausedState = false;
    }
  }

  stopSpeaking() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeakingActive = false;
    this.isPausedState = false;
  }

  isSpeaking(): boolean {
    return this.isSpeakingActive;
  }

  isPaused(): boolean {
    return this.isPausedState;
  }
}

export const speechService = new SpeechService();
