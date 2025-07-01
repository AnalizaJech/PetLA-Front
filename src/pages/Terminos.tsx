import { useEffect } from "react";
import Layout from "@/components/Layout";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Users,
  Clock,
  Phone,
} from "lucide-react";

export default function Terminos() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-vet-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-vet-secondary/10 rounded-2xl mb-6">
              <FileText className="w-8 h-8 text-vet-secondary" />
            </div>
            <h1 className="text-4xl font-bold text-vet-gray-900 mb-4">
              Términos y Condiciones
            </h1>
            <p className="text-xl text-vet-gray-600 max-w-2xl mx-auto">
              Al usar los servicios de PetLA, aceptas estos términos y
              condiciones de uso.
            </p>
            <div className="inline-flex items-center text-sm text-vet-gray-500 mt-4">
              <Clock className="w-4 h-4 mr-2" />
              Última actualización: 15 de Enero, 2024
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            {/* Aviso Importante */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">
                    Aviso Importante
                  </h3>
                  <p className="text-amber-700 text-sm">
                    PetLA es una plataforma tecnológica que conecta a dueños de
                    mascotas con profesionales veterinarios. No reemplazamos el
                    juicio clínico profesional ni proporcionamos diagnósticos
                    médicos directos.
                  </p>
                </div>
              </div>
            </div>

            {/* Sección 1: Definiciones */}
            <section>
              <h2 className="text-2xl font-bold text-vet-gray-900 mb-6">
                1. Definiciones
              </h2>
              <div className="space-y-4">
                <div className="border-l-4 border-vet-primary pl-4">
                  <p className="text-vet-gray-700">
                    <strong>"PetLA"</strong> se refiere a la plataforma digital,
                    aplicación móvil y servicios veterinarios proporcionados por
                    nuestra empresa.
                  </p>
                </div>
                <div className="border-l-4 border-vet-secondary pl-4">
                  <p className="text-vet-gray-700">
                    <strong>"Usuario"</strong> incluye dueños de mascotas,
                    veterinarios y administradores que utilizan nuestros
                    servicios.
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-vet-gray-700">
                    <strong>"Servicios"</strong> comprende consultas
                    veterinarias, gestión de citas, historial médico digital y
                    servicios de emergencia.
                  </p>
                </div>
              </div>
            </section>

            {/* Sección 2: Servicios Ofrecidos */}
            <section>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-vet-primary/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-vet-primary" />
                </div>
                <h2 className="text-2xl font-bold text-vet-gray-900">
                  2. Servicios Ofrecidos
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-vet-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-vet-gray-900 mb-3">
                    Servicios Principales
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-vet-gray-700">
                    <li>Consultas veterinarias presenciales y virtuales</li>
                    <li>Gestión de citas y recordatorios automáticos</li>
                    <li>Historial médico digital de mascotas</li>
                    <li>Servicios de emergencia 24/7</li>
                    <li>Programa de vacunación y desparasitación</li>
                  </ul>
                </div>
                <div className="bg-vet-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-vet-gray-900 mb-3">
                    Servicios Adicionales
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-vet-gray-700">
                    <li>Consultoría nutricional personalizada</li>
                    <li>Seguimiento post-operatorio</li>
                    <li>Educación y recursos para dueños</li>
                    <li>Integración con laboratorios y farmacias</li>
                    <li>Reportes de salud y tendencias</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Sección 3: Responsabilidades del Usuario */}
            <section>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-vet-secondary/10 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-vet-secondary" />
                </div>
                <h2 className="text-2xl font-bold text-vet-gray-900">
                  3. Responsabilidades del Usuario
                </h2>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-vet-gray-900">
                  Como dueño de mascota, te comprometes a:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-vet-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-vet-gray-900 mb-2">
                      Información Veraz
                    </h4>
                    <p className="text-sm text-vet-gray-600">
                      Proporcionar información precisa y actualizada sobre tu
                      mascota y su historial médico
                    </p>
                  </div>
                  <div className="border border-vet-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-vet-gray-900 mb-2">
                      Seguimiento de Tratamientos
                    </h4>
                    <p className="text-sm text-vet-gray-600">
                      Seguir las indicaciones médicas y completar los
                      tratamientos prescritos
                    </p>
                  </div>
                  <div className="border border-vet-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-vet-gray-900 mb-2">
                      Pago Oportuno
                    </h4>
                    <p className="text-sm text-vet-gray-600">
                      Realizar los pagos de servicios en los tiempos acordados
                    </p>
                  </div>
                  <div className="border border-vet-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-vet-gray-900 mb-2">
                      Uso Apropiado
                    </h4>
                    <p className="text-sm text-vet-gray-600">
                      Utilizar la plataforma de manera responsable y respetuosa
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sección 4: Política de Cancelaciones */}
            <section>
              <h2 className="text-2xl font-bold text-vet-gray-900 mb-6">
                4. Política de Cancelaciones y Reembolsos
              </h2>
              <div className="bg-gradient-to-r from-vet-primary/5 to-vet-secondary/5 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-vet-gray-900 mb-2">
                      24+ Horas
                    </h3>
                    <p className="text-sm text-vet-gray-600">
                      Cancelación gratuita con reembolso completo
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-vet-gray-900 mb-2">
                      2-24 Horas
                    </h3>
                    <p className="text-sm text-vet-gray-600">
                      Cargo del 50% por cancelación tardía
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-vet-gray-900 mb-2">
                      Menos de 2h
                    </h3>
                    <p className="text-sm text-vet-gray-600">
                      Cargo completo por inasistencia
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sección 5: Limitaciones de Responsabilidad */}
            <section>
              <h2 className="text-2xl font-bold text-vet-gray-900 mb-6">
                5. Limitaciones de Responsabilidad
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4">
                  Importantes Limitaciones
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-red-700">
                  <li>
                    PetLA no se hace responsable por diagnósticos incorrectos o
                    tratamientos fallidos
                  </li>
                  <li>
                    Los usuarios son responsables de seguir las recomendaciones
                    veterinarias
                  </li>
                  <li>
                    En emergencias, siempre contacta primero a servicios de
                    emergencia veterinaria locales
                  </li>
                  <li>
                    La plataforma puede experimentar interrupciones técnicas
                    ocasionales
                  </li>
                </ul>
              </div>
            </section>

            {/* Sección 6: Modificaciones */}
            <section>
              <h2 className="text-2xl font-bold text-vet-gray-900 mb-4">
                6. Modificaciones a los Términos
              </h2>
              <p className="text-vet-gray-700 mb-4">
                PetLA se reserva el derecho de modificar estos términos en
                cualquier momento. Las modificaciones entrarán en vigor 30 días
                después de su publicación en la plataforma.
              </p>
              <p className="text-vet-gray-700">
                Es tu responsabilidad revisar periódicamente estos términos para
                mantenerte informado de cualquier cambio.
              </p>
            </section>

            {/* Contacto */}
            <section className="bg-vet-gray-50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Phone className="w-6 h-6 text-vet-primary" />
                <h2 className="text-xl font-bold text-vet-gray-900">
                  Contacto para Términos Legales
                </h2>
              </div>
              <p className="text-vet-gray-700 mb-4">
                Para preguntas sobre estos términos y condiciones:
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Email Legal:</strong> legal@petla.com
                </p>
                <p>
                  <strong>Teléfono:</strong> (555) 123-4567 ext. 102
                </p>
                <p>
                  <strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
