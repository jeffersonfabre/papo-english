// Diagnóstico temporário: confere se a função alcança o AI Gateway (prompt fixo e mínimo).
module.exports = async (req, res) => {
  const token = process.env.AI_GATEWAY_API_KEY || req.headers["x-vercel-oidc-token"] || process.env.VERCEL_OIDC_TOKEN;
  const out = {oidc: !!token};
  try {
    const r = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {method: "POST", headers: {Authorization: "Bearer " + token, "Content-Type": "application/json"},
      body: JSON.stringify({model: process.env.PAPO_MODEL || "openai/gpt-4.1-mini", messages: [{role: "user", content: "Reply with the single word: OK"}], max_tokens: 3})});
    const j = await r.json().catch(() => ({}));
    out.status = r.status; out.reply = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content; out.error = j.error ? (j.error.message || j.error) : undefined;
  } catch (e) { out.error = String(e); }
  res.setHeader("Content-Type", "application/json"); res.setHeader("Cache-Control", "no-store"); res.end(JSON.stringify(out));
};
