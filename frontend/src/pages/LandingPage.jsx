import React, { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight, Archive, BookOpen, Check, ChevronDown, Cloud, ExternalLink, FileText, Folder,
  Globe, LayoutGrid, Lock, LogIn, NotebookPen, Play, Plus, Search,
  ShieldCheck, Sparkles, Star, Tag, UserRound, Video
} from 'lucide-react'
import Button from '../components/ui/Button'
import Logo from '../components/BrandLogo'
import Header from '../components/landing/Header'
import ProductMockup from '../components/landing/ProductMockup'

function SectionHeading({ eyebrow, children, text }) {
  return (
    <div className="section-heading reveal">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{children}</h2>
      {text && <p className="section-copy">{text}</p>}
    </div>
  )
}

function BrowserScene() {
  return (
    <div className="hero-visual">
      <div className="hero-sun" />
      <div className="plant plant-left"><i /><i /><i /><i /><i /><i /></div>
      <div className="plant-pot" />
      <div className="table-shadow" />
      <ProductMockup />
    </div>
  )
}

function Hero({ onNavigate }) {
  return (
    <section id="top" className="hero-section overflow-hidden">
      <div className="page-shell grid min-h-[440px] items-center gap-8 py-8 sm:py-10 lg:grid-cols-[.93fr_1.07fr] lg:py-14">
        <div className="hero-copy">
          <span className="pill">Your Thoughts, Anywhere</span>
          <h1 className="my-3 max-w-[550px] text-[32px] sm:text-[44px] lg:text-[54px] font-extrabold leading-[1.06] tracking-tight">
            Write Smarter.<br /><em>Organize</em> Better.<br />Achieve More.
          </h1>
          <p className="mb-5 max-w-[490px] text-[14px] sm:text-[15px] leading-relaxed text-[#6B6584]">
            A clean and powerful workspace to capture your ideas, organize important information, and access your notes anytime, anywhere.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => onNavigate('signup')}>
              Get Started Free <ArrowRight size={15} />
            </Button>
            <Button secondary>
              <span className="play-chip"><Play size={10} fill="currentColor" /></span> Watch Demo
            </Button>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
            <div className="avatar-row">
              {['A','M','J','K'].map((letter, index) => <span key={letter} className={`avatar avatar-${index}`}>{letter}</span>)}
            </div>
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
            </div>
            <span>Loved by 10,000+ creators</span>
          </div>
        </div>
        <BrowserScene />
      </div>
    </section>
  )
}


function HashIcon() { return <span className="hash-icon">✣</span> }

