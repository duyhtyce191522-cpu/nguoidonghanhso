// Vietnamese Solar & Lunar Calendar Service
// Implements standard Vietnamese astronomical algorithms for accurate Lunar date & Can Chi

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

function jdFromDate(d: number, m: number, y: number): number {
  let a = Math.floor((14 - m) / 12);
  let y1 = y + 4800 - a;
  let m1 = m + 12 * a - 3;
  let jd = d + Math.floor((153 * m1 + 2) / 5) + 365 * y1 + Math.floor(y1 / 4) - Math.floor(y1 / 100) + Math.floor(y1 / 400) - 32045;
  if (jd < 2299161) jd = d + Math.floor((153 * m1 + 2) / 5) + 365 * y1 + Math.floor(y1 / 4) - 32083;
  return jd;
}

function getNewMoonDay(k: number, timeZone = 7): number {
  let T = k / 1236.85;
  let T2 = T * T;
  let T3 = T2 * T;
  let dr = Math.PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  let M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  let Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  let F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr);
  C1 = C1 - 0.0004 * Math.sin(3 * dr * Mpr);
  C1 = C1 + 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin((M + Mpr) * dr);
  C1 = C1 - 0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
  C1 = C1 - 0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
  C1 = C1 + 0.0010 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((M + 2 * Mpr) * dr);
  let JdNew = Jd1 + C1;
  return Math.floor(JdNew + 0.5 + timeZone / 24);
}

export function convertSolarToLunar(dd: number, mm: number, yy: number, timeZone = 7) {
  let dayNumber = jdFromDate(dd, mm, yy);
  let k = Math.floor((dayNumber - 2415021.0769986) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  let a11 = getNewMoonDay(Math.floor((jdFromDate(31, 12, yy) - 2415021.0769986) / 29.530588853), timeZone);
  let lunarDay = dayNumber - monthStart + 1;
  let diff = Math.floor((monthStart - a11) / 29);
  let lunarMonth = diff >= 0 ? diff + 11 : diff + 23;
  if (lunarMonth > 12) lunarMonth = lunarMonth - 12;

  // Year Can Chi
  const yearCan = CAN[(yy + 6) % 10];
  const yearChi = CHI[(yy + 8) % 12];
  const lunarYearName = `Năm ${yearCan} ${yearChi}`;

  return {
    lunarDay,
    lunarMonth,
    lunarYear: yy,
    lunarYearName
  };
}

export class LunarService {
  /**
   * Get full date and time speech for elderly
   */
  getCalendarSpeech(date = new Date()): string {
    const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const weekday = weekdays[date.getDay()];
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();

    const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const lunar = convertSolarToLunar(d, m, y);

    let specialNote = '';
    if (lunar.lunarDay === 1) {
      specialNote = ' Hôm nay là ngày Mùng Một đầu tháng Âm lịch, con kính chúc bác một tháng mới dồi dào sức khỏe, an khang và vạn sự như ý ạ!';
    } else if (lunar.lunarDay === 15) {
      if (lunar.lunarMonth === 8) {
        specialNote = ' Hôm nay chính là Rằm Trung Thu (15 tháng 8 Âm lịch) rồi bác ơi! Chúc bác đón Tết Trung Thu thật ấm cúng và vui vẻ bên con cháu ạ!';
      } else {
        specialNote = ' Hôm nay là ngày Rằm (ngày 15 Âm lịch) bác nhé!';
      }
    } else if (lunar.lunarDay >= 10 && lunar.lunarDay <= 14 && lunar.lunarMonth === 8) {
      const daysLeft = 15 - lunar.lunarDay;
      specialNote = ` Còn ${daysLeft} ngày nữa là đến Rằm Trung Thu rồi đấy bác ạ.`;
    }

    return `Dạ thưa bác, bây giờ là ${timeStr}, ${weekday}, ngày ${d} tháng ${m} năm ${y} Dương lịch; tức ngày ${lunar.lunarDay} tháng ${lunar.lunarMonth} Âm lịch (${lunar.lunarYearName}) ạ.${specialNote}`;
  }
}

export const lunarService = new LunarService();
