import { useEffect } from "react";
import Layout from "@/components/Layout";
import {
  Mail,
  Dog,
  Calendar,
  BookOpen,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  BarChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NewsletterInfo() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-vet-primary/5 to-vet-secondary/5">
        {/* Hero Section */}
        <div className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-vet-primary/10 rounded-3xl mb-8">
              <Mail className="w-10 h-10 text-vet-primary" />
            </div>
            <h1 className="text-5xl font-bold text-vet-gray-900 mb-6">
              Newsletter Veterinario
              <span className="text-vet-primary block mt-2">PetLA</span>
            </h1>
            <p className="text-xl text-vet-gray-600 max-w-2xl mx-auto mb-8">
              El boletín semanal más completo de Latinoamérica sobre salud y
              bienestar animal. Más de 50,000 familias confían en nuestros
              consejos veterinarios.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-vet-gray-500">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>50K+ suscriptores</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>4.9/5 valoración</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Cada miércoles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido del Newsletter */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Información principal */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-vet-gray-900 mb-6">
                  ¿Qué incluye nuestro newsletter?
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-vet-primary/10 rounded-xl flex items-center justify-center mt-1">
                      <Dog className="w-6 h-6 text-vet-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                        Consejos Veterinarios Semanales
                      </h3>
                      <p className="text-vet-gray-600">
                        Artículos escritos por nuestro equipo de veterinarios
                        certificados sobre prevención, nutrición, comportamiento
                        y cuidados específicos por especie.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-vet-secondary/10 rounded-xl flex items-center justify-center mt-1">
                      <Calendar className="w-6 h-6 text-vet-secondary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                        Recordatorios Personalizados
                      </h3>
                      <p className="text-vet-gray-600">
                        Calendarios de vacunación adaptados a la edad y especie
                        de tu mascota, recordatorios de desparasitación y citas
                        de control.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mt-1">
                      <BookOpen className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                        Casos Clínicos Reales
                      </h3>
                      <p className="text-vet-gray-600">
                        Historias educativas de casos reales (anonimizados) que
                        te ayudan a identificar síntomas y tomar decisiones
                        informadas sobre la salud de tu mascota.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mt-1">
                      <Star className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                        Ofertas Exclusivas
                      </h3>
                      <p className="text-vet-gray-600">
                        Descuentos especiales en consultas, vacunas, productos y
                        servicios. Solo para suscriptores de nuestro newsletter.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas Mejoradas */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-vet-gray-100">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-2xl mb-4">
                    <BarChart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-vet-gray-900 mb-2">
                    Impacto de Nuestro Newsletter
                  </h3>
                  <p className="text-vet-gray-600">
                    Números que demuestran la confianza de nuestra comunidad
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-vet-primary/5 to-vet-primary/10 rounded-2xl border border-vet-primary/20">
                    <div className="w-12 h-12 bg-vet-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-vet-primary" />
                    </div>
                    <div className="text-4xl font-bold text-vet-primary mb-2">
                      50K+
                    </div>
                    <div className="text-sm font-medium text-vet-gray-700">
                      Familias suscritas
                    </div>
                    <div className="text-xs text-vet-gray-500 mt-1">
                      Creciendo cada día
                    </div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-vet-secondary/5 to-vet-secondary/10 rounded-2xl border border-vet-secondary/20">
                    <div className="w-12 h-12 bg-vet-secondary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6 text-vet-secondary" />
                    </div>
                    <div className="text-4xl font-bold text-vet-secondary mb-2">
                      95%
                    </div>
                    <div className="text-sm font-medium text-vet-gray-700">
                      Tasa de apertura
                    </div>
                    <div className="text-xs text-vet-gray-500 mt-1">
                      Muy por encima del promedio
                    </div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
                    <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="w-6 h-6 text-green-700" />
                    </div>
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      200+
                    </div>
                    <div className="text-sm font-medium text-vet-gray-700">
                      Artículos publicados
                    </div>
                    <div className="text-xs text-vet-gray-500 mt-1">
                      Contenido de calidad
                    </div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                    <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Star className="w-6 h-6 text-purple-700" />
                    </div>
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      4.9
                    </div>
                    <div className="text-sm font-medium text-vet-gray-700">
                      Valoración promedio
                    </div>
                    <div className="text-xs text-vet-gray-500 mt-1">
                      De 5 estrellas
                    </div>
                  </div>
                </div>

                {/* Testimonios rápidos */}
                <div className="mt-8 pt-6 border-t border-vet-gray-200">
                  <div className="flex items-center justify-center space-x-8 text-sm text-vet-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>98% recomiendan</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-vet-primary rounded-full"></div>
                      <span>3 min promedio de lectura</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-vet-secondary rounded-full"></div>
                      <span>Miércoles 8:00 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview del newsletter */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-vet-gray-900 mb-6">
                  Vista previa de esta semana
                </h2>

                {/* Mock Newsletter */}
                <div className="border border-vet-gray-200 rounded-xl p-6 bg-vet-gray-50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-vet-primary rounded-full flex items-center justify-center">
                      <Dog className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-vet-gray-900">
                        Newsletter PetLA
                      </h3>
                      <p className="text-sm text-vet-gray-500">
                        Edición #127 - 17 de Enero, 2024
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-vet-gray-900 mb-2">
                        🩺 Artículo Principal: "Cómo detectar problemas dentales
                        en gatos"
                      </h4>
                      <p className="text-sm text-vet-gray-600 mb-2">
                        Los problemas dentales son una de las afecciones más
                        comunes en felinos mayores de 3 años. Aprende a
                        identificar los signos tempranos...
                      </p>
                      <div className="text-vet-primary text-sm font-medium">
                        Leer artículo completo →
                      </div>
                    </div>

                    <hr className="border-vet-gray-300" />

                    <div>
                      <h4 className="font-semibold text-vet-gray-900 mb-2">
                        Recordatorio: Vacuna antirrábica
                      </h4>
                      <p className="text-sm text-vet-gray-600">
                        Es momento de renovar la vacuna antirrábica de Luna
                        (Golden Retriever, 2 años). Programa tu cita con 20% de
                        descuento.
                      </p>
                    </div>

                    <hr className="border-vet-gray-300" />

                    <div>
                      <h4 className="font-semibold text-vet-gray-900 mb-2">
                        🏆 Caso de éxito: Recuperación de Max
                      </h4>
                      <p className="text-sm text-vet-gray-600">
                        Conoce la historia de Max, un Border Collie que se
                        recuperó completamente de una displasia de cadera
                        gracias al diagnóstico temprano...
                      </p>
                    </div>

                    <hr className="border-vet-gray-300" />

                    <div className="bg-vet-primary/10 rounded-lg p-4">
                      <h4 className="font-semibold text-vet-primary mb-2">
                        🎁 Oferta exclusiva de la semana
                      </h4>
                      <p className="text-sm text-vet-gray-700">
                        Consulta de nutrición + plan alimentario personalizado
                      </p>
                      <div className="text-lg font-bold text-vet-primary">
                        $2,500 → $1,875 (25% OFF)
                      </div>
                      <p className="text-xs text-vet-gray-600 mt-1">
                        Código: NEWSLETTER25 • Válido hasta el domingo
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonios */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-vet-gray-900 mb-6">
                  Lo que dicen nuestros suscriptores
                </h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-vet-primary pl-4">
                    <p className="text-sm text-vet-gray-700 italic mb-2">
                      "Gracias al newsletter de PetLA detecté a tiempo un
                      problema de obesidad en mi gato. Los consejos
                      nutricionales han sido increíbles."
                    </p>
                    <div className="text-xs text-vet-gray-500">
                      - María González, Ciudad de México
                    </div>
                  </div>
                  <div className="border-l-4 border-vet-secondary pl-4">
                    <p className="text-sm text-vet-gray-700 italic mb-2">
                      "Los recordatorios de vacunas me han salvado muchas veces.
                      Nunca más se me olvidará una cita importante."
                    </p>
                    <div className="text-xs text-vet-gray-500">
                      - Carlos Rodríguez, Guadalajara
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Mejorado */}
              <div className="relative overflow-hidden bg-gradient-to-br from-vet-primary via-vet-primary-dark to-vet-secondary rounded-3xl p-12 text-white">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
                  <div className="absolute bottom-10 right-10 w-32 h-32 border border-white rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white rounded-full"></div>
                </div>

                <div className="relative z-10 text-center max-w-2xl mx-auto">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm">
                    <Mail className="w-10 h-10 text-white" />
                  </div>

                  <h3 className="text-4xl font-bold mb-4">
                    ¿Listo para unirte?
                  </h3>
                  <p className="text-xl mb-2 text-white/90 leading-relaxed">
                    Únete a más de{" "}
                    <span className="font-bold text-white">
                      50,000 familias
                    </span>{" "}
                    que ya reciben nuestro newsletter veterinario.
                  </p>
                  <p className="text-white/80 mb-8">
                    Consejos profesionales, recordatorios personalizados y
                    ofertas exclusivas.
                  </p>

                  <div className="space-y-4">
                    <Link to="/#newsletter">
                      <Button className="bg-white text-vet-primary hover:bg-vet-gray-100 font-bold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                        <Mail className="mr-3 w-5 h-5" />
                        Suscribirme Gratis Ahora
                        <ArrowRight className="ml-3 w-5 h-5" />
                      </Button>
                    </Link>

                    <div className="flex items-center justify-center space-x-6 text-sm text-white/80">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Sin spam</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Cancela cuando quieras</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>100% gratis</span>
                      </div>
                    </div>
                  </div>

                  {/* Social Proof */}
                  <div className="mt-8 pt-8 border-t border-white/20">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full border-2 border-white"></div>
                        <div className="w-8 h-8 bg-white/20 rounded-full border-2 border-white"></div>
                        <div className="w-8 h-8 bg-white/20 rounded-full border-2 border-white"></div>
                        <div className="w-8 h-8 bg-white/20 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold">
                          +50K
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-300 fill-current" />
                          <Star className="w-4 h-4 text-yellow-300 fill-current" />
                          <Star className="w-4 h-4 text-yellow-300 fill-current" />
                          <Star className="w-4 h-4 text-yellow-300 fill-current" />
                          <Star className="w-4 h-4 text-yellow-300 fill-current" />
                          <span className="text-sm font-semibold ml-1">
                            4.9
                          </span>
                        </div>
                        <p className="text-xs text-white/70">
                          Valorado por nuestra comunidad
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
