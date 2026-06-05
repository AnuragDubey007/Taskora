// ============================================
// components/Hero.jsx
// Exact markup + Tailwind from reference HTML
// Copy to: frontend/src/components/Hero.jsx
// ============================================

import { Mic } from 'lucide-react'

function Hero() {
  return (
    <header className="relative z-10 px-6 pt-20 pb-16 overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Live badge */}
        <div className="anim-1 inline-flex items-center gap-2 mb-12 px-3.5 py-2 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-white/60" />
          <p className="text-xs uppercase tracking-[0.2em] font-medium text-white/60">
            AI Voice Task Agent
          </p>
        </div>

        {/* Main heading */}
        <h1 className="anim-2 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl bg-clip-text text-transparent"
  style={{ backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #ffffff 60%, rgba(255,255,255,0.4) 100%)' }}>
  Taskora.<br />
  <span className="text-3xl sm:text-4xl md:text-5xl font-normal" style={{ backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
    Your tasks, managed by voice.
  </span>
</h1>


        {/* Subtitle */}
        <p className="anim-3 mt-8 text-base sm:text-lg max-w-2xl leading-relaxed text-white/50">
          Just speak naturally. Taskora creates, updates, and deletes
          your tasks — no buttons, no typing, no friction.
        </p>

        {/* Mic hint */}
        <div className="anim-4 mt-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <Mic size={18} color="#000" />
          </div>
          <span className="text-sm text-white/50">
            Tap the mic below and start talking
          </span>
        </div>

        {/* Feature badges */}
        <div className="anim-4 mt-6 flex flex-wrap gap-2">
          <div className="feature-badge"><span>✓</span> Context Memory</div>
          <div className="feature-badge"><span>✓</span> Voice CRUD</div>
          <div className="feature-badge"><span>✓</span> Realtime</div>
          <div className="feature-badge"><span>✓</span> Gemini AI</div>
        </div>

      </div>
    </header>
  )
}

export default Hero