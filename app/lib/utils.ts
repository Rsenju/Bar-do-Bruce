import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Gera um ID único de reserva
 */
export function gerarReservaId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `BRU-${timestamp}-${random}`
}

/**
 * Formata valor em centavos para BRL
 */
export function formatarReais(centavos: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(centavos / 100)
}

/**
 * Valida e formata data para exibição
 */
export function formatarDataBR(dataISO: string): string {
  if (!dataISO) return ''
  const [year, month, day] = dataISO.split('-')
  return `${day}/${month}/${year}`
}

/**
 * Data mínima para reservas (hoje)
 */
export function dataMinReserva(): string {
  return new Date().toISOString().split('T')[0]
}
