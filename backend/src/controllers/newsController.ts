import { Request, Response } from 'express';
import { store } from '../services/dataStore';

export const getNewsList = (req: Request, res: Response) => {
  const news = store.getNews();
  res.json({ success: true, news });
};

export const getSingleNews = (req: Request, res: Response) => {
  const { id } = req.params;
  const item = store.getNews().find(n => n.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Không tìm thấy tin tức' });
  }
  return res.json({ success: true, news: item });
};
