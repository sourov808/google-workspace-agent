import { createClient } from '@/utils/supabase/server'
import { ChatOpenAI } from "@langchain/openai";
import { tavily } from "@tavily/core";
import { google } from 'googleapis'
import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { SystemMessage, AIMessage, HumanMessage } from "@langchain/core/messages";

// ================== TYPES ==================

interface PastMessage {
  role: 'user' | 'assistant'
  content: string
}

// ================== TOOLS ==================

const createTools = (accessToken: string) => {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })

  const gmail = google.gmail({ version: 'v1', auth })
  const calendar = google.calendar({ version: 'v3', auth })
  const drive = google.drive({ version: 'v3', auth })

  return [
    tool(
      async ({ query }: { query: string }) => {
        try {
          const res = await gmail.users.messages.list({ userId: 'me', q: query, maxResults: 5 })
          if (!res.data.messages) return "No emails found."
          const details = await Promise.all(
            res.data.messages.map(async (m) => {
              const msg = await gmail.users.messages.get({ userId: 'me', id: m.id! })
              return `Subject: ${msg.data.snippet}`
            })
          )
          return details.join('\n')
        } catch (err) {
          console.error("Gmail Search Error:", err)
          return "Error searching Gmail."
        }
      },
      {
        name: "search_gmail",
        description: "Search for emails in the user's Gmail inbox.",
        schema: z.object({ query: z.string() })
      }
    ),
    tool(
      async ({ to, subject, body }: { to: string, subject: string, body: string }) => {
        try {
          const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
          const messageParts = [
            `From: me`,
            `To: ${to}`,
            `Content-Type: text/html; charset=utf-8`,
            `MIME-Version: 1.0`,
            `Subject: ${utf8Subject}`,
            '',
            body,
          ];
          const message = messageParts.join('\n');
          const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
            
          await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw: encodedMessage },
          });
          return "Email sent successfully.";
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Unknown error";
          console.error("Gmail Send Error:", err);
          return `Error sending email: ${message}`;
        }
      },
      {
        name: "send_email",
        description: "Send an email to a specific recipient.",
        schema: z.object({ to: z.string(), subject: z.string(), body: z.string() })
      }
    ),
    tool(
      async () => {
        try {
          const res = await calendar.events.list({ 
            calendarId: 'primary', 
            timeMin: new Date().toISOString(), 
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime'
          })
          return res.data.items?.map(e => `${e.summary} at ${e.start?.dateTime || e.start?.date}`).join('\n') || "No upcoming events."
        } catch (err) {
          console.error("Calendar List Error:", err)
          return "Error listing calendar events."
        }
      },
      {
        name: "list_calendar_events",
        description: "List the upcoming 10 events from the user's Google Calendar.",
        schema: z.object({})
      }
    ),
    tool(
      async ({ summary, start, end, description }: { summary: string, start: string, end: string, description?: string }) => {
        try {
          await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
              summary,
              description,
              start: { dateTime: start },
              end: { dateTime: end },
            },
          });
          return "Event created successfully.";
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Unknown error";
          console.error("Calendar Insert Error:", err);
          return `Error creating event: ${message}`;
        }
      },
      {
        name: "create_calendar_event",
        description: "Create a new event in the user's Google Calendar. Start and end should be ISO date strings.",
        schema: z.object({ summary: z.string(), start: z.string(), end: z.string(), description: z.string().optional() })
      }
    ),
    tool(
      async ({ query }: { query: string }) => {
        try {
          const res = await drive.files.list({ q: `name contains '${query}'`, pageSize: 5 })
          return res.data.files?.map(f => `${f.name} (ID: ${f.id})`).join('\n') || "No documents found."
        } catch (err) {
          console.error("Drive Search Error:", err)
          return "Error searching Google Drive."
        }
      },
      {
        name: "search_google_docs",
        description: "Search for files and documents in the user's Google Drive.",
        schema: z.object({ query: z.string() })
      }
    ),
    tool(
      async ({ query }: { query: string }) => {
        try {
          const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
          const res = await tvly.search(query);
          return res.results.map(r => r.content).join('\n');
        } catch (err) {
          console.error("Web Search Error:", err)
          return "Error searching the web."
        }
      },
      {
        name: "web_search",
        description: "Search the web for real-time information.",
        schema: z.object({ query: z.string() })
      }
    )
  ]
}

