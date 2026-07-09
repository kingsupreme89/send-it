import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { playClick } from './utils/sound.ts'

// Global click sound — every <button> in the app gets the same click, app-wide.
document.addEventListener(
  'click',
  (e) => {
    if ((e.target as HTMLElement | null)?.closest('button')) playClick()
  },
  true,
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
