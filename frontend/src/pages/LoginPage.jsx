import React from 'react'
import LoginCard from '../components/LoginCard'

export default function LoginPage({ initialMode = 'login', onLogin, onBack, onModeChange }) {
  return (
    <div className="min-h-screen bg-[#FAF9FF] py-5 px-4 sm:px-6 flex flex-col items-center justify-center relative overflow-hidden font-sans overflow-y-auto">
      {/* Background ambient lavender aesthetic aura */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#EBE4FE]/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#DDD2FD]/50 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full border border-[#E9E1FA]/40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[920px] h-[920px] rounded-full border border-[#E9E1FA]/25 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1180px] h-[1180px] rounded-full border border-[#E9E1FA]/15 pointer-events-none" />

      {/* The Centered Auth Card */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <LoginCard
          initialMode={initialMode}
          onLogin={onLogin}
          onModeChange={onModeChange}
        />

        {/* Back to Home Link */}
        <button
          type="button"
          onClick={onBack}
          className="mt-3 text-[12.5px] font-semibold text-[#7D7699] hover:text-[#7C5CFC] flex items-center justify-center gap-1.5 transition-colors bg-transparent border-0 cursor-pointer"
        >
          ← Back to NoteFlow Home
        </button>
      </div>
    </div>
  )
}
