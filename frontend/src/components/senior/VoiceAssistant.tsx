import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { speechService } from '../../services/speechService';
import { api } from '../../services/api';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  MessageCircle,
  RefreshCw,
  Pause,
  Play,
  Square,
  RotateCcw
} from 'lucide-react';

interface VoiceAssistantProps {
  onOpenNews?: () => void;
  onOpenGuides?: () => void;
  onRefreshReminders?: () => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onOpenNews,
  onOpenGuides,
  onRefreshReminders
}) => {
  const { profile, unlockAudio } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState<string>(
    `Dạ, con chào ${profile.preferredGreeting}! Hôm nay bác thấy trong người thế nào ạ? Bác có thể chạm vào chiếc Micro to màu xanh bên dưới để trò chuyện cùng con nhé!`
  );

  useEffect(() => {
    // Monitor speaking / paused states
    const timer = setInterval(() => {
      setIsSpeaking(speechService.isSpeaking());
      setIsPaused(speechService.isPaused());
    }, 300);
    return () => clearInterval(timer);
  }, []);

  const handleStartMic = () => {
    unlockAudio();

    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    // Stop previous audio playback before listening
    speechService.stopSpeaking();
    setIsSpeaking(false);
    setIsPaused(false);
    setTranscript('');
    setIsListening(true);

    speechService.startListening({
      onResult: (text, isFinal) => {
        setTranscript(text);
        if (isFinal && text.trim()) {
          processUserSpeech(text.trim());
        }
      },
      onError: (err) => {
        setIsListening(false);
        console.warn("Speech error:", err);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });
  };

  const speakText = (text: string) => {
    unlockAudio();
    setIsSpeaking(true);
    setIsPaused(false);

    speechService.speak(text, {
      onStart: () => {
        setIsSpeaking(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setIsPaused(false);
      },
      onError: () => {
        setIsSpeaking(false);
        setIsPaused(false);
      }
    });
  };

  const processUserSpeech = async (spokenText: string) => {
    setIsListening(false);
    setIsLoadingAI(true);
    try {
      const res = await api.sendChatMessage(spokenText);
      if (res && res.reply) {
        setAssistantReply(res.reply);
        // Automatic speech playback in Vietnamese as approved in grill-me
        speakText(res.reply);

        // Smooth jump if user asked about features
        const lower = spokenText.toLowerCase();
        if (lower.includes('tin tức') && onOpenNews) {
          setTimeout(onOpenNews, 1500);
        } else if ((lower.includes('hướng dẫn') || lower.includes('zalo')) && onOpenGuides) {
          setTimeout(onOpenGuides, 1500);
        } else if ((lower.includes('thuốc') || lower.includes('lịch')) && onRefreshReminders) {
          onRefreshReminders();
        }
      }
    } catch (e) {
      const fallback = `Dạ thưa ${profile.preferredGreeting}, cháu luôn ở bên cạnh bác ạ. Bác muốn kiểm tra lịch uống thuốc hay nghe đọc tin tức không ạ?`;
      setAssistantReply(fallback);
      speakText(fallback);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handlePromptClick = (text: string) => {
    unlockAudio();
    setTranscript(text);
    processUserSpeech(text);
  };

  const handleReplayVoice = () => {
    if (assistantReply) {
      speakText(assistantReply);
    }
  };

  const handleTogglePause = () => {
    if (isPaused) {
      speechService.resumeSpeaking();
      setIsPaused(false);
    } else {
      speechService.pauseSpeaking();
      setIsPaused(true);
    }
  };

  const handleStopVoice = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <div className="voice-hero-card" id="voice-section">
      <div className="voice-greeting">
        Người Đồng Hành Cùng {profile.preferredGreeting}
      </div>

      {/* Live Status indicator */}
      <div>
        {isListening ? (
          <span className="voice-status-pill listening">
            <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: '#DC2626' }}></span>
            Đang lắng nghe bác nói...
          </span>
        ) : isLoadingAI ? (
          <span className="voice-status-pill">
            <RefreshCw className="animate-spin" size={15} />
            Cháu đang suy nghĩ câu trả lời...
          </span>
        ) : isSpeaking ? (
          <span className="voice-status-pill speaking">
            <Volume2 size={16} />
            {isPaused ? 'Đã tạm dừng giọng đọc' : 'Cháu đang đọc câu trả lời...'}
          </span>
        ) : (
          <span className="voice-status-pill">
            <Sparkles size={15} />
            Chạm vào Micro để nói chuyện
          </span>
        )}
      </div>

      {/* Giant Voice Mic Button */}
      <div className="mic-button-wrapper">
        <div className={`pulse-ring ${isListening ? 'active' : ''}`} />
        <button
          onClick={handleStartMic}
          className={`mic-button ${isListening ? 'is-listening' : ''}`}
          aria-label={isListening ? "Đang nghe bác nói, bấm để dừng" : "Bấm vào đây để nói chuyện với AI"}
          title="Bấm vào để nói chuyện"
        >
          {isListening ? <MicOff size={44} /> : <Mic size={44} />}
          <span className="mic-label">{isListening ? "Đang Nghe" : "Nói Ngay"}</span>
        </button>
      </div>

      {/* Spoken transcript if available */}
      {transcript && (
        <div style={{ marginBottom: 10, fontStyle: 'italic', color: '#475569', fontSize: '1rem' }}>
          "{transcript}"
        </div>
      )}

      {/* Synchronized Subtitle & Audio Player Card */}
      <div className="speech-subtitle-card">
        <div className="speech-header-row">
          <div className="speech-speaker-label">
            <MessageCircle size={17} />
            <span>Người Đồng Hành Số:</span>
          </div>

          {/* Soundwave animation while reading */}
          {isSpeaking && !isPaused && (
            <div className="audio-soundwave" title="Đang phát giọng đọc tiếng Việt">
              <div className="soundwave-bar"></div>
              <div className="soundwave-bar"></div>
              <div className="soundwave-bar"></div>
              <div className="soundwave-bar"></div>
            </div>
          )}
        </div>

        {/* Large Readable Subtitle Text */}
        <div className="speech-text-body">
          {assistantReply}
        </div>

        {/* Playback Controls */}
        <div className="speech-controls-row">
          <button
            onClick={handleReplayVoice}
            className={`speech-action-btn ${isSpeaking && !isPaused ? 'active' : ''}`}
            title="Đọc lại câu trả lời này"
          >
            <RotateCcw size={16} />
            <span>{isSpeaking ? 'Đọc lại từ đầu' : '🔊 Nghe đọc'}</span>
          </button>

          {isSpeaking && (
            <>
              <button
                onClick={handleTogglePause}
                className="speech-action-btn"
                title={isPaused ? "Đọc tiếp" : "Tạm dừng giọng đọc"}
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                <span>{isPaused ? 'Đọc tiếp' : 'Tạm dừng'}</span>
              </button>

              <button
                onClick={handleStopVoice}
                className="speech-action-btn"
                title="Dừng đọc"
                style={{ color: '#DC2626' }}
              >
                <Square size={14} fill="#DC2626" />
                <span>Dừng</span>
              </button>
            </>
          )}
        </div>

        {/* Quick Zalo Trigger if mentioned */}
        {(assistantReply.toLowerCase().includes('zalo') || transcript.toLowerCase().includes('zalo')) && (
          <button
            onClick={() => {
              speechService.stopSpeaking();
              speechService.speak("Dạ, cháu đang mở ứng dụng Zalo để bác gọi cho con gái Mai Lan đây ạ!");
              window.open('https://zalo.me/0912345678', '_blank');
            }}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '12px 18px',
              background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 900,
              fontSize: '1.02rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
            }}
          >
            <span>📱 BẤM ĐỂ MỞ ZALO GỌI CHO CON GÁI NGAY</span>
          </button>
        )}
      </div>

      {/* Quick Prompts For Fast Interaction */}
      <div className="quick-prompts-title">
        Hoặc bác có thể chạm vào các câu hỏi thường gặp:
      </div>
      <div className="quick-prompts-list">
        <button
          className="prompt-chip"
          style={{ background: '#F0F9FF', borderColor: '#BAE6FD', color: '#0369A1' }}
          onClick={() => handlePromptClick("Hôm nay thời tiết thế nào?")}
        >
          🌤️ Hôm nay thời tiết thế nào?
        </button>
        <button
          className="prompt-chip"
          style={{ background: '#F0FDF4', borderColor: '#BBF7D0', color: '#15803D' }}
          onClick={() => handlePromptClick("Tôi cần uống thuốc gì hôm nay?")}
        >
          💊 Tôi cần uống thuốc gì?
        </button>
        <button
          className="prompt-chip"
          style={{ background: '#FFFBEB', borderColor: '#FDE68A', color: '#B45309' }}
          onClick={() => handlePromptClick("Đọc tin tức hôm nay cho tôi")}
        >
          📰 Đọc tin tức hôm nay
        </button>
        <button
          className="prompt-chip"
          style={{ background: '#EFF6FF', borderColor: '#BFDBFE', color: '#1D4ED8' }}
          onClick={() => handlePromptClick("Chỉ tôi cách gọi Zalo cho con")}
        >
          📱 Chỉ tôi cách gọi Zalo
        </button>
      </div>
    </div>
  );
};
