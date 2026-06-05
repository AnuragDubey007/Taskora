// server.js - main backend server
import express   from 'express'
import cors      from 'cors'
import dotenv    from 'dotenv'
import connectDB from './config/db.js'
import { chat }  from './services/gemini.js'
import Task      from './models/taskModel.js'
import authRoutes from './routes/authRoutes.js'
import auth from './middleware/authMiddleware.js'


dotenv.config()

const app  = express()
const PORT = process.env.PORT || 3001

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: ['https://taskora-dusky.vercel.app', 'http://localhost:5173']
}))

app.use(express.json({ limit: '1mb' }))
app.use('/api/auth', authRoutes)

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// ── Get all tasks ─────────────────────────────────────────────
app.get('/api/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
        user: req.user._id
    }).sort({ createdAt: -1 })
    res.json({ success: true, tasks })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ── Main chat endpoint ────────────────────────────────────────
// Called every time user speaks
app.post('/api/chat', auth, async (req, res) => {
  try {
    const { message, history = [] } = req.body

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' })
    }

    const result = await chat(
        message,
        history,
        req.user._id
    )

    res.json({
      success:    true,
      reply:      result.reply,
      action:     result.action,
      actionData: result.actionData,
      history:    result.history
    })

  } catch (error) {
    console.error('Chat error:', error.message)
    res.status(500).json({ success: false, message: error.message })
  }
})

// ── TTS endpoint ──────────────────────────────────────────────
// Tries Google Cloud TTS first, falls back to Gemini TTS
app.post('/api/tts', async (req, res) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ message: 'Text required' })

  // ── Option 1: Google Cloud Text-to-Speech (better quality) ──
  if (process.env.GOOGLE_TTS_API_KEY) {
    try {
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input:       { text },
            voice: {
              languageCode: 'en-US',
              name:         'en-US-Neural2-D',   // Deep male voice (Jarvis-like)
              ssmlGender:   'MALE'
            },
            audioConfig: {
              audioEncoding:   'MP3',
              speakingRate:    1.05,              // Slightly faster = more natural
              pitch:           -2.0,              // Slightly lower = authoritative
              effectsProfileId: ['headphone-class-device']
            }
          })
        }
      )

      const data = await response.json()

      if (data.audioContent) {
        const buf = Buffer.from(data.audioContent, 'base64')
        res.set('Content-Type', 'audio/mpeg')
        return res.send(buf)
      }

      console.warn('Google TTS: no audioContent, trying fallback. Response:', JSON.stringify(data))
    } catch (err) {
      console.warn('Google TTS failed, trying Gemini TTS:', err.message)
    }
  }

  // ── Option 2: Gemini TTS fallback ────────────────────────────
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Charon' }
                }
              }
            }
          })
        }
      )

      const data = await response.json()
      const audioB64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
      if (audioB64) {
        const buf = Buffer.from(audioB64, 'base64')
        res.set('Content-Type', 'audio/wav')
        return res.send(buf)
      }

      console.warn('Gemini TTS: no audio returned')
    } catch (err) {
      console.warn('Gemini TTS failed:', err.message)
    }
  }

  // ── Both failed ───────────────────────────────────────────────
  // Return 503 so frontend falls back to browser SpeechSynthesis
  res.status(503).json({ message: 'TTS unavailable, use browser fallback' })
})


// ── Start server ──────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
})