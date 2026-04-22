import { NextRequest, NextResponse } from 'next/server'
import { enviarEmailReserva } from '@/app/lib/email'
import { gerarReservaId, formatarReais, formatarDataBR } from '@/app/lib/utils'
import { mesas, balcao, TAXA_RESERVA_CENTAVOS } from '@/app/lib/data'
import type { ReservaPayload } from '@/app/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body: ReservaPayload = await req.json()

    // ── Validações ──────────────────────────────────────────────────────────
    const { nome, email, pessoas, data, horario, tipo, mesaId, capacidade } = body

    if (!nome || !email || !pessoas || !data || !horario || !tipo || !mesaId) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      )
    }

    // Validar capacidade
    if (tipo === 'mesa') {
      const mesa = mesas.find(m => m.id === Number(mesaId))
      if (!mesa) {
        return NextResponse.json(
          { success: false, error: 'Mesa não encontrada.' },
          { status: 400 }
        )
      }
      if (pessoas > mesa.capacidade) {
        return NextResponse.json(
          {
            success: false,
            error: `Esta mesa comporta no máximo ${mesa.capacidade} pessoas. Você selecionou ${pessoas}.`,
          },
          { status: 400 }
        )
      }
    }

    if (tipo === 'balcao' && pessoas > balcao.lugares) {
      return NextResponse.json(
        {
          success: false,
          error: `O balcão tem ${balcao.lugares} assentos. Você selecionou ${pessoas} pessoa(s).`,
        },
        { status: 400 }
      )
    }

    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido.' },
        { status: 400 }
      )
    }

    // ── Criar reserva ────────────────────────────────────────────────────────
    const reservaId = gerarReservaId()
    const valorPago = formatarReais(TAXA_RESERVA_CENTAVOS)
    const dataFormatada = formatarDataBR(data)

    // ── Enviar email ─────────────────────────────────────────────────────────
    await enviarEmailReserva({
      ...body,
      data: dataFormatada,
      reservaId,
      valorPago,
    })

    // ── Resposta ─────────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      reservaId,
      message: `Reserva confirmada! ID: ${reservaId}`,
    })
  } catch (err) {
    console.error('[api/reserva] Erro:', err)
    return NextResponse.json(
      { success: false, error: 'Erro interno. Tente novamente.' },
      { status: 500 }
    )
  }
}
