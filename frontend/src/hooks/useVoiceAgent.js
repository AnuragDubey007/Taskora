// frontend/src/hooks/useVoiceAgent.js
import { useState, useEffect, useRef } from 'react'
import useTaskStore from '../store/taskStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function useVoiceAgent() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking,  setIsSpeaking]  = useState(false)
  const [isThinking,  setIsThinking]  = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isActive,    setIsActive]    = useState(false)
  const [messages,    setMessages]    = useState([])

  const historyRef      = useRef([])
  const audioRef        = useRef(null)
  const recognitionRef  = useRef(null)
  const isListeningRef  = useRef(false)
  const isSpeakingRef   = useRef(false)
  const isThinkingRef   = useRef(false)
  const noSpeechTimer   = useRef(null)
  const isActiveRef     = useRef(false)
  // Each speakText call gets a unique ID. Callbacks check this before acting,
  // so a stale audio element can't fire startListening a second time.
  const speakSessionRef = useRef(0)

  const addTask      = useTaskStore(s => s.addTask)
  const updateTask   = useTaskStore(s => s.updateTask)
  const setTasks     = useTaskStore(s => s.setTasks)
  const setLoading   = useTaskStore(s => s.setLoading)
  const setNewTaskId = useTaskStore(s => s.setNewTaskId)
  const setConfirmCard  = useTaskStore(s => s.setConfirmCard)
  const setDeletingId   = useTaskStore(s => s.setDeletingId)
  const setUpdatingId   = useTaskStore(s => s.setUpdatingId)

  useEffect(() => { isListeningRef.current = isListening }, [isListening])
  useEffect(() => { isSpeakingRef.current  = isSpeaking  }, [isSpeaking])
  useEffect(() => { isThinkingRef.current  = isThinking  }, [isThinking])
  useEffect(() => { isActiveRef.current    = isActive    }, [isActive])

  // Health check
  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then(r => r.ok ? setIsConnected(true) : setIsConnected(false))
      .catch(() => setIsConnected(false))
  }, [])

  // Load tasks
  useEffect(() => {
    setLoading(true)
    fetch(`${API_URL}/api/tasks`)
      .then(r => r.json())
      .then(d => { if (d.tasks) setTasks(d.tasks) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function addMessage(role, text) {
    setMessages(prev => [...prev, { role, text, id: Date.now() + Math.random() }])
  }

  function stopAudio() {
    // Invalidate any in-flight speakText promise so its callbacks won't fire
    speakSessionRef.current += 1
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    window.speechSynthesis?.cancel()
    setIsSpeaking(false)
    isSpeakingRef.current = false
  }

 // Replace speakWithBrowser in your hook

function speakWithBrowser(text, sessionId, onDone) {
  console.log('[TTS:browser] called from:', new Error().stack.split('\n')[2])
  console.log('[TTS:browser] Speaking:', text.slice(0, 60))
  if (speakSessionRef.current !== sessionId) { onDone(); return }

  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null
      speakWithBrowser(text, sessionId, onDone)
    }
    return
  }

  const utter = new SpeechSynthesisUtterance(text)
  utter.rate  = 1.05
  utter.pitch = 0.9

  const preferred = voices.find(v => v.name === 'Google UK English Male') ||
    voices.find(v => v.name === 'Microsoft Mark - English (United States)') ||
    voices.find(v => v.name === 'Google US English') ||
    voices.find(v => v.name === 'Microsoft David - English (United States)') ||
    voices.find(v => v.lang === 'en-GB' && v.name.includes('Male')) ||
    voices.find(v => v.lang === 'en-US' && v.name.includes('Male')) ||
    voices.find(v => v.lang.startsWith('en')
  )

  if (preferred) utter.voice = preferred

  // Chrome fires onend twice in some versions — guard with a flag
  let finished = false
  const finish = () => {
    if (finished) { console.warn('[TTS] browser onend fired twice — ignoring'); return }
    if (speakSessionRef.current !== sessionId) return
    finished = true
    setIsSpeaking(false)
    isSpeakingRef.current = false
    onDone()
  }
  utter.onend   = finish
  utter.onerror = finish

  setIsSpeaking(true)
  isSpeakingRef.current = true
  setIsThinking(false)
  isThinkingRef.current = false
  window.speechSynthesis.speak(utter)
}

  // async function speakText(text) {
  //   stopAudio()
  //   // Grab this session's ID *after* stopAudio increments it
  //   const sessionId = speakSessionRef.current
  //   console.log('[TTS] Speaking (session', sessionId, '):', text)

  //   return new Promise(async (resolve) => {
  //     const done = () => {
  //       // Only act if we're still the active session
  //       if (speakSessionRef.current !== sessionId) return
  //       setIsSpeaking(false)
  //       isSpeakingRef.current = false
  //       resolve()
  //     }

  //     // ── Try backend TTS first ──────────────────────────────
  //     try {
  //       const res = await fetch(`${API_URL}/api/tts`, {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ text })
  //       })

  //       // Check session again — user may have interrupted while fetch was in flight
  //       if (speakSessionRef.current !== sessionId) { resolve(); return }

  //       if (res.ok) {
  //         const blob  = await res.blob()
  //         if (speakSessionRef.current !== sessionId) { resolve(); return }

  //         const url   = URL.createObjectURL(blob)
  //         const audio = new Audio(url)
  //         audioRef.current = audio

  //         let fallbackCalled = false  // guards onerror + play() from both triggering fallback

  //         audio.onended = () => {
  //           audioRef.current = null
  //           URL.revokeObjectURL(url)
  //           console.log('[TTS] Audio ended (session', sessionId, ')')
  //           done()
  //         }

  //         audio.onerror = () => {
  //           if (fallbackCalled) return
  //           fallbackCalled = true
  //           audioRef.current = null
  //           URL.revokeObjectURL(url)
  //           console.warn('[TTS] Audio error, falling back to browser TTS')
  //           if (speakSessionRef.current === sessionId) {
  //             speakWithBrowser(text, sessionId, resolve)
  //           } else {
  //             resolve()
  //           }
  //         }

  //         try {
  //           await audio.play()
  //           if (speakSessionRef.current !== sessionId) {
  //             audio.pause()
  //             audioRef.current = null
  //             URL.revokeObjectURL(url)
  //             resolve()
  //             return
  //           }
  //           setIsSpeaking(true)
  //           isSpeakingRef.current = true
  //           setIsThinking(false)
  //           isThinkingRef.current = false
  //           return
  //         } catch (playErr) {
  //           if (fallbackCalled) return  // onerror already handled it
  //           fallbackCalled = true
  //           console.warn('[TTS] play() blocked:', playErr.message)
  //           audioRef.current = null
  //           URL.revokeObjectURL(url)
  //           if (speakSessionRef.current === sessionId) {
  //             speakWithBrowser(text, sessionId, resolve)
  //           } else {
  //             resolve()
  //           }
  //           return
  //         }
  //       }
  //     } catch (err) {
  //       console.warn('[TTS] Backend fetch failed:', err.message)
  //     }

  //     // ── Backend unavailable — go straight to browser TTS ──
  //     if (speakSessionRef.current === sessionId) {
  //       speakWithBrowser(text, sessionId, resolve)
  //     } else {
  //       resolve()
  //     }
  //   })
  // }

  async function speakText(text) {
    stopAudio()
    const sessionId = speakSessionRef.current
    console.log('[TTS] Speaking (session', sessionId, '):', text)
    return new Promise(resolve => {
      speakWithBrowser(text, sessionId, resolve)
    })
  }


  function handleAction(action, actionData) {
    if (!action || !actionData) return
    console.log('[ACTION]', action, actionData)

    if (action === 'find_tasks_by_name' && actionData.tasks?.length > 0) {
      const task = actionData.tasks[0]
      setConfirmCard({ title: task.name, desc: task.details || task.time || 'Task found', glow: 'no-intent' })
    }

    if (action === 'create_task' && actionData.task) {
      addTask(actionData.task)
      setNewTaskId(actionData.task._id)
      setConfirmCard({ title: 'Task Created', desc: actionData.task.name, glow: 'new-glow' })
      setTimeout(() => { setNewTaskId(null); setConfirmCard(null) }, 2000)
    }

    if (action === 'update_task' && actionData.task) {
      setUpdatingId(actionData.task._id)
      updateTask(actionData.task)
      setConfirmCard({ title: 'Task Updated', desc: actionData.task.name, glow: 'update-glow' })
      setTimeout(() => { setUpdatingId(null); setConfirmCard(null) }, 2000)
    }

    if (action === 'delete_task') {
      if (actionData.taskId) setDeletingId(actionData.taskId)
      setConfirmCard({ title: 'Task Deleted', desc: actionData.message || 'Task removed', glow: 'delete-glow' })
      setTimeout(() => {
        fetch(`${API_URL}/api/tasks`).then(r => r.json()).then(d => { if (d.tasks) setTasks(d.tasks) })
        setDeletingId(null)
        setConfirmCard(null)
      }, 1500)
    }

    if (action === 'get_all_tasks') {
      fetch(`${API_URL}/api/tasks`).then(r => r.json()).then(d => { if (d.tasks) setTasks(d.tasks) })
    }
  }

  async function sendToBackend(userText) {
    stopListeningOnly()
    setIsThinking(true)
    isThinkingRef.current = true
    addMessage('user', userText)
    console.log('[CHAT] Sending:', userText)

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history: historyRef.current })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Backend error')

      historyRef.current = data.history || []
      addMessage('ai', data.reply)
      if (data.action) handleAction(data.action, data.actionData)
      // If action was just a search (no delete/update followed), dismiss confirm card after speaking
      if (data.action === 'find_tasks_by_name' && !data.actionData?.deleted) {
        setTimeout(() => setConfirmCard(null), 10000)
      }


      console.log('[CHAT] Reply:', data.reply)
      await speakText(data.reply)

    } catch (err) {
      console.error('[CHAT] Error:', err.message)
      setIsThinking(false)
      isThinkingRef.current = false
      const msg = 'Sorry, something went wrong. Please try again.'
      addMessage('ai', msg)
      await speakText(msg)
    }

    // speakText resolves only when the *current* session finishes speaking.
    // If the user interrupted (stopAudio was called), speakSessionRef changed,
    // so speakText resolved early and isActive controls whether we re-listen.
    setTimeout(() => {
  if (isActiveRef.current && !isListeningRef.current && !isThinkingRef.current && !isSpeakingRef.current) {
    startListening()
  }
}, 200)
  }

  function stopListeningOnly() {
    clearTimeout(noSpeechTimer.current)
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch (_) {}
      recognitionRef.current = null
    }
    setIsListening(false)
    isListeningRef.current = false
  }

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Use Chrome or Edge for voice input.'); return }
    if (isListeningRef.current || isThinkingRef.current || isSpeakingRef.current) {
      console.log('[STT] Skipping start — busy')
      return
    }

    stopListeningOnly()

    const recognition = new SR()
    recognition.lang            = 'en-US'
    recognition.interimResults  = false
    recognition.continuous      = false
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition

    recognition.onstart = () => {
      console.log('[STT] Started listening')
      setIsListening(true)
      isListeningRef.current = true
    }

    recognition.onresult = (event) => {
      clearTimeout(noSpeechTimer.current)
      const text = event.results[0][0].transcript.trim()
      console.log('[STT] Heard:', text)
      if (text) sendToBackend(text)
    }

    recognition.onerror = (event) => {
      console.warn('[STT] Error:', event.error)
      setIsListening(false)
      isListeningRef.current = false
      if (event.error === 'no-speech') {
        noSpeechTimer.current = setTimeout(() => {
          if (!isSpeakingRef.current && !isThinkingRef.current && isActiveRef.current) {
            startListening()
          }
        }, 800)
      } else if (event.error === 'not-allowed') {
        addMessage('ai', 'Microphone access denied. Please allow mic permissions.')
        setIsActive(false)
        isActiveRef.current = false
      }
    }

    recognition.onend = () => {
      console.log('[STT] Recognition ended')
      setIsListening(false)
      isListeningRef.current = false
      // Do NOT call startListening here — sendToBackend handles the restart
      // after speaking is done. Calling it here too is what caused double-speak.
    }

    try { recognition.start() } catch (err) {
      console.warn('[STT] Start error:', err.message)
    }
  }

  function handleMicClick() {
    if (!isActive) {
      console.log('[MIC] Activating agent')
      setIsActive(true)
      isActiveRef.current = true
      setMessages([])
      historyRef.current = []
      setTimeout(() => startListening(), 100)
      return
    }

    if (isSpeakingRef.current) {
      console.log('[MIC] Interrupting AI speech')
      stopAudio()
      setTimeout(() => startListening(), 150)
      return
    }

    if (isListeningRef.current) {
      console.log('[MIC] Stopping listen manually')
      stopListeningOnly()
    } else {
      startListening()
    }
  }

  function clearChat() {
    stopAudio()
    stopListeningOnly()
    historyRef.current = []
    setMessages([])
    setIsThinking(false)
    isThinkingRef.current = false
    setIsActive(false)
    isActiveRef.current = false
    console.log('[AGENT] Session ended')
  }

  return {
    isListening, isSpeaking, isThinking,
    isPanelOpen: isActive, isConnected, messages,
    handleMicClick, clearChat,
  }
}

export default useVoiceAgent