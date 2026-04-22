'use client'

import { useState, useEffect, useRef } from 'react'
import { mesas, balcaoLugares, horarios, TAXA_RESERVA_CENTAVOS } from '@/app/lib/data'
import { formatarReais, formatarDataBR, dataMinReserva } from '@/app/lib/utils'
import type { ReservaPayload } from '@/app/lib/types'

type Tipo = 'mesa' | 'balcao'
type Status = 'idle' | 'loading' | 'success' | 'error'

interface FormState {
  nome: string
  email: string
  telefone: string
  pessoas: number
  data: string
  horario: string
}

// Simulated occupied seats (in production, fetch from DB)
const OCUPADOS_MESA = [3] // Mesa 3 está ocupada
const OCUPADOS_BALCAO = ['B2']

export default function Reservas() {
  const sectionRef = useRef<HTMLElement>(null)
  const [tipo, setTipo] = useState<Tipo>('mesa')
  const [selectedId, setSelectedId] = useState<number | string | null>(null)
  const [form, setForm] = useState<FormState>({
    nome: '', email: '', telefone: '', pessoas: 1, data: '', horario: '',
  })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [reservaId, setReservaId] = useState('')

  // Reveal on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) } }),
      { threshold: 0.1 }
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Reset selection when tipo changes
  const handleTipo = (t: Tipo) => {
    setTipo(t)
    setSelectedId(null)
    setErrorMsg('')
  }

  // Mesa capacity check
  const getMesaStatus = (mesaId: number) => {
    if (OCUPADOS_MESA.includes(mesaId)) return 'ocupado'
    const mesa = mesas.find(m => m.id === mesaId)!
    if (form.pessoas > mesa.capacidade) return 'incompativel'
    return 'disponivel'
  }

  const getBalcaoStatus = (id: string) => {
    if (OCUPADOS_BALCAO.includes(id)) return 'ocupado'
    return 'disponivel'
  }

  const handleSelectMesa = (id: number) => {
    const s = getMesaStatus(id)
    if (s === 'ocupado') return
    if (s === 'incompativel') {
      setErrorMsg(`Esta mesa comporta ${mesas.find(m => m.id === id)?.capacidade} pessoa(s). Aumente a capacidade ou escolha outra mesa.`)
      return
    }
    setSelectedId(id)
    setErrorMsg('')
  }

  const handleSelectBalcao = (id: string) => {
    if (getBalcaoStatus(id) === 'ocupado') return
    setSelectedId(id)
    setErrorMsg('')
  }

  const handleField = (field: keyof FormState, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (field === 'pessoas') {
      setSelectedId(null) // reset on people change
      setErrorMsg('')
    }
  }

  const getMesaLabel = () => {
    if (!selectedId) return ''
    if (tipo === 'mesa') return `Mesa ${selectedId}`
    return `Balcão ${String(selectedId).replace('B', '')}`
  }

  const getCapacidade = () => {
    if (!selectedId) return 0
    if (tipo === 'mesa') return mesas.find(m => m.id === selectedId)?.capacidade ?? 0
    return 1
  }

  const handleSubmit = async () => {
    // Client-side validation
    if (!form.nome.trim()) { setErrorMsg('Informe seu nome.'); return }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrorMsg('Informe um email válido.'); return
    }
    if (!form.data) { setErrorMsg('Selecione a data.'); return }
    if (!form.horario) { setErrorMsg('Selecione o horário.'); return }
    if (!selectedId) { setErrorMsg('Selecione uma mesa ou assento.'); return }

    setStatus('loading')
    setErrorMsg('')

    const payload: ReservaPayload = {
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      pessoas: form.pessoas,
      data: form.data,
      horario: form.horario,
      tipo,
      mesaId: selectedId,
      mesaLabel: getMesaLabel(),
      capacidade: getCapacidade(),
    }

    try {
      const res = await fetch('/api/reserva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao confirmar reserva.')
      }

      setReservaId(data.reservaId)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <section id="reservas" className="section-pad bg-bg">
        <div className="max-w-[720px] mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/30 mb-6">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="section-tag justify-center">Reserva Confirmada</div>
          <h2 className="font-playfair font-black text-[clamp(2rem,5vw,3.2rem)] tracking-[-0.02em] mt-2">
            Até <em className="italic text-accent">breve</em>, {form.nome.split(' ')[0]}!
          </h2>
          <p className="mt-4 text-gray-DEFAULT leading-relaxed">
            Sua reserva foi confirmada. Um email de confirmação foi enviado para <strong className="text-white">{form.email}</strong>.
          </p>
          <div className="mt-8 bg-bg3 border border-white/[0.07] rounded p-6 text-left inline-block min-w-[320px]">
            <p className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-accent mb-4">Resumo da Reserva</p>
            {[
              ['ID', `#${reservaId}`],
              ['Data', formatarDataBR(form.data)],
              ['Horário', form.horario],
              ['Local', getMesaLabel()],
              ['Pessoas', String(form.pessoas)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-8 py-2 border-b border-white/[0.05] last:border-0">
                <span className="text-[0.8rem] text-gray-DEFAULT">{k}</span>
                <span className="text-[0.8rem] text-white font-medium">{v}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => { setStatus('idle'); setSelectedId(null); setForm({ nome:'', email:'', telefone:'', pessoas:1, data:'', horario:'' }) }}
            className="btn-outline mt-8 mx-auto"
          >
            Nova Reserva
          </button>
        </div>
      </section>
    )
  }

  return (
    <section id="reservas" ref={sectionRef} className="section-pad bg-bg">
      <div className="max-w-[900px] mx-auto">
        <div className="reveal">
          <div className="section-tag">Reservas</div>
          <h2 className="font-playfair font-black tracking-[-0.02em] leading-[1.1]"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}>
            Reserve sua<br /><em className="italic text-accent">experiência</em>
          </h2>
          <p className="mt-4 text-gray-DEFAULT text-[0.9rem] leading-relaxed max-w-[520px]">
            Taxa de reserva: <strong className="text-white">{formatarReais(TAXA_RESERVA_CENTAVOS)}</strong> — debitada do consumo no bar.
          </p>
        </div>

        <div className="reveal mt-10" style={{ transitionDelay: '0.1s' }}>
          <div className="bg-bg3 border border-white/[0.07] rounded p-8">

            {/* Dados pessoais */}
            <p className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-accent mb-4">Seus Dados</p>
            <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <div className="flex flex-col gap-2">
                <label className="text-[0.68rem] font-semibold tracking-[0.12em] uppercase text-gray-DEFAULT">Nome completo *</label>
                <input
                  type="text" placeholder="Seu nome"
                  value={form.nome} onChange={e => handleField('nome', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[0.68rem] font-semibold tracking-[0.12em] uppercase text-gray-DEFAULT">Email *</label>
                <input
                  type="email" placeholder="seu@email.com"
                  value={form.email} onChange={e => handleField('email', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[0.68rem] font-semibold tracking-[0.12em] uppercase text-gray-DEFAULT">Telefone</label>
                <input
                  type="tel" placeholder="(71) 9 0000-0000"
                  value={form.telefone} onChange={e => handleField('telefone', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Detalhes da reserva */}
            <p className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-accent mb-4">Detalhes</p>
            <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <div className="flex flex-col gap-2">
                <label className="text-[0.68rem] font-semibold tracking-[0.12em] uppercase text-gray-DEFAULT">Data *</label>
                <input
                  type="date" min={dataMinReserva()}
                  value={form.data} onChange={e => handleField('data', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[0.68rem] font-semibold tracking-[0.12em] uppercase text-gray-DEFAULT">Horário *</label>
                <select
                  value={form.horario} onChange={e => handleField('horario', e.target.value)}
                  className="form-select"
                >
                  <option value="">Selecione</option>
                  {horarios.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[0.68rem] font-semibold tracking-[0.12em] uppercase text-gray-DEFAULT">Pessoas *</label>
                <select
                  value={form.pessoas}
                  onChange={e => handleField('pessoas', Number(e.target.value))}
                  className="form-select"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n} pessoa{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tipo toggle */}
            <p className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-accent mb-4">Local</p>
            <div className="flex border border-white/[0.07] rounded overflow-hidden w-fit mb-6">
              {(['mesa', 'balcao'] as Tipo[]).map(t => (
                <button
                  key={t}
                  onClick={() => handleTipo(t)}
                  className={`px-6 py-2.5 text-[0.72rem] font-semibold tracking-[0.1em] uppercase transition-all duration-200 ${
                    tipo === t ? 'bg-accent text-bg' : 'text-gray-DEFAULT hover:text-white'
                  }`}
                >
                  {t === 'mesa' ? 'Mesas' : 'Balcão'}
                </button>
              ))}
            </div>

            {/* Mesas grid */}
            {tipo === 'mesa' && (
              <div>
                <p className="text-[0.65rem] text-gray-DEFAULT uppercase tracking-[0.1em] mb-3">
                  Mesas compatíveis para <strong className="text-white">{form.pessoas}</strong> pessoa(s) aparecem em destaque
                </p>
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
                  {mesas.map(mesa => {
                    const s = getMesaStatus(mesa.id)
                    const isSel = selectedId === mesa.id
                    return (
                      <button
                        key={mesa.id}
                        onClick={() => handleSelectMesa(mesa.id)}
                        disabled={s === 'ocupado'}
                        className={`
                          relative flex flex-col items-center gap-1 py-4 px-3 rounded border text-center
                          transition-all duration-200
                          ${isSel ? 'border-accent bg-accent/10' : ''}
                          ${s === 'disponivel' && !isSel ? 'border-emerald-500/30 bg-white/[0.02] hover:border-accent/40 hover:bg-accent/5 cursor-pointer' : ''}
                          ${s === 'incompativel' ? 'border-white/[0.05] bg-white/[0.01] opacity-40 cursor-not-allowed' : ''}
                          ${s === 'ocupado' ? 'border-white/[0.05] opacity-30 cursor-not-allowed' : ''}
                        `}
                      >
                        <span className="text-xl">🪑</span>
                        <span className={`text-[0.72rem] font-semibold ${isSel ? 'text-accent' : 'text-gray-DEFAULT'}`}>
                          Mesa {mesa.id}
                        </span>
                        <span className={`text-[0.6rem] font-medium ${
                          isSel ? 'text-accent' :
                          s === 'disponivel' ? 'text-emerald-400' :
                          s === 'ocupado' ? 'text-gray-dark' : 'text-gray-dark'
                        }`}>
                          {s === 'ocupado' ? 'Ocupada' : isSel ? 'Selecionada' : `${mesa.capacidade} lug.`}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Balcão grid */}
            {tipo === 'balcao' && (
              <div>
                <p className="text-[0.65rem] text-gray-DEFAULT uppercase tracking-[0.1em] mb-3">
                  {balcaoLugares.length} assentos individuais disponíveis
                </p>
                <div className="flex gap-3 flex-wrap">
                  {balcaoLugares.map(lugar => {
                    const s = getBalcaoStatus(lugar.id)
                    const isSel = selectedId === lugar.id
                    return (
                      <button
                        key={lugar.id}
                        onClick={() => handleSelectBalcao(lugar.id)}
                        disabled={s === 'ocupado'}
                        className={`
                          flex flex-col items-center gap-1 py-4 px-5 rounded border
                          transition-all duration-200
                          ${isSel ? 'border-accent bg-accent/10' : ''}
                          ${s === 'disponivel' && !isSel ? 'border-emerald-500/30 bg-white/[0.02] hover:border-accent/40 cursor-pointer' : ''}
                          ${s === 'ocupado' ? 'border-white/[0.05] opacity-30 cursor-not-allowed' : ''}
                        `}
                      >
                        <span className="text-xl">🍺</span>
                        <span className={`text-[0.72rem] font-semibold ${isSel ? 'text-accent' : 'text-gray-DEFAULT'}`}>
                          {lugar.label}
                        </span>
                        <span className={`text-[0.6rem] ${
                          isSel ? 'text-accent' :
                          s === 'disponivel' ? 'text-emerald-400' : 'text-gray-dark'
                        }`}>
                          {s === 'ocupado' ? 'Ocupado' : isSel ? 'Selecionado' : 'Disponível'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Error message */}
            {errorMsg && (
              <div className="mt-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded p-4">
                <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-[0.85rem] text-red-300">{errorMsg}</p>
              </div>
            )}

            {/* Confirm row */}
            <div className="mt-8 pt-6 border-t border-white/[0.07] flex items-center justify-between gap-4 flex-wrap">
              <div className="text-[0.82rem] text-gray-DEFAULT">
                {selectedId && form.data && form.horario ? (
                  <>
                    <strong className="text-white">{getMesaLabel()}</strong>
                    {' · '}{formatarDataBR(form.data)} às {form.horario}
                    {' · '}{form.pessoas} pessoa(s)
                  </>
                ) : (
                  <span>Preencha todos os campos para continuar</span>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={status === 'loading'}
                className="btn-primary"
              >
                {status === 'loading' ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Confirmando...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Confirmar Reserva
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
