import { NextRequest, NextResponse } from 'next/server';
import vision from '@google-cloud/vision';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GOOGLE_CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const IRRELEVANT_KEYWORDS = [
  'hello', 'hi', 'hey', 'selam', 'merhaba', 'naber', 'test',
  'thanks', 'thank you', 'how are you', "what's up", 'good morning',
  'good night', 'bye', 'see you',
];

export async function POST(req: NextRequest) {
  try {
    const { prompt, imageBase64 } = await req.json();

    let detectedItems: string[] = [];

    // Google Vision client
    const client = new vision.ImageAnnotatorClient({
      keyFilename: GOOGLE_CREDENTIALS_PATH,
    });

    // Görsel varsa label, logo ve text OCR al
    if (imageBase64 && typeof imageBase64 === 'string') {
      const base64Content = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Content, 'base64');

      // Logo detection
      const [logoResult] = await client.logoDetection({ image: { content: imageBuffer } });
      const logos = logoResult.logoAnnotations?.map(l => l.description.toLowerCase()) || [];

      // Text detection (OCR)
      const [textResult] = await client.textDetection({ image: { content: imageBuffer } });
      const textsRaw = textResult.textAnnotations?.map(t => t.description.toLowerCase()) || [];
      // En uzun textAnnotations[0] genel text, diğerleri kelimeler
      const texts = textsRaw.length > 1 ? textsRaw.slice(1) : [];

      detectedItems = [...new Set([...logos, ...texts])];

      if (detectedItems.length === 0) {
        detectedItems.push('No detected logos or text');
      }
    }

    // Prompt ya da imageBase64 yoksa hata
    if ((!prompt || typeof prompt !== 'string') && detectedItems.length === 0) {
      return NextResponse.json({ error: 'Prompt or image required' }, { status: 400 });
    }

    // Metin alakasızsa reddet
    if (prompt) {
      const lowerPrompt = prompt.toLowerCase();
      if (
        IRRELEVANT_KEYWORDS.some(k => lowerPrompt.includes(k)) ||
        prompt.trim().length < 10
      ) {
        return NextResponse.json({
          error: 'This query does not relate to intellectual property risk.',
        }, { status: 400 });
      }
    }

    // Groq prompt hazırlığı
    let groqPrompt = 'Please provide a risk level (0-100%) and a detailed explanation regarding intellectual property risk for the following input. Respond ONLY in this format:\nRISK: <percentage>\nEXPLANATION: <detailed explanation>\n';

    if (imageBase64) {
      groqPrompt += `Detected brand logos or text: ${detectedItems.join(', ')}.\n`;
    }

    if (prompt) {
      groqPrompt += `Input text: ${prompt}`;
    }

    const body = {
      model: 'compound-beta',
      temperature: 0.2,
      top_p: 0.1,
      messages: [{ role: 'user', content: groqPrompt }],
    };

    // Groq API çağrısı
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Groq API error' }, { status: 500 });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || '';

    const riskMatch = answer.match(/RISK:\s*(\d{1,3})/i);
    const explanationMatch = answer.match(/EXPLANATION:\s*([\s\S]*)/i);

    const riskLevel = riskMatch ? parseInt(riskMatch[1], 10) : null;
    const explanation = explanationMatch ? explanationMatch[1].trim() : null;

    if (riskLevel === null || explanation === null) {
      return NextResponse.json({ error: 'API response format is incorrect' }, { status: 500 });
    }

    return NextResponse.json({ riskLevel, explanation, detectedItems });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'An error occurred' }, { status: 500 });
  }
}
