'use client'

import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import { balcao, balcaoLugares, mesas, horarios, TAXA_RESERVA_CENTAVOS, negocio } from '@/app/lib/data'
import { dataMinReserva, formatarReais, formatarTempoRestante } from '@/app/lib/utils'
import type { PagamentoResponse, ReservaPayload, ReservaResponse, ReservaResumo } from '@/app/lib/types'

type Tipo = 'mesa' | 'balcao'
type Etapa = 'dados' | 'pagamento' | 'comprovante'
type MesaStatus = 'disponivel' | 'incompativel' | 'selecionado'

interface FormState {
  nome: string
  email: string
  telefone: string
  pessoas: number
  data: string
  horario: string
}

interface PixState {
  pixKey: string
  barcodeValue: string
  expiresAt: string
}

const ETAPAS: Array<{ key: Etapa; label: string }> = [
  { key: 'dados', label: 'Dados da reserva' },
  { key: 'pagamento', label: 'Pagamento Pix' },
  { key: 'comprovante', label: 'Comprovante' },
]

const BUBBLES = Array.from({ length: 12 }, (_, index) => index)

function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function baixarComprovantePdf(reserva: ReservaResumo) {
  const linhas = [
    'BAR DO BRUCE',
    'COMPROVANTE DE RESERVA',
    '',
    `Reserva: ${reserva.reservaId}`,
    `Nome: ${reserva.nome}`,
    `Telefone: ${reserva.telefone || '-'}`,
    `Mesa: ${reserva.mesa}`,
    `Pessoas: ${reserva.pessoas}`,
    `Data: ${reserva.data}`,
    `Horario: ${reserva.horario}`,
    `Valor pago: ${reserva.valorPago}`,
    '',
    'Ao chegar no estabelecimento, apresente-se no balcao para confirmar sua reserva.',
    'Sua reserva conta com tolerancia maxima de 15 minutos.',
    'Apos esse periodo, ela podera ser cancelada automaticamente.',
    `Contato: https://wa.me/${negocio.whatsapp}`,
  ]

  let cursorY = 760
  const operacoes = ['BT', '/F1 14 Tf', '50 800 Td', `(${escapePdfText('Bar do Bruce - Reserva')}) Tj`, 'ET']

  for (const linha of linhas) {
    operacoes.push('BT')
    operacoes.push('/F1 11 Tf')
    operacoes.push(`50 ${cursorY} Td`)
    operacoes.push(`(${escapePdfText(linha)}) Tj`)
    operacoes.push('ET')
    cursorY -= 24
  }

  const stream = operacoes.join('\n')
  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${stream.length} >>
stream
${stream}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000063 00000 n 
0000000122 00000 n 
0000000248 00000 n 
0000000318 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${318 + stream.length + 35}
%%EOF`

  const blob = new Blob([pdf], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${reserva.reservaId.toLowerCase()}-comprovante.pdf`
  link.click()
  URL.revokeObjectURL(url)
}

