import { Request, Response } from 'express';
import { store } from '../services/dataStore';

export const getGuidesList = (req: Request, res: Response) => {
  const guides = store.getGuides();
  res.json({ success: true, guides });
};

export const getSingleGuide = (req: Request, res: Response) => {
  const { id } = req.params;
  const item = store.getGuides().find(g => g.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Không tìm thấy bài hướng dẫn' });
  }
  return res.json({ success: true, guide: item });
};
