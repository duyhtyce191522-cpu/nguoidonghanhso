import { Reminder, NewsItem, GuideItem, EmergencyContact, HealthLog, SeniorProfile, CaregiverStats } from '../types';

const BASE_URL = '/api';

const getHeaders = (extraHeaders?: Record<string, string>): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  const phone = localStorage.getItem('user_phone');
  if (phone) {
    headers['x-user-phone'] = phone;
  }
  return headers;
};

export const api = {
  // Authentication & Pairing
  async sendOtp(phone: string): Promise<{
    success: boolean;
    message: string;
    phone?: string;
    isExistingUser?: boolean;
    testOtp?: string;
    error?: string;
  }> {
    const res = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return await res.json();
  },

  async verifyOtp(phone: string, otp: string): Promise<{
    success: boolean;
    message?: string;
    phone?: string;
    familyCode?: string;
    pin?: string;
    hasCustomPin?: boolean;
    profile?: SeniorProfile;
    error?: string;
  }> {
    const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    return await res.json();
  },

  async setPin(pin: string, phone?: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    const targetPhone = phone || localStorage.getItem('user_phone') || '';
    const res = await fetch(`${BASE_URL}/auth/set-pin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ pin, phone: targetPhone })
    });
    return await res.json();
  },

  async verifyPin(pin: string, phone?: string): Promise<{
    success: boolean;
    valid: boolean;
    error?: string;
  }> {
    const targetPhone = phone || localStorage.getItem('user_phone') || '';
    const res = await fetch(`${BASE_URL}/auth/verify-pin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ pin, phone: targetPhone })
    });
    return await res.json();
  },

  async pairFamilyCode(code: string): Promise<{
    success: boolean;
    message?: string;
    phone?: string;
    familyCode?: string;
    profile?: SeniorProfile;
    error?: string;
  }> {
    const res = await fetch(`${BASE_URL}/auth/pair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    return await res.json();
  },

  async getAccountInfo(): Promise<{
    success: boolean;
    phone: string;
    familyCode: string;
    profile: SeniorProfile;
    remindersCount: number;
    contactsCount: number;
  }> {
    const res = await fetch(`${BASE_URL}/auth/account`, {
      headers: getHeaders()
    });
    return await res.json();
  },

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
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    return data;
  },

  async getChatHistory() {
    const res = await fetch(`${BASE_URL}/chat/history`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  // Reminders
  async getReminders(): Promise<Reminder[]> {
    const res = await fetch(`${BASE_URL}/reminders`, {
      headers: getHeaders()
    });
    const data = await res.json();
    return data.reminders || [];
  },

  async toggleReminder(id: string): Promise<Reminder> {
    const res = await fetch(`${BASE_URL}/reminders/${id}/toggle`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    const data = await res.json();
    return data.reminder;
  },

  async createReminder(reminderData: Partial<Reminder>): Promise<Reminder> {
    const res = await fetch(`${BASE_URL}/reminders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reminderData)
    });
    const data = await res.json();
    return data.reminder;
  },

  async deleteReminder(id: string): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/reminders/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.ok;
  },

  // News
  async getNews(): Promise<NewsItem[]> {
    const res = await fetch(`${BASE_URL}/news`, {
      headers: getHeaders()
    });
    const data = await res.json();
    return data.news || [];
  },

  // Guides
  async getGuides(): Promise<GuideItem[]> {
    const res = await fetch(`${BASE_URL}/guides`, {
      headers: getHeaders()
    });
    const data = await res.json();
    return data.guides || [];
  },

  // SOS & Contacts
  async triggerSOS(reason?: string): Promise<{ success: boolean; contactToCall: EmergencyContact; message: string }> {
    const res = await fetch(`${BASE_URL}/sos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    return await res.json();
  },

  async getContacts(): Promise<EmergencyContact[]> {
    const res = await fetch(`${BASE_URL}/contacts`, {
      headers: getHeaders()
    });
    const data = await res.json();
    return data.contacts || [];
  },

  async addContact(contact: Partial<EmergencyContact>): Promise<EmergencyContact> {
    const res = await fetch(`${BASE_URL}/contacts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(contact)
    });
    const data = await res.json();
    return data.contact;
  },

  async deleteContact(id: string): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/contacts/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.ok;
  },

  // Caregiver
  async getCaregiverDashboard(): Promise<{
    profile: SeniorProfile;
    stats: CaregiverStats;
    recentLogs: HealthLog[];
    contacts: EmergencyContact[];
    familyCode?: string;
    phone?: string;
  }> {
    const res = await fetch(`${BASE_URL}/caregiver/dashboard`, {
      headers: getHeaders()
    });
    const data = await res.json();
    return data.data;
  },

  async updateProfile(profile: Partial<SeniorProfile>): Promise<SeniorProfile> {
    const res = await fetch(`${BASE_URL}/caregiver/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profile)
    });
    const data = await res.json();
    return data.profile;
  },

  async getHealthLogs(): Promise<HealthLog[]> {
    const res = await fetch(`${BASE_URL}/caregiver/logs`, {
      headers: getHeaders()
    });
    const data = await res.json();
    return data.logs || [];
  }
};
