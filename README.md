# 🍻 Bar do Bruce — Site Oficial

Site premium para o Bar do Bruce, localizado no Pelourinho, Salvador/BA.
Construído com Next.js 14 (App Router), Tailwind CSS e TypeScript.

---

## 🚀 Stack

| Tecnologia | Uso |
|---|---|
| Next.js 14 (App Router) | Framework principal |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilização |
| Framer Motion | Animações (opcional) |
| Stripe | Pagamentos (modo teste) |
| Resend / Nodemailer | Envio de email |

---

## 📁 Estrutura

```
bar-do-bruce/
├── app/
│   ├── components/       # Componentes de seção
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── Sobre.tsx
│   │   ├── Reservas.tsx
│   │   ├── Cardapio.tsx
│   │   ├── Contato.tsx
│   │   └── Footer.tsx
│   ├── api/
│   │   ├── reserva/      # POST /api/reserva
│   │   └── pagamento/    # POST /api/pagamento (Stripe)
│   ├── lib/
│   │   ├── data.ts       # Dados estáticos (cardápio, mesas, negócio)
│   │   ├── email.ts      # Utilitário de envio de email
│   │   ├── types.ts      # TypeScript types
│   │   └── utils.ts      # Funções utilitárias
│   ├── layout.tsx        # Root layout + metadata
│   └── page.tsx          # Página principal
├── public/
│   └── img/              # ⚠️ Adicione as fotos aqui (ver README em /img)
├── styles/
│   └── globals.css       # Estilos globais + CSS variables
├── .env.example          # Exemplo de variáveis de ambiente
├── vercel.json           # Configuração Vercel
└── tailwind.config.ts
```

---

## ⚙️ Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas chaves:

```env
# Stripe (modo teste — obtenha em dashboard.stripe.com)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Resend (recomendado para Vercel — obtenha em resend.com)
RESEND_API_KEY=re_...

# Email de destino
EMAIL_TO=contatobardobruce@gmail.com
```

### 3. Adicionar imagens

Coloque as fotos em `/public/img/` seguindo as instruções em `public/img/README.md`.

### 4. Rodar localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🌐 Deploy na Vercel

### Opção A — Via GitHub (recomendado)

1. Faça push do projeto para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Adicione as variáveis de ambiente no painel da Vercel
4. Deploy automático ✅

### Opção B — Via CLI

```bash
npm i -g vercel
vercel --prod
```

---

## 📧 Email

O site suporta dois providers de email:

**Resend** (recomendado para Vercel):
- Crie uma conta em [resend.com](https://resend.com)
- Verifique seu domínio
- Adicione `RESEND_API_KEY` no `.env.local`

**Nodemailer** (via Gmail):
- Ative "Senha de app" na sua conta Google
- Configure `SMTP_USER` e `SMTP_PASS` no `.env.local`

> Se nenhum provider estiver configurado, o email é apenas logado no console
> (não bloqueia o fluxo de reserva).

---

## 💳 Stripe

O endpoint `/api/pagamento` cria um PaymentIntent no Stripe.

- **Sem chave configurada**: retorna mock para desenvolvimento
- **Com chave de teste**: processa pagamento real no modo teste
- Taxa de reserva: R$10,00 (configurável em `lib/data.ts` → `TAXA_RESERVA_CENTAVOS`)

---

## 🖼️ Galeria

A seção de galeria está **comentada** em `app/page.tsx`:

```tsx
{/* <SectionGaleria /> */}
```

Será ativada quando as fotos do estabelecimento estiverem prontas.

---

## 📞 Contato

**Bar do Bruce**
Ladeira do Carmo, nº 2 — Pelourinho, Salvador/BA
contatobardobruce@gmail.com
