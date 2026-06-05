// ============================================
// components/TaskGrid.jsx
// Tailwind grid matching reference HTML
// Copy to: frontend/src/components/TaskGrid.jsx
// ============================================

import useTaskStore from '../store/taskStore'
import TaskCard from './TaskCard'

function TaskGrid() {
  const tasks     = useTaskStore((s) => s.tasks)
  const isLoading = useTaskStore((s) => s.isLoading)

  if (isLoading) {
    return (
      <p className="text-center py-20 text-white/25 text-sm">
        Loading tasks...
      </p>
    )
  }

  if (tasks.length === 0) {
    return (
      <p className="text-center py-20 text-white/25 text-sm leading-relaxed">
        No tasks yet.<br />
        Click the mic and say <em>"Create a task for..."</em>
      </p>
    )
  }

  return (
    // Exact same grid as reference: 1 → 2 → 3 columns
    <div id="task-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} />
      ))}
    </div>
  )
}

export default TaskGrid