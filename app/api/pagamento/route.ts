import { NextRequest, NextResponse } from "next/server";
import { TAXA_RESERVA_CENTAVOS } from "@/app/lib/data";
import type { PagamentoPayload } from "@/app/lib/types";

export async function POST(req: NextRequest) {
  try {
    // ── Verificar chave Stripe ────────────────────────────────────────────────
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn(
        "[api/pagamento] STRIPE_SECRET_KEY não configurada — modo simulado",
      );
      // Retornar mock para desenvolvimento sem Stripe configurado
      return NextResponse.json({
        success: true,
        clientSecret: "pi_mock_secret_for_development",
        paymentIntentId: `pi_mock_${Date.now()}`,
        mock: true,
      });
    }

    const body: PagamentoPayload = await req.json();
    const { reservaId, nome, email } = body;

    if (!reservaId) {
      return NextResponse.json(
        { success: false, error: "reservaId é obrigatório." },
        { status: 400 },
      );
    }

    // ── Importar Stripe ───────────────────────────────────────────────────────
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });

    // ── Criar Payment Intent ──────────────────────────────────────────────────
    const paymentIntent = await stripe.paymentIntents.create({
      amount: TAXA_RESERVA_CENTAVOS,
      currency: "brl",
      description: `Taxa de reserva — Bar do Bruce (${reservaId})`,
      metadata: {
        reservaId,
        nome,
        email,
      },
      receipt_email: email || undefined,
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("[api/pagamento] Erro Stripe:", err);
    const message = err instanceof Error ? err.message : "Erro no pagamento";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
