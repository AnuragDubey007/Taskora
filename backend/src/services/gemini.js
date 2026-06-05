// gemini.js - all Gemini AI logic lives here
// Gemini reads user message, decides which task tool to call
import 'dotenv/config'
import { GoogleGenAI } from '@google/genai'
import { createTask, getAllTasks, updateTask, deleteTask, findTasksByName, getTasksByTimeRange } from './taskTools.js'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// ── Tool definitions ──────────────────────────────────────────
const tools = [
  {
    name: 'create_task',
    description: 'Create a new task. Use this when user wants to add, schedule, or create a task.',
    parameters: {
      type: 'object',
      properties: {
        name:    { type: 'string', description: 'The task name or title' },
        details: { type: 'string', description: 'Extra details about the task' },
        time:    { type: 'string', description: 'Time of the task e.g. 10:00 AM' },
        date:    { type: 'string', description: 'Date in YYYY-MM-DD format. Use today if not specified.' },
      },
      required: ['name']
    }
  },
  {
    name: 'get_all_tasks',
    description: 'Get all tasks. Use when user asks about their tasks, agenda, schedule, or what they have planned.',
    parameters: { type: 'object', properties: {} }
  },
  {
    name: 'update_task',
    description: 'Update an existing task. Use when user wants to change time, date, name, or mark as done.',
    parameters: {
      type: 'object',
      properties: {
        id:      { type: 'string', description: 'The MongoDB _id of the task to update' },
        name:    { type: 'string', description: 'New task name' },
        details: { type: 'string', description: 'New details' },
        time:    { type: 'string', description: 'New time e.g. 3:00 PM' },
        date:    { type: 'string', description: 'New date in YYYY-MM-DD format' },
        status:  { type: 'string', description: 'completed or pending' },
      },
      required: ['id']
    }
  },
  {
    name: 'delete_task',
    description: 'Delete a task permanently. Always confirm with user before calling this.',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The MongoDB _id of the task to delete' },
      },
      required: ['id']
    }
  },
  {
    name: 'find_tasks_by_name',
    description: 'Search tasks by name. Use this to find a task when user refers to it by partial name.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The search term to find matching tasks' },
      },
      required: ['query']
    }
  },
  {
  name: 'get_tasks_by_time_range',
  description: 'Get tasks filtered by time of day or date. Use for: today tasks, evening tasks, morning agenda, tomorrow tasks.',
  parameters: {
    type: 'object',
    properties: {
      date:       { type: 'string', description: 'YYYY-MM-DD, today, tomorrow' },
      time_range: { type: 'string', description: 'morning | afternoon | evening | night | all' }
    }
  }
}
]

// ── Map tool names to actual functions ────────────────────────
const toolFunctions = {
  create_task:        createTask,
  get_all_tasks:      getAllTasks,
  update_task:        updateTask,
  delete_task:        deleteTask,
  find_tasks_by_name: findTasksByName,
  get_tasks_by_time_range: getTasksByTimeRange,
}

