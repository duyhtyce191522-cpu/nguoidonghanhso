import fs from 'fs';
import path from 'path';
import { Request } from 'express';
import { Reminder, NewsItem, GuideItem, EmergencyContact, HealthLog, ChatMessage } from '../types';

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_DIR = path.join(DATA_DIR, 'users');
const FAMILY_CODES_FILE = path.join(DATA_DIR, 'family_codes.json');
const DEFAULT_DATA_FILE = path.join(DATA_DIR, 'store.json');

export interface StoreData {
  phone?: string;
  pin?: string;
  familyCode?: string;
  createdAt?: string;
  updatedAt?: string;
  seniorProfile: {
    fullName: string;
    preferredGreeting: string;
    birthYear: number;
    healthNotes: string;
  };
  reminders: Reminder[];
  news: NewsItem[];
  guides: GuideItem[];
  contacts: EmergencyContact[];
  logs: HealthLog[];
  chats: ChatMessage[];
}

const defaultData: StoreData = {
  phone: '0912345678',
  pin: '1234',
  familyCode: '829104',
  seniorProfile: {
    fullName: "Nguyễn Văn Hùng",
    preferredGreeting: "Bác Hùng",
    birthYear: 1952,
    healthNotes: "Huyết áp hơi cao, hay quên giờ uống thuốc sau ăn sáng."
  },
  reminders: [
    {
      id: "rem-1",
      title: "Uống thuốc Huyết Áp (Amlodipine)",
      time: "07:30",
      period: "morning",
      type: "medicine",
      dosage: "1 viên sau ăn sáng 15 phút",
      note: "Nhớ uống với 1 cốc nước ấm đầy nhé bác",
      completed: true,
      completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: "rem-2",
      title: "Đo huyết áp & nhịp tim buổi sáng",
      time: "08:00",
      period: "morning",
      type: "blood_pressure",
      dosage: "Nghỉ ngơi 5 phút trước khi đo",
      note: "Ghi nhớ chỉ số tâm thu và tâm trương",
      completed: true,
      completedAt: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: "rem-3",
      title: "Uống thuốc Bổ Não & Khớp (Glucosamine)",
      time: "12:00",
      period: "noon",
      type: "medicine",
      dosage: "1 viên cùng bữa ăn trưa",
      note: "Uống đúng bữa trưa để hấp thụ tốt nhất",
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "rem-4",
      title: "Uống 1 cốc nước ấm và đi dạo 15 phút",
      time: "16:30",
      period: "afternoon",
      type: "water",
      dosage: "300ml nước ấm",
      note: "Đi bộ nhẹ nhàng trong sân hoặc ban công",
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "rem-5",
      title: "Uống thuốc Tiểu Đường / Canxi",
      time: "20:00",
      period: "evening",
      type: "medicine",
      dosage: "1 viên sau bữa tối",
      note: "Uống xong chuẩn bị ngâm chân nước ấm trước khi ngủ",
      completed: false,
      createdAt: new Date().toISOString()
    }
  ],
  news: [
    {
      id: "news-1",
      title: "Thời tiết hôm nay: Nắng ấm dịu dàng, thích hợp đi dạo thể dục",
      summary: "Nhiệt độ dao động 25-29 độ C, gió nhẹ, độ ẩm dễ chịu. Các bác nên tập thể dục nhẹ ngoài trời lúc sáng sớm hoặc chiều mát.",
      category: "weather",
      date: "Hôm nay",
      source: "Đài Khí Tượng Thủy Văn",
      audioText: "Dạ thưa bác, thời tiết hôm nay rất đẹp, trời nắng nhẹ từ 25 đến 29 độ C. Buổi chiều mát bác có thể đi dạo 15 phút trong sân để thư giãn gân cốt nhé ạ."
    },
    {
      id: "news-2",
      title: "5 thói quen đơn giản giúp huyết áp ổn định cho người cao tuổi",
      summary: "Uống đủ nước ấm rải đều trong ngày, giảm ăn mặn, ngủ đủ 7 tiếng và giữ tinh thần vui tươi giúp tim mạch luôn khỏe mạnh.",
      category: "health",
      date: "Sáng nay",
      source: "Bác Sĩ Gia Đình",
      audioText: "Thưa bác, các bác sĩ khuyên người cao tuổi nên uống nước ấm từng ngụm nhỏ, ăn nhạt bớt muối, và giữ tâm trạng an vui để huyết áp luôn ở mức lý tưởng."
    },
    {
      id: "news-3",
      title: "Cảnh giác: Tuyệt đối không bấm vào đường link lạ tự xưng cơ quan công an",
      summary: "Cơ quan nhà nước không bao giờ gọi điện yêu cầu chuyển tiền hoặc tải app lạ. Nếu có số lạ gọi đe dọa, hãy gọi ngay cho con cái hoặc công an phường.",
      category: "tips",
      date: "Hôm qua",
      source: "Cổng Thông Tin An Ninh Mạng",
      audioText: "Bác lưu ý giúp cháu: Nếu có số điện thoại lạ gọi đến xưng là công an hay tòa án đòi nợ tiền hoặc bảo bấm vào đường link, bác hãy tắt máy ngay và gọi cho con cháu nhé!"
    },
    {
      id: "news-4",
      title: "Mẹo ngâm chân nước gừng ấm buổi tối giúp ngủ sâu giấc",
      summary: "Nước ấm khoảng 40 độ pha chút muối hạt và gừng đập dập, ngâm 15 phút trước khi ngủ giúp lưu thông khí huyết, tránh chuột rút ban đêm.",
      category: "health",
      date: "2 ngày trước",
      source: "Sức Khỏe Đời Sống",
      audioText: "Tối nay bác có thể bảo người nhà nấu một chậu nước gừng ấm pha chút muối để ngâm chân 15 phút trước khi đi ngủ, vừa ấm chân vừa ngủ rất ngon giấc ạ."
    }
  ],
  guides: [
    {
      id: "guide-zalo-call",
      title: "Cách gọi Video Zalo cho Con Cháu",
      description: "Xem mặt và trò chuyện trực tiếp với con cháu ở xa qua màn hình",
      category: "phone",
      difficulty: "rất dễ",
      steps: [
        {
          stepNumber: 1,
          title: "Mở ứng dụng Zalo",
          instruction: "Tìm biểu tượng hình chữ 'Zalo' màu xanh da trời trên màn hình chính và chạm nhẹ vào đó.",
          tip: "Chạm 1 lần dứt khoát vào giữa biểu tượng."
        },
        {
          stepNumber: 2,
          title: "Chọn tên người thân",
          instruction: "Trong danh sách, chạm vào tên con gái (ví dụ: 'Con Gái Lan') hoặc bấm vào ô tìm kiếm.",
          tip: "Tên người thân thường có ảnh đại diện quen thuộc của con cháu."
        },
        {
          stepNumber: 3,
          title: "Bấm vào biểu tượng Máy Quay Phim",
          instruction: "Nhìn lên góc trên cùng bên phải màn hình, bác sẽ thấy hình một chiếc máy quay phim nhỏ. Bấm vào đó để gọi có hình ảnh.",
          tip: "Nếu chỉ muốn nghe tiếng không mở camera, hãy bấm vào hình chiếc Ống nghe điện thoại bên cạnh."
        },
        {
          stepNumber: 4,
          title: "Trò chuyện và tắt máy",
          instruction: "Khi con cháu bắt máy, bác sẽ thấy hình con cháu. Khi nói chuyện xong, bấm nút tròn màu đỏ để tắt cuộc gọi.",
          tip: "Cầm máy thẳng trước mặt cách khoảng 40cm để con cháu nhìn rõ mặt bác."
        }
      ]
    },
    {
      id: "guide-fraud-avoid",
      title: "Cách Nhận Biết & Tránh Cuộc Gọi Lừa Đảo",
      description: "Bảo vệ tiền tiết kiệm và an toàn thông tin cá nhân",
      category: "security",
      difficulty: "rất dễ",
      steps: [
        {
          stepNumber: 1,
          title: "Giữ bình tĩnh khi nghe giọng lạ",
          instruction: "Kẻ lừa đảo thường dùng giọng đe dọa, nói bác dính líu vi phạm pháp luật hoặc con cháu đang gặp nạn cần tiền gấp.",
          tip: "Hãy nhớ: Cơ quan công an KHÔNG BAO GIỜ làm việc qua điện thoại."
        },
        {
          stepNumber: 2,
          title: "Tuyệt đối không cung cấp mã số",
          instruction: "Không đọc mã OTP ngân hàng, không đọc số thẻ CCCD, không bấm vào bất kỳ đường dẫn (link) nào gửi qua tin nhắn.",
          tip: "Không có ai được quyền đòi mật khẩu hay mã ngân hàng của bác."
        },
        {
          stepNumber: 3,
          title: "Tắt máy ngay lập tức",
          instruction: "Bác chỉ cần bấm nút màu đỏ kết thúc cuộc gọi, không cần tranh cãi hay giải thích.",
          tip: "Bấm nút nguồn hoặc nút đỏ là cuộc gọi sẽ ngắt ngay lập tức."
        },
        {
          stepNumber: 4,
          title: "Gọi ngay cho con cái",
          instruction: "Mở nút SOS trong ứng dụng này hoặc gọi cho con gái/con trai để hỏi lại thông tin cho an tâm.",
          tip: "Con cháu luôn sẵn sàng lắng nghe và bảo vệ bác 24/7."
        }
      ]
    },
    {
      id: "guide-ac-remote",
      title: "Cách Chỉnh Điều Hòa Nhiệt Độ Tốt Cho Sức Khỏe",
      description: "Giữ phòng mát mẻ mà không bị cảm lạnh hoặc khô họng",
      category: "home_appliance",
      difficulty: "dễ",
      steps: [
        {
          stepNumber: 1,
          title: "Bật điều hòa",
          instruction: "Bấm nút màu VÀNG hoặc ĐỎ có chữ 'ON/OFF' hoặc 'POWER' trên điều khiển từ xa.",
          tip: "Nghe tiếng 'tít' và cánh gió điều hòa mở ra là đã bật thành công."
        },
        {
          stepNumber: 2,
          title: "Chỉnh nhiệt độ phù hợp (26 - 28 độ)",
          instruction: "Bấm nút mũi tên Hướng Lên (▲) để tăng nhiệt độ và Hướng Xuống (▼) để giảm. Đặt ở mức 26 hoặc 27 độ C là tốt nhất cho người lớn tuổi.",
          tip: "Không nên để dưới 25 độ vì dễ gây nghẹt mũi và đau nhức khớp."
        },
        {
          stepNumber: 3,
          title: "Chỉnh cánh gió không thổi thẳng vào người",
          instruction: "Bấm nút 'SWING' để cánh đảo gió hướng lên cao hoặc sang ngang, tránh gió lạnh phả trực tiếp vào đầu hoặc ngực.",
          tip: "Nên để một chậu nước nhỏ hoặc máy tạo ẩm trong phòng."
        }
      ]
    }
  ],
  contacts: [
    {
      id: "contact-1",
      name: "Nguyễn Thị Mai Lan",
      relation: "Con gái cả",
      phone: "0912 345 678",
      isPrimary: true
    },
    {
      id: "contact-2",
      name: "Nguyễn Minh Tuấn",
      relation: "Con trai út",
      phone: "0987 654 321",
      isPrimary: false
    },
    {
      id: "contact-3",
      name: "BS. Trần Hoài Nam",
      relation: "Bác sĩ tim mạch gia đình",
      phone: "0903 115 115",
      isPrimary: false
    },
    {
      id: "contact-4",
      name: "Cấp cứu 115",
      relation: "Cứu thương y tế khẩn cấp",
      phone: "115",
      isPrimary: false
    }
  ],
  logs: [
    {
      id: "log-1",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      type: "medicine_taken",
      description: "Đã uống thuốc Huyết Áp (Amlodipine) sáng đúng giờ (07:32)."
    },
    {
      id: "log-2",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: "blood_pressure",
      description: "Đo huyết áp sáng: 125/80 mmHg, nhịp tim 74 bpm (Mức độ: Tốt, ổn định)."
    },
    {
      id: "log-3",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: "voice_chat",
      description: "Hỏi AI: 'Cháu ơi hôm nay thời tiết thế nào?' - AI đã trả lời và khuyên đi dạo."
    }
  ],
  chats: [
    {
      id: "chat-1",
      sender: "assistant",
      text: "Dạ, con chào bác Hùng ạ! Chúc bác một ngày mới thật an vui và dồi dào sức khỏe. Bác cần con hỗ trợ hoặc trò chuyện điều gì không ạ?",
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
    }
  ]
};

