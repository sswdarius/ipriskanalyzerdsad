import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const IRRELEVANT_KEYWORDS = [
  'hello',
  'hi',
  'hey',
  'selam',
  'merhaba',
  'naber',
  'test',
  'thanks',
  'thank you',
  'how are you',
  "what's up",
  'good morning',
  'good night',
  'bye',
  'see you',
];

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const lowerPrompt = prompt.toLowerCase();
    if (
      IRRELEVANT_KEYWORDS.some(keyword => lowerPrompt.includes(keyword)) ||
      prompt.trim().length < 10
    ) {
      return NextResponse.json({
        error: 'This query does not relate to intellectual property risk. Please provide a relevant inquiry.',
      }, { status: 400 });
    }

    const body = {
      model: 'compound-beta',
      temperature: 0.2, // ✅ Daha tutarlı sonuçlar için düşük sıcaklık
      messages: [
        {
          role: 'user',
          content: `Please provide a risk level (0-100%) and a detailed explanation regarding intellectual property risk for the following input. Respond ONLY in this format:
RISK: <percentage>
EXPLANATION: <detailed explanation>
Input: ${prompt}`,
        },
      ],
    };

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

    return NextResponse.json({ riskLevel, explanation });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
