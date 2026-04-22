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
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) }
      }),
      { threshold: 0.1 }
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleCategory = (cat: CategoriaCardapio) => {
    if (cat === activeCategory) return
    setAnimating(true)
    setTimeout(() => {
      setActiveCategory(cat)
      setAnimating(false)
    }, 200)
  }

  const items = cardapio.filter(item => item.categoria === activeCategory)
  const isBebidas = activeCategory === 'bebidas'

  return (
    <section id="cardapio" ref={sectionRef} className="section-pad bg-bg2">
      <div className="reveal">
        <div className="section-tag">Cardápio</div>
        <h2 className="font-playfair font-black tracking-[-0.02em] leading-[1.1]"
          style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}>
          Sabores que<br /><em className="italic text-accent">contam histórias</em>
        </h2>
      </div>

      {/* Category tabs */}
      <div className="reveal mt-8 border-b border-white/[0.07] flex flex-wrap" style={{ transitionDelay: '0.05s' }}>
        {categorias.map(cat => (
          <button
            key={cat.key}
            onClick={() => handleCategory(cat.key as CategoriaCardapio)}
            className={`
              px-5 py-3 text-[0.72rem] font-semibold tracking-[0.1em] uppercase
              border-b-2 -mb-px transition-all duration-200
              ${activeCategory === cat.key
                ? 'text-accent border-accent'
                : 'text-gray-DEFAULT border-transparent hover:text-white'
              }
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Bebidas: compact list layout ── */}
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
            {items.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors duration-200 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-base">
                      {item.id === 'caipirinha' ? '🍋' :
                       item.id === 'mojito' ? '🌿' :
                       item.id === 'sex-on-the-beach' ? '🍹' :
                       item.id === 'agua' ? '💧' :
                       item.id === 'refrigerante' ? '🥤' :
                       '🍺'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[0.9rem] font-semibold text-white font-playfair">{item.nome}</p>
                    <p className="text-[0.78rem] text-gray-DEFAULT mt-0.5">{item.descricao}</p>
                  </div>
                </div>
                <span className="font-playfair text-[1.05rem] font-bold text-accent shrink-0">{item.preco}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Other categories: card grid ── */}
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
              className="group bg-bg3 border border-white/[0.07] rounded overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent/25 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
            >
              {/* Image */}
              <div className="relative aspect-[3/2] overflow-hidden bg-bg2">
                <Image
                  src={item.imagem!}
                  alt={item.nome}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Tag */}
                {item.tag && (
                  <div className="absolute top-3 left-3 bg-bg/80 backdrop-blur-sm border border-white/10 rounded px-2.5 py-1">
                    <span className="text-[0.6rem] font-semibold tracking-[0.1em] uppercase text-gray-DEFAULT">{item.tag}</span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="font-playfair text-[1.1rem] font-semibold leading-tight">{item.nome}</h3>
                <p className="mt-2 text-[0.82rem] text-gray-DEFAULT leading-[1.6]">{item.descricao}</p>
                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="font-playfair text-[1.15rem] font-bold text-accent">{item.preco}</span>
                  <span className="text-[0.65rem] font-semibold tracking-[0.08em] uppercase text-gray-dark">
                    {activeCategory === 'entradas' ? 'Entrada' :
                     activeCategory === 'pratos' ? 'Prato Principal' : 'Sobremesa'}
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
