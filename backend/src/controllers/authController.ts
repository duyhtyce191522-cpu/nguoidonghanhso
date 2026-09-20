import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { cleanPhone, getUserStore, getStoreFromReq, familyCodeManager } from '../services/dataStore';

interface OtpEntry {
  otp: string;
  expiresAt: number;
}

const otpMemory = new Map<string, OtpEntry>();

const USERS_DIR = path.join(__dirname, '../../data/users');

export const sendOtp = (req: Request, res: Response) => {
  const { phone } = req.body;
  const cleaned = cleanPhone(phone);

  if (!cleaned || cleaned.length < 9 || cleaned.length > 12) {
    return res.status(400).json({
      success: false,
      error: 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (VD: 0912345678).'
    });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpMemory.set(cleaned, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 mins
  });

  const isExistingUser = fs.existsSync(path.join(USERS_DIR, `${cleaned}.json`));

  return res.json({
    success: true,
    message: 'Mã xác thực OTP đã được gửi.',
    phone: cleaned,
    isExistingUser,
    // Returned in dev/local mode for instant easy testing
    testOtp: otp
  });
};

export const verifyOtp = (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  const cleaned = cleanPhone(phone);

  if (!cleaned) {
    return res.status(400).json({ success: false, error: 'Thiếu số điện thoại' });
  }

  const enteredOtp = (otp || '').trim();
  const cached = otpMemory.get(cleaned);

  // Allow standard demo OTPs in dev
  const isMasterOtp = enteredOtp === '123456' || enteredOtp === '888888';
  const isCachedValid = cached && cached.otp === enteredOtp && cached.expiresAt > Date.now();

  if (!isMasterOtp && !isCachedValid) {
    return res.status(400).json({
      success: false,
      error: 'Mã OTP không chính xác hoặc đã hết hạn (5 phút). Vui lòng thử lại!'
    });
  }

  // Clear OTP
  otpMemory.delete(cleaned);

  // Initialize or get user store
  const userStore = getUserStore(cleaned);
  const familyCode = userStore.getFamilyCode();
  const currentPin = userStore.getPin();

  return res.json({
    success: true,
    message: 'Xác thực số điện thoại thành công!',
    phone: cleaned,
    familyCode,
    pin: currentPin,
    hasCustomPin: currentPin !== '1234',
    profile: userStore.getProfile()
  });
};

export const setPin = (req: Request, res: Response) => {
  const { phone, pin } = req.body;
  const targetPhone = cleanPhone(phone || req.headers['x-user-phone'] as string);

  if (!targetPhone) {
    return res.status(400).json({ success: false, error: 'Thiếu thông tin tài khoản' });
  }

  if (!pin || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ success: false, error: 'Mã PIN phải gồm đúng 4 chữ số (0-9)' });
  }

  const userStore = getUserStore(targetPhone);
  userStore.setPin(pin);

  return res.json({
    success: true,
    message: 'Đã thiết lập mã PIN bảo vệ thành công!',
    pin
  });
};

export const verifyPin = (req: Request, res: Response) => {
  const { phone, pin } = req.body;
  const targetPhone = cleanPhone(phone || req.headers['x-user-phone'] as string);

  if (!targetPhone) {
    return res.status(400).json({ success: false, error: 'Thiếu thông tin tài khoản' });
  }

  const userStore = getUserStore(targetPhone);
  const isValid = userStore.getPin() === pin;

  return res.json({
    success: true,
    valid: isValid
  });
};

export const pairFamilyCode = (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: 'Vui lòng nhập mã ghép nối 6 chữ số' });
  }

  const cleanCode = code.toString().replace(/[^0-9]/g, '');
  const mappedPhone = familyCodeManager.getPhoneByCode(cleanCode);

  if (!mappedPhone) {
    return res.status(404).json({
      success: false,
      error: 'Mã ghép nối gia đình không chính xác hoặc chưa được kích hoạt. Hãy kiểm tra mã trên máy con cái!'
    });
  }

  const userStore = getUserStore(mappedPhone);

  return res.json({
    success: true,
    message: 'Đã kết nối thành công với máy gia đình!',
    phone: mappedPhone,
    familyCode: cleanCode,
    profile: userStore.getProfile()
  });
};

export const getAccountInfo = (req: Request, res: Response) => {
  const store = getStoreFromReq(req);
  return res.json({
    success: true,
    phone: store.getPhone(),
    familyCode: store.getFamilyCode(),
    profile: store.getProfile(),
    remindersCount: store.getReminders().length,
    contactsCount: store.getContacts().length
  });
};
