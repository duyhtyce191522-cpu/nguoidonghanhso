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
  RotateCcw,
  ExternalLink,
  Youtube,
  Facebook,
  PlaySquare,
  PhoneCall
} from 'lucide-react';

interface VoiceAssistantProps {
  onOpenNews?: () => void;
  onOpenGuides?: () => void;
  onRefreshReminders?: () => void;
}

interface AppAction {
  type: 'open_url';
  url: string;
  appName: string;
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
  const [appAction, setAppAction] = useState<AppAction | null>(null);
  const [assistantReply, setAssistantReply] = useState<string>(
    `Dạ, con chào ${profile.preferredGreeting}! Cháu là Trợ lý Đồng Hành Số. Bác có thể hỏi cháu mọi câu hỏi về đời sống, khoa học, thời tiết, lịch uống thuốc hoặc nói cháu mở YouTube, Facebook, TikTok cho bác xem nhé!`
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

  const checkLocalAppIntent = (text: string): AppAction | null => {
    const lower = text.toLowerCase();
    if (
      lower.includes('youtube') ||
      lower.includes('cải lương') ||
      lower.includes('ca nhạc') ||
      lower.includes('du túp') ||
      lower.includes('dút tuýp') ||
      lower.includes('bolero') ||
      lower.includes('nhạc vàng') ||
      (lower.includes('xem') && (lower.includes('hài') || lower.includes('phim') || lower.includes('hát') || lower.includes('thời sự')))
    ) {
      let query = 'ca nhạc cải lương';
      if (lower.includes('cải lương')) {
        query = 'cải lương việt nam tuyển chọn';
      } else if (lower.includes('nhạc vàng') || lower.includes('nhạc xưa') || lower.includes('bolero') || lower.includes('ca nhạc') || lower.includes('nhạc') || lower.includes('hát')) {
        query = 'nhạc vàng xưa trữ tình chọn lọc';
      } else if (lower.includes('hài') || lower.includes('tiểu phẩm')) {
        query = 'hài kịch dân gian việt nam';
      } else if (lower.includes('phim')) {
        query = 'phim truyền hình việt nam';
      } else if (lower.includes('thời sự') || lower.includes('tin tức')) {
        query = 'thời sự vtv1 mới nhất hôm nay';
      }

      const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      return {
        type: 'open_url',
        url,
        appName: 'YouTube'
      };
    }
    if (lower.includes('facebook') || lower.includes('phây búc') || lower.includes('xem ảnh')) {
      return {
        type: 'open_url',
        url: 'https://www.facebook.com',
        appName: 'Facebook'
      };
    }
    if (lower.includes('tiktok') || lower.includes('tóp tóp')) {
      return {
        type: 'open_url',
        url: 'https://www.tiktok.com',
        appName: 'TikTok'
      };
    }
    if (lower.includes('zalo')) {
      return {
        type: 'open_url',
        url: 'https://zalo.me/0912345678',
        appName: 'Zalo'
      };
    }
    return null;
  };

  const processUserSpeech = async (spokenText: string) => {
    setIsListening(false);
    setIsLoadingAI(true);
    setAppAction(null);

    // Immediate local intent check for snappy UX
    const localIntent = checkLocalAppIntent(spokenText);
    if (localIntent) {
      setAppAction(localIntent);
    }

    try {
      const res = await api.sendChatMessage(spokenText);
      if (res && res.reply) {
        setAssistantReply(res.reply);
        speakText(res.reply);

        if (res.action) {
          setAppAction(res.action);
          // Try to automatically open in new tab
          try {
            window.open(res.action.url, '_blank');
          } catch (e) {
            console.warn("Auto popup blocked, button available for user touch:", e);
          }
        } else if (localIntent) {
          try {
            window.open(localIntent.url, '_blank');
          } catch (e) {
            console.warn("Auto popup blocked:", e);
          }
        }

        // Section scrolling if requested
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
      const fallback = `Dạ thưa ${profile.preferredGreeting}, cháu luôn ở đây để giúp bác. Bác có thể hỏi cháu mọi câu hỏi hoặc bấm vào các nút bên dưới để mở YouTube, Facebook hay kiểm tra lịch thuốc nhé ạ!`;
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

  const renderAppActionCard = () => {
    if (!appAction) return null;

    let icon = <ExternalLink size={24} />;
    let btnStyle = {
      background: 'linear-gradient(135deg, #386641 0%, #2D5A3D 100%)',
      color: 'white',
      border: 'none'
    };

    if (appAction.appName === 'YouTube') {
      icon = <Youtube size={26} color="white" />;
      btnStyle = {
        background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
        color: 'white',
        border: 'none'
      };
    } else if (appAction.appName === 'Facebook') {
      icon = <Facebook size={26} color="white" />;
      btnStyle = {
        background: 'linear-gradient(135deg, #1877F2 0%, #0C63D4 100%)',
        color: 'white',
        border: 'none'
      };
    } else if (appAction.appName === 'TikTok') {
      icon = <PlaySquare size={26} color="white" />;
      btnStyle = {
        background: 'linear-gradient(135deg, #111827 0%, #000000 100%)',
        color: 'white',
        border: 'none'
      };
    } else if (appAction.appName === 'Zalo') {
      icon = <PhoneCall size={24} color="white" />;
      btnStyle = {
        background: 'linear-gradient(135deg, #0068FF 0%, #0052CC 100%)',
        color: 'white',
        border: 'none'
      };
    }

    return (
      <div className="voice-app-action-box" style={{ marginTop: '14px' }}>
        <button
          onClick={() => {
            speechService.stopSpeaking();
            window.open(appAction.url, '_blank');
          }}
          className="voice-app-action-button"
          style={{
            ...btnStyle,
            width: '100%',
            padding: '14px 20px',
            borderRadius: '16px',
            fontWeight: 800,
            fontSize: '1.05rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.15)',
            transition: 'transform 0.15s ease'
          }}
        >
          {icon}
          <span>BẤM VÀO ĐÂY ĐỂ VÀO {appAction.appName.toUpperCase()} NGAY</span>
          <ExternalLink size={18} />
        </button>
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#576B60', marginTop: '6px' }}>
          *(Nếu trình duyệt chưa tự mở tab mới, bác chỉ cần chạm vào nút phía trên)*
        </div>
      </div>
    );
  };

  return (
    <div className="voice-hero-card" id="voice-section">
      <div className="voice-greeting">
        🌿 Trợ Lý Thông Minh Đồng Hành Cùng {profile.preferredGreeting}
      </div>
      <div className="voice-subgreeting">
        Như trợ lý Google riêng, con có thể giải đáp mọi câu hỏi và mở ứng dụng cho bác
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
            Chạm vào Micro để hỏi bất kỳ câu gì
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
        <div style={{ marginBottom: 10, fontStyle: 'italic', color: '#386641', fontSize: '1.02rem', fontWeight: 600 }}>
          "{transcript}"
        </div>
      )}

      {/* Synchronized Subtitle & Audio Player Card */}
      <div className="speech-subtitle-card">
        <div className="speech-header-row">
          <div className="speech-speaker-label">
            <MessageCircle size={18} />
            <span>Trợ Lý Trả Lời:</span>
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

        {/* Interactive App Action Button (YouTube / Facebook / TikTok / Zalo) */}
        {renderAppActionCard()}
      </div>

      {/* Quick Prompts For Fast Google Assistant Q&A */}
      <div className="quick-prompts-title">
        💡 Hoặc bác có thể chạm vào các câu hỏi gợi ý:
      </div>
      <div className="quick-prompts-list">
        <button
          className="prompt-chip app-youtube-chip"
          onClick={() => handlePromptClick("Mở YouTube xem cải lương")}
        >
          ▶️ Mở YouTube xem cải lương
        </button>
        <button
          className="prompt-chip app-facebook-chip"
          onClick={() => handlePromptClick("Vào Facebook xem ảnh con cháu")}
        >
          👥 Vào Facebook xem ảnh
        </button>
        <button
          className="prompt-chip app-tiktok-chip"
          onClick={() => handlePromptClick("Bật TikTok giải trí")}
        >
          🎵 Bật TikTok giải trí
        </button>
        <button
          className="prompt-chip question-chip"
          onClick={() => handlePromptClick("Trái đất cách mặt trời bao xa?")}
        >
          ❓ Trái đất cách mặt trời bao xa?
        </button>
        <button
          className="prompt-chip question-chip"
          onClick={() => handlePromptClick("Thủ đô của nước Pháp là gì?")}
        >
          🗼 Thủ đô của Pháp là gì?
        </button>
        <button
          className="prompt-chip question-chip"
          onClick={() => handlePromptClick("Hôm nay thời tiết thế nào?")}
        >
          🌤️ Hôm nay thời tiết thế nào?
        </button>
        <button
          className="prompt-chip question-chip"
          onClick={() => handlePromptClick("Tôi cần uống thuốc gì hôm nay?")}
        >
          💊 Tôi cần uống thuốc gì?
        </button>
        <button
          className="prompt-chip question-chip"
          onClick={() => handlePromptClick("Chỉ tôi cách gọi Zalo cho con gái")}
        >
          📱 Chỉ tôi cách gọi Zalo
        </button>
      </div>
    </div>
  );
};
