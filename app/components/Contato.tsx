'use client'

import { useEffect, useRef } from 'react'
import { negocio } from '@/app/lib/data'

export default function Contato() {
  const sectionRef = useRef<HTMLElement>(null)

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

  const infoItems = [
    {
      icon: '📍',
      title: 'Endereço',
      content: (
        <p className="text-[0.9rem] text-gray-DEFAULT leading-[1.7]">
          {negocio.endereco.rua}<br />
          {negocio.endereco.bairro} — {negocio.endereco.cidade}/{negocio.endereco.estado}
        </p>
      ),
    },
    {
      icon: '📞',
      title: 'Contato',
      content: (
        <div className="space-y-2">
          <p className="text-[0.9rem] text-gray-DEFAULT">{negocio.telefone}</p>
          <a
            href={`https://wa.me/${negocio.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white text-[0.78rem] font-semibold px-4 py-2 rounded transition-all duration-200 hover:-translate-y-0.5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chamar no WhatsApp
          </a>
        </div>
      ),
    },
    {
      icon: '✉️',
      title: 'Email',
      content: (
        <a
          href={`mailto:${negocio.email}`}
          className="text-[0.9rem] text-gray-DEFAULT hover:text-accent transition-colors"
        >
          {negocio.email}
        </a>
      ),
    },
    {
      icon: '🕐',
      title: 'Horários',
      content: (
        <div className="space-y-1">
          {Object.entries(negocio.horarios).map(([day, hours]) => (
            <div key={day} className="flex justify-between gap-6">
              <span className="text-[0.82rem] text-gray-DEFAULT">{day}</span>
              <span className={`text-[0.82rem] font-medium ${hours === 'Fechado' ? 'text-gray-dark' : 'text-white'}`}>
                {hours}
              </span>
            </div>
          ))}
        </div>
      ),
    },
  ]

  return (
    <section id="contato" ref={sectionRef} className="section-pad bg-bg2">
      <div className="reveal">
        <div className="section-tag">Contato</div>
        <h2 className="font-playfair font-black tracking-[-0.02em] leading-[1.1]"
          style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}>
          Venha nos <em className="italic text-accent">visitar</em>
        </h2>
      </div>

      <div
        className="mt-12 grid gap-10"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
      >
        {/* Info */}
        <div className="reveal space-y-7" style={{ transitionDelay: '0.1s' }}>
          {infoItems.map(item => (
            <div key={item.title} className="flex gap-4 items-start">
              <div className="w-11 h-11 shrink-0 bg-accent/[0.08] border border-accent/20 rounded flex items-center justify-center text-lg">
                {item.icon}
              </div>
              <div>
                <p className="text-[0.65rem] font-semibold tracking-[0.14em] uppercase text-accent mb-1.5">{item.title}</p>
                {item.content}
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div
          className="reveal rounded border border-white/[0.07] overflow-hidden"
          style={{ transitionDelay: '0.2s', minHeight: '380px' }}
        >
          <iframe
            src={negocio.mapsEmbed}
            width="100%"
            height="100%"
            style={{
              border: 0,
              filter: 'grayscale(1) invert(0.9) contrast(0.85) brightness(0.8)',
              minHeight: '380px',
              display: 'block',
            }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização Bar do Bruce — Pelourinho, Salvador"
          />
        </div>
      </div>
    </section>
  )
}
