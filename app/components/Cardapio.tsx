'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { cardapio, categorias } from '@/app/lib/data'
import type { CategoriaCardapio } from '@/app/lib/types'

export default function Cardapio() {
  const [activeCategory, setActiveCategory] = useState<CategoriaCardapio>('entradas')
  const [animating, setAnimating] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      }),
      { threshold: 0.1 }
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach(element => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  const handleCategory = (category: CategoriaCardapio) => {
    if (category === activeCategory) return
    setAnimating(true)
    setTimeout(() => {
      setActiveCategory(category)
      setAnimating(false)
    }, 200)
  }

  const items = cardapio.filter(item => item.categoria === activeCategory)
  const isBebidas = activeCategory === 'bebidas'

  return (
    <section id="cardapio" ref={sectionRef} className="section-pad bg-bg2">
      <div className="reveal">
        <div className="section-tag">Cardápio</div>
        <p className="font-script text-[clamp(1.8rem,4vw,3.4rem)] text-[var(--accent-light)] leading-none">
          Cozinha de estreia
        </p>
        <h2 className="mt-3 font-playfair font-black tracking-[-0.03em] leading-[1.05]" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>
          Sabores que
          <br />
          <em className="not-italic text-accent">marcam presença</em>
        </h2>
      </div>

      <div className="reveal mt-8 border-b border-[#404040] flex flex-wrap" style={{ transitionDelay: '0.05s' }}>
        {categorias.map(category => (
          <button
            key={category.key}
            onClick={() => handleCategory(category.key as CategoriaCardapio)}
            className={`px-6 py-3 text-[0.78rem] font-semibold tracking-[0.1em] uppercase border-b-2 -mb-px transition-all duration-200 ${
              activeCategory === category.key
                ? 'text-[var(--accent-light)] border-[var(--accent-light)]'
                : 'text-white border-transparent hover:text-[var(--accent-light)] hover:border-[rgba(166,139,91,0.4)]'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {isBebidas && (
        <div
          ref={gridRef}
          className="reveal mt-8"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(10px)' : 'translateY(0)',
            transition: 'opacity 0.25s, transform 0.25s',
            transitionDelay: '0.08s',
          }}
        >
          <div className="grid gap-0" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {items.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 px-5 py-5 border-b border-[#2c2c2c] hover:bg-white/[0.02] transition-colors duration-200 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[rgba(166,139,91,0.08)] border border-[rgba(166,139,91,0.35)] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[1.35rem] leading-none">
                      {item.id === 'caipirinha' ? '🍋' :
                       item.id === 'mojito' ? '🌿' :
                       item.id === 'sex-on-the-beach' ? '🍹' :
                       item.id === 'agua' ? '💧' :
                       item.id === 'refrigerante' ? '🥤' :
                       '🍺'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[0.96rem] font-semibold text-white font-playfair">{item.nome}</p>
                    <p className="text-[0.8rem] text-gray-DEFAULT mt-0.5">{item.descricao}</p>
                  </div>
                </div>
                <span className="font-playfair text-[1.05rem] font-bold text-[var(--accent-light)] shrink-0">{item.preco}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isBebidas && (
        <div
          ref={gridRef}
          className="mt-8 grid gap-6 reveal"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(10px)' : 'translateY(0)',
            transition: 'opacity 0.25s, transform 0.25s',
            transitionDelay: '0.08s',
          }}
        >
          {items.map(item => (
            <div
              key={item.id}
              className="group bg-[#171717] border border-[#404040] rounded-[26px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            >
              <div className="relative aspect-[3/2] overflow-hidden bg-bg2">
                <Image
                  src={item.imagem!}
                  alt={item.nome}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(18,18,18,0.38)] to-transparent" />
                {item.tag && (
                  <div className="absolute top-3 left-3 bg-[rgba(18,18,18,0.82)] backdrop-blur-sm border border-white/10 rounded-full px-3 py-1">
                    <span className="text-[0.6rem] font-semibold tracking-[0.1em] uppercase text-gray-DEFAULT">{item.tag}</span>
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-playfair text-[1.15rem] font-semibold leading-tight">{item.nome}</h3>
                <p className="mt-2 text-[0.84rem] text-gray-DEFAULT leading-[1.7]">{item.descricao}</p>
                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="font-playfair text-[1.15rem] font-bold text-accent">{item.preco}</span>
                  <span className="text-[0.65rem] font-semibold tracking-[0.08em] uppercase text-gray-dark">
                    {activeCategory === 'entradas' ? 'Entrada' : activeCategory === 'pratos' ? 'Principal' : 'Sobremesa'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
