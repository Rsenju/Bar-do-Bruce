import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Gera um ID único de reserva
 */
export function gerarReservaId(): string {
  const random = Math.random().toString(36).substring(2, 9).toUpperCase()
  return `RES-${random}`
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

export function gerarPixKeyAleatoria(): string {
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  return template.replace(/[xy]/g, char => {
    const random = Math.floor(Math.random() * 16)
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

export function gerarCodigoBarras(valor: string): string {
  return valor.replace(/[^A-Z0-9]/gi, '').toUpperCase().padEnd(32, '0').slice(0, 32)
}

export function formatarTempoRestante(totalSegundos: number): string {
  const minutos = Math.floor(totalSegundos / 60)
  const segundos = totalSegundos % 60
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
}
