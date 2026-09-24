import React from 'react'
import { LayoutGrid, Sparkles } from 'lucide-react'

function HashIcon() {
  return <span className="hash-icon">✣</span>
}

export default function TrustBar() {
  return (
    <section className="border-y border-[#eee4dc] bg-white/50 py-7">
      <div className="page-shell">
        <p className="mb-5 text-center text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#b7aaa1]">
          Trusted by individuals and teams worldwide
        </p>
        <div className="trust-logos">
          <span><LayoutGrid size={19} />Notion</span>
          <span><Sparkles size={19} />Figma</span>
          <span className="google-mark">G</span>
          <span><LayoutGrid size={19} />Microsoft</span>
          <span><HashIcon />Slack</span>
          <span><span className="spotify-dot">◓</span>Spotify</span>
          <span className="adobe">A<span>i</span></span>
        </div>
      </div>
    </section>
  )
}
