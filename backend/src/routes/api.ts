import { Router } from 'express';
import { handleAIChat, getChatHistory } from '../controllers/aiController';
import {
  getReminders,
  toggleReminder,
  createReminder,
  updateReminder,
  deleteReminder
} from '../controllers/reminderController';
import { getNewsList, getSingleNews } from '../controllers/newsController';
import { getGuidesList, getSingleGuide } from '../controllers/guideController';
import { triggerSOS, getContacts, addContact, deleteContact } from '../controllers/sosController';
import { getCaregiverDashboard, updateProfile, getHealthLogs } from '../controllers/caregiverController';
import { handleTTS } from '../controllers/ttsController';

const router = Router();

// AI Chat & Voice TTS
router.post('/chat', handleAIChat);
router.get('/chat/history', getChatHistory);
router.get('/tts', handleTTS);

// Reminders
router.get('/reminders', getReminders);
router.post('/reminders', createReminder);
router.patch('/reminders/:id/toggle', toggleReminder);
router.put('/reminders/:id', updateReminder);
router.delete('/reminders/:id', deleteReminder);

// News
router.get('/news', getNewsList);
router.get('/news/:id', getSingleNews);

// Guides
router.get('/guides', getGuidesList);
router.get('/guides/:id', getSingleGuide);

// SOS & Contacts
router.post('/sos', triggerSOS);
router.get('/contacts', getContacts);
router.post('/contacts', addContact);
router.delete('/contacts/:id', deleteContact);

// Caregiver Dashboard & Logs
router.get('/caregiver/dashboard', getCaregiverDashboard);
router.get('/caregiver/logs', getHealthLogs);
router.put('/caregiver/profile', updateProfile);

export default router;
