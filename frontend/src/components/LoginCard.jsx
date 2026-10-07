import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { api } from '../lib/api'

export default function LoginCard({ initialMode = 'login', onLogin, onError, onModeChange }) {
  // modes: 'login' | 'signup' | 'verify' | 'forgot-password' | 'reset-password'
  const [mode, setMode] = useState(initialMode)
  const [values, setValues] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    code: '',
    newPassword: '',
    confirmNewPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [infoMsg, setInfoMsg] = useState('')

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode)
      setErrorMsg('')
      setInfoMsg('')
    }
  }, [initialMode])

  // Countdown timer for resend code
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const switchMode = (newMode) => {
    setMode(newMode)
    setErrorMsg('')
    setInfoMsg('')
    if (onModeChange) onModeChange(newMode)
  }

  // Handle Resend Code in verify or reset mode
  const handleResendCode = async () => {
    if (resendCooldown > 0 || resending) return
    if (!values.email.includes('@')) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    setResending(true)
    setErrorMsg('')
    try {
      if (mode === 'verify') {
        await api('/auth/resend-code', null, {
          method: 'POST',
          body: JSON.stringify({ email: values.email.trim() }),
        })
        setInfoMsg('A fresh verification code has been sent to your email.')
      } else {
        await api('/auth/forgot-password', null, {
          method: 'POST',
          body: JSON.stringify({ email: values.email.trim() }),
        })
        setInfoMsg('A fresh password reset code has been sent to your email.')
      }
      setResendCooldown(60)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setErrorMsg('')
    setInfoMsg('')

    // ── 1. LOGIN SUBMIT ──
    if (mode === 'login') {
      if (!values.email.includes('@')) {
        setErrorMsg('Please enter a valid email address.')
        return
      }
      if (!values.password) {
        setErrorMsg('Please enter your password.')
        return
      }

      setLoading(true)
      try {
        const result = await api('/auth/login', null, {
          method: 'POST',
          body: JSON.stringify({
            email: values.email.trim(),
            password: values.password,
          }),
        })

        onLogin({
          token: result.token || result.idToken,
          idToken: result.idToken,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user,
        })
      } catch (err) {
        if (err.code === 'UserNotConfirmedException') {
          setMode('verify')
          setInfoMsg('Your email is not verified yet. We have switched to verification. Enter your code below.')
        } else {
          setErrorMsg(err.message || 'Unable to sign in. Please verify your credentials.')
          if (onError) onError(err)
        }
      } finally {
        setLoading(false)
      }
      return
    }

    // ── 2. SIGNUP SUBMIT ──
    if (mode === 'signup') {
      if (!values.fullName.trim()) {
        setErrorMsg('Please enter your full name.')
        return
      }
      if (!values.email.includes('@')) {
        setErrorMsg('Please enter a valid email address.')
        return
      }
      if (values.password.length < 8) {
        setErrorMsg('Password must be at least 8 characters long.')
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

      setLoading(true)
      try {
        const result = await api('/auth/signup', null, {
          method: 'POST',
          body: JSON.stringify({
            fullName: values.fullName.trim(),
            email: values.email.trim(),
            password: values.password,
          }),
        })

        if (result.requiresConfirmation) {
          setMode('verify')
          setInfoMsg('Account created! Please check your email for the 6-digit confirmation code.')
          setResendCooldown(60)
        } else {
          // If auto-confirmed
          const loginRes = await api('/auth/login', null, {
            method: 'POST',
            body: JSON.stringify({
              email: values.email.trim(),
              password: values.password,
            }),
          })
          onLogin({
            token: loginRes.token,
            user: loginRes.user,
          })
        }
      } catch (err) {
        setErrorMsg(err.message || 'Unable to create account. Please try again.')
        if (onError) onError(err)
      } finally {
        setLoading(false)
      }
      return
    }

    // ── 3. VERIFY CODE SUBMIT ──
    if (mode === 'verify') {
      if (!values.code.trim()) {
        setErrorMsg('Please enter the 6-digit verification code.')
        return
      }

      setLoading(true)
      try {
        await api('/auth/confirm-signup', null, {
          method: 'POST',
          body: JSON.stringify({
            email: values.email.trim(),
            code: values.code.trim(),
          }),
        })

        // If password was already entered during signup, attempt auto-login
        if (values.password) {
          try {
            const loginRes = await api('/auth/login', null, {
              method: 'POST',
              body: JSON.stringify({
                email: values.email.trim(),
                password: values.password,
              }),
            })
            onLogin({
              token: loginRes.token,
              user: loginRes.user,
            })
            return
          } catch {}
        }

        setMode('login')
        setInfoMsg('Email verified successfully! You can now sign in.')
      } catch (err) {
        setErrorMsg(err.message || 'Invalid or expired verification code.')
      } finally {
        setLoading(false)
      }
      return
    }

    // ── 4. FORGOT PASSWORD SUBMIT ──
    if (mode === 'forgot-password') {
      if (!values.email.includes('@')) {
        setErrorMsg('Please enter your registered email address.')
        return
      }

      setLoading(true)
      try {
        await api('/auth/forgot-password', null, {
          method: 'POST',
          body: JSON.stringify({ email: values.email.trim() }),
        })

        setMode('reset-password')
        setInfoMsg('We sent a reset code to your email. Enter the code and your new password below.')
        setResendCooldown(60)
      } catch (err) {
        setErrorMsg(err.message || 'Failed to send reset code. Please check your email.')
      } finally {
        setLoading(false)
      }
      return
    }

    // ── 5. RESET PASSWORD SUBMIT ──
    if (mode === 'reset-password') {
      if (!values.code.trim()) {
        setErrorMsg('Please enter the verification code.')
        return
      }
      if (values.newPassword.length < 8) {
        setErrorMsg('New password must be at least 8 characters long.')
        return
      }
      if (values.newPassword !== values.confirmNewPassword) {
        setErrorMsg('New passwords do not match. Please verify.')
        return
      }

      setLoading(true)
      try {
        await api('/auth/reset-password', null, {
          method: 'POST',
          body: JSON.stringify({
            email: values.email.trim(),
            code: values.code.trim(),
            newPassword: values.newPassword,
          }),
        })

        setMode('login')
        setValues((v) => ({ ...v, password: v.newPassword }))
        setInfoMsg('Password reset successfully! Please sign in with your new password.')
      } catch (err) {
        setErrorMsg(err.message || 'Failed to reset password. Please check your code.')
      } finally {
        setLoading(false)
      }
      return
    }
  }

  return (
    <div className="w-full max-w-[425px] rounded-[24px] bg-white border border-[#E8E2FA] shadow-[0_16px_40px_-10px_rgba(124,92,252,0.12),0_2px_6px_rgba(0,0,0,0.02)] p-5 sm:p-7 relative transition-all">
      {/* Card Top Brand */}
      <div className="flex items-center justify-center gap-2 mb-1.5">
        <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6946EC] to-[#997BFF] flex items-center justify-center text-white text-[17px] font-black shadow-md shadow-[#7C5CFC]/30">
          N
        </span>
        <span className="text-[21px] font-extrabold text-[#1E1938] tracking-tight font-sans">
          NoteFlow
        </span>
      </div>

      {/* Mode Switcher Tabs (Only for Login & Signup) */}
      {(mode === 'login' || mode === 'signup') && (
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
      )}

      {/* Headings according to active Mode */}
      {mode === 'login' && (
        <div className="text-center mb-3">
          <h2 className="text-[22px] font-extrabold text-[#1E1938] tracking-tight">
            Welcome <span className="text-[#7C5CFC]">back</span>
          </h2>
          <p className="text-[12.5px] text-[#6B6584] mt-0.5">
            Sign in to access your notes, tasks, and ideas
          </p>
        </div>
      )}

      {mode === 'signup' && (
        <div className="text-center mb-3">
          <h2 className="text-[22px] font-extrabold text-[#1E1938] tracking-tight">
            Create your <span className="text-[#7C5CFC]">free account</span>
          </h2>
          <p className="text-[12.5px] text-[#6B6584] mt-0.5">
            Organize thoughts, capture ideas, and elevate productivity
          </p>
        </div>
      )}

      {mode === 'verify' && (
        <div className="text-center mb-3">
          <div className="w-11 h-11 mx-auto mb-2 rounded-2xl bg-[#F0EBFF] text-[#7C5CFC] flex items-center justify-center shadow-inner">
            <Mail size={22} />
          </div>
          <h2 className="text-[21px] font-extrabold text-[#1E1938] tracking-tight">
            Verify your <span className="text-[#7C5CFC]">email</span>
          </h2>
          <p className="text-[12.5px] text-[#6B6584] mt-0.5">
            Enter the 6-digit code sent to <strong className="text-[#1E1938]">{values.email}</strong>
          </p>
        </div>
      )}

      {mode === 'forgot-password' && (
        <div className="text-center mb-3">
          <div className="w-11 h-11 mx-auto mb-2 rounded-2xl bg-[#F0EBFF] text-[#7C5CFC] flex items-center justify-center shadow-inner">
            <KeyRound size={22} />
          </div>
          <h2 className="text-[21px] font-extrabold text-[#1E1938] tracking-tight">
            Reset <span className="text-[#7C5CFC]">password</span>
          </h2>
          <p className="text-[12.5px] text-[#6B6584] mt-0.5">
            Enter your email to receive a secure verification code
          </p>
        </div>
      )}

      {mode === 'reset-password' && (
        <div className="text-center mb-3">
          <div className="w-11 h-11 mx-auto mb-2 rounded-2xl bg-[#F0EBFF] text-[#7C5CFC] flex items-center justify-center shadow-inner">
            <Lock size={22} />
          </div>
          <h2 className="text-[21px] font-extrabold text-[#1E1938] tracking-tight">
            Set new <span className="text-[#7C5CFC]">password</span>
          </h2>
          <p className="text-[12.5px] text-[#6B6584] mt-0.5">
            Enter the verification code and choose a new password
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
                placeholder="e.g. Sarah Jenkins"
                autoComplete="name"
                className="w-full h-[45px] rounded-xl border border-[#E5E0F4] bg-white pl-10 pr-4 text-[13.5px] text-[#1E1938] placeholder:text-[#9E98B4] focus:border-[#7C5CFC] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 transition"
              />
            </div>
          </div>
        )}

        {/* Email Address Field (Login, Signup, Forgot Password) */}
        {(mode === 'login' || mode === 'signup' || mode === 'forgot-password') && (
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
        )}

        {/* Password Field (Login, Signup) */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="mb-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10.5px] font-extrabold tracking-wider text-[#6B6584] uppercase">
                {mode === 'signup' ? 'PASSWORD (MIN 8 CHARS)' : 'PASSWORD'}
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => switchMode('forgot-password')}
                  className="text-[11px] font-bold text-[#7C5CFC] hover:underline bg-transparent border-0 cursor-pointer p-0"
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
        )}

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

        {/* Verification Code Field (Verify & Reset Password modes) */}
        {(mode === 'verify' || mode === 'reset-password') && (
          <div className="mb-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10.5px] font-extrabold tracking-wider text-[#6B6584] uppercase">
                6-DIGIT VERIFICATION CODE
              </label>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || resending}
                className="text-[11px] font-bold text-[#7C5CFC] hover:underline bg-transparent border-0 cursor-pointer p-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {resending ? (
                  <>
                    <RefreshCw size={11} className="animate-spin" /> Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  'Resend code'
                )}
              </button>
            </div>
            <div className="relative flex items-center">
              <KeyRound size={17} className="absolute left-3.5 text-[#9E98B4] pointer-events-none" />
              <input
                type="text"
                maxLength={8}
                value={values.code}
                onChange={(e) => setValues({ ...values, code: e.target.value })}
                placeholder="Enter 6-digit code"
                autoComplete="one-time-code"
                className="w-full h-[45px] rounded-xl border border-[#E5E0F4] bg-white pl-10 pr-4 text-[15px] font-mono tracking-widest text-[#1E1938] placeholder:text-[#9E98B4] placeholder:tracking-normal focus:border-[#7C5CFC] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 transition"
              />
            </div>
          </div>
        )}

        {/* New Password & Confirm New Password Fields (Reset Password mode) */}
        {mode === 'reset-password' && (
          <>
            <div className="mb-3.5">
              <label className="block text-[10.5px] font-extrabold tracking-wider text-[#6B6584] uppercase mb-1.5">
                NEW PASSWORD (MIN 8 CHARS)
              </label>
              <div className="relative flex items-center">
                <Lock size={17} className="absolute left-3.5 text-[#9E98B4] pointer-events-none" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={values.newPassword}
                  onChange={(e) => setValues({ ...values, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className="w-full h-[45px] rounded-xl border border-[#E5E0F4] bg-white pl-10 pr-10 text-[13.5px] text-[#1E1938] placeholder:text-[#9E98B4] focus:border-[#7C5CFC] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 text-[#9E98B4] hover:text-[#6B6584] p-1 bg-transparent border-0 cursor-pointer"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="mb-3.5">
              <label className="block text-[10.5px] font-extrabold tracking-wider text-[#6B6584] uppercase mb-1.5">
                CONFIRM NEW PASSWORD
              </label>
              <div className="relative flex items-center">
                <Lock size={17} className="absolute left-3.5 text-[#9E98B4] pointer-events-none" />
                <input
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  value={values.confirmNewPassword}
                  onChange={(e) => setValues({ ...values, confirmNewPassword: e.target.value })}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className="w-full h-[45px] rounded-xl border border-[#E5E0F4] bg-white pl-10 pr-10 text-[13.5px] text-[#1E1938] placeholder:text-[#9E98B4] focus:border-[#7C5CFC] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute right-3 text-[#9E98B4] hover:text-[#6B6584] p-1 bg-transparent border-0 cursor-pointer"
                  aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Options / Checkbox (Login & Signup only) */}
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
        ) : mode === 'signup' ? (
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
              I agree to NoteFlow's{' '}
              <a href="#terms" className="text-[#7C5CFC] font-semibold hover:underline">
                Terms of Service
              </a>{' '}
              &{' '}
              <a href="#privacy" className="text-[#7C5CFC] font-semibold hover:underline">
                Privacy Policy
              </a>
            </span>
          </div>
        ) : null}

        {/* Info Message */}
        {infoMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#F0EBFF] border border-[#DDD6F8] text-[#5538C4] text-[12px] font-medium flex items-start gap-2">
            <CheckCircle2 size={16} className="text-[#7C5CFC] flex-shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium">
            {errorMsg}
          </div>
        )}

        {/* Main Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full h-[46px] rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6946EC] hover:from-[#6E4CE8] hover:to-[#5B39DE] active:scale-[0.99] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-[#7C5CFC]/25 transition-all duration-150 cursor-pointer disabled:opacity-75"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <RefreshCw size={15} className="animate-spin" /> Please wait...
            </span>
          ) : mode === 'login' ? (
            <>
              <span>Sign In to Workspace</span>
              <ArrowRight size={16} />
            </>
          ) : mode === 'signup' ? (
            <>
              <span>Create NoteFlow Account</span>
              <ArrowRight size={16} />
            </>
          ) : mode === 'verify' ? (
            <>
              <span>Confirm & Activate Account</span>
              <ArrowRight size={16} />
            </>
          ) : mode === 'forgot-password' ? (
            <>
              <span>Send Verification Code</span>
              <ArrowRight size={16} />
            </>
          ) : (
            <>
              <span>Update Password</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Mode Switch Footer Links */}
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
        ) : mode === 'signup' ? (
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
        ) : (
          <button
            type="button"
            onClick={() => switchMode('login')}
            className="text-[#7C5CFC] font-bold hover:underline bg-transparent border-0 cursor-pointer flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </button>
        )}
      </div>

      {/* Trust Footer Badges */}
      <div className="mt-5 pt-3 border-t border-[#F2EDFC] flex items-center justify-center gap-3 text-[11px] text-[#7D7699]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-[#7C5CFC]" />
          <span>AWS Cognito Secured</span>
        </div>
        <span className="text-[#DDD6F3]">|</span>
        <div className="flex items-center gap-1.5">
          <Lock size={13} className="text-[#7C5CFC]" />
          <span>256-bit encryption</span>
        </div>
      </div>
    </div>
  )
}
