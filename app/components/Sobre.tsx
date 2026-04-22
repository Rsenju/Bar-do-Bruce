'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { negocio } from '@/app/lib/data'

const stats = [
  { num: '2026', label: 'Inauguração' },
  { num: '18', label: 'Pratos exclusivos' },
  { num: '5★', label: 'Avaliação média' },
]

export default function Sobre() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="sobre"
      ref={sectionRef}
      className="section-pad bg-bg2"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '5rem',
        alignItems: 'center',
      }}
    >
      {/* Image block */}
      <div className="reveal relative" style={{ transitionDelay: '0s' }}>
        <div className="relative w-full aspect-[4/5] rounded-sm overflow-hidden">
          <Image
            src="/img/sobre-ambiente.jpg"
            alt="Interior do Bar do Bruce"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            loading="lazy"
          />
          {/* Fallback gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-bg3 to-bg2 opacity-30" />
        </div>

        {/* Float image */}
        <div className="absolute bottom-[-1.5rem] right-[-1.5rem] w-[48%] aspect-square rounded-sm overflow-hidden border-4 border-bg2 shadow-2xl">
          <Image
            src="/img/sobre-detalhe.jpg"
            alt="Detalhe gastronômico"
            fill
            sizes="25vw"
            className="object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-bg3 opacity-20" />
        </div>
      </div>

      {/* Text block */}
      <div className="reveal" style={{ transitionDelay: '0.15s' }}>
        <div className="section-tag">Nossa História</div>
        <h2 className="font-playfair font-black leading-[1.08] tracking-[-0.02em]"
          style={{ fontSize: 'clamp(2rem, 4.5vw, 3.6rem)' }}>
          Onde Salvador<br />se <em className="italic text-accent">senta à mesa</em>
        </h2>

        <p className="mt-6 text-gray-DEFAULT leading-[1.8] text-[0.95rem]">
          O Bar do Bruce nasceu do amor pela cozinha baiana e pela boa conversa.
          No coração do Pelourinho, criamos um espaço onde tradição e modernidade
          se encontram: ingredientes locais, técnicas contemporâneas e uma atmosfera
          que convida você a ficar.
        </p>
        <p className="mt-4 text-gray-DEFAULT leading-[1.8] text-[0.95rem]">
          Cada prato carrega a alma do Recôncavo — o dendê, o aipim, o charque —
          com apresentações que surpreendem e sabores que emocionam. Bem-vindo ao nosso lar.
        </p>

        {/* Stats */}
        <div
          className="mt-8 pt-8 flex flex-wrap gap-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          {stats.map(s => (
            <div key={s.num}>
              <span className="font-playfair text-[3rem] font-black text-accent leading-none">{s.num}</span>
              <p className="mt-1 text-[0.75rem] text-gray-DEFAULT uppercase tracking-[0.1em]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
