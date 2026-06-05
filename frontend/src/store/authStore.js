import { create } from 'zustand'

const stored = JSON.parse(localStorage.getItem('taskora_auth') || 'null')

const useAuthStore = create((set) => ({
  user:  stored?.user  || null,
  token: stored?.token || null,

  login: (userData) => {
    localStorage.setItem('taskora_auth', JSON.stringify(userData))
    set({ user: userData.user, token: userData.token })
  },

  logout: () => {
    localStorage.removeItem('taskora_auth')
    set({ user: null, token: null })
  }
}))

export default useAuthStore
