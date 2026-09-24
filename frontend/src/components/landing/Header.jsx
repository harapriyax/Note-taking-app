import React, { useState } from 'react'
import { ArrowRight, ChevronRight, Menu, X } from 'lucide-react'
import Logo from '../BrandLogo'
import Button from '../ui/Button'

export default function Header({ onNavigate }) {
  const [open, setOpen] = useState(false)
  const links = ['Features', 'How it works', 'Pricing', 'Security', 'Blog']

  return (
    <header className="site-header">
      <div className="page-shell flex h-[76px] items-center justify-between">
        <Logo />
        <nav className="nav-links">
          {links.map((link) => (
            <a key={link} href={`#${link.toLowerCase().replaceAll(' ', '-')}`}>
              {link}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          <button
            className="text-sm font-bold text-slate-600 bg-transparent border-0 cursor-pointer"
            onClick={() => onNavigate('login')}
          >
            Login
          </button>
          <Button onClick={() => onNavigate('login')}>
            Get Started <ArrowRight size={15} />
          </Button>
        </div>
        <button
          className="grid h-10 w-10 place-items-center rounded-xl border border-[#eaded5] text-ink md:hidden bg-transparent cursor-pointer"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? <X size={20} /> : <Menu size={21} />}
        </button>
      </div>
      {open && (
        <div className="mobile-nav page-shell">
          <nav>
            {links.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replaceAll(' ', '-')}`}
                onClick={() => setOpen(false)}
              >
                {link}
                <ChevronRight size={16} />
              </a>
            ))}
            <Button onClick={() => onNavigate('login')} className="mt-3 w-full justify-center">
              Get Started <ArrowRight size={15} />
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