const SYSTEM_PROMPT = `
You are a powerful personal AI assistant named AGENT_ME.
Always use tools to find information across Gmail, Calendar, and Docs.

PLANNING & PERMISSIONS:
1. When a user asks you to perform a task (email, calendar, docs), first search for any context needed.
2. In your very first response, present a clear PLAN of what you found and exactly what you intend to do (e.g., "I'll send an email to X with subject Y and body Z"). 
3. After presenting the plan, ask for a single, clear PERMISSION to proceed.
4. DO NOT repeat the permission request if the user has already said "Yes" or "Go ahead" for the specific plan.
5. DELETION RULE: If the plan involves DELETING anything (email, event, or file), you MUST give a clear WARNING about the data loss and ask for permission TWO SEPARATE TIMES before executing the deletion tool. NEVER delete on the first "Yes".
6. NEVER perform a write/delete action without explicit permission.

RESPONSE STYLE:
- Be meaningful, professional, and research-driven.
- Avoid repetitive asking; bundle your info and request into one tight response.
- If you find conflicting info during research, point it out before asking to proceed.
`;

// ================== API ==================

export async function POST(req: Request) {
  try {
    const { messages, conversationId } = await req.json()
    if (!messages || messages.length === 0) {
        return Response.json({ error: "Messages is required" }, { status: 400 })
    }
    const lastMessage = messages[messages.length - 1].content

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: "Unauthorized. Please login again." }, { status: 401 })
    }

    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.provider_token

    if (!accessToken) {
      return Response.json({ error: "Unauthorized. Please login again." }, { status: 401 })
    }

    // 1. Fetch History from Supabase
    let history: (HumanMessage | AIMessage)[] = []
    if (conversationId) {
      const { data: pastMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (pastMessages) {
        history = pastMessages.map((m: PastMessage) => 
          m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)
        )
      }
    }

    // 2. Save User Message
    if (conversationId) {
      const { error: insertError } = await (await createClient()).from('messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: lastMessage
      })
      if (insertError) console.error('Error inserting user message:', insertError)
    }

    // Using OpenAI gpt-4o-mini
    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      openAIApiKey: process.env.OPENAI_API_KEY,
      streaming: true,
      temperature: 0
    })

    const tools = createTools(accessToken)
    const agent = createReactAgent({
      llm: model,
      tools,
      messageModifier: new SystemMessage(SYSTEM_PROMPT)
    })

    const stream = await agent.streamEvents(
      { messages: [...history, new HumanMessage(lastMessage)] },
      { version: "v2" }
    )

    let assistantResponse = ""
    const encoder = new TextEncoder()

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.event === "on_chat_model_stream") {
              const content = event.data.chunk.content
              if (content && typeof content === 'string') {
                assistantResponse += content
                controller.enqueue(encoder.encode(`0:${JSON.stringify(content)}\n`))
              }
            }
          }

          // 3. Save Assistant Message
          if (conversationId && assistantResponse) {
            const finalSupabase = await createClient()
            await finalSupabase.from('messages').insert({
               conversation_id: conversationId,
               role: 'assistant',
               content: assistantResponse
            })

            if (history.length === 0) {
              const titleSnippet = lastMessage.substring(0, 30) + (lastMessage.length > 30 ? "..." : "")
              await finalSupabase.from('conversations').update({ title: titleSnippet }).eq('id', conversationId)
            }
          }
        } catch (err: unknown) {
          console.error("Streaming error loop:", err)
        } finally {
          controller.close()
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'x-vercel-ai-data-stream': 'v1'
      }
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error('API Error:', err)
    return Response.json({ 
      error: message,
    }, { status: 500 })
  }
}