// ── System prompt ─────────────────────────────────────────────
function getSystemPrompt() {
  const today    = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const time     = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return `You are Jarvis, an intelligent voice task manager assistant.
Today is ${today}, tomorrow is ${tomorrow}, current time is ${time}.

PERSONALITY: Confident, concise, natural. You speak like a real AI assistant, not a chatbot.

RESPONSE RULES:
1. Always respond in short natural spoken sentences — max 2-3 sentences. You are read aloud via TTS.
2. Never use markdown, bullet points, or lists. Speak conversationally.
3. After every action, confirm what you did in one short sentence.
4. Maintain conversation context — use history to resolve "that task", "the previous one", "the second one", "last one", "it".

TASK CREATION:
5. CRITICAL: NEVER call create_task unless user EXPLICITLY uses action words: "create", "add", "schedule", "make", "set up", "remind me to", "add a task". Phrases like "call Ritik", "buy milk", "go to gym" alone are NOT task creation requests.
6. If user says something that COULD be a task but has no explicit create intent, ask: "Would you like me to create a task for that?"
7. For multiple tasks in one request, call create_task once per task sequentially.
8. Extract clean task names — if user says "create task called morning workout", the name is "morning workout" not "task called morning workout".

TASK SEARCH & SEMANTIC UNDERSTANDING:
9. When searching, extract only the KEY NOUN — if user says "delete bottle task" or "remove the bottle one", search for "bottle" not "bottle task". Strip words like "task", "the", "one", "it".
10. Understand semantic meaning — "evening workout", "gym session", "LinkedIn post" should match tasks with similar meaning even if names differ slightly.
11. If task not found, suggest the closest match: "I couldn't find that. Did you mean [closest task name]?"

DELETE RULES:
12. NEVER call delete_task immediately. Always call find_tasks_by_name first, confirm with user: "I found [name]. Should I delete it?"
13. Only delete after user says "yes", "sure", "go ahead", "delete it", "confirm", "do it".
14. If user says "no", "don't", "cancel", "stop" — respond "Okay, I won't delete it." and do nothing.

UPDATE RULES:
15. For updates, find the task first if only partial name given, then update.
16. "Move to tomorrow", "change to 6 PM", "mark as done" — apply to the contextually referenced task.

TIME UNDERSTANDING:
17. Morning = 6 AM–12 PM, Afternoon = 12 PM–5 PM, Evening = 5 PM–9 PM, Night = 9 PM–12 AM.
18. "Today's evening tasks", "tomorrow morning agenda" — use get_tasks_by_time_range with correct date and range.
19. When summarizing tasks, speak naturally: "You have a gym session at 7 AM and a team sync at 9 AM."

FAILURE HANDLING:
20. If STT seems wrong or unclear, ask for clarification naturally: "Sorry, could you repeat that?"
21. For any destructive action, always validate before executing.`
}


// ── Main chat function ────────────────────────────────────────
// conversationHistory = array of { role, parts } objects
  async function chat(
    userMessage,
    conversationHistory = [],
    userId
  ) {

  // Append new user message to history
  const messages = [
    ...conversationHistory,
    { role: 'user', parts: [{ text: userMessage }] }
  ]

  // First Gemini call — may return text or a tool call
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: messages,
    config: {
      systemInstruction: getSystemPrompt(),
      tools: [{ functionDeclarations: tools }],
    }
  })

  const candidate = response.candidates?.[0]?.content
  const parts     = candidate?.parts || []


  if (parts.length === 0) {
   throw new Error('Empty Gemini response')
  }



  // ── Tool call branch ──────────────────────────────────────
  // ── Handle MULTIPLE tool calls (e.g. "create 3 tasks") ───────
const toolCallParts = (parts || []).filter(
  p => p.functionCall
)

if (toolCallParts.length > 0) {
  let messagesWithTools = [...messages]
  let lastAction = null
  let lastActionData = null

  for (const toolCallPart of toolCallParts) {
    const { name, args } = toolCallPart.functionCall
  
    const toolResult = await toolFunctions[name]({
      ...args,
      userId
    })
    

    messagesWithTools = [
      ...messagesWithTools,
      { role: 'model', parts: [{ functionCall: { name, args } }] },
      { role: 'user',  parts: [{ functionResponse: { name, response: toolResult } }] }
    ]
    lastAction = name
    lastActionData = toolResult
  }

  const finalResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: messagesWithTools,
    config: { systemInstruction: getSystemPrompt() }
  })

  const finalParts = finalResponse.candidates?.[0]?.content?.parts || []
const replyText = finalParts.find(p => p.text)?.text
if (!replyText) throw new Error('No text returned from Gemini after tool call')


  const completeHistory = [
    ...messagesWithTools,
    { role: 'model', parts: [{ text: replyText }] }
  ]

  return { reply: replyText, action: lastAction, actionData: lastActionData, history: completeHistory }
}

  // ── Plain text response (no tool call) ───────────────────
  const replyText =
  parts.find(p => p.text)?.text

  if (!replyText) {
    throw new Error('No text returned from Gemini')
  }

  return {
    reply:   replyText,
    action:  null,
    actionData: null,
    history: [...messages, { role: 'model', parts: [{ text: replyText }] }]
  }
}

export { chat }