// ============================================
// store/taskStore.js — Global task state
// Uses Zustand to store tasks so ANY component
// can read or update them without prop drilling
// Copy to: frontend/src/store/taskStore.js
// ============================================

import { create } from 'zustand'

const useTaskStore = create((set) => ({

  // ── State ──────────────────────────────────
  tasks: [],          // array of task objects from MongoDB
  isLoading: false,   // true while fetching from backend

  // ── Actions ────────────────────────────────

  // Replace entire tasks array (used on page load)
  setTasks: (tasks) => set({ tasks }),

  // Add one new task to the TOP of the list
  addTask: (task) => set((state) => ({
    tasks: [task, ...state.tasks]
  })),

  // Update one task by its MongoDB _id
  // Merges only the changed fields, keeps rest same
  updateTask: (updatedTask) => set((state) => ({
    tasks: state.tasks.map((t) =>
      t._id === updatedTask._id ? updatedTask : t
    )
  })),

  // Remove one task by its MongoDB _id
  deleteTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter((t) => t._id !== taskId)
  })),

  // Set loading state
  setLoading: (bool) => set({ isLoading: bool }),
  deletingId: null,
  updatingId: null,
  setDeletingId: (id) => set({ deletingId: id }),
  setUpdatingId: (id) => set({ updatingId: id }),
  newTaskId: null,
  setNewTaskId: (id) => set({ newTaskId: id }),
  confirmCard: null,
  setConfirmCard: (data) => set({ confirmCard: data }),

}))

export default useTaskStore