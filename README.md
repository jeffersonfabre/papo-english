# Papo English — converse em inglês com IA

Tutor de conversação em inglês por voz, inspirado no Loora. **Grátis.**
Arquivo único (`index.html`) + uma função na Vercel (`api/ai.js`).

**Versão:** v1.1.0 · Desenvolvido por **DomDevLabs** · domdevlabs@gmail.com

## Funcionalidades
- Primeiro acesso com objetivo, nível, dificuldades, interesses, **teste de nível falado** (CEFR), meta diária e horário de lembrete
- **Conversa por voz** com a tutora "Lu" em 17 situações: dia a dia, Business English e simulados **IELTS, TOEFL e estilo TDIE**, além de conversa livre e pergunta do dia
- **Correção de cada frase** (gramática, jeito nativo, explicação em português) sem interromper a conversa
- Ouvir de novo, ouvir devagar, traduzir, modo **PT → EN** e 💡 sugestões de resposta
- **Resumo da sessão**: pontos-chave, erros, palavras novas, notas e estimativa de nível/nota
- **Pronúncia** com nota por palavra, frases por nível, sons difíceis para brasileiros e dicas com IPA
- **Vocabulário** automático com flashcards e revisão espaçada
- **Progresso**: XP, níveis, sequência de dias, 12 conquistas, gráfico semanal, histórico
- Instalável no celular (PWA)

## Como funciona
- **Login**: Supabase Auth (Google ou e-mail e senha)
- **Banco**: projeto Supabase **Araleo Fragrances**, mas **independente** — usa só `papo_estado`, `papo_uso` e a função `papo_registrar_uso()`. Script em [`supabase/001_papo_english.sql`](supabase/001_papo_english.sql)
- **IA**: `api/ai.js` valida o login, conta o uso (limite diário por usuário, `PAPO_DAILY_LIMIT`, padrão 400) e chama `openai/gpt-4.1-mini` pelo **Vercel AI Gateway** (sem chave: usa o OIDC da Vercel). Troque o modelo com `PAPO_MODEL`
- **Microfone e voz**: do próprio navegador (Web Speech API). Reconhecimento de voz no Chrome (Android/PC), Safari (iPhone/Mac) e Edge

## Publicação
Vercel (projeto `papo-english`). Depois, no Supabase: Authentication → URL Configuration →
adicionar a URL do site em **Redirect URLs** (login com Google, confirmação de e-mail e redefinição de senha).
