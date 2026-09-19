# [Implementation Plan] AI "Người Đồng Hành Số" Cho Người Lớn Tuổi (Elderly AI Companion)

Dự án xây dựng hệ thống AI Người Đồng Hành Số chuyên biệt cho người lớn tuổi với giao diện Voice-first (ưu tiên giọng nói tiếng Việt), chữ to, độ tương phản cao, và chế độ Caregiver dành cho con cháu quản lý từ xa.

## Cấu Trúc Dự Án (`d:\AI-nguoidonghanhso`)

```
d:\AI-nguoidonghanhso\
├── backend/                  # Node.js + Express + TypeScript Server (Port 5000)
│   ├── src/
│   │   ├── controllers/      # Handlers cho AI Companion, Reminders, News, Guides, SOS
│   │   ├── services/         # Gemini AI Service (có fallback thông minh), Lưu trữ dữ liệu
│   │   ├── routes/           # REST API
│   │   └── index.ts          # Server Entrypoint
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # React + Vite + TypeScript PWA (Port 5173)
│   ├── src/
│   │   ├── components/
│   │   │   ├── senior/       # Giao diện Senior: Nút Mic to, Thẻ nhắc thuốc, Tin tức, Hướng dẫn, SOS
│   │   │   ├── caregiver/    # Giao diện Caregiver: Quản lý lịch nhắc, Nhật ký sức khỏe, Cài đặt
│   │   │   └── common/       # Header, Device Frame chuyển chế độ
│   │   ├── services/         # Web Speech API (STT & TTS tiếng Việt) & API Backend Client
│   │   ├── context/          # App State Context
│   │   ├── styles/           # High-contrast, Accessible Senior Design System
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── package.json              # Chạy cả backend và frontend đồng thời với 1 lệnh npm run dev
└── README.md
```

---

## Các Tính Năng Chính Được Xây Dựng

1. **Giao Diện Người Lớn Tuổi (Senior Mode):**
   - **Voice-first & Trợ lý ảo:** Nút Micro siêu to, nhận diện giọng nói tiếng Việt mượt mà. AI trả lời ân cần, ngắn gọn, xưng hô "cháu - ông/bà" gần gũi, kèm giọng đọc tiếng Việt tự nhiên và phụ đề chữ to.
   - **Nhắc nhở sinh hoạt & Uống thuốc:** Danh sách việc cần làm trong ngày với biểu tượng thuốc/nước/huyết áp, âm thanh nhắc nhở, nút bấm "Đã uống" xác nhận dễ dàng.
   - **Đọc tin tức chọn lọc:** Cập nhật tin thời tiết, sức khỏe dưỡng sinh, tin vui trong ngày không bị giật gân, có nút bấm để AI đọc to từng tin.
   - **Cẩm nang công nghệ & cuộc sống:** Hướng dẫn từng bước với hình ảnh/icon minh họa (Cách gọi video Zalo cho con cháu, cách xem Youtube, cảnh báo chiêu trò lừa đảo qua điện thoại).
   - **Nút Khẩn Cấp (SOS):** 1 chạm để gọi ngay cho người thân và thông báo cho Caregiver.

2. **Giao Diện Con Cháu Quản Lý (Caregiver Mode):**
   - Bảng điều khiển từ xa: Xem tình trạng của ông/bà (đã uống thuốc mấy cữ, nhật ký trò chuyện).
   - Quản lý lịch nhắc nhở: Thêm đơn thuốc mới, đặt giờ sáng/trưa/chiều/tối, ghi chú dặn dò.
   - Cài đặt hệ thống: Tùy chỉnh danh bạ khẩn cấp, cỡ chữ màn hình, âm lượng.

3. **Backend API & AI Engine:**
   - Hỗ trợ Gemini API hoặc offline empathetic AI fallback (trả lời trọn vẹn ngay cả khi chưa nhập API key).
   - Persistent store lưu trữ danh sách nhắc nhở và nhật ký hoạt động.
