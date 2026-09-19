import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { speechService } from '../../services/speechService';
import { api } from '../../services/api';
import { Mic, MicOff, Volume2, Sparkles, MessageCircle, RefreshCw } from 'lucide-react';

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
  const { profile } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState<string>(
    `Dạ, con chào ${profile.preferredGreeting}! Hôm nay bác thấy trong người thế nào ạ? Bác có thể chạm vào chiếc Micro to màu xanh bên dưới để trò chuyện cùng con nhé!`
  );

  useEffect(() => {
    // Check if browser is currently speaking
    const checkSpeaking = setInterval(() => {
      setIsSpeaking(speechService.isSpeaking());
    }, 400);
    return () => clearInterval(checkSpeaking);
  }, []);

  const handleStartMic = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    // Stop speaking if assistant is currently talking
    speechService.stopSpeaking();
    setIsSpeaking(false);
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

  const processUserSpeech = async (spokenText: string) => {
    setIsListening(false);
    setIsLoadingAI(true);
    try {
      const res = await api.sendChatMessage(spokenText);
      if (res && res.reply) {
        setAssistantReply(res.reply);
        // Automatically speak reply out loud in Vietnamese
        speechService.speak(res.reply, () => {
          setIsSpeaking(false);
        });
        setIsSpeaking(true);

        // If user asked about news or guides, notify parent
        const lower = spokenText.toLowerCase();
        if (lower.includes('tin tức') && onOpenNews) {
          onOpenNews();
        } else if ((lower.includes('hướng dẫn') || lower.includes('zalo')) && onOpenGuides) {
          onOpenGuides();
        } else if ((lower.includes('thuốc') || lower.includes('lịch')) && onRefreshReminders) {
          onRefreshReminders();
        }
      }
    } catch (e) {
      const fallback = "Dạ thưa bác, cháu luôn ở bên cạnh bác ạ. Bác muốn kiểm tra lịch thuốc hay nghe đọc tin tức không ạ?";
      setAssistantReply(fallback);
      speechService.speak(fallback);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handlePromptClick = (text: string) => {
    setTranscript(text);
    processUserSpeech(text);
  };

  const handleReplayVoice = () => {
    if (assistantReply) {
      speechService.stopSpeaking();
      speechService.speak(assistantReply, () => {
        setIsSpeaking(false);
      });
      setIsSpeaking(true);
    }
  };

  return (
    <div className="voice-hero-card">
      <div className="voice-greeting">
        Người Đồng Hành Cùng {profile.preferredGreeting}
      </div>

      {/* Live Status indicator */}
      <div>
        {isListening ? (
          <span className="voice-status-pill listening">
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#DC2626' }}></span>
            Đang lắng nghe bác nói...
          </span>
        ) : isLoadingAI ? (
          <span className="voice-status-pill">
            <RefreshCw className="animate-spin" size={16} />
            Cháu đang suy nghĩ câu trả lời...
          </span>
        ) : isSpeaking ? (
          <span className="voice-status-pill speaking">
            <Volume2 size={18} />
            Cháu đang trò chuyện cùng bác...
          </span>
        ) : (
          <span className="voice-status-pill">
            <Sparkles size={16} />
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
          {isListening ? <MicOff size={46} /> : <Mic size={46} />}
          <span className="mic-label">{isListening ? "Đang Nghe" : "Nói Ngay"}</span>
        </button>
      </div>

      {/* Spoken transcript if available */}
      {transcript && (
        <div style={{ marginBottom: 12, fontStyle: 'italic', color: '#475569', fontSize: '1.05rem' }}>
          "{transcript}"
        </div>
      )}

      {/* Assistant Voice Speech Bubble */}
      <div className="speech-bubble-container">
        <div className="speech-bubble-speaker">
          <MessageCircle size={18} />
          <span>Người Đồng Hành Số:</span>
        </div>
        <div className="speech-bubble-text">
          {assistantReply}
        </div>

        <button
          onClick={handleReplayVoice}
          className="speech-speak-btn"
          title="Nghe lại câu trả lời này"
        >
          <Volume2 size={18} />
          <span>{isSpeaking ? "Đang đọc... Bấm để đọc lại" : "Nghe lại bằng giọng nói"}</span>
        </button>
      </div>

      {/* Quick Prompts For Fast Interaction */}
      <div className="quick-prompts-title">
        Hoặc bác có thể chạm vào các câu hỏi thường gặp:
      </div>
      <div className="quick-prompts-list">
        <button
          className="prompt-chip"
          onClick={() => handlePromptClick("Hôm nay thời tiết thế nào?")}
        >
          🌤️ Hôm nay thời tiết thế nào?
        </button>
        <button
          className="prompt-chip"
          onClick={() => handlePromptClick("Tôi cần uống thuốc gì hôm nay?")}
        >
          💊 Tôi cần uống thuốc gì?
        </button>
        <button
          className="prompt-chip"
          onClick={() => handlePromptClick("Đọc tin tức hôm nay cho tôi")}
        >
          📰 Đọc tin tức hôm nay
        </button>
        <button
          className="prompt-chip"
          onClick={() => handlePromptClick("Chỉ tôi cách gọi Zalo cho con")}
        >
          📱 Chỉ tôi cách gọi Zalo
        </button>
      </div>
    </div>
  );
};
