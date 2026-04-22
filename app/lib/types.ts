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

export interface ReservaResponse {
  success: boolean
  reservaId?: string
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
  valor: number // em centavos
  nome: string
  email: string
}

export interface PagamentoResponse {
  success: boolean
  clientSecret?: string
  paymentIntentId?: string
  error?: string
}
