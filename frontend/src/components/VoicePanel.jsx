// ============================================
// components/VoicePanel.jsx
// Exact markup from reference HTML, Tailwind classes
// Copy to: frontend/src/components/VoicePanel.jsx
// ============================================

import { Mic, MicOff } from 'lucide-react'
import { useRef, useEffect } from 'react'

function VoicePanel({
  isListening,
  isSpeaking,
  isThinking,
  isPanelOpen,
  isConnected,
  messages,
  onMicClick,
  onEndClick,
}) {

    const messagesEndRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isThinking])

  function getStatusLabel() {
    if (!isConnected) return 'Connecting...'
    if (isListening)  return 'Listening'
    if (isThinking)   return 'Thinking...'
    if (isSpeaking)   return 'Speaking...'
    if (isPanelOpen)  return 'Press mic to talk'   // ← panel open but transitioning = show Listening
    return 'Ready'
  }

  return (
    // voice-panel = fixed bottom center (index.css)
    <div className={`voice-panel ${isListening ? 'active' : ''}`} id="voice-panel">

      {/* Glow backdrop behind mic */}
      <div className="mic-glow-backdrop" />

      {/* ── Transcript panel slides up ── */}
      <div className={`transcript-shell ${isPanelOpen ? 'open' : ''}`} id="transcript-shell">
        <div className="transcript-inner">

          {/* Header: wave + status + End btn */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/5">
            <div className="flex items-center gap-3">

              {/* Wave bars only while listening */}
              {isListening && (
                <div className="wave-line" id="wave-indicator">
                  <span /><span /><span /><span /><span />
                </div>
              )}

              <span className="text-[11px] uppercase tracking-[0.15em] text-white/30 font-medium">
                {getStatusLabel()}
              </span>
            </div>

            {/* End button */}
            <button
              id="end-btn"
              onClick={onEndClick}
              className="text-[11px] px-3 py-1 rounded-full bg-white/5 text-white/40 border border-white/[0.08] hover:bg-white/10 transition-all"
            >
              End
            </button>
          </div>

          {/* ── Messages area ── */}
          <div
            id="chat-messages"
            className="flex-1 px-4 py-3 space-y-2.5 overflow-y-auto"
          >

            {/* AI thinking dots */}
            {isThinking && (
              <div id="ai-status" className="flex justify-start mb-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-2xl text-[13px] bg-white/[0.03] text-white/40">
                  <span className="ai-dot" />
                  <span className="ai-dot" />
                  <span className="ai-dot" />
                  <span id="ai-status-text" className="ml-1">Thinking...</span>
                </div>
              </div>
            )}

            {/* Chat bubbles */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-msg flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-white/10 text-white'
                    : 'bg-white/[0.03] text-white/40'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />   {/* ← add this at the very end */}
          </div>

        </div>
      </div>

      {/* ── Mic button ── */}
      {/* Mic button with snake ring */}
<div style={{ position: 'relative', display: 'inline-flex' }}>
  {!isPanelOpen && <div className="mic-snake-ring" />}
  <button
    id="mic-btn"
    onClick={onMicClick}
    className={`mic-btn flex items-center justify-center ${isListening ? 'active' : ''}`}
    aria-label={isListening ? 'Stop listening' : 'Start voice interaction'}
  >
    {isListening
      ? <Mic    size={22} color="#000" />
      : <MicOff size={22} color="#000" />
    }
  </button>
</div>


    </div>
  )
}

export default VoicePanel