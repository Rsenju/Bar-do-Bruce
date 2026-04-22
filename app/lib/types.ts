// ─── Mesa & Reserva ───────────────────────────────────────────────────────────

export interface Mesa {
  id: number
  capacidade: number
  status?: 'disponivel' | 'ocupado' | 'selecionado'
}

export interface BalcaoLugar {
  id: string
  label: string
  status: 'disponivel' | 'ocupado' | 'selecionado'
}

export interface ReservaPayload {
  nome: string
  email: string
  telefone: string
  pessoas: number
  data: string
  horario: string
  tipo: 'mesa' | 'balcao'
  mesaId: number | string
  mesaLabel: string
  capacidade: number
}

export interface ReservaResumo {
  nome: string
  email: string
  telefone: string
  data: string
  horario: string
  mesa: string
  pessoas: number
  tipo: 'mesa' | 'balcao'
  reservaId: string
  valorPago: string
}

export interface ReservaResponse {
  success: boolean
  reservaId?: string
  reserva?: ReservaResumo
  message?: string
  error?: string
}

// ─── Cardápio ─────────────────────────────────────────────────────────────────

export type CategoriaCardapio = 'entradas' | 'pratos' | 'sobremesas' | 'bebidas'

export interface ItemCardapio {
  id: string
  nome: string
  descricao: string
  preco: string
  imagem?: string // path relativo em /public/img/
  tag?: string
  categoria: CategoriaCardapio
  semImagem?: boolean
}

// ─── Pagamento ────────────────────────────────────────────────────────────────

export interface PagamentoPayload {
  reservaId: string
  nome: string
  email: string
  action?: 'create' | 'confirm'
  telefone?: string
  data?: string
  horario?: string
  mesa?: string
  pessoas?: number
  tipo?: 'mesa' | 'balcao'
}

export interface PagamentoResponse {
  success: boolean
  pixKey?: string
  barcodeValue?: string
  expiresAt?: string
  reserva?: ReservaResumo
  copiedMessage?: string
  error?: string
}
