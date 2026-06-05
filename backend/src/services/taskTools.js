import Task from '../models/taskModel.js'

// ── CREATE ─────────────────────────────────────────
async function createTask({
  userId,
  name,
  details = '',
  time = '',
  date = ''
}) {
  const task = await Task.create({
    user: userId,
    name,
    details,
    time,
    date,
    status: 'pending'
  })

  return {
    success: true,
    task,
    message: `Task "${name}" created successfully`
  }
}

// ── GET ALL ────────────────────────────────────────
async function getAllTasks({ userId }) {
  const tasks = await Task.find({
    user: userId
  }).sort({ createdAt: -1 })

  return {
    success: true,
    tasks
  }
}

// ── UPDATE ─────────────────────────────────────────
async function updateTask({
  userId,
  id,
  name,
  details,
  time,
  date,
  status
}) {
  const updates = {}

  if (name !== undefined) updates.name = name
  if (details !== undefined) updates.details = details
  if (time !== undefined) updates.time = time
  if (date !== undefined) updates.date = date
  if (status !== undefined) updates.status = status

  const task = await Task.findOneAndUpdate(
    {
      _id: id,
      user: userId
    },
    updates,
    { new: true }
  )

  if (!task) {
    return {
      success: false,
      message: 'Task not found'
    }
  }

  return {
    success: true,
    task,
    message: 'Task updated successfully'
  }
}

// ── DELETE ─────────────────────────────────────────
async function deleteTask({ userId, id }) {
  const task = await Task.findOneAndDelete({
    _id: id,
    user: userId
  })

  if (!task) {
    return {
      success: false,
      message: 'Task not found'
    }
  }

  return {
    success: true,
    taskId: task._id,
    message: `Task "${task.name}" deleted successfully`
  }
}

// ── FIND BY NAME ───────────────────────────────────
async function findTasksByName({
  userId,
  query
}) {
  const tasks = await Task.find({
    user: userId,
    name: {
      $regex: query,
      $options: 'i'
    }
  })

  return {
    success: true,
    tasks
  }
}

// ── TIME RANGE ─────────────────────────────────────
async function getTasksByTimeRange({
  userId,
  date = 'today',
  time_range = 'all'
}) {
  const today = new Date().toISOString().split('T')[0]

  const tomorrow = new Date(
    Date.now() + 86400000
  ).toISOString().split('T')[0]

  const targetDate =
    date === 'today'
      ? today
      : date === 'tomorrow'
      ? tomorrow
      : date

  const timeRanges = {
    morning: { start: '06:00', end: '12:00' },
    afternoon: { start: '12:00', end: '17:00' },
    evening: { start: '17:00', end: '21:00' },
    night: { start: '21:00', end: '23:59' },
    all: { start: '00:00', end: '23:59' }
  }

  const query = {
    user: userId
  }

  if (targetDate) {
    query.date = targetDate
  }

  const tasks = await Task.find(query)
    .sort({ time: 1 })

  if (time_range !== 'all') {
    const { start, end } =
      timeRanges[time_range] || timeRanges.all

    const filtered = tasks.filter(task => {
      if (!task.time) return false

      const normalized = new Date(
        `2000-01-01 ${task.time}`
      )
        .toTimeString()
        .slice(0, 5)

      return (
        normalized >= start &&
        normalized <= end
      )
    })

    return {
      success: true,
      tasks: filtered
    }
  }

  return {
    success: true,
    tasks
  }
}

export {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  findTasksByName,
  getTasksByTimeRange
}