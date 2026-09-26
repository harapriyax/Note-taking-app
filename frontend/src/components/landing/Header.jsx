import React, { useState } from 'react'
import { ArrowRight, ChevronRight, LogIn, Menu, UserPlus, X } from 'lucide-react'
import Logo from '../BrandLogo'
import Button from '../ui/Button'

export default function Header({ onNavigate }) {
  const [open, setOpen] = useState(false)
  const links = ['Features', 'How it works', 'Pricing', 'Security', 'FAQ']

  const handleNav = (destination) => {
    setOpen(false)
    onNavigate(destination)
  }

  return (
    <header className="site-header">
      <div className="page-shell flex h-[68px] sm:h-[74px] items-center justify-between">
        <Logo />

        {/* Desktop Navigation Links */}
        <nav className="nav-links">
          {links.map((link) => (
            <a key={link} href={`#${link.toLowerCase().replaceAll(' ', '-')}`}>
              {link}
            </a>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <button
            type="button"
            className="text-[13.5px] font-bold text-[#4E4868] hover:text-[#7C5CFC] px-3 py-2 rounded-lg transition-colors bg-transparent border-0 cursor-pointer"
            onClick={() => onNavigate('login')}
          >
            Login
          </button>
          <Button onClick={() => onNavigate('signup')}>
            Get Started <ArrowRight size={15} />
          </Button>
        </div>

        {/* Mobile Header: Clean Hamburger Toggle only (no duplicate top-bar login button) */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            className="mobile-header-menu-btn"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown / Drawer Overlay */}
      {open && (
        <div className="mobile-nav page-shell animate-mobile-enter">
          <nav>
            {links.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replaceAll(' ', '-')}`}
                onClick={() => setOpen(false)}
                className="mobile-nav-link"
              >
                <span>{link}</span>
                <ChevronRight size={16} className="text-[#9E98B4]" />
              </a>
            ))}

            <div className="mobile-nav-actions">
              <button
                type="button"
                className="mobile-nav-login-btn"
                onClick={() => handleNav('login')}
              >
                <span>Log In</span>
              </button>

              <button
                type="button"
                className="mobile-nav-signup-btn"
                onClick={() => handleNav('signup')}
              >
                <span>Get Started Free</span>
                <ArrowRight size={16} />
              </button>
            </div>
            <p className="mobile-nav-hint">Free forever • No credit card required</p>
          </nav>
        </div>
      )}
    </header>
  )
}

