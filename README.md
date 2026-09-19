# AI Người Đồng Hành Số (Elderly AI Companion)

Ứng dụng trợ lý trí tuệ nhân tạo chuyên biệt dành cho người cao tuổi Việt Nam, kết hợp bảng điều khiển từ xa dành cho con cháu (Caregiver).

---

## 🌟 Tính Năng Nổi Bật

### 1. Giao Diện Người Lớn Tuổi (Senior Mode)
- **Voice-first & Trợ Lý Ân Cần:** Nút Micro siêu to (120px) với hiệu ứng sóng âm thanh trực quan, nhận diện giọng nói tiếng Việt tự nhiên và đọc lại câu trả lời bằng giọng nói chuẩn tiếng Việt (Web Speech API). AI luôn xưng hô lễ phép (*"cháu/con" - "bác/ông/bà"*), câu từ ngắn gọn, mộc mạc và tâm lý.
- **Lịch Nhắc Uống Thuốc & Sinh Hoạt:** Thẻ hiển thị cữ thuốc sáng/trưa/chiều/tối với màu sắc độ tương phản cao, kèm nút bấm to *"Bấm Đã Uống"* phát âm thanh chúc mừng êm ái khi hoàn thành.
- **Bản Tin Sức Khỏe & Đời Sống:** Tuyển chọn tin tức thời tiết, mẹo dưỡng sinh, cảnh giác lừa đảo qua mạng xã hội, tích hợp nút *"🔊 Bấm để nghe đọc to"*.
- **Cẩm Nang Công Nghệ & An Toàn:** Hướng dẫn từng bước trực quan: *Cách gọi Video Zalo cho con cháu*, *Cách chỉnh điều hòa nhiệt độ an toàn*, *Cách nhận biết cuộc gọi mạo danh công an/lừa đảo tiền bạc*.
- **Nút Cứu Hộ Khẩn Cấp (SOS):** 1 chạm để gọi ngay cho con gái/con trai hoặc cấp cứu 115 kèm cơ chế đếm ngược 3 giây an toàn tránh bấm nhầm.

### 2. Giao Diện Con Cháu Quản Lý (Caregiver Mode)
- **Theo dõi từ xa:** Đo lường tỷ lệ tuân thủ uống thuốc hôm nay (% hoàn thành), số cữ còn lại.
- **Quản lý đơn thuốc:** Thêm/sửa/xóa các loại thuốc, giờ uống, liều lượng và ghi chú dặn dò.
- **Nhật ký thời gian thực:** Xem lại nhật ký bác đã uống thuốc lúc mấy giờ, tương tác trò chuyện với AI.
- **Quản lý danh bạ khẩn cấp:** Thêm số điện thoại người thân trong nhà, thiết lập người ưu tiên gọi trước.
- **Cá nhân hóa:** Tùy chỉnh tên gọi, cách xưng hô (Bác, Ông, Cụ...) và ghi chú bệnh lý.

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh

### 1. Cài đặt các gói thư viện (Chỉ làm lần đầu)
```bash
npm run install:all
```

### 2. Khởi chạy toàn bộ hệ thống (Cả Backend & Frontend)
```bash
npm run dev
```
- **Giao diện Ứng dụng (Frontend):** `http://localhost:5173`
- **Máy chủ Backend API:** `http://localhost:5000`
- **Kiểm tra tình trạng Backend:** `http://localhost:5000/health`

### 3. Tích hợp Google Gemini AI (Tùy chọn)
Hệ thống đã tích hợp sẵn **bộ não AI đồng hành dự phòng tiếng Việt thông minh** tự động phản hồi ân cần ngay cả khi không có Internet hoặc chưa có API key. Nếu muốn sử dụng mô hình trực tiếp từ Google Gemini:
Tạo file `backend/.env`:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 📁 Cấu Trúc Dự Án

```
d:\AI-nguoidonghanhso\
├── backend/
│   ├── src/
│   │   ├── controllers/      # AI Chat, Reminder, News, Guides, SOS, Caregiver
│   │   ├── services/         # Gemini AI & Offline Fallback, Data Store
│   │   ├── routes/           # Express API endpoints
│   │   └── index.ts          # Server Entrypoint
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── senior/       # VoiceAssistant, ReminderCard, NewsReader, DeviceGuides, SOSButton
│   │   │   ├── caregiver/    # CaregiverHome, ReminderManager, HealthLogView, SettingsModal
│   │   │   └── common/       # Header, DeviceFrame
│   │   ├── services/         # speechService (STT, TTS, Web Audio Chimes), API Client
│   │   ├── context/          # AppContext
│   │   └── styles/           # High contrast accessible design system
│   ├── index.html
│   └── package.json
│
├── package.json              # Root package coordinator
└── README.md
```
