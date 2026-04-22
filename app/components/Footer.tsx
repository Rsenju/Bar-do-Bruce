import { negocio } from '@/app/lib/data'

const navLinks = [
  { href: '#hero', label: 'Início' },
  { href: '#sobre', label: 'Sobre' },
  { href: '#reservas', label: 'Reservas' },
  { href: '#cardapio', label: 'Cardápio' },
  { href: '#contato', label: 'Contato' },
]

export default function Footer() {
  return (
    <footer>
      <div
        className="bg-[#101010] border-t border-[#404040] px-[6%] py-14"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start',
        }}
      >
        <div>
          <p className="font-playfair text-[1.45rem] font-black tracking-tight mb-3">
            Bar do <span className="text-accent">Bruce</span>
          </p>
          <p className="text-[0.82rem] text-gray-DEFAULT leading-[1.8] max-w-[260px]">
            Gastronomia baiana com atmosfera premium no coração do Pelourinho, Salvador.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href={`https://wa.me/${negocio.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-[#404040] flex items-center justify-center text-gray-DEFAULT hover:border-accent hover:text-accent transition-all duration-200"
              aria-label="WhatsApp"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
            <a
              href={`mailto:${negocio.email}`}
              className="w-10 h-10 rounded-full border border-[#404040] flex items-center justify-center text-gray-DEFAULT hover:border-accent hover:text-accent transition-all duration-200"
              aria-label="Email"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-10 7L2 7" />
              </svg>
            </a>
            <a
              href={negocio.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-[#404040] flex items-center justify-center text-gray-DEFAULT hover:border-accent hover:text-accent transition-all duration-200"
              aria-label="Instagram"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4.25" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-accent mb-4">Navegação</h4>
          <ul className="space-y-2.5">
            {navLinks.map(link => (
              <li key={link.href}>
                <a href={link.href} className="text-[0.85rem] text-gray-DEFAULT hover:text-white transition-colors duration-200">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-accent mb-4">Funcionamento</h4>
          <div className="space-y-2">
            {Object.entries(negocio.horarios).map(([day, hours]) => (
              <div key={day} className="flex justify-between gap-4">
                <span className="text-[0.82rem] text-gray-DEFAULT">{day}</span>
                <span className={`text-[0.82rem] ${hours === 'Fechado' ? 'text-gray-dark' : 'text-white'}`}>
                  {hours}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-accent mb-4">Endereço</h4>
          <address className="not-italic space-y-1">
            <p className="text-[0.85rem] text-gray-DEFAULT">{negocio.endereco.rua}</p>
            <p className="text-[0.85rem] text-gray-DEFAULT">{negocio.endereco.bairro}</p>
            <p className="text-[0.85rem] text-gray-DEFAULT">{negocio.endereco.cidade}/{negocio.endereco.estado}</p>
          </address>
          <a href="#reservas" className="btn-primary mt-5 text-[0.7rem] py-2.5 px-4">
            Reservar Mesa
          </a>
        </div>
      </div>

      <div className="bg-[#0d0d0d] border-t border-[#2d2d2d] px-[6%] py-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.72rem] text-gray-dark">
          © {new Date().getFullYear()} Bar do Bruce — Todos os direitos reservados.
        </p>
        <p className="text-[0.72rem] text-gray-dark">
          Feito em Salvador, Bahia
        </p>
      </div>
    </footer>
  )
}
