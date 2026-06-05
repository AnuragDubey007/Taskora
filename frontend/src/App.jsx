import { Routes, Route, Navigate } from 'react-router-dom'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'

import ProtectedRoute from './components/ProtectedRoute'
import useAuthStore from './store/authStore'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

    <Route
        path="/app"
        element={
            <ProtectedRoute>
            <Home />
            </ProtectedRoute>
        }
    />
    </Routes>
  )
}

export default App