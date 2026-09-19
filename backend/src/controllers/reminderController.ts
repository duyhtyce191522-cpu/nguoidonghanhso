import { Request, Response } from 'express';
import { store } from '../services/dataStore';

export const getReminders = (req: Request, res: Response) => {
  const reminders = store.getReminders();
  res.json({ success: true, reminders });
};

export const toggleReminder = (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = store.toggleReminderComplete(id);
  if (!updated) {
    return res.status(404).json({ error: 'Không tìm thấy lịch nhắc' });
  }
  return res.json({ success: true, reminder: updated });
};

export const createReminder = (req: Request, res: Response) => {
  const { title, time, period, type, dosage, note } = req.body;
  if (!title || !time) {
    return res.status(400).json({ error: 'Thiếu tên thuốc/lịch hoặc thời gian' });
  }

  const newReminder = store.addReminder({
    title,
    time,
    period: period || 'morning',
    type: type || 'medicine',
    dosage,
    note,
    completed: false
  });

  return res.status(201).json({ success: true, reminder: newReminder });
};

export const updateReminder = (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = store.updateReminder(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Không tìm thấy lịch nhắc' });
  }
  return res.json({ success: true, reminder: updated });
};

export const deleteReminder = (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = store.deleteReminder(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Không tìm thấy lịch nhắc cần xóa' });
  }
  return res.json({ success: true, message: 'Đã xóa lịch nhắc' });
};
