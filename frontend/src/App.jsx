// ============================================
// App.jsx — Root component
// Copy to: frontend/src/App.jsx
// ============================================

import { useEffect } from 'react'
import useTaskStore from './store/taskStore'
import useVoiceAgent from './hooks/useVoiceAgent'
import Hero from './components/Hero'
import TaskGrid from './components/TaskGrid'
import VoicePanel from './components/VoicePanel'
import ConfirmCard from './components/ConfirmCard'

const API_URL = 'http://localhost:3001'

function App() {
  const setTasks   = useTaskStore((s) => s.setTasks)
  const setLoading = useTaskStore((s) => s.setLoading)

  const {
    isListening,
    isSpeaking,
    isThinking,
    isPanelOpen,
    messages,
    handleMicClick,
    clearChat,
    isConnected
  } = useVoiceAgent()

  // Load all tasks once on mount
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res  = await fetch(`${API_URL}/api/tasks`)
        const data = await res.json()
        if (data.tasks) setTasks(data.tasks)
      } catch (err) {
        console.error('Failed to load tasks:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="page-bg text-white overflow-x-hidden w-full">

      {/* Hero section */}
      <Hero />

      {/* Task grid — extra bottom padding so cards don't hide behind mic */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pb-36">
        <TaskGrid />
      </main>

      {/* Floating voice panel */}
      <VoicePanel
        isListening={isListening}
        isSpeaking={isSpeaking}
        isThinking={isThinking}
        isPanelOpen={isPanelOpen}
        isConnected={isConnected}
        messages={messages}
        onMicClick={handleMicClick}
        onEndClick={clearChat}
      />
    <ConfirmCard />
    {/* Footer */}
    <footer className="relative z-10 text-center py-6 border-t border-white/[0.04]">
      <p className="text-xs text-white/20 tracking-wider">
        Made by <span className="text-white/40 font-medium">Anurag Dubey</span> · Urban Ground AI Assignment
      </p>
    </footer>

    </div>
  )
}

export default App