'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { negocio } from '@/app/lib/data'

const stats = [
  { num: '2026', label: 'Inauguração' },
  { num: '8', label: 'Pratos exclusivos' },
]

export default function Sobre() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach(element => observer.observe(element))
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
      <div className="reveal relative" style={{ transitionDelay: '0s' }}>
        <div className="relative w-full aspect-[4/5] rounded-[28px] overflow-hidden border border-[#404040] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <Image
            src="/img/sobre-ambiente.jpg"
            alt="Interior do Bar do Bruce"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(18,18,18,0.4)] to-[rgba(18,18,18,0.75)]" />
        </div>

        <div className="absolute bottom-[-1.5rem] right-[-1.5rem] w-[48%] aspect-square rounded-[24px] overflow-hidden border-4 border-bg2 shadow-2xl">
          <Image
            src="/img/sobre-detalhe.jpg"
            alt="Detalhe gastronômico"
            fill
            sizes="25vw"
            className="object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[rgba(18,18,18,0.24)]" />
        </div>
      </div>

      <div className="reveal" style={{ transitionDelay: '0.15s' }}>
        <div className="section-tag">Nossa História</div>
        <p className="font-script text-[clamp(2rem,5vw,3.7rem)] text-[var(--accent-light)] leading-none">
          Atmosfera, sabor e encontro
        </p>
        <h2
          className="mt-3 font-playfair font-black leading-[1.04] tracking-[-0.03em]"
          style={{ fontSize: 'clamp(2rem, 4.5vw, 3.8rem)' }}
        >
          Um novo capítulo no
          <br />
          <em className="not-italic text-accent">Pelourinho</em>
        </h2>

        <p className="mt-6 text-gray-DEFAULT leading-[1.9] text-[0.95rem] max-w-[620px]">
          O {negocio.nome} nasce do encontro entre a cozinha baiana, a estética de um bar contemporâneo
          e a vontade de receber com elegância. O espaço foi pensado para uma estreia memorável, com pratos
          autorais, ambiente intimista e detalhes que convidam à permanência.
        </p>
        <p className="mt-4 text-gray-DEFAULT leading-[1.9] text-[0.95rem] max-w-[620px]">
          Nosso cardápio de abertura reúne 8 pratos exclusivos entre entradas, principais e sobremesas.
          As bebidas acompanham a experiência, mas não entram nessa contagem especial de inauguração.
        </p>

        <div className="mt-8 pt-8 flex flex-wrap gap-8" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {stats.map(stat => (
            <div key={stat.num}>
              <span className="font-playfair text-[3rem] font-black text-accent leading-none">{stat.num}</span>
              <p className="mt-1 text-[0.75rem] text-gray-DEFAULT uppercase tracking-[0.1em]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
