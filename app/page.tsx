import Header from '@/app/components/Header'
import Hero from '@/app/components/Hero'
import Sobre from '@/app/components/Sobre'
import Reservas from '@/app/components/Reservas'
import Cardapio from '@/app/components/Cardapio'
// {/* <SectionGaleria /> */}
// Galeria comentada — será ativada futuramente quando as fotos estiverem prontas
import Contato from '@/app/components/Contato'
import Footer from '@/app/components/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Sobre />
        <Reservas />
        <Cardapio />
        {/* <SectionGaleria /> */}
        <Contato />
      </main>
      <Footer />
    </>
  )
}
