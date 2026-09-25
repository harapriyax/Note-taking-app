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

/** Parse JWT payload without a library */
function parseJwt(token) {
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

/** Check if a JWT token is still valid (not expired) */
function isTokenValid(token) {
  if (!token || token.startsWith('demo-token') || token.startsWith('google-token')) return true
  const payload = parseJwt(token)
  if (!payload || !payload.exp) return true // no expiry = assume valid
  return Date.now() < payload.exp * 1000
}

function App() {
  const [view, setView] = useState(getInitialView)
  const [navKey, setNavKey] = useState(0)
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('noteflow_session')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Validate token is not expired
        if (parsed?.token && !isTokenValid(parsed.token)) {
          localStorage.removeItem('noteflow_session')
          return null
        }
        return parsed
      }
    } catch {}
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

  // If user lands on /dashboard but has no valid session, redirect to login
  useEffect(() => {
    if (view === 'dashboard' && !session) {
      navigate('login')
    }
  }, [view, session])

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
      localStorage.removeItem('noteflow_notes')
      localStorage.removeItem('noteflow_tasks')
      localStorage.removeItem('noteflow_categories')
    } catch {}
    setView('landing')
    setNavKey((k) => k + 1)
    window.history.pushState(null, '', '/')
    window.scrollTo({ top: 0 })
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
        ) : view === 'dashboard' && session ? (
          <DashboardPage
            session={session}
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
