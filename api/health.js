// Diagnóstico: confere se a função alcança a IA (prompt fixo e mínimo, sem dados de usuário).
module.exports = async (req, res) => {
  const gem = process.env.GEMINI_API_KEY || "";
  const token = gem || process.env.AI_GATEWAY_API_KEY || req.headers["x-vercel-oidc-token"] || process.env.VERCEL_OIDC_TOKEN;
  const out = {provider: gem ? "gemini" : "vercel-ai-gateway", credential: !!token};
  try {
    const r = await fetch(gem ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions" : "https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST", headers: {Authorization: "Bearer " + token, "Content-Type": "application/json"},
      body: JSON.stringify(Object.assign({model: gem ? (process.env.GEMINI_MODEL || "gemini-2.5-flash") : (process.env.PAPO_MODEL || "openai/gpt-4.1-mini"),
        messages: [{role: "user", content: "Reply with the single word: OK"}], max_tokens: 5}, gem ? {reasoning_effort: "none"} : {}))});
    const j = await r.json().catch(() => ({}));
    const msg = Array.isArray(j) ? j[0] : j;
    out.status = r.status; out.ok = r.ok;
    out.reply = msg && msg.choices && msg.choices[0] && msg.choices[0].message && msg.choices[0].message.content;
    if (!r.ok) out.error = String((msg && msg.error && (msg.error.message || msg.error)) || "erro").slice(0, 300);
  } catch (e) { out.error = String(e); }
  res.setHeader("Content-Type", "application/json"); res.setHeader("Cache-Control", "no-store"); res.end(JSON.stringify(out));
};
