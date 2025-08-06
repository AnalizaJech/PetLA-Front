import { Link } from "react-router-dom";
import {
  Dog,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  Shield,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function NewFooter() {
  return (
    <footer className="bg-gradient-to-br from-vet-gray-900 via-vet-gray-800 to-vet-gray-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Main Footer Content - Balanced 3 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand & About Column */}
          <div className="flex flex-col md:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-vet-primary to-vet-primary-dark rounded-xl shadow-lg">
                <Dog className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold">
                Pet<span className="text-vet-primary">LA</span>
              </span>
            </div>
            <p className="text-vet-gray-300 text-sm leading-relaxed mb-4 sm:mb-6">
              La plataforma veterinaria líder en Latinoamérica. Conectamos
              tecnología innovadora con el cuidado profesional que tu mascota
              merece.
            </p>

            {/* Mission Statement */}
            <div className="bg-vet-primary/10 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <h4 className="text-white font-semibold mb-2 flex items-center text-sm">
                <Dog className="w-4 h-4 mr-2 text-vet-primary" />
                Nuestra Misión
              </h4>
              <p className="text-vet-gray-300 text-xs leading-relaxed">
                Revolucionar el cuidado veterinario mediante tecnología
                accesible, conectando a las mascotas con la mejor atención
                médica.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
              <div>
                <div className="text-base sm:text-lg font-bold text-vet-primary">
                  500+
                </div>
                <div className="text-xs text-vet-gray-400">Familias</div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-vet-secondary">
                  15+
                </div>
                <div className="text-xs text-vet-gray-400">Veterinarios</div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-green-500">
                  24/7
                </div>
                <div className="text-xs text-vet-gray-400">Disponible</div>
              </div>
            </div>
          </div>

          {/* Contact & Emergency Column */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-white">Contacto</h3>
            <div className="space-y-4 flex-grow">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-vet-primary/20 rounded-lg flex items-center justify-center mt-1">
                  <Phone className="w-4 h-4 text-vet-primary" />
                </div>
                <div>
                  <a
                    href="tel:+5551234567"
                    className="text-white font-semibold text-sm hover:text-vet-primary transition-colors"
                  >
                    (555) 123-4567
                  </a>
                  <p className="text-vet-gray-300 text-xs">Citas y consultas</p>
                  <p className="text-vet-gray-400 text-xs">
                    Lun - Dom: 6:00 AM - 10:00 PM
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-vet-secondary/20 rounded-lg flex items-center justify-center mt-1">
                  <Mail className="w-4 h-4 text-vet-secondary" />
                </div>
                <div>
                  <a
                    href="mailto:info@petla.com"
                    className="text-white font-semibold text-sm hover:text-vet-secondary transition-colors"
                  >
                    info@petla.com
                  </a>
                  <p className="text-vet-gray-300 text-xs">
                    Consultas generales
                  </p>
                  <p className="text-vet-gray-400 text-xs">Respuesta &lt; 2h</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mt-1">
                  <MapPin className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <a
                    href="https://maps.google.com/?q=Av.+Principal+123,+Centro+Médico+Veterinario"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-semibold text-sm hover:text-green-400 transition-colors"
                  >
                    Av. Principal 123
                  </a>
                  <p className="text-vet-gray-300 text-xs">
                    Centro Médico Veterinario
                  </p>
                  <p className="text-vet-gray-400 text-xs">
                    Zona Centro • Fácil acceso
                  </p>
                </div>
              </div>
            </div>

            {/* Certification & Emergency Notices */}
            <div className="space-y-3 mt-4">
              <div className="bg-vet-primary/15 rounded-lg p-3 border border-vet-primary/30">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 bg-vet-primary rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-vet-primary font-bold text-sm">
                    Certificado Veterinario
                  </span>
                </div>
                <p className="text-vet-gray-300 text-xs">
                  Licencia SENASA #VET-2024-001
                </p>
              </div>

              <div className="bg-vet-secondary/15 rounded-lg p-3 border border-vet-secondary/30">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 bg-vet-secondary rounded-full flex items-center justify-center animate-pulse">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-vet-secondary font-bold text-sm">
                    Emergencias 24/7
                  </span>
                </div>
                <p className="text-vet-gray-300 text-xs">
                  Respuesta &lt; 5 minutos
                </p>
              </div>
            </div>
          </div>

          {/* Social Media Column */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-white">
              Síguenos en Redes
            </h3>
            <p className="text-vet-gray-300 text-xs mb-6 leading-relaxed">
              Únete a nuestra comunidad de amantes de las mascotas. Consejos
              diarios, historias inspiradoras y contenido educativo.
            </p>

            {/* Social Media Grid - Neon Style Icons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Instagram */}
              <a
                href="https://instagram.com/petla"
                className="group flex items-center space-x-2 text-pink-400 hover:text-pink-300 transition-all duration-300 transform hover:scale-105"
                title="Instagram"
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-current drop-shadow-[0_0_8px_currentColor] group-hover:drop-shadow-[0_0_16px_currentColor]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold">Instagram</div>
                  <div className="text-xs opacity-70">Fotos diarias</div>
                </div>
              </a>

              {/* TikTok */}
              <a
                href="https://tiktok.com/@petla"
                className="group flex items-center space-x-2 text-white hover:text-gray-200 transition-all duration-300 transform hover:scale-105"
                title="TikTok"
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-current drop-shadow-[0_0_8px_currentColor] group-hover:drop-shadow-[0_0_16px_currentColor]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    strokeWidth="0"
                  >
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold">TikTok</div>
                  <div className="text-xs opacity-70">Videos virales</div>
                </div>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com/@petla"
                className="group flex items-center space-x-2 text-red-400 hover:text-red-300 transition-all duration-300 transform hover:scale-105"
                title="YouTube"
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-current drop-shadow-[0_0_8px_currentColor] group-hover:drop-shadow-[0_0_16px_currentColor]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                    <path d="m10 15 5-3-5-3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold">YouTube</div>
                  <div className="text-xs opacity-70">Tutoriales</div>
                </div>
              </a>

              {/* X (Twitter) */}
              <a
                href="https://x.com/petla"
                className="group flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-all duration-300 transform hover:scale-105"
                title="X (Twitter)"
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-current drop-shadow-[0_0_8px_currentColor] group-hover:drop-shadow-[0_0_16px_currentColor]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold">X</div>
                  <div className="text-xs opacity-70">Noticias</div>
                </div>
              </a>
            </div>

            {/* Community Stats */}
            <div className="bg-vet-gray-800 rounded-lg p-4 flex-grow">
              <h4 className="text-white font-semibold mb-3 text-sm">
                Nuestra Comunidad
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-vet-gray-300 text-xs">
                    Seguidores totales
                  </span>
                  <span className="text-vet-primary font-bold text-sm">
                    50K+
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-vet-gray-300 text-xs">
                    Videos educativos
                  </span>
                  <span className="text-vet-secondary font-bold text-sm">
                    200+
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-vet-gray-300 text-xs">
                    Historias compartidas
                  </span>
                  <span className="text-green-500 font-bold text-sm">
                    1000+
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-vet-gray-700 pt-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-3 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-vet-gray-400 text-sm">
              <p>&copy; 2024 PetLA. Todos los derechos reservados.</p>
              <div className="flex space-x-4">
                <Link
                  to="/privacidad"
                  className="hover:text-vet-primary transition-colors"
                >
                  Privacidad
                </Link>
                <Link
                  to="/terminos"
                  className="hover:text-vet-primary transition-colors"
                >
                  Términos
                </Link>
                <Link
                  to="/cookies"
                  className="hover:text-vet-primary transition-colors"
                >
                  Cookies
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-vet-gray-400 text-sm">
              <span>Hecho con</span>
              <Dog className="w-4 h-4 text-vet-secondary animate-pulse" />
              <span>para el bienestar animal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-vet-primary/5 rounded-full -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-vet-secondary/5 rounded-full translate-y-40 -translate-x-40"></div>
    </footer>
  );
}