export class DataStore {
  private filePath: string;
  private data: StoreData;

  constructor(filePath: string, initialData?: StoreData) {
    this.filePath = filePath;
    this.data = this.loadData(initialData);
  }

  private loadData(initialData?: StoreData): StoreData {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn(`Could not load store at ${this.filePath}, initializing.`, e);
    }
    const dataToSave = initialData ? { ...initialData } : JSON.parse(JSON.stringify(defaultData));
    this.saveData(dataToSave);
    return dataToSave;
  }

  private saveData(data?: StoreData): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const dataToPersist = data || this.data;
      dataToPersist.updatedAt = new Date().toISOString();
      fs.writeFileSync(this.filePath, JSON.stringify(dataToPersist, null, 2), 'utf-8');
    } catch (e) {
      console.error(`Failed to save data store at ${this.filePath}:`, e);
    }
  }

  // Auth & Account Details
  getPhone(): string {
    return this.data.phone || '';
  }

  getPin(): string {
    return this.data.pin || '1234';
  }

  setPin(newPin: string): void {
    this.data.pin = newPin;
    this.saveData();
  }

  getFamilyCode(): string {
    return this.data.familyCode || '';
  }

  setFamilyCode(code: string): void {
    this.data.familyCode = code;
    this.saveData();
  }

  // Reminders
  getReminders(): Reminder[] {
    return this.data.reminders;
  }

  getReminder(id: string): Reminder | undefined {
    return this.data.reminders.find(r => r.id === id);
  }

  addReminder(reminder: Omit<Reminder, 'id' | 'createdAt'>): Reminder {
    const newRem: Reminder = {
      ...reminder,
      id: 'rem-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    this.data.reminders.push(newRem);
    this.addLog({
      type: 'medicine_taken',
      description: `Người nhà đã thêm lịch nhắc mới: "${newRem.title}" lúc ${newRem.time}.`
    });
    this.saveData();
    return newRem;
  }

  updateReminder(id: string, updates: Partial<Reminder>): Reminder | null {
    const idx = this.data.reminders.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.reminders[idx] = { ...this.data.reminders[idx], ...updates };
    this.saveData();
    return this.data.reminders[idx];
  }

  deleteReminder(id: string): boolean {
    const initialLen = this.data.reminders.length;
    this.data.reminders = this.data.reminders.filter(r => r.id !== id);
    if (this.data.reminders.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  toggleReminderComplete(id: string): Reminder | null {
    const rem = this.getReminder(id);
    if (!rem) return null;
    rem.completed = !rem.completed;
    rem.completedAt = rem.completed ? new Date().toISOString() : undefined;

    if (rem.completed) {
      this.addLog({
        type: 'medicine_taken',
        description: `Bác đã hoàn thành lịch nhắc: "${rem.title}" vào lúc ${new Date().toLocaleTimeString('vi-VN')}.`
      });
    }

    this.saveData();
    return rem;
  }

  // News & Guides
  getNews(): NewsItem[] {
    return this.data.news;
  }

  getGuides(): GuideItem[] {
    return this.data.guides;
  }

  // Contacts
  getContacts(): EmergencyContact[] {
    return this.data.contacts;
  }

  addContact(contact: Omit<EmergencyContact, 'id'>): EmergencyContact {
    const newContact: EmergencyContact = {
      ...contact,
      id: 'contact-' + Date.now()
    };
    this.data.contacts.push(newContact);
    this.saveData();
    return newContact;
  }

  deleteContact(id: string): boolean {
    this.data.contacts = this.data.contacts.filter(c => c.id !== id);
    this.saveData();
    return true;
  }

  // Health Logs
  getLogs(): HealthLog[] {
    return [...this.data.logs].reverse();
  }

  addLog(log: Omit<HealthLog, 'id' | 'timestamp'>): HealthLog {
    const newLog: HealthLog = {
      ...log,
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString()
    };
    this.data.logs.push(newLog);
    this.saveData();
    return newLog;
  }

  // Chat History
  getChats(): ChatMessage[] {
    return this.data.chats;
  }

  addChat(message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const newMsg: ChatMessage = {
      ...message,
      id: 'chat-' + Date.now(),
      timestamp: new Date().toISOString()
    };
    this.data.chats.push(newMsg);
    if (this.data.chats.length > 50) {
      this.data.chats = this.data.chats.slice(-50);
    }
    this.saveData();
    return newMsg;
  }

  getProfile() {
    return this.data.seniorProfile;
  }

  updateProfile(profile: Partial<StoreData['seniorProfile']>) {
    this.data.seniorProfile = { ...this.data.seniorProfile, ...profile };
    this.saveData();
    return this.data.seniorProfile;
  }
}

// Global default store
export const store = new DataStore(DEFAULT_DATA_FILE);

// Multi-tenant Store Manager
export const cleanPhone = (phone: string): string => {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+84')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('84') && cleaned.length > 9) {
    cleaned = '0' + cleaned.slice(2);
  }
  return cleaned;
};

// Family Code Manager
export const familyCodeManager = {
  loadCodes(): Record<string, string> {
    try {
      if (fs.existsSync(FAMILY_CODES_FILE)) {
        return JSON.parse(fs.readFileSync(FAMILY_CODES_FILE, 'utf-8'));
      }
    } catch (e) {
      console.warn("Could not read family codes file", e);
    }
    return { '829104': '0912345678' };
  },

  saveCodes(codes: Record<string, string>): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(FAMILY_CODES_FILE, JSON.stringify(codes, null, 2), 'utf-8');
    } catch (e) {
      console.error("Could not save family codes file", e);
    }
  },

  getPhoneByCode(code: string): string | null {
    const cleanCode = code.replace(/[^0-9]/g, '');
    const codes = this.loadCodes();
    return codes[cleanCode] || null;
  },

  generateUniqueCode(phone: string): string {
    const codes = this.loadCodes();
    // Check if phone already has an existing code
    for (const [code, p] of Object.entries(codes)) {
      if (p === phone) {
        return code;
      }
    }
    // Generate new 6-digit code
    let newCode = '';
    do {
      newCode = Math.floor(100000 + Math.random() * 900000).toString();
    } while (codes[newCode]);

    codes[newCode] = phone;
    this.saveCodes(codes);
    return newCode;
  }
};

