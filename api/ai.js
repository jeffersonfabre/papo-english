// Papo English — endpoint de IA (DomDevLabs)
// Recebe as mensagens do app, confere o login no Supabase, conta o uso diário
// e chama o modelo pelo Vercel AI Gateway (autenticado pelo OIDC da própria Vercel).

const SB_URL = process.env.SUPABASE_URL || "https://hcyvrzjncsfrraadjmvf.supabase.co";
const SB_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_DAQltYQi-54Pn3WoNm4Myw_IBMJpUcC";
const MODEL = process.env.PAPO_MODEL || "openai/gpt-4.1-mini";
const DAILY_LIMIT = parseInt(process.env.PAPO_DAILY_LIMIT || "400", 10);
const GATEWAY = "https://ai-gateway.vercel.sh/v1/chat/completions";
// Alternativa sem cartão: chave grátis do Google AI Studio (Gemini), endpoint compatível com OpenAI
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, {code: "method", error: "Use POST"});

  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return send(res, 401, {code: "no_session", error: "Faça login"});

  let body;
  try { body = await readBody(req); } catch (e) { return send(res, 400, {code: "bad_request", error: "JSON inválido"}); }

  const json = !!body.json;
  const task = String(body.task || "chat");
  let messages = Array.isArray(body.messages) ? body.messages : [];
  messages = messages.slice(-60)
    .filter(m => m && ["user", "assistant", "system"].includes(m.role) && typeof m.content === "string")
    .map(m => ({role: m.role, content: m.content.slice(0, 12000)}));
  if (!messages.length) return send(res, 400, {code: "bad_request", error: "Sem mensagens"});

  // 1) valida o login e registra o uso (a função do Supabase recusa token inválido)
  try {
    const u = await fetch(SB_URL + "/rest/v1/rpc/papo_registrar_uso", {
      method: "POST",
      headers: {apikey: SB_KEY, Authorization: auth, "Content-Type": "application/json"},
      body: JSON.stringify({limite: DAILY_LIMIT})
    });
    if (u.status === 401 || u.status === 403) return send(res, 401, {code: "no_session", error: "Sessão expirada. Entre de novo."});
    if (!u.ok) return send(res, 500, {code: "error", error: "Falha ao validar uso"});
    const n = await u.json();
    if (n === -1) return send(res, 429, {code: "daily_limit", error: "Limite diário atingido"});
  } catch (e) {
    return send(res, 500, {code: "error", error: "Falha ao validar login"});
  }

  // 2) chama o modelo: Gemini (se houver GEMINI_API_KEY) ou Vercel AI Gateway
  const useGemini = !!GEMINI_KEY;
  const token = useGemini ? GEMINI_KEY : (process.env.AI_GATEWAY_API_KEY || req.headers["x-vercel-oidc-token"] || process.env.VERCEL_OIDC_TOKEN);
  if (!token) return send(res, 500, {code: "error", error: "IA sem credencial"});

  const payload = {
    model: useGemini ? GEMINI_MODEL : MODEL,
    messages,
    max_tokens: json ? (task === "summary" ? 1400 : 900) : 350,
    temperature: json ? 0.3 : 0.8
  };
  if (json) payload.response_format = {type: "json_object"};
  if (useGemini) payload.reasoning_effort = "none";

  try {
    const r = await fetch(useGemini ? GEMINI_URL : GATEWAY, {
      method: "POST",
      headers: {Authorization: "Bearer " + token, "Content-Type": "application/json"},
      body: JSON.stringify(payload)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = (j && j.error && (j.error.message || j.error)) || ("HTTP " + r.status);
      const setup = r.status === 401 || r.status === 403;
      return send(res, r.status === 429 ? 429 : 502, {code: r.status === 429 ? "rate_limited" : (setup ? "ai_setup" : "ai_error"), error: String(msg).slice(0, 300)});
    }
    const text = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "";
    return send(res, 200, {text});
  } catch (e) {
    return send(res, 502, {code: "ai_error", error: "Falha ao falar com a IA"});
  }
};
