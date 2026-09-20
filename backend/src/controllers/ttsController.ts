import { Request, Response } from 'express';

// Normalize Vietnamese spoken text for senior clarity
function normalizeVietnameseSpeech(raw: string): string {
  return raw
    .replace(/[*#_`~>•]/g, ' ')
    .replace(/[\u{1F600}-\u{1F6FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/°C/g, ' độ C ')
    .replace(/mmHg/gi, ' mi li mét thủy ngân ')
    .replace(/km\/h/gi, ' ki lô mét một giờ ')
    .replace(/\bkm\b/gi, ' ki lô mét ')
    .replace(/\bml\b/gi, ' mi li lít ')
    .replace(/\bmg\b/gi, ' mi li gam ')
    .replace(/\bbpm\b/gi, ' nhịp một phút ')
    .replace(/->|➜|👉/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Split long text into natural sentences (around 150 chars max per chunk)
function splitIntoChunks(text: string, maxLen = 160): string[] {
  if (text.length <= maxLen) return [text];

  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
  let current = '';

  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;

    if ((current + ' ' + trimmed).trim().length <= maxLen) {
      current = (current + ' ' + trimmed).trim();
    } else {
      if (current) chunks.push(current);
      if (trimmed.length > maxLen) {
        // Fallback split by commas
        const subParts = trimmed.split(/,\s+/);
        let subCurrent = '';
        for (const part of subParts) {
          if ((subCurrent + ', ' + part).length <= maxLen) {
            subCurrent = (subCurrent ? subCurrent + ', ' + part : part).trim();
          } else {
            if (subCurrent) chunks.push(subCurrent);
            subCurrent = part.trim();
          }
        }
        if (subCurrent) current = subCurrent;
      } else {
        current = trimmed;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text.slice(0, maxLen)];
}

async function fetchGoogleTTSAudioChunk(chunk: string): Promise<Buffer> {
  const encoded = encodeURIComponent(chunk);
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encoded}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Google TTS responded with status: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export const handleTTS = async (req: Request, res: Response) => {
  try {
    const rawText = req.query.text as string;
    if (!rawText || !rawText.trim()) {
      return res.status(400).send('Missing text parameter');
    }

    const cleanText = normalizeVietnameseSpeech(rawText);
    const chunks = splitIntoChunks(cleanText);

    // Limit to max 4 chunks (~600 chars) for responsive audio streaming
    const activeChunks = chunks.slice(0, 4);
    const audioBuffers = await Promise.all(activeChunks.map(c => fetchGoogleTTSAudioChunk(c)));

    const mergedBuffer = Buffer.concat(audioBuffers);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': mergedBuffer.length,
      'Cache-Control': 'public, max-age=86400'
    });

    return res.send(mergedBuffer);
  } catch (err: any) {
    console.error('TTS Proxy error:', err);
    return res.status(500).send('Error generating TTS audio');
  }
};
