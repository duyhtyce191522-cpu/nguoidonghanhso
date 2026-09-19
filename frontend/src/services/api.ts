import { Reminder, NewsItem, GuideItem, EmergencyContact, HealthLog, SeniorProfile, CaregiverStats } from '../types';

const BASE_URL = '/api';

export const api = {
  // AI Chat
  async sendChatMessage(message: string): Promise<{
    reply: string;
    messageId: string;
    action?: {
      type: 'open_url';
      url: string;
      appName: string;
    };
  }> {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    return data;
  },

  async getChatHistory() {
    const res = await fetch(`${BASE_URL}/chat/history`);
    return await res.json();
  },

  // Reminders
  async getReminders(): Promise<Reminder[]> {
    const res = await fetch(`${BASE_URL}/reminders`);
    const data = await res.json();
    return data.reminders || [];
  },

  async toggleReminder(id: string): Promise<Reminder> {
    const res = await fetch(`${BASE_URL}/reminders/${id}/toggle`, {
      method: 'PATCH'
    });
    const data = await res.json();
    return data.reminder;
  },

  async createReminder(reminderData: Partial<Reminder>): Promise<Reminder> {
    const res = await fetch(`${BASE_URL}/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reminderData)
    });
    const data = await res.json();
    return data.reminder;
  },

  async deleteReminder(id: string): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/reminders/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  },

  // News
  async getNews(): Promise<NewsItem[]> {
    const res = await fetch(`${BASE_URL}/news`);
    const data = await res.json();
    return data.news || [];
  },

  // Guides
  async getGuides(): Promise<GuideItem[]> {
    const res = await fetch(`${BASE_URL}/guides`);
    const data = await res.json();
    return data.guides || [];
  },

  // SOS & Contacts
  async triggerSOS(reason?: string): Promise<{ success: boolean; contactToCall: EmergencyContact; message: string }> {
    const res = await fetch(`${BASE_URL}/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return await res.json();
  },

  async getContacts(): Promise<EmergencyContact[]> {
    const res = await fetch(`${BASE_URL}/contacts`);
    const data = await res.json();
    return data.contacts || [];
  },

  async addContact(contact: Partial<EmergencyContact>): Promise<EmergencyContact> {
    const res = await fetch(`${BASE_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact)
    });
    const data = await res.json();
    return data.contact;
  },

  async deleteContact(id: string): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/contacts/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  },

  // Caregiver
  async getCaregiverDashboard(): Promise<{
    profile: SeniorProfile;
    stats: CaregiverStats;
    recentLogs: HealthLog[];
    contacts: EmergencyContact[];
  }> {
    const res = await fetch(`${BASE_URL}/caregiver/dashboard`);
    const data = await res.json();
    return data.data;
  },

  async updateProfile(profile: Partial<SeniorProfile>): Promise<SeniorProfile> {
    const res = await fetch(`${BASE_URL}/caregiver/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    const data = await res.json();
    return data.profile;
  },

  async getHealthLogs(): Promise<HealthLog[]> {
    const res = await fetch(`${BASE_URL}/caregiver/logs`);
    const data = await res.json();
    return data.logs || [];
  }
};
