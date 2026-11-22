# Papo English — treine conversação em inglês

Treino de conversação em inglês por voz, inspirado no Loora, **sem IA e grátis**.
Arquivo único (`index.html`), sem build e sem servidor próprio.

**Versão:** v1.2.0 · Desenvolvido por **DomDevLabs** · domdevlabs@gmail.com

## Funcionalidades
- Primeiro acesso com objetivo, nível, dificuldades, temas, **teste de nível por leitura em voz alta**, meta diária e horário de lembrete
- **Diálogos guiados** com a "Lu" em 16 situações: dia a dia, Business English e simulados **IELTS, TOEFL e estilo TDIE**, além da pergunta do dia
- Em cada fala: escolha a resposta (com tradução e áudio), leia em voz alta e receba **nota de pronúncia por palavra**
- Nos simulados e na pergunta do dia: **resposta livre** comparada com a **resposta-modelo** (quanto das ideias-chave você usou)
- **Dicas de pronúncia** por regras para os sons que mais pegam para brasileiros (TH, R, -ED, S inicial, vogais longas, finais…)
- **Resumo da sessão**: pronúncia média, palavras para treinar, dicas e expressões novas
- **Pronúncia**: frases por nível, sons difíceis e frases do seu vocabulário
- **Vocabulário** automático com flashcards e revisão espaçada
- **Progresso**: XP, níveis, sequência de dias, 12 conquistas, gráfico semanal, sons que mais pegam e histórico
- Instalável no celular (PWA)

## Como funciona
- **Login**: Supabase Auth (Google ou e-mail e senha)
- **Banco**: projeto Supabase **Araleo Fragrances**, mas **independente** — usa só a tabela `papo_estado` (um registro por usuário, protegido por RLS). Script em [`supabase/001_papo_english.sql`](supabase/001_papo_english.sql)
- **Microfone e voz**: do próprio navegador (Web Speech API). Reconhecimento de voz no Chrome (Android/PC), Safari (iPhone/Mac) e Edge. A nota de pronúncia compara o que o reconhecimento entendeu com a frase esperada.

## Publicação
Vercel (projeto `papo-english`) em https://papo-english.vercel.app — deploy automático a cada push na `main`.
No Supabase: Authentication → URL Configuration → `https://papo-english.vercel.app/**` em **Redirect URLs**.
