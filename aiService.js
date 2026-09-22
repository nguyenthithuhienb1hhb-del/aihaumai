const axios = require('axios');

/**
 * Nghiep vu 2: dau noi LLM (OpenAI/Gemini) de tra ve HUONG DAN CACH GIAI,
 * khong dua dap an cuoi cung.
 *
 * Luu y #7 trong anh review: "Neu duoc hay su dung tieng Anh trong prompt
 * - AI hieu tot hon va do ton token hon" => system prompt viet bang tieng Anh.
 * (Ban Vietnamese goc duoc giu lai o comment ben duoi de doi chieu)
 */

// Nguyen van yeu cau tu de bai (anh 1):
// "Ban la tro giang hoc thuat tai ZIM Academy. Dua tren bai tap va trinh do
// [Band hien tai] cua hoc vien, hay dua ra goi y tu duy, phuong phap lam bai,
// phan tich tu khoa. TUYET DOI KHONG giai ho bai tap, KHONG cung cap dap an
// cuoi cung."
const SYSTEM_PROMPT = `You are an academic tutor at ZIM Academy.
Based on the student's exercise and their current IELTS band score, provide:
- Guiding questions to help them think through the problem
- The general method/approach to tackle this type of exercise
- Analysis of key words/phrases in the question

STRICT RULES:
- You must NEVER solve the exercise for the student.
- You must NEVER provide the final answer.
- Keep the response concise, encouraging, and pedagogical.`;

function buildUserPrompt({ assignmentContent, studentAnswer, currentBand }) {
  return [
    `Current student band score: ${currentBand ?? 'unknown'}`,
    `Exercise (đề bài): ${assignmentContent}`,
    `Student's current attempt (bài làm, if any): ${studentAnswer || '(chưa có bài làm)'}`,
    `Please give hints following the strict rules in the system prompt.`,
  ].join('\n\n');
}

async function callOpenAI(userPrompt) {
  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
    },
    { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
  );
  return res.data.choices[0].message.content;
}

async function callGemini(userPrompt) {
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    }
  );
  return res.data.candidates[0].content.parts[0].text;
}

// Ham chinh: goi tu route /api/ai/hint
async function getHint({ assignmentContent, studentAnswer, currentBand }) {
  const userPrompt = buildUserPrompt({ assignmentContent, studentAnswer, currentBand });
  const provider = process.env.AI_PROVIDER || 'openai';

  if (provider === 'gemini') return callGemini(userPrompt);
  return callOpenAI(userPrompt);
}

module.exports = { getHint, SYSTEM_PROMPT };
