import { Request, Response } from 'express';
import { aiService } from '../services/geminiService';
import { getStoreFromReq } from '../services/dataStore';

export const handleAIChat = async (req: Request, res: Response) => {
  try {
    const store = getStoreFromReq(req);
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Nội dung tin nhắn không hợp lệ' });
    }

    // Save user message
    store.addChat({ sender: 'user', text: message });

    // Generate AI response with user store context
    const aiResult = await aiService.generateReply(message, store);

    // Save AI message
    const savedMsg = store.addChat({ sender: 'assistant', text: aiResult.reply });

    // Add health/interaction log
    store.addLog({
      type: 'voice_chat',
      description: `Bác trò chuyện: "${message.slice(0, 40)}${message.length > 40 ? '...' : ''}" -> AI phản hồi.`
    });

    return res.json({
      success: true,
      reply: aiResult.reply,
      action: aiResult.action,
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
  const store = getStoreFromReq(req);
  const chats = store.getChats();
  res.json({ success: true, chats });
};
