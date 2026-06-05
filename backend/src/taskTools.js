// taskTools.js - all the database operations for tasks
// Gemini will call these functions when user speaks

import Task from './taskModel.js'

// ── CREATE a new task ─────────────────────────────────────────
async function createTask({ name, details = '', time = '', date = '' }) {
  const task = await Task.create({ name, details, time, date, status: 'pending' })
  return { success: true, task, message: `Task "${name}" created successfully` }
}

// ── GET all tasks (with optional filter) ─────────────────────
async function getAllTasks() {
  const tasks = await Task.find().sort({ createdAt: -1 })
  return { success: true, tasks }
}

// ── UPDATE a task by id ───────────────────────────────────────
async function updateTask({ id, name, details, time, date, status }) {
  // build update object with only fields that were provided
  const updates = {}
  if (name    !== undefined) updates.name    = name
  if (details !== undefined) updates.details = details
  if (time    !== undefined) updates.time    = time
  if (date    !== undefined) updates.date    = date
  if (status  !== undefined) updates.status  = status

  const task = await Task.findByIdAndUpdate(id, updates, { new: true })

  if (!task) return { success: false, message: 'Task not found' }
  return { success: true, task, message: `Task updated successfully` }
}

// ── DELETE a task by id ───────────────────────────────────────
async function deleteTask({ id }) {
  const task = await Task.findByIdAndDelete(id)
  if (!task) return { success: false, message: 'Task not found' }
  return { success: true, taskId: task._id, message: `Task "${task.name}" deleted successfully` }
}

// ── FIND tasks by fuzzy name match ────────────────────────────
// Used when user says "delete the LinkedIn task" - we search by name
async function findTasksByName({ query }) {
  const tasks = await Task.find({
    name: { $regex: query, $options: 'i' } // case insensitive search
  })
  return { success: true, tasks }
}

async function getTasksByTimeRange({ date = 'today', time_range = 'all' }) {
  const today    = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const targetDate = date === 'today' ? today : date === 'tomorrow' ? tomorrow : date

  const timeRanges = {
    morning:   { start: '06:00', end: '12:00' },
    afternoon: { start: '12:00', end: '17:00' },
    evening:   { start: '17:00', end: '21:00' },
    night:     { start: '21:00', end: '23:59' },
    all:       { start: '00:00', end: '23:59' },
  }

  let query = {}
  if (targetDate) query.date = targetDate

  const tasks = await Task.find(query).sort({ time: 1 })

  if (time_range !== 'all') {
    const { start, end } = timeRanges[time_range] || timeRanges.all
    const filtered = tasks.filter(t => {
      if (!t.time) return false
      // normalize "10:00 AM" -> compare
      const normalized = new Date(`2000-01-01 ${t.time}`).toTimeString().slice(0,5)
      return normalized >= start && normalized <= end
    })
    return { success: true, tasks: filtered }
  }

  return { success: true, tasks }
}

export { createTask, getAllTasks, updateTask, deleteTask, findTasksByName, getTasksByTimeRange }