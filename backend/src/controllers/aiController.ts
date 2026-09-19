import { Request, Response } from 'express';
import { aiService } from '../services/geminiService';
import { store } from '../services/dataStore';

export const handleAIChat = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Nội dung tin nhắn không hợp lệ' });
    }

    // Save user message
    store.addChat({ sender: 'user', text: message });

    // Generate AI response
    const reply = await aiService.generateReply(message);

    // Save AI message
    const savedMsg = store.addChat({ sender: 'assistant', text: reply });

    // Add health/interaction log
    store.addLog({
      type: 'voice_chat',
      description: `Bác trò chuyện: "${message.slice(0, 40)}${message.length > 40 ? '...' : ''}" -> AI phản hồi ân cần.`
    });

    return res.json({
      success: true,
      reply,
      messageId: savedMsg.id,
      timestamp: savedMsg.timestamp
    });
  } catch (err: any) {
    console.error('AI chat error:', err);
    return res.status(500).json({
      error: 'Có lỗi xảy ra khi xử lý phản hồi AI',
      reply: 'Dạ thưa bác, cháu đang kết nối lại một chút, bác chờ cháu vài giây nhé ạ!'
    });
  }
};

export const getChatHistory = (req: Request, res: Response) => {
  const chats = store.getChats();
  res.json({ success: true, chats });
};
