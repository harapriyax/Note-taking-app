import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './dashboard.css'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

/** Resolve view from both pathname (/login, /signup) and hash (#login, #signup) */
function getInitialView() {
  if (typeof window === 'undefined') return 'landing'
  const path = window.location.pathname.toLowerCase()
  const hash = window.location.hash.toLowerCase()
  if (path === '/signup' || path === '/register' || hash === '#signup' || hash === '#register') return 'signup'
  if (path === '/login' || path === '/signin' || hash === '#login' || hash === '#signin') return 'login'
  if (path === '/dashboard') return 'dashboard'
  return 'landing'
}

function App() {
  const [view, setView] = useState(getInitialView)
  const [navKey, setNavKey] = useState(0)
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('noteflow_session')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.user && parsed.user.fullName !== 'Harapriya') {
          parsed.user.fullName = 'Harapriya'
          parsed.user.email = 'harapriya@example.com'
          localStorage.setItem('noteflow_session', JSON.stringify(parsed))
        }
        return parsed
      }
    } catch {}
    if (typeof window !== 'undefined' && window.location.pathname.toLowerCase() === '/dashboard') {
      const defaultUser = {
        token: 'demo-token',
        user: { id: 'user-harapriya', fullName: 'Harapriya', email: 'harapriya@example.com' },
      }
      try {
        localStorage.setItem('noteflow_session', JSON.stringify(defaultUser))
      } catch {}
      return defaultUser
    }
    return null
  })

  const navigate = (newView) => {
    setNavKey((k) => k + 1)
    setView(newView)
    if (newView === 'login') {
      window.history.pushState(null, '', '/login')
    } else if (newView === 'signup') {
      window.history.pushState(null, '', '/signup')
    } else if (newView === 'dashboard') {
      window.history.pushState(null, '', '/dashboard')
    } else {
      window.history.pushState(null, '', '/')
    }
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {}
  }

  // Listen for browser back/forward
  useEffect(() => {
    const handlePop = () => {
      setNavKey((k) => k + 1)
      setView(getInitialView())
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  const completeLogin = (result) => {
    setSession(result)
    try {
      localStorage.setItem('noteflow_session', JSON.stringify(result))
    } catch {}
    navigate('dashboard')
  }

  const handleLogout = () => {
    setSession(null)
    try {
      localStorage.removeItem('noteflow_session')
    } catch {}
    navigate('landing')
  }

  return (
    <>
      {/* Top Lavender Progress Bar while changing pages */}
      <div key={`nav-bar-${navKey}`} className="nav-progress-bar" />

      {/* Animated View Container with smooth enter transition */}
      <div key={`view-${view}-${navKey}`} className="page-transition-wrapper animate-page-enter">
        {view === 'login' || view === 'signup' ? (
          <LoginPage
            initialMode={view === 'signup' ? 'signup' : 'login'}
            onLogin={completeLogin}
            onBack={() => navigate('landing')}
            onModeChange={(mode) => {
              if (mode === 'signup') window.history.replaceState(null, '', '/signup')
              else window.history.replaceState(null, '', '/login')
            }}
          />
        ) : view === 'dashboard' ? (
          <DashboardPage
            session={
              session || {
                token: 'demo-token',
                user: { id: 'user-harapriya', fullName: 'Harapriya', email: 'harapriya@example.com' },
              }
            }
            onLogout={handleLogout}
          />
        ) : (
          <LandingPage onNavigate={navigate} />
        )}
      </div>
    </>
  )
}

createRoot(document.getElementById('root')).render(<App />)
