import { NextRequest, NextResponse } from 'next/server'
import { mesas, balcao, TAXA_RESERVA_CENTAVOS } from '@/app/lib/data'
import { formatarDataBR, formatarReais, gerarReservaId } from '@/app/lib/utils'
import type { ReservaPayload, ReservaResumo } from '@/app/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body: ReservaPayload = await req.json()
    const { nome, email, telefone, pessoas, data, horario, tipo, mesaId } = body

    if (!nome || !email || !pessoas || !data || !horario || !tipo || !mesaId) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos obrigatórios precisam ser preenchidos.' },
        { status: 400 }
      )
    }

    if (pessoas > 4) {
      return NextResponse.json(
        { success: false, error: 'As reservas em mesa são limitadas a até 4 pessoas.' },
        { status: 400 }
      )
    }

    if (tipo === 'mesa') {
      const mesa = mesas.find(item => item.id === Number(mesaId))

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
            error: `Esta mesa comporta no máximo ${mesa.capacidade} pessoa(s).`,
          },
          { status: 400 }
        )
      }
    }

    if (tipo === 'balcao' && pessoas > balcao.lugares) {
      return NextResponse.json(
        { success: false, error: `O balcão possui ${balcao.lugares} assentos.` },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Informe um email válido.' },
        { status: 400 }
      )
    }

    const reservaId = gerarReservaId()
    const reserva: ReservaResumo = {
      nome,
      email,
      telefone,
      data: formatarDataBR(data),
      horario,
      mesa: tipo === 'mesa' ? `Mesa ${mesaId}` : `Balcão ${String(mesaId).replace('B', '')}`,
      pessoas,
      tipo,
      reservaId,
      valorPago: formatarReais(TAXA_RESERVA_CENTAVOS),
    }

    return NextResponse.json({
      success: true,
      reservaId,
      reserva,
      message: 'Pré-reserva criada com sucesso.',
    })
  } catch (error) {
    console.error('[api/reserva] erro ao criar pré-reserva', error)

    return NextResponse.json(
      { success: false, error: 'Erro interno ao criar a reserva.' },
      { status: 500 }
    )
  }
}
