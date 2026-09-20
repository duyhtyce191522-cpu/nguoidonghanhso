import { Request, Response } from 'express';
import { newsService } from '../services/newsService';
import { getStoreFromReq } from '../services/dataStore';

export const getNewsList = async (req: Request, res: Response) => {
  try {
    const liveNews = await newsService.fetchLiveNews();
    res.json({ success: true, news: liveNews });
  } catch (e) {
    const store = getStoreFromReq(req);
    res.json({ success: true, news: store.getNews() });
  }
};

export const getNewsAudioDigest = async (req: Request, res: Response) => {
  try {
    const store = getStoreFromReq(req);
    const greeting = store.getProfile()?.preferredGreeting || 'Bác';
    const digest = await newsService.getAudioNewsDigest(greeting);
    res.json({ success: true, ...digest });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Không thể tạo bản tin điểm báo' });
  }
};

export const getSingleNews = async (req: Request, res: Response) => {
  const { id } = req.params;
  const list = await newsService.fetchLiveNews();
  const item = list.find(n => n.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Không tìm thấy tin tức' });
  }
  return res.json({ success: true, news: item });
};