// User Store Cache Map
const userStores = new Map<string, DataStore>();

export const getUserStore = (rawPhone: string): DataStore => {
  const phone = cleanPhone(rawPhone);
  if (!phone) return store;

  if (userStores.has(phone)) {
    return userStores.get(phone)!;
  }

  const userFilePath = path.join(USERS_DIR, `${phone}.json`);
  let initialUserData: StoreData | undefined = undefined;

  if (!fs.existsSync(userFilePath)) {
    const familyCode = familyCodeManager.generateUniqueCode(phone);
    initialUserData = {
      ...JSON.parse(JSON.stringify(defaultData)),
      phone,
      familyCode,
      createdAt: new Date().toISOString()
    };
  }

  const userStore = new DataStore(userFilePath, initialUserData);
  // Ensure family code mapping exists
  const currentCode = userStore.getFamilyCode();
  if (currentCode) {
    const codes = familyCodeManager.loadCodes();
    if (!codes[currentCode]) {
      codes[currentCode] = phone;
      familyCodeManager.saveCodes(codes);
    }
  }

  userStores.set(phone, userStore);
  return userStore;
};

// Helper to extract store from Express Request
export const getStoreFromReq = (req: Request): DataStore => {
  const headerPhone = req.headers['x-user-phone'];
  const queryPhone = req.query.userPhone || req.query.phone;
  const bodyPhone = req.body && (req.body.userPhone || req.body.phone);

  const phoneCandidate = (typeof headerPhone === 'string' && headerPhone) ||
                         (typeof queryPhone === 'string' && queryPhone) ||
                         (typeof bodyPhone === 'string' && bodyPhone);

  if (phoneCandidate) {
    return getUserStore(phoneCandidate);
  }
  return store;
};
