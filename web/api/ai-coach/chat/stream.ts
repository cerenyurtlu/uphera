type ChatRequestBody = {
  message?: string;
  context?: string;
  use_streaming?: boolean;
  user_data?: Record<string, any> | null;
  use_enhanced?: boolean;
};

function buildPrompt(message: string, context?: string, userData?: Record<string, any> | null): string {
  const ctx = context || 'general';
  const ud = userData ? JSON.stringify(userData) : '';
  return [
    "Sen 'Ada Hera'sın — teknolojide kadınları güçlendiren pratik, gerçekçi bir asistan.",
    `Bağlam: ${ctx}`,
    ud ? `Kullanıcı verisi: ${ud}` : '',
    'Tarz: kısa, net, tekrarsız; gereksiz süsleme yok. En fazla 3 maddelik, ölçülebilir öneriler ver. 1 net aksiyonla bitir.',
    '',
    `Kullanıcı mesajı: ${message}`
  ].filter(Boolean).join('\n');
}

function splitIntoChunks(text: string, maxLen = 120): string[] {
  const chunks: string[] = [];
  let buf = '';
  for (const part of text.split(/(\s+)/)) {
    if ((buf + part).length > maxLen) {
      if (buf) chunks.push(buf);
      buf = part.trimStart();
    } else {
      buf += part;
    }
  }
  if (buf) chunks.push(buf);
  return chunks.filter(Boolean);
}

function sseEvent(data: any): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

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

  const controller = new AbortController();
  const { signal } = controller;

  const stream = new ReadableStream<Uint8Array>({
    async start(ctrl) {
      try {
        const prompt = buildPrompt(message, body.context, body.user_data || null);
        const model = 'gemini-1.5-flash-8b';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const genResp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-client': 'uphera-chat/1.0' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 640, temperature: 0.5, topP: 0.9, topK: 32 }
          }),
          signal
        });

        if (!genResp.ok) {
          const err = await genResp.text();
          ctrl.enqueue(new TextEncoder().encode(sseEvent({ type: 'content', content: 'Üzgünüm, şu anda yanıt veremiyorum.' })));
          ctrl.enqueue(new TextEncoder().encode(sseEvent({ type: 'done', enhanced: true, suggestions: [] })));
          ctrl.close();
          return;
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

        const encoder = new TextEncoder();
        const chunks = splitIntoChunks(text, 160);
        for (const ch of chunks) {
          ctrl.enqueue(encoder.encode(sseEvent({ type: 'content', content: ch })));
          await new Promise(r => setTimeout(r, 20));
        }
        const suggestions = ['Mülakat hazırlığı yapalım', 'CV optimizasyonu öner', 'Kariyer planlama ipuçları'];
        ctrl.enqueue(encoder.encode(sseEvent({ type: 'done', enhanced: true, suggestions })));
        ctrl.close();
      } catch (e) {
        try {
          const encoder = new TextEncoder();
          ctrl.enqueue(encoder.encode(sseEvent({ type: 'content', content: 'Bağlantı hatası oluştu.' })));
          ctrl.enqueue(encoder.encode(sseEvent({ type: 'done', enhanced: false, suggestions: [] })));
        } catch {}
        ctrl.close();
      }
    },
    cancel() {}
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    }
  });
}


