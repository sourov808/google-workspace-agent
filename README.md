# 🤖 Google Workspace AI Agent

An AI assistant that doesn't just chat — it **takes action across your Google Workspace.** Sign in with your Google account and ask it, in plain language, to read and send emails, manage your calendar, and search the web. Built as a real tool-using agent with LangGraph.

> _"Find emails about the invoice and schedule a follow-up call for Friday at 3pm."_ — and it actually does it.

<!-- 📸 TODO: add a screenshot or GIF of the agent in action, then uncomment:
![Demo](./public/demo.gif) -->

## 🔗 Live Demo
<!-- 🚀 TODO: paste your Vercel URL here after deploying -->
**[Try it live →](https://your-deploy-url.vercel.app)**

## ✨ Features
- **Conversational agent** — describe what you want in natural language; the agent decides which tools to use.
- **📧 Gmail** — search your inbox and send emails on your behalf.
- **📅 Google Calendar** — list upcoming events and create new ones.
- **📄 Google Docs** — access enabled via OAuth scope.
- **🌐 Web search** — pulls live information from the web via Tavily.
- **🔐 Secure Google login** — OAuth 2.0 through Supabase Auth; the agent acts only with the permissions you grant.

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router) + TypeScript
- **AI / Agent:** LangChain + **LangGraph** (`createReactAgent`), OpenAI (`ChatOpenAI`)
- **Tools:** Google APIs (Gmail, Calendar, Docs), Tavily web search
- **Auth & Backend:** Supabase Auth (Google OAuth) + Supabase SSR
- **Styling:** Tailwind CSS

## 🧠 How It Works
1. The user signs in with Google; Supabase handles OAuth and returns an access token scoped for Gmail, Calendar, and Docs.
2. On each request, the API route (`app/api/chat/route.ts`) builds a set of **tools** bound to that access token — `search_gmail`, `send_email`, `list_calendar_events`, `create_calendar_event`, and web search.
3. A **LangGraph ReAct agent** receives the user's message plus history, reasons about which tool(s) to call, runs them against the real Google APIs, and replies with the result.

This is a true **agentic** pattern: the LLM doesn't just answer — it chooses and runs actions, then uses the results to respond.

## 🚀 Run Locally
```bash
git clone https://github.com/sourov808/google-workspace-agent.git
cd google-workspace-agent
pnpm install
cp .env.example .env.local   # then fill in your values
pnpm dev
```

### Environment variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
TAVILY_API_KEY=
```
Google OAuth (Client ID/Secret) and the redirect URL are configured in your Supabase project's Auth provider settings, with these scopes enabled: `gmail.modify`, `calendar`, `documents`.

## 📝 License
MIT
