import type { Mesa, BalcaoLugar, ItemCardapio } from "./types";

// ─── Configuração real do espaço ──────────────────────────────────────────────

export const mesas: Mesa[] = [
  { id: 1, capacidade: 4 },
  { id: 2, capacidade: 2 },
  { id: 3, capacidade: 2 },
  { id: 4, capacidade: 3 },
  { id: 5, capacidade: 2 },
];

export const balcao = {
  lugares: 3,
};

export const balcaoLugares: BalcaoLugar[] = Array.from(
  { length: balcao.lugares },
  (_, i) => ({
    id: `B${i + 1}`,
    label: `Balcão ${i + 1}`,
    status: "disponivel" as const,
  }),
);

// ─── Horários disponíveis ─────────────────────────────────────────────────────

export const horarios = [
  "12:00",
  "13:00",
  "14:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];

// ─── Reserva: valor da taxa de reserva (em Pix) ─────────────────────────
// R$50,00 de taxa. Esse valor será totalmente revertido em consumo.

export const TAXA_RESERVA_CENTAVOS = 5000;

// ─── Cardápio ─────────────────────────────────────────────────────────────────

export const cardapio: ItemCardapio[] = [
  // Entradas
  {
    id: "coxinha-do-carmo",
    nome: "Coxinha do Carmo",
    descricao: "Coxinha de aipim + frango + aioli de alho (3)",
    preco: "R$20",
    imagem: "/img/coxinha-do-carmo.jpg",
    tag: "Tradicional",
    categoria: "entradas",
  },
  {
    id: "tarde-em-itapoa",
    nome: "Tarde em Itapoã",
    descricao: "Caldo de aipim + camarão + leite de coco",
    preco: "R$23",
    imagem: "/img/tarde-em-itapoa.jpg",
    tag: "Mar & Terra",
    categoria: "entradas",
  },
  {
    id: "olodum",
    nome: "Olodum",
    descricao: "Bolinho de aipim + charque + requeijão (3)",
    preco: "R$20",
    imagem: "/img/Olodum.jpg",
    tag: "Baiano",
    categoria: "entradas",
  },

  // Pratos principais
  {
    id: "temporal",
    nome: "Temporal",
    descricao: "Risoto + filé mignon + cogumelos",
    preco: "R$60",
    imagem: "/img/Temporal.jpg",
    tag: "Chef",
    categoria: "pratos",
  },
  {
    id: "primavera",
    nome: "Primavera",
    descricao: "Risoto + gorgonzola + damasco + amêndoas",
    preco: "R$60",
    imagem: "/img/Primavera.jpg",
    tag: "Vegetariano",
    categoria: "pratos",
  },
  {
    id: "oceano",
    nome: "Oceano",
    descricao: "Espaguete + camarão + pesto",
    preco: "R$65",
    imagem: "/img/Oceano.jpg",
    tag: "Mar",
    categoria: "pratos",
  },

  // Sobremesas
  {
    id: "aconchego",
    nome: "Aconchego",
    descricao: "Mousse de chocolate + castanhas",
    preco: "R$22",
    imagem: "/img/Aconchego.jpg",
    tag: "Chocolate",
    categoria: "sobremesas",
  },
  {
    id: "reconvexo",
    nome: "Reconvexo",
    descricao: "Creme de limão + crumble + merengue",
    preco: "R$20",
    imagem: "/img/Reconvexo.jpg",
    tag: "Cítrico",
    categoria: "sobremesas",
  },

  // Bebidas — sem imagem
  {
    id: "caipirinha",
    nome: "Caipirinha",
    descricao: "Cachaça, limão, açúcar e gelo",
    preco: "R$23",
    categoria: "bebidas",
    semImagem: true,
  },
  {
    id: "mojito",
    nome: "Mojito",
    descricao: "Rum, hortelã, limão, açúcar e água com gás",
    preco: "R$25",
    categoria: "bebidas",
    semImagem: true,
  },
  {
    id: "sex-on-the-beach",
    nome: "Sex on the Beach",
    descricao: "Vodka, pêssego, suco de laranja e cranberry",
    preco: "R$28",
    categoria: "bebidas",
    semImagem: true,
  },
  {
    id: "agua",
    nome: "Água",
    descricao: "Mineral com ou sem gás",
    preco: "R$6",
    categoria: "bebidas",
    semImagem: true,
  },
  {
    id: "refrigerante",
    nome: "Refrigerantes",
    descricao: "Cola, guaraná, laranja ou limão",
    preco: "R$7",
    categoria: "bebidas",
    semImagem: true,
  },
  {
    id: "heineken",
    nome: "Heineken",
    descricao: "Long neck 330ml gelada",
    preco: "R$12",
    categoria: "bebidas",
    semImagem: true,
  },
];

export const categorias = [
  { key: "entradas", label: "Entradas" },
  { key: "pratos", label: "Pratos Principais" },
  { key: "sobremesas", label: "Sobremesas" },
  { key: "bebidas", label: "Bebidas" },
] as const;

// ─── Informações do negócio ───────────────────────────────────────────────────

export const negocio = {
  nome: "Bar do Bruce",
  tagline: "Uma experiência gastronômica em Salvador",
  inauguracao: "24/04/2026",
  endereco: {
    rua: "Ladeira do Carmo, nº 2",
    bairro: "Pelourinho",
    cidade: "Salvador",
    estado: "BA",
    cep: "40301-100",
    completo: "Ladeira do Carmo, nº 2 — Pelourinho, Salvador/BA",
  },
  email: "contatobardobruce@gmail.com",
  telefone: "(71) 9999-8888",
  whatsapp: "5571999998888",
  horarios: {
    "Terça a Quinta": "12h — 23h",
    "Sexta e Sábado": "12h — 01h",
    Domingo: "12h — 21h",
    Segunda: "Fechado",
  },
  instagram: "https://www.instagram.com/bardobruceoficial/",
  mapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.3!2d-38.5117!3d-12.9713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE2LjciUyAzOMKwMzAnNDIuMSJX!5e0!3m2!1spt!2sbr!4v1700000000000!5m2!1spt!2sbr",
};
