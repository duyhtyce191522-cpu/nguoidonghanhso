export interface Reminder {
  id: string;
  title: string;
  time: string; // e.g. "07:30"
  period: 'morning' | 'noon' | 'afternoon' | 'evening';
  type: 'medicine' | 'blood_pressure' | 'water' | 'exercise' | 'doctor';
  dosage?: string;
  note?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: 'health' | 'weather' | 'life' | 'tips';
  date: string;
  source: string;
  audioText: string;
}

export interface GuideStep {
  stepNumber: number;
  title: string;
  instruction: string;
  icon?: string;
  tip?: string;
}

export interface GuideItem {
  id: string;
  title: string;
  description: string;
  category: 'phone' | 'home_appliance' | 'security' | 'entertainment';
  difficulty: 'rất dễ' | 'dễ' | 'vừa';
  steps: GuideStep[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string; // e.g. "Con gái cả", "Con trai út", "Bác sĩ gia đình"
  phone: string;
  isPrimary: boolean;
}

export interface HealthLog {
  id: string;
  timestamp: string;
  type: 'medicine_taken' | 'voice_chat' | 'blood_pressure' | 'sos_alert';
  description: string;
  details?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
