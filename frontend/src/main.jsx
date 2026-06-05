// ============================================
// main.jsx — Entry point
// Mounts React app into the #root div in index.html
// Copy to: frontend/src/main.jsx
// ============================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'   // global styles
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)