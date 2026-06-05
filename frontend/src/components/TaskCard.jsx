// ============================================
// components/TaskCard.jsx
// Exact Tailwind classes from reference HTML
// Glow red before delete, glow green on update
// Copy to: frontend/src/components/TaskCard.jsx
// ============================================

import { useState, useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'
import useTaskStore from '../store/taskStore'

function TaskCard({ task }) {

  // Track previous task to detect updates
  const prevTaskRef   = useRef(task)
  const [glowClass,   setGlowClass]   = useState('')
  const [isRemoving,  setIsRemoving]  = useState(false)

  // const deleteFromStore = useTaskStore((s) => s.deleteTask)

  // ── Detect when this task was updated → flash green ──
  useEffect(() => {
    const prev = prevTaskRef.current
    // If any field changed and it's not the first render
    if (
      prev._id === task._id &&
      (prev.name !== task.name ||
       prev.time !== task.time ||
       prev.date !== task.date ||
       prev.status !== task.status)
    ) {
      setGlowClass('card-update-glow')
      // Remove glow class after animation finishes
      setTimeout(() => setGlowClass(''), 800)
    }
    prevTaskRef.current = task
  }, [task])

  // ── Expose delete animation to parent via store ──────
  // Store a "markDeleting" fn so VoiceAgent can trigger it
  const deletingId = useTaskStore(s => s.deletingId)
  const updatingId = useTaskStore(s => s.updatingId)
  const newTaskId  = useTaskStore(s => s.newTaskId)

useEffect(() => {
  if (deletingId === task._id) {
    setGlowClass('card-delete-glow')
    setIsRemoving(true)
  }
}, [deletingId])

useEffect(() => {
  if (updatingId === task._id) {
    setGlowClass('card-update-glow')
    setTimeout(() => setGlowClass(''), 800)
  }
}, [updatingId])

useEffect(() => {                                    // ← add this block
  if (newTaskId === task._id) {
    setGlowClass('card-new-glow')
    setTimeout(() => setGlowClass(''), 900)
  }
}, [newTaskId])

  // ── Date label helper ────────────────────────
  function getDateLabel(dateStr) {
    if (!dateStr) return ''
    const today    = new Date(); today.setHours(0,0,0,0)
    const taskDate = new Date(dateStr); taskDate.setHours(0,0,0,0)
    const diff = Math.round((taskDate - today) / 86400000)
    if (diff ===  0) return 'Today'
    if (diff ===  1) return 'Tomorrow'
    if (diff === -1) return 'Yesterday'
    if (diff > 1 && diff <= 30) return `In ${diff}d`
    return taskDate.toLocaleDateString('en', { month: 'short', day: 'numeric' })
  }

  const isDone = task.status === 'completed'

  return (
    <div className={`task-card ${glowClass} ${isRemoving ? 'card-deleting' : ''}`}>

      {/* ── Top row: status badge + time pill ── */}
      <div className="card-header">

        {/* Status: dot + text */}
        <div className="status-badge">
          <div className={`status-dot ${isDone ? 'status-completed' : 'status-pending'}`} />
          <span className="text-xs uppercase tracking-wider"
            style={{ color: isDone ? '#22c55e' : 'rgba(255,255,255,0.4)' }}>
            {isDone ? 'Done' : 'Pending'}
          </span>
        </div>

        {/* Time pill — only if task has a time */}
        {task.time && (
          <div className="card-time-section">
            <Clock size={14} className="time-icon" />
            <div className="time-display">
              <span className="time-value">{task.time}</span>
              {task.date && (
                <span className="time-label">{getDateLabel(task.date)}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Task name + details ── */}
      <div className="flex-1">
        <h3 className="text-lg font-bold leading-snug mb-2 text-white">
          {task.name}
        </h3>
        {task.details && (
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {task.details}
          </p>
        )}
      </div>

    </div>
  )
}

export default TaskCard