function TrustBar() {
  return (
    <section className="border-y border-[#eee4dc] bg-white/50 py-5 sm:py-6">
      <div className="page-shell">
        <p className="mb-3.5 text-center text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#b7aaa1]">Trusted by individuals and teams worldwide</p>
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

const processSteps = [
  { icon: NotebookPen, badge: 'Lightning Fast', title: 'Capture Instantly', text: 'Jot down thoughts with our distraction-free rich text editor. Auto-saves continuously in real time.' },
  { icon: Folder, badge: 'Zero Clutter', title: 'Organize Thoughtfully', text: 'Categorize by College, Work, Projects, or Personal. Apply color palettes and hashtag chips.' },
  { icon: Search, badge: 'Always Ready', title: 'Retrieve Everywhere', text: 'Search through thousands of notes in milliseconds. Star priority favorites for instant access.' },
]

function Workflow() {
  return (
    <section id="how-it-works" className="pattern-section workflow-section">
      <div className="page-shell py-12 sm:py-16">
        <SectionHeading eyebrow="Seamless workflow" text="Three intuitive steps that transform cluttered thoughts into structured knowledge.">
          Bring Calm to <span>Every Thought</span>
        </SectionHeading>
        <div className="process-grid">
          {processSteps.map((item, index) => (
            <article className="process-card reveal" key={item.title}>
              <div className="flex items-start justify-between">
                <strong>0{index + 1}</strong>
                <span className="tiny-badge">{item.badge}</span>
              </div>
              <div className="icon-tile">
                <item.icon size={22} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              {index < 2 && (
                <div className="step-arrow-wrap" aria-hidden="true">
                  <ArrowRight size={16} />
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const security = [
  { icon: ShieldCheck, title: '256-Bit Encryption', text: 'Your data is encrypted with industry-standard AES-256 protocols both at rest and in transit.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Lock, title: 'Zero Data Selling', text: 'We never sell your data or serve targeted advertisements. Your notes belong exclusively to you.', color: 'text-orange-600', bg: 'bg-orange-50' },
  { icon: Cloud, title: 'Automated Snapshots', text: 'Automated backups and 30-day trash retention protect you from accidental deletions.', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: UserRound, title: 'Full Export Ownership', text: 'Export your entire knowledge base to standard Markdown or JSON files anytime, in seconds.', color: 'text-violet-600', bg: 'bg-violet-50' },
]

function Security() {
  return (
    <section id="security" className="security-section">
      <div className="page-shell py-12 sm:py-16">
        <div className="security-intro">
          <div>
            <p className="eyebrow">Private by design</p>
            <h2>Your Ideas <span>Stay Yours</span></h2>
            <p>Built from the foundation up with strict privacy, encryption, and zero data selling.</p>
          </div>
          <div className="shield-illustration" aria-hidden="true">
            <div className="shield-glow" />
            <ShieldCheck size={150} strokeWidth={1.15} />
            <Lock className="shield-lock" size={42} />
            <div className="paper-note"><b>Your Data<br />Stays Yours</b><span /><span /><span /></div>
            <div className="plant plant-right"><i /><i /><i /><i /></div>
          </div>
        </div>
        <div className="security-grid">
          {security.map(item => (
            <article className="security-card reveal" key={item.title}>
              <div className={`icon-tile ${item.bg} ${item.color}`}><item.icon size={24} /></div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const plans = [
  { name: 'Starter', subtitle: 'Essential note-taking for individuals and students.', price: '$0', suffix: 'forever free', features: ['Up to 100 notes', 'Basic organization', 'Tagging & color coding', 'Lightning fast search', 'Basic cloud sync'], action: 'Get Started Free' },
  { name: 'Pro Thinker', subtitle: 'For professionals, researchers, and engineers.', price: '$8', suffix: 'per month', features: ['Unlimited notes & storage', 'Custom categories & tags', 'Markdown & text file export', 'Priority support', 'Revision history', 'Custom starter templates'], action: 'Start Pro Trial', featured: true },
  { name: 'Team Workspace', subtitle: 'Collaborative note management for modern teams.', price: '$16', suffix: 'per user / month', features: ['Everything in Pro', 'Shared team workspace', 'Real-time shared notes', 'Role-based permissions', 'Centralized admin billing', 'Dedicated priority support'], action: 'Contact Sales' },
]

function Pricing({ onNavigate }) {
  return (
    <section id="pricing" className="pricing-section pattern-section">
      <div className="page-shell py-12 sm:py-16">
        <SectionHeading eyebrow="Transparent plans" text="Choose the plan that fits your personal or team workflow. Free forever options available.">
          Simple Pricing for <span>Every Thinker</span>
        </SectionHeading>
        <div className="pricing-grid">
          {plans.map(plan => (
            <article className={`price-card reveal ${plan.featured ? 'featured' : ''}`} key={plan.name}>
              {plan.featured && <span className="popular-tag">Most Popular</span>}
              <h3>{plan.name}</h3>
              <p className="plan-subtitle">{plan.subtitle}</p>
              <div className="price"><b>{plan.price}</b><span>{plan.suffix}</span></div>
              <div className="price-rule" />
              <ul>{plan.features.map(f => <li key={f}><Check size={15} />{f}</li>)}</ul>
              <Button onClick={() => onNavigate('signup')} secondary={!plan.featured} className="mt-auto w-full justify-center">{plan.action} {plan.featured && <ArrowRight size={15} />}</Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const reviews = [
  { initials: 'ER', name: 'Elena Rakov', role: 'Staff Product Designer', text: '"NoteFlow replaced three separate apps for me. The clean interface makes writing notes an absolute joy rather than a chore."' },
  { initials: 'MV', name: 'Marcus Vance', role: 'Lead Cloud Architect', text: '"The search is instant and the clean Markdown exporting means I never feel locked into a proprietary ecosystem. Essential for developers."' },
  { initials: 'AS', name: 'Ananya Sharma', role: 'Graduate Researcher', text: '"My study summaries and research notes have never been so well organized. The categorization and tag filtering save me hours every week."' },
]

function Reviews() {
  return (
    <section className="reviews-section">
      <div className="page-shell py-12 sm:py-16">
        <SectionHeading eyebrow="Community trust" text="See how professionals, researchers, and students elevate their thinking with NoteFlow.">
          Loved by Creators <span>Worldwide</span>
        </SectionHeading>
        <div className="review-grid">
          {reviews.map(review => (
            <article className="review-card reveal" key={review.name}>
              <div className="flex gap-0.5 text-amber-400">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
              <p>{review.text}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="review-avatar">{review.initials}</span>
                <div><b>{review.name}</b><small>{review.role}</small></div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const faqs = [
  {
    q: 'Can I export my notes to Markdown or other formats?',
    icon: NotebookPen,
    a: 'Yes, absolutely. NoteFlow supports 1-click exports to standard Markdown (.md), clean JSON, and plain text. Your thoughts are never locked into a proprietary silo and can be exported anytime in seconds.',
  },
  {
    q: 'Does NoteFlow work seamlessly offline?',
    icon: Folder,
    a: 'Yes! NoteFlow operates with a local-first architecture. All your notes, tags, and tasks are instantly cached and saved locally in your browser, keeping your workflow uninterrupted without internet.',
  },
  {
    q: 'How are my notes secure and kept private?',
    icon: Lock,
    a: 'Your privacy is our core foundation. Notes remain strictly within your device session or encrypted with client-grade isolation. We never sell your personal data or serve targeted advertisements.',
  },
  {
    q: 'Can I use NoteFlow across multiple devices?',
    icon: LayoutGrid,
    a: 'Yes. NoteFlow is built with modern, ultra-responsive web standards that work effortlessly across desktop laptops, tablets, and mobile browsers with consistent layouts.',
  },
  {
    q: 'Can I organize notes with custom tags and colors?',
    icon: Tag,
    a: 'Yes, NoteFlow features dynamic categories with custom color palettes and clickable tag pills. Filter your notes instantly by project, study topic, or personal goals.',
  },
  {
    q: 'Does NoteFlow have a daily task and checklist system?',
    icon: Check,
    a: 'Yes! The built-in Today widget lets you manage to-do items with priority levels (High, Medium, Low), completion tracking, and quick filters to stay productive every day.',
  },
]

function FAQ() {
  const [active, setActive] = useState(0)

  return (
    <section id="faq" className="faq-section pattern-section">
      <div className="page-shell py-12 sm:py-16">
        <SectionHeading
          eyebrow="Thinker care"
          text="Discover everything you need to know about our privacy architecture, offline capability, markdown exports, and cross-device sync."
        >
          Any <span>Questions?</span>
        </SectionHeading>
        <div className="faq-container">
          {faqs.map((faq, index) => {
            const isOpen = active === index
            const Icon = faq.icon
            return (
              <article
                className={`faq-card reveal ${isOpen ? 'faq-open' : ''}`}
                key={faq.q}
              >
                <button
                  type="button"
                  onClick={() => setActive(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-no">0{index + 1}</span>
                  <span className="faq-icon">
                    <Icon size={19} />
                  </span>
                  <b>{faq.q}</b>
                  <span className="faq-toggle">
                    <ChevronDown size={16} />
                  </span>
                </button>
                <div className="faq-answer-wrap">
                  <div className="faq-answer-inner">
                    <p>{faq.a}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FinalCta({ onNavigate }) {
  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="final-cta">
        <div className="relative z-10 max-w-[490px]">
          <p className="eyebrow">Ready to get started?</p>
          <h2>Turn Your Thoughts<br />Into Something Bigger</h2>
          <p>Join thousands of creators, researchers, and students who think better with NoteFlow.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => onNavigate('signup')}>Get Started Free <ArrowRight size={16} /></Button>
            <Button secondary><span className="play-chip"><Play size={10} fill="currentColor" /></span> Watch Demo</Button>
          </div>
        </div>
        <div className="cta-scene">
          <div className="plant cta-plant"><i /><i /><i /><i /></div>
          <div className="laptop">
            <div className="laptop-screen"><ProductMockup compact /></div>
            <div className="laptop-base" />
          </div>
          <div className="phone">
            <div className="phone-notch" />
            <div className="phone-body"><b>NoteFlow</b><span>Personal Goals</span><span>Project Notes</span><span>Design Ideas</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="page-shell pb-8 pt-4">
      <div className="footer-top">
        <div><Logo /><p>Your thoughts, organized for a better tomorrow.</p></div>
        <nav>{['Features', 'Pricing', 'Security', 'Blog', 'Help'].map(link => <a key={link} href="#top">{link}</a>)}</nav>
        <div className="socials">
          <a href="#linkedin" aria-label="LinkedIn"><Globe size={16} /></a>
          <a href="#github" aria-label="GitHub"><ExternalLink size={16} /></a>
          <a href="#youtube" aria-label="Youtube"><Video size={16} /></a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 NoteFlow. All rights reserved.</span>
        <span style={{ opacity: 0.45, fontSize: '11px', letterSpacing: '0.5px' }}>Designed & built by Harapriya</span>
        <div><a href="#privacy">Privacy</a><a href="#terms">Terms</a><a href="#cookies">Cookies</a></div>
      </div>
    </footer>
  )
}

export default function LandingPage({ onNavigate }) {
  const app = useRef(null)

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.from('.site-header', { y: -18, opacity: 0, duration: 0.65, ease: 'power2.out' })
      gsap.from('.hero-copy > *', { y: 26, opacity: 0, duration: 0.7, stagger: 0.09, delay: 0.12, ease: 'power3.out' })
      gsap.from('.hero-visual', { x: 35, opacity: 0, scale: 0.96, duration: 1, delay: 0.15, ease: 'power3.out' })
      gsap.to('.hero-visual', { y: -7, duration: 2.3, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.1 })
      gsap.utils.toArray('.reveal').forEach((card) => {
        gsap.fromTo(
          card,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        )
      })
    }, app)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={app}>
      <Header onNavigate={onNavigate} />
      <main>
        <Hero onNavigate={onNavigate} />
        <TrustBar />
        <Workflow />
        <Security />
        <Pricing onNavigate={onNavigate} />
        <Reviews />
        <FAQ />
        <FinalCta onNavigate={onNavigate} />
      </main>
      <Footer />
    </div>
  )
}
