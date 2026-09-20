import { Request, Response } from 'express';
import { getStoreFromReq } from '../services/dataStore';

export const getCaregiverDashboard = (req: Request, res: Response) => {
  const store = getStoreFromReq(req);
  const reminders = store.getReminders();
  const logs = store.getLogs();
  const profile = store.getProfile();
  const contacts = store.getContacts();

  const totalReminders = reminders.length;
  const completedReminders = reminders.filter(r => r.completed).length;
  const adherenceRate = totalReminders > 0 ? Math.round((completedReminders / totalReminders) * 100) : 100;

  res.json({
    success: true,
    data: {
      profile,
      stats: {
        totalReminders,
        completedReminders,
        pendingReminders: totalReminders - completedReminders,
        adherenceRate
      },
      recentLogs: logs.slice(0, 10),
      contacts,
      familyCode: store.getFamilyCode(),
      phone: store.getPhone()
    }
  });
};

export const updateProfile = (req: Request, res: Response) => {
  const store = getStoreFromReq(req);
  const updated = store.updateProfile(req.body);
  res.json({ success: true, profile: updated });
};

export const getHealthLogs = (req: Request, res: Response) => {
  const store = getStoreFromReq(req);
  res.json({ success: true, logs: store.getLogs() });
};