export default function Reservas() {
  const sectionRef = useRef<HTMLElement>(null)
  const [tipo, setTipo] = useState<Tipo>('mesa')
  const [selectedId, setSelectedId] = useState<number | 'balcao' | null>(null)
  const [etapa, setEtapa] = useState<Etapa>('dados')
  const [form, setForm] = useState<FormState>({
    nome: '',
    email: '',
    telefone: '',
    pessoas: 2,
    data: '',
    horario: '',
  })
  const [erro, setErro] = useState('')
  const [copied, setCopied] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [confirmingPayment, setConfirmingPayment] = useState(false)
  const [reserva, setReserva] = useState<ReservaResumo | null>(null)
  const [pixState, setPixState] = useState<PixState | null>(null)
  const [tempoRestante, setTempoRestante] = useState(10 * 60)
  const [showBubbles, setShowBubbles] = useState(false)

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
      { threshold: 0.1 }
    )

    sectionRef.current?.querySelectorAll('.reveal').forEach(element => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (etapa !== 'pagamento' || !pixState?.expiresAt) return

    const timer = window.setInterval(() => {
      const restante = Math.max(0, Math.floor((new Date(pixState.expiresAt).getTime() - Date.now()) / 1000))
      setTempoRestante(restante)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [etapa, pixState?.expiresAt])

  useEffect(() => {
    if (!copied) return

    const timer = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  const getMesaStatus = (mesaId: number): MesaStatus => {
    if (selectedId === mesaId) return 'selecionado'

    const mesa = mesas.find(item => item.id === mesaId)
    if (!mesa || form.pessoas > mesa.capacidade) return 'incompativel'

    return 'disponivel'
  }

  const getBalcaoStatus = (): MesaStatus => {
    if (selectedId === 'balcao') return 'selecionado'
    if (form.pessoas > balcao.lugares) return 'incompativel'
    return 'disponivel'
  }

  const getMesaLabel = () => {
    if (tipo === 'balcao') return 'Balcão'
    return selectedId ? `Mesa ${selectedId}` : ''
  }

  const handleField = (field: keyof FormState, value: string | number) => {
    setErro('')

    if (field === 'pessoas') {
      const pessoas = Math.min(4, Math.max(1, Number(value)))
      setForm(prev => ({ ...prev, pessoas }))

      if (typeof selectedId === 'number') {
        const mesa = mesas.find(item => item.id === selectedId)
        if (!mesa || pessoas > mesa.capacidade) {
          setSelectedId(null)
        }
      }

      if (selectedId === 'balcao' && pessoas > balcao.lugares) {
        setSelectedId(null)
      }
      return
    }

    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleTipo = (nextTipo: Tipo) => {
    setTipo(nextTipo)
    setSelectedId(null)
    setErro('')
  }

  const selecionarMesa = (mesaId: number) => {
    const mesa = mesas.find(item => item.id === mesaId)
    if (!mesa || form.pessoas > mesa.capacidade) {
      setErro(`Mesa ${mesaId} comporta ${mesa?.capacidade || 0} pessoa(s). Escolha uma mesa compatível.`)
      return
    }

    setSelectedId(mesaId)
    setErro('')
  }

  const selecionarBalcao = () => {
    if (form.pessoas > balcao.lugares) {
      setErro(`O balcão atende até ${balcao.lugares} pessoa(s) por reserva.`)
      return
    }

    setSelectedId('balcao')
    setErro('')
  }

  const validarFormulario = () => {
    if (!form.nome.trim()) return 'Informe seu nome.'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Informe um email válido.'
    if (!form.telefone.trim()) return 'Informe seu telefone.'
    if (!form.data) return 'Selecione a data da reserva.'
    if (!form.horario) return 'Selecione o horário da reserva.'
    if (!selectedId) return 'Selecione uma mesa ou o balcão para continuar.'
    return ''
  }

  const criarPreReserva = async () => {
    const validacao = validarFormulario()
    if (validacao) {
      setErro(validacao)
      return
    }

    setProcessing(true)
    setErro('')

    try {
      const payload: ReservaPayload = {
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        pessoas: form.pessoas,
        data: form.data,
        horario: form.horario,
        tipo,
        mesaId: tipo === 'mesa' ? Number(selectedId) : 'balcao',
        mesaLabel: tipo === 'mesa' ? `Mesa ${selectedId}` : 'Balcão',
        capacidade: tipo === 'mesa' ? mesas.find(item => item.id === selectedId)?.capacidade || 0 : balcao.lugares,
      }

      const reservaResponse = await fetch('/api/reserva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const reservaData: ReservaResponse = await reservaResponse.json()

      if (!reservaResponse.ok || !reservaData.success || !reservaData.reserva) {
        throw new Error(reservaData.error || 'Não foi possível criar a pré-reserva.')
      }

      setReserva(reservaData.reserva)

      const pagamentoResponse = await fetch('/api/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          reservaId: reservaData.reserva.reservaId,
          nome: reservaData.reserva.nome,
          email: reservaData.reserva.email,
          telefone: reservaData.reserva.telefone,
          data: reservaData.reserva.data,
          horario: reservaData.reserva.horario,
          mesa: reservaData.reserva.mesa,
          pessoas: reservaData.reserva.pessoas,
          tipo: reservaData.reserva.tipo,
        }),
      })
      const pagamentoData: PagamentoResponse = await pagamentoResponse.json()

      if (!pagamentoResponse.ok || !pagamentoData.success || !pagamentoData.pixKey || !pagamentoData.barcodeValue || !pagamentoData.expiresAt) {
        throw new Error(pagamentoData.error || 'Não foi possível gerar o pagamento Pix.')
      }

      setPixState({
        pixKey: pagamentoData.pixKey,
        barcodeValue: pagamentoData.barcodeValue,
        expiresAt: pagamentoData.expiresAt,
      })
      setTempoRestante(10 * 60)
      setEtapa('pagamento')
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao preparar a reserva.')
    } finally {
      setProcessing(false)
    }
  }

  const confirmarPagamento = async () => {
    if (!reserva) return
    if (tempoRestante <= 0) {
      setErro('O tempo do Pix expirou. Volte e gere uma nova cobrança.')
      return
    }

    setConfirmingPayment(true)
    setErro('')

    try {
      const response = await fetch('/api/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm',
          reservaId: reserva.reservaId,
          nome: reserva.nome,
          email: reserva.email,
          telefone: reserva.telefone,
          data: reserva.data,
          horario: reserva.horario,
          mesa: reserva.mesa,
          pessoas: reserva.pessoas,
          tipo: reserva.tipo,
        }),
      })
      const data: PagamentoResponse = await response.json()

      if (!response.ok || !data.success || !data.reserva) {
        throw new Error(data.error || 'Não foi possível confirmar o pagamento.')
      }

      setReserva(data.reserva)
      setEtapa('comprovante')
      setShowBubbles(true)
      window.setTimeout(() => setShowBubbles(false), 2200)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao confirmar pagamento.')
    } finally {
      setConfirmingPayment(false)
    }
  }

  const copiarPix = async () => {
    if (!pixState?.pixKey) return

    try {
      await navigator.clipboard.writeText(pixState.pixKey)
      setCopied(true)
    } catch {
      setErro('Não foi possível copiar a chave Pix neste navegador.')
    }
  }

  const reiniciarFluxo = () => {
    setEtapa('dados')
    setSelectedId(null)
    setReserva(null)
    setPixState(null)
    setErro('')
    setCopied(false)
    setTempoRestante(10 * 60)
    setForm({
      nome: '',
      email: '',
      telefone: '',
      pessoas: 2,
      data: '',
      horario: '',
    })
  }

  const whatsappLink = `https://wa.me/${negocio.whatsapp}?text=${encodeURIComponent(
    reserva ? `Olá! Preciso de ajuda com a reserva ${reserva.reservaId}.` : 'Olá! Gostaria de ajuda com uma reserva.'
  )}`

  return (
    <section id="reservas" ref={sectionRef} className="section-pad bg-bg reservas-shell">
      <div className="max-w-[1120px] mx-auto">
        <div className="reveal flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="section-tag">Reservas</div>
            <p className="font-script text-[clamp(1.9rem,4vw,3.4rem)] text-[var(--accent-light)] leading-none">
              Experiência de abertura
            </p>
            <h2 className="mt-3 font-playfair font-black tracking-[-0.03em] leading-[1.04]" style={{ fontSize: 'clamp(2.3rem, 5vw, 4.2rem)' }}>
              Reserve sua mesa com
              <br />
              <em className="not-italic text-accent">pagamento via Pix</em>
            </h2>
            <p className="mt-4 max-w-[620px] text-gray-DEFAULT text-[0.96rem] leading-[1.9]">
              Taxa de reserva: <strong className="text-white">{formatarReais(TAXA_RESERVA_CENTAVOS)}</strong>.
              Esse valor será totalmente revertido em consumo. Mesas disponíveis para até 4 pessoas.
            </p>
          </div>

          <div className="min-w-[260px] rounded-[28px] border border-[#404040] bg-[#181818] px-5 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-accent">Estados visuais</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[0.72rem]">
              <span className="rounded-full border border-[#5a5a5a] bg-[#242424] px-3 py-1 text-white">Disponível</span>
              <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-accent">Selecionado</span>
              <span className="rounded-full border border-[#404040] bg-[#1b1b1b] px-3 py-1 text-gray-DEFAULT">Incompatível</span>
            </div>
          </div>
        </div>

        <div className="reveal mt-10" style={{ transitionDelay: '0.08s' }}>
          <div className="rounded-[34px] border border-[#404040] bg-[radial-gradient(circle_at_top,rgba(166,139,91,0.08),transparent_32%),linear-gradient(180deg,rgba(24,24,24,0.98),rgba(18,18,18,1))] p-6 md:p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
            <div className="flex flex-wrap gap-3">
              {ETAPAS.map((item, index) => {
                const isActive = item.key === etapa
                const isDone = ETAPAS.findIndex(step => step.key === etapa) > index

                return (
                  <div
                    key={item.key}
                    className={`min-w-[180px] flex-1 rounded-[22px] border px-4 py-3 transition-all duration-300 ${
                      isActive
                        ? 'border-accent/40 bg-accent/10'
                        : isDone
                          ? 'border-[rgba(197,166,111,0.22)] bg-[rgba(197,166,111,0.06)]'
                          : 'border-[#404040] bg-[#181818]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full border text-[0.74rem] font-semibold ${
                          isActive
                            ? 'border-accent/40 text-accent'
                            : isDone
                              ? 'border-[rgba(197,166,111,0.22)] text-[var(--accent-light)]'
                              : 'border-[#404040] text-gray-DEFAULT'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gray-DEFAULT">Etapa</p>
                        <p className="text-[0.88rem] font-medium text-white">{item.label}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {etapa === 'dados' && (
              <div className="mt-8 grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="rounded-[28px] border border-[#404040] bg-[#181818] p-6 md:p-7">
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-accent">Dados da reserva</p>
                    <h3 className="mt-3 font-playfair text-[clamp(1.9rem,3vw,3rem)] leading-none">Preencha seus dados</h3>
                    <div className="mt-4 inline-flex rounded-full border border-[#404040] px-4 py-2 text-[0.78rem] text-gray-DEFAULT">
                      Atendimento com tolerância de 15 min
                    </div>
                  </div>

                  <div className="mt-6 mx-auto max-w-[420px] grid gap-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-[0.72rem] uppercase tracking-[0.16em] text-gray-DEFAULT">Nome</span>
                      <input
                        type="text"
                        value={form.nome}
                        onChange={event => handleField('nome', event.target.value)}
                        className="form-input"
                        placeholder="Seu nome completo"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-[0.72rem] uppercase tracking-[0.16em] text-gray-DEFAULT">Email</span>
                      <input
                        type="email"
                        value={form.email}
                        onChange={event => handleField('email', event.target.value)}
                        className="form-input"
                        placeholder="voce@email.com"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-[0.72rem] uppercase tracking-[0.16em] text-gray-DEFAULT">Telefone</span>
                      <input
                        type="tel"
                        value={form.telefone}
                        onChange={event => handleField('telefone', event.target.value)}
                        className="form-input"
                        placeholder="(71) 99999-9999"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-[0.72rem] uppercase tracking-[0.16em] text-gray-DEFAULT">Data</span>
                      <input
                        type="date"
                        min={dataMinReserva()}
                        value={form.data}
                        onChange={event => handleField('data', event.target.value)}
                        className="form-input"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-[0.72rem] uppercase tracking-[0.16em] text-gray-DEFAULT">Horário</span>
                      <select value={form.horario} onChange={event => handleField('horario', event.target.value)} className="form-select">
                        <option value="">Selecione</option>
                        {horarios.map(horario => (
                          <option key={horario} value={horario}>
                            {horario}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="flex flex-col gap-2">
                      <span className="text-[0.72rem] uppercase tracking-[0.16em] text-gray-DEFAULT">Pessoas</span>
                      <div className="rounded-[24px] border border-[#404040] bg-[#141414] p-3">
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => handleField('pessoas', form.pessoas - 1)}
                            className="h-11 w-11 rounded-[16px] border border-[#404040] bg-[#202020] text-[1.4rem] text-white transition hover:border-accent/40 hover:text-accent"
                          >
                            -
                          </button>
                          <div className="flex-1 rounded-[18px] bg-[#1b1b1b] px-4 py-3 text-center">
                            <div className="text-[1.45rem] font-semibold leading-none text-white">{form.pessoas}</div>
                            <div className="mt-1 text-[0.66rem] uppercase tracking-[0.16em] text-gray-DEFAULT">
                              {form.pessoas === 1 ? 'Pessoa' : 'Pessoas'}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleField('pessoas', form.pessoas + 1)}
                            className="h-11 w-11 rounded-[16px] border border-[#404040] bg-[#202020] text-[1.4rem] text-white transition hover:border-accent/40 hover:text-accent"
                          >
                            +
                          </button>
                        </div>
                        <p className="mt-3 text-[0.76rem] leading-relaxed text-gray-DEFAULT">
                          Reservas em mesa disponíveis para até 4 pessoas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#404040] bg-[#181818] p-6 md:p-7">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-accent">Escolha seu lugar</p>
                      <h3 className="mt-3 font-playfair text-[clamp(1.7rem,3vw,2.8rem)] leading-none">Mesa ou balcão</h3>
                    </div>
                    <div className="inline-flex rounded-full border border-[#404040] bg-[#141414] p-1">
                      {(['mesa', 'balcao'] as Tipo[]).map(item => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleTipo(item)}
                          className={`rounded-full px-4 py-2 text-[0.76rem] font-semibold uppercase tracking-[0.14em] transition ${
                            tipo === item ? 'bg-[linear-gradient(135deg,var(--accent-light),var(--accent-dark))] text-white' : 'text-gray-DEFAULT hover:text-white'
                          }`}
                        >
                          {item === 'mesa' ? 'Mesa' : 'Balcão'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {tipo === 'mesa' && (
                    <>
                      <p className="mt-6 text-[0.82rem] leading-relaxed text-gray-DEFAULT">
                        Todas as mesas aparecem disponíveis visualmente. As incompatíveis continuam bloqueadas pela capacidade.
                      </p>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {mesas.map(mesa => {
                          const status = getMesaStatus(mesa.id)
                          return (
                            <button
                              key={mesa.id}
                              type="button"
                              onClick={() => selecionarMesa(mesa.id)}
                              className={`mesa-card ${status === 'selecionado' ? 'mesa-card-selected' : status === 'disponivel' ? 'mesa-card-available' : 'mesa-card-incompatible'}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gray-DEFAULT">Mesa</p>
                                  <h4 className="mt-2 font-playfair text-2xl text-white">{mesa.id}</h4>
                                </div>
                                <span className="rounded-full border border-[#404040] px-3 py-1 text-[0.7rem] uppercase tracking-[0.12em] text-gray-DEFAULT">
                                  {mesa.capacidade} lugares
                                </span>
                              </div>

                              <div className="mt-6 flex items-center justify-between text-[0.78rem]">
                                <span className={`font-medium ${status === 'selecionado' ? 'text-white' : 'text-gray-DEFAULT'}`}>
                                  {status === 'selecionado' ? 'Selecionada' : status === 'incompativel' ? 'Capacidade insuficiente' : 'Disponível'}
                                </span>
                                <span className="text-gray-DEFAULT">
                                  {status === 'incompativel' ? 'Escolha outra' : `${mesa.capacidade} lugares`}
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}

                  {tipo === 'balcao' && (
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={selecionarBalcao}
                        className={`mesa-card w-full ${getBalcaoStatus() === 'selecionado' ? 'mesa-card-selected' : getBalcaoStatus() === 'disponivel' ? 'mesa-card-available' : 'mesa-card-incompatible'}`}
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gray-DEFAULT">Balcão</p>
                            <h4 className="mt-2 font-playfair text-2xl text-white">Experiência no balcão</h4>
                            <p className="mt-3 max-w-[420px] text-[0.84rem] leading-relaxed text-gray-DEFAULT">
                              Todos os assentos são exibidos como disponíveis nesta versão comparativa.
                            </p>
                          </div>
                          <span className="rounded-full border border-[#404040] px-3 py-1 text-[0.7rem] uppercase tracking-[0.12em] text-gray-DEFAULT">
                            até {balcao.lugares} pessoas
                          </span>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {balcaoLugares.map(lugar => (
                            <span key={lugar.id} className="rounded-full border border-[#505050] bg-[#242424] px-3 py-1 text-[0.72rem] text-white">
                              {lugar.label}
                            </span>
                          ))}
                        </div>
                      </button>
                    </div>
                  )}

                  {erro && (
                    <div className="mt-6 rounded-[22px] border border-red-400/25 bg-red-500/10 px-4 py-4 text-[0.86rem] leading-relaxed text-red-200">
                      {erro}
                    </div>
                  )}

                  <div className="mt-6 rounded-[24px] border border-[#404040] bg-[#141414] px-5 py-4">
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-accent">Resumo</p>
                    <div className="mt-4 grid gap-3 text-[0.84rem] text-gray-DEFAULT">
                      <div className="flex items-center justify-between gap-3">
                        <span>Local</span>
                        <strong className="text-white">{selectedId ? getMesaLabel() : 'Aguardando seleção'}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Pessoas</span>
                        <strong className="text-white">{form.pessoas}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Taxa</span>
                        <strong className="text-white">{formatarReais(TAXA_RESERVA_CENTAVOS)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col items-center justify-center gap-4">
                    <a href="#contato" className="btn-outline min-w-[270px] justify-center">
                      Entrar em contato
                    </a>
                    <button type="button" onClick={criarPreReserva} disabled={processing} className="btn-primary min-w-[270px] justify-center">
                      {processing ? 'Preparando Pix...' : 'Continuar para o Pix'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {etapa === 'pagamento' && reserva && pixState && (
              <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[30px] border border-[#404040] bg-[#181818] p-6 md:p-7">
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-accent">Etapa de pagamento</p>
                  <h3 className="mt-4 font-playfair text-[clamp(2rem,3vw,3rem)] leading-none">Finalize sua reserva via Pix</h3>
                  <p className="mt-4 text-[0.96rem] leading-[1.85] text-gray-DEFAULT">
                    Para garantir sua mesa, a reserva é confirmada somente após pagamento no valor de{' '}
                    <strong className="text-white">{reserva.valorPago}</strong>. Esse valor será revertido em consumo no dia da sua visita.
                  </p>

                  <div className="mt-6 rounded-[24px] border border-[rgba(166,139,91,0.22)] bg-[rgba(166,139,91,0.08)] px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[0.82rem] uppercase tracking-[0.14em] text-[var(--accent-light)]">
                        Tempo restante para pagamento
                      </span>
                      <strong className="font-playfair text-[2.2rem] leading-none text-white">
                        {formatarTempoRestante(tempoRestante)}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-gray-DEFAULT">Chave Pix</label>
                    <div className="mt-3 flex gap-3 flex-col sm:flex-row">
                      <input readOnly value={pixState.pixKey} className="form-input flex-1" />
                      <button type="button" onClick={copiarPix} className="btn-primary sm:min-w-[140px]">
                        Copiar
                      </button>
                    </div>
                    {copied && <p className="mt-3 text-[0.78rem] text-accent">Chave Pix copiada com sucesso.</p>}
                  </div>

                  <div className="mt-6 rounded-[24px] border border-[#404040] bg-[#141414] px-5 py-5">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-[0.7rem] uppercase tracking-[0.16em] text-gray-DEFAULT">Código da reserva</p>
                        <h4 className="mt-2 font-playfair text-2xl text-white">{reserva.reservaId}</h4>
                      </div>
                      <div className="rounded-full border border-[#404040] px-4 py-2 text-[0.76rem] text-gray-DEFAULT">
                        {reserva.mesa} • {reserva.pessoas} pessoa(s)
                      </div>
                    </div>

                    <div
                      className="mt-5 h-[88px] rounded-[18px] border border-[#404040] bg-white"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(90deg,#111 0 3px,transparent 3px 6px,#111 6px 10px,transparent 10px 12px)',
                        backgroundSize: '100% 100%',
                      }}
                      aria-hidden="true"
                    />
                    <p className="mt-3 text-[0.78rem] break-all text-gray-DEFAULT">{pixState.barcodeValue}</p>
                  </div>

                  {erro && (
                    <div className="mt-6 rounded-[22px] border border-red-400/25 bg-red-500/10 px-4 py-4 text-[0.86rem] leading-relaxed text-red-200">
                      {erro}
                    </div>
                  )}

                  <div className="mt-8 flex flex-col gap-3">
                    <button type="button" onClick={confirmarPagamento} disabled={confirmingPayment || tempoRestante <= 0} className="btn-primary w-full justify-center">
                      {confirmingPayment ? 'Confirmando pagamento...' : 'Já paguei, ver comprovante'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEtapa('dados')}
                      className="text-center text-[0.92rem] text-gray-DEFAULT underline underline-offset-4 transition hover:text-white"
                    >
                      Voltar e editar dados
                    </button>
                  </div>
                </div>

                <div className="rounded-[30px] border border-[#404040] bg-[linear-gradient(180deg,rgba(36,36,36,0.65),rgba(20,20,20,0.95))] p-6 md:p-7">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-accent">Prévia da reserva</p>
                      <h3 className="mt-4 font-playfair text-[clamp(2rem,3vw,3rem)] leading-none">Bar do Bruce</h3>
                    </div>
                    <div className="rounded-full border border-[#404040] px-4 py-2 text-[0.76rem] uppercase tracking-[0.12em] text-gray-DEFAULT">
                      Um brinde ao agora
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {[
                      ['Nome', reserva.nome],
                      ['Telefone', reserva.telefone || '-'],
                      ['Pessoas', String(reserva.pessoas)],
                      ['Mesa', reserva.mesa],
                      ['Data', reserva.data],
                      ['Horário', reserva.horario],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[22px] border border-[#404040] bg-[#181818] px-4 py-4">
                        <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gray-DEFAULT">{label}</p>
                        <p className="mt-2 text-[1rem] text-white">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-[24px] border border-[#404040] bg-[#141414] px-5 py-5">
                    <p className="text-[0.72rem] uppercase tracking-[0.16em] text-accent">Importante</p>
                    <p className="mt-3 text-[0.9rem] leading-[1.8] text-gray-DEFAULT">
                      Ao chegar no estabelecimento, apresente-se no balcão para confirmar sua reserva.
                      O sistema considera tolerância máxima de 15 minutos após o horário agendado.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {etapa === 'comprovante' && reserva && (
              <div className="mt-8 relative overflow-hidden rounded-[34px] border border-[#404040] bg-[linear-gradient(180deg,rgba(24,24,24,0.98),rgba(18,18,18,1))]">
                {showBubbles && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {BUBBLES.map(item => (
                      <span
                        key={item}
                        className="receipt-bubble"
                        style={
                          {
                            '--delay': `${item * 0.08}s`,
                            '--left': `${8 + item * 7}%`,
                            '--size': `${18 + (item % 4) * 12}px`,
                          } as CSSProperties
                        }
                      />
                    ))}
                  </div>
                )}

                <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] p-6 md:p-8">
                  <div className="rounded-[28px] border border-[#d8d0c2] bg-[#f7f1e5] text-[#1A1A1A] shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                    <div className="rounded-t-[28px] bg-[#1A1A1A] px-6 py-6 text-white">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[var(--accent-light)]">Reserva confirmada</p>
                          <h3 className="mt-3 font-playfair text-[clamp(1.9rem,3vw,2.8rem)] leading-none">Bar do Bruce</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-[0.72rem] uppercase tracking-[0.14em] text-[#9CA3AF]">Código</p>
                          <p className="mt-2 font-playfair text-2xl text-[#FFFFFF]">{reserva.reservaId}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {[
                          ['Nome', reserva.nome],
                          ['Telefone', reserva.telefone || '-'],
                          ['Pessoas', String(reserva.pessoas)],
                          ['Mesa', reserva.mesa],
                          ['Data', reserva.data],
                          ['Horário', reserva.horario],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <p className="text-[0.72rem] uppercase tracking-[0.14em] text-[#6B7280]">{label}</p>
                            <p className="mt-2 text-[1.02rem] text-[#1A1A1A]">{value}</p>
                          </div>
                        ))}
                      </div>

                      <div
                        className="mt-6 h-[96px] rounded-[18px] border border-[#d7c9ab] bg-white"
                        style={{
                          backgroundImage: 'repeating-linear-gradient(90deg,#111 0 3px,transparent 3px 6px,#111 6px 10px,transparent 10px 12px)',
                        }}
                        aria-hidden="true"
                      />

                      <div className="mt-6 grid gap-4">
                        <div className="rounded-[20px] border border-[#d7c9ab] bg-[#f3ead6] px-4 py-4 text-[0.95rem] leading-[1.7] text-[#4B5563]">
                          Ao chegar no estabelecimento, apresente-se no balcão para confirmar sua reserva.
                        </div>
                        <div className="rounded-[20px] border border-[#d7c9ab] bg-[#f3ead6] px-4 py-4 text-[0.95rem] leading-[1.8] text-[#4B5563]">
                          Para garantir a melhor experiência, pedimos atenção ao horário: sua reserva conta com uma tolerância máxima de 15 minutos. Após esse período, ela poderá ser cancelada automaticamente, sem direito a mesa ou reembolso. Qualquer ajuste, cancelamento ou solicitação de estorno pode ser feito pelo nosso WhatsApp.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-6">
                    <div className="rounded-[28px] border border-accent/20 bg-accent/10 px-6 py-6">
                      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-accent">Pagamento confirmado</p>
                      <h3 className="mt-4 font-playfair text-[clamp(2rem,3vw,3rem)] leading-none text-white">Comprovante pronto</h3>
                      <p className="mt-4 text-[0.96rem] leading-[1.8] text-gray-DEFAULT">
                        O email foi preparado para <strong className="text-white">{negocio.email}</strong> com nome do cliente, data, horário, mesa, pessoas e valor pago.
                      </p>
                    </div>

                    <div className="rounded-[28px] border border-[#404040] bg-[#181818] px-6 py-6">
                      <div className="grid gap-4 text-[0.9rem]">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-DEFAULT">Valor pago</span>
                          <strong className="text-white">{reserva.valorPago}</strong>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-DEFAULT">Contato</span>
                          <strong className="text-white">{negocio.telefone}</strong>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-DEFAULT">Reserva</span>
                          <strong className="text-white">{reserva.reservaId}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button type="button" onClick={() => baixarComprovantePdf(reserva)} className="btn-primary w-full justify-center">
                        Baixar comprovante
                      </button>
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center rounded-[999px] bg-[#22C55E] px-6 py-4 text-[0.86rem] font-semibold uppercase tracking-[0.14em] text-white transition hover:brightness-110"
                      >
                        Entrar em contato
                      </a>
                      <button type="button" onClick={reiniciarFluxo} className="btn-outline w-full justify-center">
                        Nova reserva
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
