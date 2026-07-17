import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { MarketProvider } from './context/MarketContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <MarketProvider>
          <App />
        </MarketProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
