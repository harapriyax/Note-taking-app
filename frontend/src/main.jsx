import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './dashboard.css'

// Initialize Amplify (must be before any auth/api usage)
import './lib/amplifyConfig'

import { getCurrentUser, signOut, fetchAuthSession } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'

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
  const [session, setSession] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Check for existing Amplify session on mount
  useEffect(() => {
    checkAuthState()
  }, [])

  async function checkAuthState() {
    try {
      const user = await getCurrentUser()
      if (user) {
        // Get user attributes from the session
        const authSession = await fetchAuthSession()
        const idToken = authSession.tokens?.idToken
        const payload = idToken ? idToken.payload : {}

        setSession({
          signedIn: true,
          token: 'amplify-managed', // Placeholder — Amplify handles tokens internally
          user: {
            cognitoId: `${import.meta.env.VITE_AWS_REGION || 'ap-south-1'}:${user.userId}`,
            fullName: payload.name || payload.email?.split('@')[0] || 'User',
            displayName: payload.name || payload.email?.split('@')[0] || 'User',
            email: payload.email || '',
          },
        })

        // If on landing or login, redirect to dashboard
        if (view === 'landing' || view === 'login' || view === 'signup') {
          setView('dashboard')
          window.history.replaceState(null, '', '/dashboard')
        }
      }
    } catch {
      // Not signed in — that's fine
      setSession(null)
    } finally {
      setAuthChecked(true)
    }
  }

  // Listen for Amplify Auth Hub events
  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          checkAuthState()
          break
        case 'signedOut':
          setSession(null)
          setView('landing')
          window.history.pushState(null, '', '/')
          break
      }
    })
    return unsubscribe
  }, [])

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
    if (authChecked && view === 'dashboard' && !session) {
      navigate('login')
    }
  }, [view, session, authChecked])

  // Listen for browser back/forward
  useEffect(() => {
    const handlePop = () => {
      setNavKey((k) => k + 1)
      setView(getInitialView())
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  const completeLogin = async (_result) => {
    // After Amplify signIn succeeds, fetch the session
    await checkAuthState()
    navigate('dashboard')
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch {}
    setSession(null)
    try {
      localStorage.removeItem('noteflow_notes')
      localStorage.removeItem('noteflow_tasks')
      localStorage.removeItem('noteflow_categories')
    } catch {}
    setView('landing')
    setNavKey((k) => k + 1)
    window.history.pushState(null, '', '/')
    window.scrollTo({ top: 0 })
  }

  // Show nothing until auth state is checked (prevents flash)
  if (!authChecked) return null

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
