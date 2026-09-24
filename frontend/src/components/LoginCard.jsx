import React, { useState, useEffect } from 'react'
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, UserRound, Zap } from 'lucide-react'

export default function LoginCard({ initialMode = 'login', onLogin, onError, onModeChange }) {
  const [mode, setMode] = useState(initialMode) // 'login' | 'signup'
  const [values, setValues] = useState({
    fullName: 'Harapriya',
    email: 'harapriya@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode)
      setErrorMsg('')
      setSuccessMsg('')
    }
  }, [initialMode])

  const switchMode = (newMode) => {
    setMode(newMode)
    setErrorMsg('')
    setSuccessMsg('')
    if (onModeChange) onModeChange(newMode)
  }

  const handleInstantDemo = () => {
    onLogin({
      token: 'demo-token-' + Date.now(),
      user: {
        id: 'user-harapriya',
        fullName: 'Harapriya',
        email: 'harapriya@example.com',
      },
    })
  }

  const handleGoogleLogin = () => {
    onLogin({
      token: 'google-token-' + Date.now(),
      user: {
        id: 'google-user-' + Date.now(),
        fullName: values.fullName.trim() || 'Harapriya',
        email: values.email || 'harapriya@example.com',
      },
    })
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!values.email.includes('@')) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    if (values.password.length < 4) {
      setErrorMsg('Password should be at least 4 characters.')
      return
    }

    if (mode === 'signup') {
      if (!values.fullName.trim()) {
        setErrorMsg('Please enter your full name.')
        return
      }
      if (values.password !== values.confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify.')
        return
      }
      if (!agreeTerms) {
        setErrorMsg('Please accept the Terms of Service to create an account.')
        return
      }
    }

    setLoading(true)
    try {
      const displayName = mode === 'signup'
        ? values.fullName.trim()
        : (values.email.includes('harapriya') ? 'Harapriya' : values.email.split('@')[0])

      // Successful login/registration (serverless / local persistence)
      onLogin({
        token: 'token-' + Date.now(),
        user: {
          id: 'user-' + Date.now(),
          fullName: displayName,
          email: values.email.trim(),
        },
      })
    } catch (err) {
      setErrorMsg(err.message || 'Unable to proceed.')
      if (onError) onError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[415px] rounded-[24px] bg-white border border-[#E8E2FA] shadow-[0_16px_40px_-10px_rgba(124,92,252,0.10),0_2px_6px_rgba(0,0,0,0.02)] p-5 sm:p-7 relative transition-all">
      {/* Card Top Logo */}
      <div className="flex items-center justify-center gap-2 mb-1.5">
        <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6946EC] to-[#997BFF] flex items-center justify-center text-white text-[17px] font-black shadow-md shadow-[#7C5CFC]/30">
          N
        </span>
        <span className="text-[21px] font-extrabold text-[#1E1938] tracking-tight font-sans">
          NoteFlow
        </span>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="mt-2.5 mb-3.5 p-1 bg-[#F5F2FE] rounded-xl flex items-center gap-1 border border-[#EBE4FA]">
        <button
          type="button"
          onClick={() => switchMode('login')}
          className={`flex-1 py-1.5 text-[12.5px] font-bold rounded-lg transition-all border-0 cursor-pointer ${
            mode === 'login'
              ? 'bg-white text-[#7C5CFC] shadow-sm'
              : 'bg-transparent text-[#6B6584] hover:text-[#1E1938]'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchMode('signup')}
          className={`flex-1 py-1.5 text-[12.5px] font-bold rounded-lg transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'signup'
              ? 'bg-white text-[#7C5CFC] shadow-sm'
              : 'bg-transparent text-[#6B6584] hover:text-[#1E1938]'
          }`}
        >
          <span>Create Account</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#EBE4FA] text-[#7C5CFC] text-[9.5px] font-extrabold uppercase">
            Free
          </span>
        </button>
      </div>

      {/* Heading */}
      {mode === 'login' ? (
        <div className="text-center mb-3">
          <h2 className="text-[22px] font-extrabold text-[#1E1938] tracking-tight">
            Welcome <span className="text-[#7C5CFC]">back</span>
          </h2>
          <p className="text-[12.5px] text-[#6B6584] mt-0.5">
            Sign in to access your notes, tasks, and ideas
          </p>
        </div>
      ) : (
        <div className="text-center mb-3">
          <h2 className="text-[22px] font-extrabold text-[#1E1938] tracking-tight">
            Create your <span className="text-[#7C5CFC]">free account</span>
          </h2>
          <p className="text-[12.5px] text-[#6B6584] mt-0.5">
            Organize thoughts, capture ideas, and elevate productivity
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-2">
        {/* Full Name Field (Sign Up Only) */}
        {mode === 'signup' && (
          <div className="mb-3.5">
            <label className="block text-[10.5px] font-extrabold tracking-wider text-[#6B6584] uppercase mb-1.5">
              FULL NAME
            </label>
            <div className="relative flex items-center">
              <UserRound size={17} className="absolute left-3.5 text-[#9E98B4] pointer-events-none" />
              <input
                type="text"
                value={values.fullName}
                onChange={(e) => setValues({ ...values, fullName: e.target.value })}
                placeholder="e.g. Harapriya"
                autoComplete="name"
                className="w-full h-[45px] rounded-xl border border-[#E5E0F4] bg-white pl-10 pr-4 text-[13.5px] text-[#1E1938] placeholder:text-[#9E98B4] focus:border-[#7C5CFC] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 transition"
              />
            </div>
          </div>
        )}

        {/* Email Address Field */}
        <div className="mb-3.5">
          <label className="block text-[10.5px] font-extrabold tracking-wider text-[#6B6584] uppercase mb-1.5">
            EMAIL ADDRESS
          </label>
          <div className="relative flex items-center">
            <Mail size={17} className="absolute left-3.5 text-[#9E98B4] pointer-events-none" />
            <input
              type="email"
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              placeholder="name@example.com"
              autoComplete="email"
              className="w-full h-[45px] rounded-xl border border-[#E5E0F4] bg-white pl-10 pr-4 text-[13.5px] text-[#1E1938] placeholder:text-[#9E98B4] focus:border-[#7C5CFC] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 transition"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="mb-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10.5px] font-extrabold tracking-wider text-[#6B6584] uppercase">
              {mode === 'signup' ? 'CREATE PASSWORD' : 'PASSWORD'}
            </label>
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => setSuccessMsg('Password reset instructions sent to your email.')}
                className="text-[11.5px] font-semibold text-[#7C5CFC] hover:underline bg-transparent border-0 cursor-pointer"
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative flex items-center">
            <Lock size={17} className="absolute left-3.5 text-[#9E98B4] pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={values.password}
              onChange={(e) => setValues({ ...values, password: e.target.value })}
              placeholder="Enter your password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              className="w-full h-[45px] rounded-xl border border-[#E5E0F4] bg-white pl-10 pr-10 text-[13.5px] text-[#1E1938] placeholder:text-[#9E98B4] focus:border-[#7C5CFC] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-[#9E98B4] hover:text-[#6B6584] p-1 bg-transparent border-0 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirm Password Field (Sign Up Only) */}
        {mode === 'signup' && (
          <div className="mb-3.5">
            <label className="block text-[10.5px] font-extrabold tracking-wider text-[#6B6584] uppercase mb-1.5">
              CONFIRM PASSWORD
            </label>
            <div className="relative flex items-center">
              <Lock size={17} className="absolute left-3.5 text-[#9E98B4] pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={values.confirmPassword}
                onChange={(e) => setValues({ ...values, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                autoComplete="new-password"
                className="w-full h-[45px] rounded-xl border border-[#E5E0F4] bg-white pl-10 pr-10 text-[13.5px] text-[#1E1938] placeholder:text-[#9E98B4] focus:border-[#7C5CFC] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-[#9E98B4] hover:text-[#6B6584] p-1 bg-transparent border-0 cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* Options / Checkbox */}
        {mode === 'login' ? (
          <div
            onClick={() => setRememberMe(!rememberMe)}
            className="mt-2.5 flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div
              className={`w-4 h-4 rounded-[4px] flex items-center justify-center transition-colors ${
                rememberMe ? 'bg-[#7C5CFC] text-white' : 'border border-[#CBD5E1] bg-white'
              }`}
            >
              {rememberMe && <Check size={11} strokeWidth={3.5} />}
            </div>
            <span className="text-[12.5px] font-medium text-[#4B4564]">Keep me signed in</span>
          </div>
        ) : (
          <div
            onClick={() => setAgreeTerms(!agreeTerms)}
            className="mt-2.5 flex items-start gap-2.5 cursor-pointer select-none"
          >
            <div
              className={`w-4 h-4 rounded-[4px] mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${
                agreeTerms ? 'bg-[#7C5CFC] text-white' : 'border border-[#CBD5E1] bg-white'
              }`}
            >
              {agreeTerms && <Check size={11} strokeWidth={3.5} />}
            </div>
            <span className="text-[12px] font-medium text-[#4B4564] leading-tight">
              I agree to NoteFlow's <a href="#terms" className="text-[#7C5CFC] font-semibold hover:underline">Terms of Service</a> & <a href="#privacy" className="text-[#7C5CFC] font-semibold hover:underline">Privacy Policy</a>
            </span>
          </div>
        )}

        {/* Notifications */}
        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#F0ECFD] border border-[#DDD3FA] text-[#7C5CFC] text-[12px] font-semibold">
            {successMsg}
          </div>
        )}

        {/* Main Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full h-[46px] rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6946EC] hover:from-[#6E4CE8] hover:to-[#5B39DE] active:scale-[0.99] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-[#7C5CFC]/25 transition-all duration-150 cursor-pointer disabled:opacity-75"
        >
          {loading ? (
            <span>Please wait...</span>
          ) : mode === 'login' ? (
            <>
              <span>Sign In to Workspace</span>
              <ArrowRight size={16} />
            </>
          ) : (
            <>
              <span>Create NoteFlow Account</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* OR CONTINUE WITH Divider */}
      <div className="my-4 flex items-center gap-3">
        <div className="h-[1px] bg-[#E8E2F8] flex-1" />
        <span className="text-[9.5px] font-extrabold tracking-wider text-[#9E98B4] uppercase">
          OR CONTINUE WITH
        </span>
        <div className="h-[1px] bg-[#E8E2F8] flex-1" />
      </div>

      {/* Continue with Google Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full h-[44px] rounded-xl border border-[#E5E0F4] hover:border-[#D5CBEF] bg-white hover:bg-[#FAF9FF] text-[#1E1938] font-semibold text-[13.5px] flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer"
      >
        <svg className="w-4 h-4 flex-none" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Instant Demo Access Button */}
      <button
        type="button"
        onClick={handleInstantDemo}
        className="mt-2.5 w-full h-[38px] rounded-xl border border-dashed border-[#DDD2FA] bg-[#FAF8FF] hover:bg-[#F2EDFE] text-[#7C5CFC] font-bold text-[12px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
      >
        <Sparkles size={14} />
        <span>Try Instant Demo as Harapriya</span>
      </button>

      {/* Mode Switch Footer Link */}
      <div className="mt-4 text-center text-[12.5px] text-[#6B6584]">
        {mode === 'login' ? (
          <>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className="text-[#7C5CFC] font-bold hover:underline bg-transparent border-0 cursor-pointer"
            >
              Create account free
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-[#7C5CFC] font-bold hover:underline bg-transparent border-0 cursor-pointer"
            >
              Sign in here
            </button>
          </>
        )}
      </div>

      {/* Trust Footer Badges */}
      <div className="mt-5 pt-3 border-t border-[#F2EDFC] flex items-center justify-center gap-3 text-[11px] text-[#7D7699]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-[#7C5CFC]" />
          <span>256-bit encrypted</span>
        </div>
        <span className="text-[#DDD6F3]">|</span>
        <div className="flex items-center gap-1.5">
          <Lock size={13} className="text-[#7C5CFC]" />
          <span>Your data stays private</span>
        </div>
      </div>
    </div>
  )
}
