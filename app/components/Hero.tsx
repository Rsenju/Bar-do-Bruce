'use client'

import { useEffect, useRef } from 'react'

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative h-screen min-h-[600px] flex items-center overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/img/hero-bg.jpg')`,
        }}
      >
        {/* Fallback gradient when image is missing */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg2 via-bg3 to-bg" />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(10,10,10,0.88)] via-[rgba(10,10,10,0.6)] to-[rgba(10,10,10,0.78)]" />
      </div>

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-[6%] w-full max-w-[960px]">
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-3 text-accent text-[0.68rem] font-semibold tracking-[0.22em] uppercase mb-6"
          style={{ animation: 'fadeUp 0.8s 0.2s both' }}
        >
          <span className="w-8 h-px bg-accent" />
          Salvador, Bahia · Est. 2026
        </div>

        {/* Title */}
        <h1
          className="font-playfair font-black leading-[0.93] tracking-[-0.02em]"
          style={{
            fontSize: 'clamp(3.2rem, 9vw, 7.8rem)',
            animation: 'fadeUp 0.9s 0.35s both',
          }}
        >
          SEJA<br />
          <em className="not-italic text-accent">BEM‑VINDO</em>
        </h1>

        {/* Subtitle */}
        <p
          className="mt-6 text-gray-DEFAULT leading-[1.75] max-w-[480px]"
          style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            animation: 'fadeUp 0.8s 0.55s both',
          }}
        >
          Uma experiência gastronômica única onde a cultura baiana encontra
          a sofisticação moderna. Cada prato conta uma história.
        </p>

        {/* Buttons */}
        <div
          className="mt-10 flex gap-4 flex-wrap"
          style={{ animation: 'fadeUp 0.8s 0.7s both' }}
        >
          <a href="#reservas" className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Fazer Reserva
          </a>
          <a href="#cardapio" className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
            Ver Cardápio
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 z-10"
        style={{ animation: 'bounceSoft 2s ease-in-out infinite' }}>
        <span className="text-gray-DEFAULT text-[0.6rem] font-semibold tracking-[0.2em] uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-transparent to-gray-DEFAULT" />
      </div>

      {/* Rotating badge — desktop only */}
      <div
        className="hidden lg:flex absolute right-[6%] bottom-[12%] w-[108px] h-[108px] rounded-full bg-accent items-center justify-center z-10"
        style={{ animation: 'rotateSlow 20s linear infinite, fadeIn 0.8s 1.2s both' }}
      >
        <span className="font-playfair text-bg text-[0.68rem] font-bold text-center leading-[1.4] px-2">
          ★ DESDE<br />2026<br />SALVADOR
        </span>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes rotateSlow {
          to { transform: rotate(360deg); }
        }
        @keyframes bounceSoft {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(6px); }
        }
      `}</style>
    </section>
  )
}
