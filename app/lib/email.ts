/**
 * lib/email.ts
 * Utilitário de envio de email para confirmação de reservas.
 * Suporta dois providers:
 *   1. Resend (recomendado para Vercel) — configure RESEND_API_KEY
 *   2. Nodemailer via SMTP (alternativa) — configure SMTP_* vars
 */

import type { ReservaPayload } from './types'

// ─── Template HTML do email ───────────────────────────────────────────────────

function buildEmailHTML(reserva: ReservaPayload & { reservaId: string; valorPago: string }): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmação de Reserva — Bar do Bruce</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:4px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#0A0A0A;padding:32px 40px;border-bottom:1px solid rgba(255,255,255,0.06);">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:900;color:#FFFFFF;letter-spacing:-0.5px;">
                Bar do <span style="color:#C8F542;">Bruce</span>
              </h1>
              <p style="margin:6px 0 0;font-size:12px;color:#9CA3AF;letter-spacing:0.15em;text-transform:uppercase;">
                Pelourinho · Salvador, Bahia
              </p>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:36px 40px 28px;background:linear-gradient(135deg,#141414 0%,#1A1A1A 100%);">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#C8F542;letter-spacing:0.2em;text-transform:uppercase;">
                ✓ Reserva Confirmada
              </p>
              <h2 style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#FFFFFF;line-height:1.2;">
                Olá, ${reserva.nome}!
              </h2>
              <p style="margin:12px 0 0;font-size:15px;color:#9CA3AF;line-height:1.6;">
                Sua reserva no Bar do Bruce foi confirmada com sucesso. Esperamos você!
              </p>
            </td>
          </tr>

          <!-- Detalhes -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,0.07);border-radius:3px;overflow:hidden;">
                <tr>
                  <td colspan="2" style="padding:16px 20px;background:rgba(200,245,66,0.06);border-bottom:1px solid rgba(255,255,255,0.07);">
                    <p style="margin:0;font-size:11px;font-weight:600;color:#C8F542;letter-spacing:0.15em;text-transform:uppercase;">
                      Detalhes da Reserva
                    </p>
                  </td>
                </tr>
                ${[
                  ['ID da Reserva', `#${reserva.reservaId}`],
                  ['Data', reserva.data],
                  ['Horário', reserva.horario],
                  ['Local', reserva.mesaLabel],
                  ['Pessoas', `${reserva.pessoas} pessoa${reserva.pessoas > 1 ? 's' : ''}`],
                  ['Valor Pago', reserva.valorPago],
                ].map(([label, value], i) => `
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.05);background:${i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'};">
                    <p style="margin:0;font-size:12px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;">${label}</p>
                  </td>
                  <td style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.05);background:${i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'};">
                    <p style="margin:0;font-size:14px;color:#FFFFFF;font-weight:500;">${value}</p>
                  </td>
                </tr>`).join('')}
              </table>
            </td>
          </tr>

          <!-- Endereço -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:3px;padding:20px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#C8F542;letter-spacing:0.15em;text-transform:uppercase;">📍 Como Chegar</p>
                    <p style="margin:0;font-size:14px;color:#FFFFFF;">Ladeira do Carmo, nº 2 — Pelourinho</p>
                    <p style="margin:2px 0 0;font-size:13px;color:#9CA3AF;">Salvador, Bahia · CEP 40301-100</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);background:#0A0A0A;">
              <p style="margin:0;font-size:12px;color:#4B5563;line-height:1.6;">
                Precisa cancelar ou alterar? Entre em contato pelo WhatsApp ou email:<br />
                <a href="mailto:contatobardobruce@gmail.com" style="color:#C8F542;text-decoration:none;">contatobardobruce@gmail.com</a>
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#374151;">
                © ${new Date().getFullYear()} Bar do Bruce — Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildEmailText(reserva: ReservaPayload & { reservaId: string; valorPago: string }): string {
  return `
BAR DO BRUCE — Confirmação de Reserva
======================================

Olá, ${reserva.nome}!

Sua reserva foi confirmada com sucesso.

─── Detalhes ───────────────────────────
ID da Reserva : #${reserva.reservaId}
Data          : ${reserva.data}
Horário       : ${reserva.horario}
Local         : ${reserva.mesaLabel}
Pessoas       : ${reserva.pessoas}
Valor Pago    : ${reserva.valorPago}
────────────────────────────────────────

📍 Endereço:
Ladeira do Carmo, nº 2 — Pelourinho
Salvador, Bahia

Precisa alterar ou cancelar?
contatobardobruce@gmail.com

© ${new Date().getFullYear()} Bar do Bruce
  `.trim()
}

// ─── Provider: Resend ─────────────────────────────────────────────────────────

async function sendViaResend(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<void> {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: 'Bar do Bruce <onboarding@resend.dev>', // trocar pelo domínio verificado
    to: [to],
    subject,
    html,
    text,
  })

  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`)
}

// ─── Provider: Nodemailer (SMTP / Gmail) ──────────────────────────────────────

async function sendViaNodemailer(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<void> {
  const nodemailer = await import('nodemailer')

  const transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: `"Bar do Bruce" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text,
  })
}

// ─── Função principal ─────────────────────────────────────────────────────────

export async function enviarEmailReserva(
  reserva: ReservaPayload & { reservaId: string; valorPago: string }
): Promise<{ success: boolean; error?: string }> {
  const emailTo = process.env.EMAIL_TO || 'contatobardobruce@gmail.com'
  const subject = `🍽️ Nova Reserva — ${reserva.nome} · ${reserva.data} às ${reserva.horario}`
  const html = buildEmailHTML(reserva)
  const text = buildEmailText(reserva)

  try {
    // Tenta Resend primeiro (preferido para Vercel)
    if (process.env.RESEND_API_KEY) {
      await sendViaResend(emailTo, subject, html, text)
      console.log('[email] Enviado via Resend para', emailTo)
      return { success: true }
    }

    // Fallback: Nodemailer
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await sendViaNodemailer(emailTo, subject, html, text)
      console.log('[email] Enviado via Nodemailer para', emailTo)
      return { success: true }
    }

    // Nenhum provider configurado — loga mas não bloqueia
    console.warn('[email] Nenhum provider configurado. Configure RESEND_API_KEY ou SMTP_*')
    console.log('[email] Conteúdo que seria enviado:\n', text)
    return { success: true } // não falhar o fluxo de reserva
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[email] Falha no envio:', msg)
    return { success: false, error: msg }
  }
}
