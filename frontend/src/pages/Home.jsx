import { useEffect } from 'react'
import useTaskStore from '../store/taskStore'
import useVoiceAgent from '../hooks/useVoiceAgent'
import Hero from '../components/Hero'
import TaskGrid from '../components/TaskGrid'
import VoicePanel from '../components/VoicePanel'
import ConfirmCard from '../components/ConfirmCard'
import Navbar from '../components/Navbar'
import API_URL from '../config/api'
import useAuthStore from '../store/authStore'

function Home() {
  const setTasks   = useTaskStore(s => s.setTasks)
  const setLoading = useTaskStore(s => s.setLoading)
  const token = useAuthStore(s => s.token)

  const { isListening, isSpeaking, isThinking, isPanelOpen, messages, handleMicClick, clearChat, isConnected } = useVoiceAgent()

  useEffect(() => {
    if (!token) return
    setLoading(true)
    fetch(`${API_URL}/api/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(r => r.json())
      .then(d => { if (d.tasks) setTasks(d.tasks) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-bg text-white overflow-x-hidden w-full min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <main className="relative z-10 max-w-5xl mx-auto px-6 pb-36 w-full">
        <TaskGrid />
      </main>
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
      <footer className="relative z-10 text-center py-6 border-t border-white/[0.04] mt-auto">
        <p className="text-xs text-white/20 tracking-wider">
          Made by <span className="text-white/40 font-medium">Anurag Dubey</span> · Urban Ground AI Assignment
        </p>
      </footer>
    </div>
  )
}

export default Home
