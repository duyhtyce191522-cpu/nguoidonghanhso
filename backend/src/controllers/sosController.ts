import { Request, Response } from 'express';
import { getStoreFromReq } from '../services/dataStore';

export const triggerSOS = (req: Request, res: Response) => {
  const store = getStoreFromReq(req);
  const { reason } = req.body;
  const primaryContact = store.getContacts().find(c => c.isPrimary) || store.getContacts()[0];

  const log = store.addLog({
    type: 'sos_alert',
    description: `[CẢNH BÁO KHẨN CẤP SOS] Bác đã bấm nút trợ giúp khẩn cấp! Đã kích hoạt liên lạc tới ${primaryContact?.name || 'người thân'} (${primaryContact?.phone}). Lý do: ${reason || 'Yêu cầu hỗ trợ ngay'}.`
  });

  return res.json({
    success: true,
    alertActive: true,
    contactToCall: primaryContact,
    logId: log.id,
    message: `Đã gửi tín hiệu khẩn cấp tới ${primaryContact?.name}. Đang kết nối cuộc gọi...`
  });
};

export const getContacts = (req: Request, res: Response) => {
  const store = getStoreFromReq(req);
  res.json({ success: true, contacts: store.getContacts() });
};

export const addContact = (req: Request, res: Response) => {
  const store = getStoreFromReq(req);
  const { name, relation, phone, isPrimary } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Thiếu tên hoặc số điện thoại người thân' });
  }
  const contact = store.addContact({ name, relation: relation || 'Người thân', phone, isPrimary: !!isPrimary });
  return res.status(201).json({ success: true, contact });
};

export const deleteContact = (req: Request, res: Response) => {
  const store = getStoreFromReq(req);
  const { id } = req.params;
  const ok = store.deleteContact(id);
  if (!ok) return res.status(404).json({ error: 'Không tìm thấy số liên lạc' });
  return res.json({ success: true });
};
