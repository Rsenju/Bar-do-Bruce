import { NextRequest, NextResponse } from 'next/server'
import { enviarEmailReserva } from '@/app/lib/email'
import { TAXA_RESERVA_CENTAVOS } from '@/app/lib/data'
import { formatarReais, gerarCodigoBarras, gerarPixKeyAleatoria } from '@/app/lib/utils'
import type { PagamentoPayload, ReservaResumo } from '@/app/lib/types'

function getPixKey() {
  return process.env.NEXT_PUBLIC_PIX_KEY || process.env.PIX_KEY || gerarPixKeyAleatoria()
}

function buildReservaResumo(body: PagamentoPayload): ReservaResumo {
  return {
    nome: body.nome,
    email: body.email,
    telefone: body.telefone || '',
    data: body.data || '',
    horario: body.horario || '',
    mesa: body.mesa || '',
    pessoas: body.pessoas || 1,
    tipo: body.tipo || 'mesa',
    reservaId: body.reservaId,
    valorPago: formatarReais(TAXA_RESERVA_CENTAVOS),
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: PagamentoPayload = await req.json()

    if (!body.reservaId || !body.nome || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Dados insuficientes para processar o pagamento.' },
        { status: 400 }
      )
    }

    if (body.action === 'confirm') {
      const reserva = buildReservaResumo(body)
      const emailResult = await enviarEmailReserva({
        nome: reserva.nome,
        email: reserva.email,
        telefone: reserva.telefone,
        pessoas: reserva.pessoas,
        data: reserva.data,
        horario: reserva.horario,
        tipo: reserva.tipo,
        mesaId: reserva.mesa,
        mesaLabel: reserva.mesa,
        capacidade: reserva.pessoas,
        reservaId: reserva.reservaId,
        valorPago: reserva.valorPago,
      })

      if (!emailResult.success) {
        return NextResponse.json(
          { success: false, error: emailResult.error || 'Falha ao enviar o email da reserva.' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        reserva,
      })
    }

    const reserva = buildReservaResumo(body)
    const pixKey = getPixKey()
    const barcodeValue = gerarCodigoBarras(`${body.reservaId}${body.nome}`)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    return NextResponse.json({
      success: true,
      pixKey,
      barcodeValue,
      expiresAt,
      reserva,
      copiedMessage: 'Chave Pix copiada com sucesso.',
    })
  } catch (error) {
    console.error('[api/pagamento] erro ao processar pagamento', error)

    return NextResponse.json(
      { success: false, error: 'Erro interno ao preparar o pagamento Pix.' },
      { status: 500 }
    )
  }
}
