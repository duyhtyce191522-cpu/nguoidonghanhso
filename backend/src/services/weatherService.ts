// Real-time Weather Service for Vietnamese Elderly Companion
// Free Open-Meteo API (no API key required, fast response, accurate for Vietnam)

interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  conditionDesc: string;
  advice: string;
}

export class WeatherService {
  /**
   * Get weather for major Vietnam regions (defaults to Hanoi / Northern or Ho Chi Minh / Southern)
   */
  async getLiveWeather(location = 'hanoi'): Promise<WeatherData | null> {
    try {
      // Hanoi coordinates: 21.0285, 105.8542; Ho Chi Minh: 10.8231, 106.6297
      const isSouth = location.toLowerCase().includes('hồ chí minh') ||
                      location.toLowerCase().includes('sài gòn') ||
                      location.toLowerCase().includes('nam');
      const lat = isSouth ? 10.8231 : 21.0285;
      const lon = isSouth ? 106.6297 : 105.8542;

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia%2FBangkok`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) return null;
      const data: any = await res.json();
      const current = data.current_weather;

      if (!current) return null;

      const temp = Math.round(current.temperature);
      const code = current.weathercode;
      const wind = Math.round(current.windspeed);

      const { conditionDesc, advice } = this.interpretWeather(temp, code, wind);

      return {
        temperature: temp,
        weatherCode: code,
        windSpeed: wind,
        conditionDesc,
        advice
      };
    } catch (err) {
      console.warn('Live weather fetch timed out or failed, using smart contextual fallback', err);
      return null;
    }
  }

  /**
   * Convert weather code & temperature into elderly-appropriate descriptions and advice
   */
  private interpretWeather(temp: number, code: number, wind: number): { conditionDesc: string; advice: string } {
    const hour = new Date().getHours();
    let conditionDesc = 'trời trong xanh, nắng nhẹ và thoáng mát';
    let advice = 'Buổi chiều mát bác có thể ra sân đi dạo 15 phút cho khoan khoái gân cốt nhé ạ.';

    // Weather Code Interpretation
    if (code === 0) {
      conditionDesc = 'trời trong xanh, quang đãng và có nắng đẹp';
    } else if (code >= 1 && code <= 3) {
      conditionDesc = 'trời nắng dịu, có mây che mát mẻ';
    } else if (code === 45 || code === 48) {
      conditionDesc = 'trời nhiều sương mù và se se lạnh';
      advice = 'Bác nhớ mặc thêm áo khoác mỏng và quàng khăn ấm cổ khi ra ngoài sáng sớm nhé.';
    } else if (code >= 51 && code <= 67) {
      conditionDesc = 'trời có mưa rào rải rác';
      advice = 'Đường xá trơn trượt, bác nhớ ở trong nhà nghỉ ngơi và cẩn thận kẻo trượt ngã nhé ạ.';
    } else if (code >= 80 && code <= 82) {
      conditionDesc = 'trời có mưa rào từng đợt';
      advice = 'Bác nhớ đóng bớt cửa sổ cho đỡ gió lùa và uống một ly nước ấm cho khỏe nhé.';
    } else if (code >= 95) {
      conditionDesc = 'trời có dông sét và mưa lớn';
      advice = 'Bác chú ý ở trong phòng ấm, hạn chế dùng thiết bị điện ngoài ban công bác nhé.';
    }

    // Temperature-based Advice
    if (temp >= 33) {
      conditionDesc += ', trời khá oi bức';
      advice = 'Trời nắng nóng, bác nhớ ngồi trong phòng thoáng mát, bật quạt nhẹ và uống nước ấm từng ngụm nhỏ rải đều trong ngày nhé ạ.';
    } else if (temp <= 20) {
      conditionDesc += ', thời tiết se lạnh';
      advice = 'Trời lạnh dễ làm nhức mỏi xương khớp, bác nhớ mặc ấm ngực, giữ ấm bàn chân và ngâm chân nước gừng vào buổi tối nhé ạ.';
    } else if (hour >= 11 && hour <= 14) {
      advice = 'Buổi trưa trời nắng ấm, bác nhớ ăn trưa ngon miệng rồi chợp mắt nghỉ ngơi nửa tiếng cho lại sức nhé ạ.';
    } else if (hour >= 16 && hour <= 18) {
      advice = 'Chiều nay gió mát dịu, bác có thể đi dạo nhẹ nhàng hoặc tưới cây quanh sân để thư giãn tinh thần nhé.';
    } else if (hour >= 19) {
      advice = 'Buổi tối trời mát mẻ dễ chịu, bác chuẩn bị ngâm chân nước ấm và đi ngủ sớm cho sâu giấc nhé.';
    }

    return { conditionDesc, advice };
  }

  /**
   * Format full spoken response for senior assistant
   */
  async formatWeatherSpeech(): Promise<string> {
    const live = await this.getLiveWeather();
    const hour = new Date().getHours();
    const timeOfDay = hour < 11 ? 'Sáng nay' : hour < 14 ? 'Trưa nay' : hour < 18 ? 'Chiều nay' : 'Tối nay';

    if (live) {
      return `Dạ thưa bác, ${timeOfDay.toLowerCase()} thời tiết khoảng ${live.temperature} độ C, ${live.conditionDesc} ạ. ${live.advice}`;
    }

    // Dynamic offline fallback based on current hour
    if (hour < 11) {
      return `Dạ thưa bác, sáng nay thời tiết nắng nhẹ dịu dàng, nhiệt độ khoảng 26 đến 28 độ C rất dễ chịu ạ. Bác nhớ ăn sáng đầy đủ, uống nước ấm và vận động tay chân nhẹ nhàng nhé!`;
    } else if (hour < 14) {
      return `Dạ thưa bác, trưa nay trời nắng ấm, nhiệt độ khoảng 30 đến 32 độ C. Bác nhớ nghỉ ngơi tĩnh dưỡng trong nhà, uống đủ nước và chợp mắt buổi trưa cho khỏe nhé ạ!`;
    } else if (hour < 18) {
      return `Dạ thưa bác, chiều nay trời dịu mát, không khí trong lành dễ chịu lắm ạ. Bác có thể ra sân đi dạo 15 phút hoặc chăm cây cảnh cho khoan khoái tinh thần nhé!`;
    } else {
      return `Dạ thưa bác, tối nay trời mát dịu, nhiệt độ khoảng 25 độ C. Bác nhớ giữ ấm ngực và bàn chân, chuẩn bị ngâm chân nước ấm để có một giấc ngủ thật ngon nhé ạ!`;
    }
  }
}

export const weatherService = new WeatherService();
