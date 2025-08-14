// Remove explicit Edge runtime to use default Node.js runtime and avoid runtime version errors

type ChatRequestBody = {
  message?: string;
  context?: string;
  use_streaming?: boolean;
  user_data?: Record<string, any> | null;
};

function buildPrompt(message: string, context?: string, userData?: Record<string, any> | null): string {
  const ctx = context || 'general';
  const ud = userData ? JSON.stringify(userData) : '';
  return [
    "Sen 'Ada Hera'sın — teknolojide kadınları güçlendiren pratik, gerçekçi bir asistan.",
    `Bağlam: ${ctx}`,
    ud ? `Kullanıcı verisi: ${ud}` : '',
    'Tarz: kısa, net, tekrarsız; gereksiz süsleme yok. Aşırı markdown ve başlık kullanma. En fazla 3 maddelik, somut ve ölçülebilir öneriler ver; mümkünse örnek/metrik ekle. Yanıtın 5-8 cümleyi geçmesin ve 1 net aksiyonla bitir.',
    '',
    `Kullanıcı mesajı: ${message}`
  ].filter(Boolean).join('\n');
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Minimal access without TypeScript Node types present
  const apiKey = (globalThis as any)?.process?.env?.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ success: false, error: 'GEMINI_API_KEY eksik' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body: ChatRequestBody = {};
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Geçersiz JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const message = (body.message || '').toString().trim();
  if (!message) {
    return new Response(JSON.stringify({ success: false, error: 'Mesaj gerekli' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const prompt = buildPrompt(message, body.context, body.user_data || null);

  try {
    const model = 'gemini-1.5-flash-8b';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const genResp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-client': 'uphera-chat/1.0' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 640,
          temperature: 0.5,
          topP: 0.9,
          topK: 32
        }
      })
    });

    if (!genResp.ok) {
      const err = await genResp.text();
      return new Response(JSON.stringify({ success: false, error: `Gemini hata: ${err.slice(0, 400)}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await genResp.json();
    const candidates = (data && data.candidates) || [];
    let text = '';
    if (candidates.length > 0) {
      const parts = (candidates[0].content?.parts || []).map((p: any) => p.text || '').filter(Boolean);
      text = parts.join(' ').trim();
    }
    if (!text) {
      text = 'Şu anda yanıt üretemedim. Lütfen biraz sonra tekrar dener misin?';
    }

    const suggestions = [
      'Mülakat hazırlığı yapalım',
      'CV optimizasyonu öner',
      'Kariyer planlama ipuçları'
    ];

    return new Response(JSON.stringify({ success: true, response: text, suggestions }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e?.message || 'Beklenmeyen hata' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


