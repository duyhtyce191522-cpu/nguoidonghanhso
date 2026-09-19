import { Request, Response } from 'express';

export const handleTTS = async (req: Request, res: Response) => {
  try {
    const text = req.query.text as string;
    if (!text || !text.trim()) {
      return res.status(400).send('Missing text parameter');
    }

    // Clean text of markdown and emojis
    const cleanText = text
      .replace(/[*#_`~>]/g, '')
      .replace(/[\u{1F600}-\u{1F6FF}]/gu, '')
      .trim();

    // Google Translate TTS URL for Vietnamese (free, natural, no key required)
    const encodedText = encodeURIComponent(cleanText.slice(0, 400));
    const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodedText}`;

    const response = await fetch(googleTTSUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Google TTS responded with status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=86400'
    });

    return res.send(buffer);
  } catch (err: any) {
    console.error('TTS Proxy error:', err);
    return res.status(500).send('Error generating TTS audio');
  }
};
