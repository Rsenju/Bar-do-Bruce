'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const navLinks = [
  { href: '#hero', label: 'Home' },
  { href: '#cardapio', label: 'Cardápio' },
  { href: '#reservas', label: 'Reservas' },
  { href: '#contato', label: 'Contato' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 px-[5%] h-[70px] flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'bg-[rgba(10,10,10,0.94)] backdrop-blur-[18px] border-b border-white/[0.07]' : ''
        }`}
      >
        {/* Logo */}
        <a href="#hero" className="font-playfair text-[1.35rem] font-black tracking-tight leading-none">
          Bar do <span className="text-accent">Bruce</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-[0.75rem] font-semibold tracking-[0.12em] uppercase text-gray-DEFAULT hover:text-white transition-colors duration-200 group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <a
            href="#reservas"
            className="btn-primary text-[0.72rem] py-[0.52rem] px-[1.2rem]"
          >
            Reservar
          </a>
        </nav>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] z-[60] p-1"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Menu"
        >
          <span className={`block w-[24px] h-[1.5px] bg-white transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-[24px] h-[1.5px] bg-white transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-[24px] h-[1.5px] bg-white transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </header>

      {/* Mobile overlay nav */}
      <div
        className={`fixed inset-0 z-40 bg-bg flex flex-col items-center justify-center gap-8 transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {navLinks.map(link => (
          <a
            key={link.href}
            href={link.href}
            onClick={closeMobile}
            className="font-playfair text-[2rem] font-bold text-white hover:text-accent transition-colors"
          >
            {link.label}
          </a>
        ))}
        <a
          href="#reservas"
          onClick={closeMobile}
          className="btn-primary mt-2 text-[0.8rem]"
        >
          Reservar Mesa
        </a>
      </div>
    </>
  )
}
