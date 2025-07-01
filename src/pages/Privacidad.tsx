import { useEffect } from "react";
import Layout from "@/components/Layout";
import { Shield, Eye, Lock, UserCheck, Clock, FileText } from "lucide-react";

export default function Privacidad() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-vet-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-vet-primary/10 rounded-2xl mb-6">
              <Shield className="w-8 h-8 text-vet-primary" />
            </div>
            <h1 className="text-4xl font-bold text-vet-gray-900 mb-4">
              Política de Privacidad
            </h1>
            <p className="text-xl text-vet-gray-600 max-w-2xl mx-auto">
              En PetLA, protegemos tu información personal y la de tus mascotas
              con los más altos estándares de seguridad.
            </p>
            <div className="inline-flex items-center text-sm text-vet-gray-500 mt-4">
              <Clock className="w-4 h-4 mr-2" />
              Última actualización: 15 de Enero, 2024
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            {/* Sección 1: Información que Recopilamos */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-vet-primary/10 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-vet-primary" />
                </div>
                <h2 className="text-2xl font-bold text-vet-gray-900">
                  Información que Recopilamos
                </h2>
              </div>
              <div className="space-y-4 text-vet-gray-700">
                <h3 className="text-lg font-semibold text-vet-gray-900">
                  Información Personal
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Nombre completo, dirección de email y número de teléfono
                  </li>
                  <li>Dirección de residencia para servicios a domicilio</li>
                  <li>Información de facturación y métodos de pago</li>
                  <li>Historial de citas y servicios veterinarios</li>
                </ul>

                <h3 className="text-lg font-semibold text-vet-gray-900 mt-6">
                  Información de Mascotas
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Nombre, especie, raza, edad y características físicas</li>
                  <li>Historial médico, vacunas y tratamientos</li>
                  <li>Fotografías y documentos médicos</li>
                  <li>Información de emergencias y contactos veterinarios</li>
                </ul>
              </div>
            </section>

            {/* Sección 2: Cómo Usamos la Información */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-vet-secondary/10 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-vet-secondary" />
                </div>
                <h2 className="text-2xl font-bold text-vet-gray-900">
                  Cómo Usamos tu Información
                </h2>
              </div>
              <div className="space-y-4 text-vet-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-vet-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-vet-gray-900 mb-3">
                      Servicios Veterinarios
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Programar y gestionar citas médicas</li>
                      <li>Mantener historiales clínicos actualizados</li>
                      <li>Proporcionar tratamientos personalizados</li>
                      <li>Enviar recordatorios de vacunas y citas</li>
                    </ul>
                  </div>
                  <div className="bg-vet-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-vet-gray-900 mb-3">
                      Comunicaciones
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Notificaciones sobre el estado de tu mascota</li>
                      <li>Newsletter con consejos veterinarios</li>
                      <li>Actualizaciones sobre nuevos servicios</li>
                      <li>Comunicación en casos de emergencia</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Sección 3: Protección de Datos */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-vet-gray-900">
                  Protección y Seguridad
                </h2>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-vet-primary/5 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-vet-gray-900 mb-2">
                      Encriptación SSL
                    </h3>
                    <p className="text-sm text-vet-gray-600">
                      Todas las comunicaciones están protegidas con encriptación
                      de grado militar
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-vet-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Lock className="w-6 h-6 text-vet-primary" />
                    </div>
                    <h3 className="font-semibold text-vet-gray-900 mb-2">
                      Acceso Limitado
                    </h3>
                    <p className="text-sm text-vet-gray-600">
                      Solo personal autorizado puede acceder a tu información
                      médica
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-vet-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-vet-secondary" />
                    </div>
                    <h3 className="font-semibold text-vet-gray-900 mb-2">
                      Cumplimiento Legal
                    </h3>
                    <p className="text-sm text-vet-gray-600">
                      Cumplimos con todas las regulaciones de protección de
                      datos
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sección 4: Tus Derechos */}
            <section>
              <h2 className="text-2xl font-bold text-vet-gray-900 mb-6">
                Tus Derechos sobre la Información
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-vet-gray-200 rounded-xl p-4">
                  <h3 className="font-semibold text-vet-gray-900 mb-2">
                    Acceso y Corrección
                  </h3>
                  <p className="text-sm text-vet-gray-600">
                    Puedes solicitar acceso a tu información y corregir
                    cualquier dato inexacto
                  </p>
                </div>
                <div className="border border-vet-gray-200 rounded-xl p-4">
                  <h3 className="font-semibold text-vet-gray-900 mb-2">
                    Eliminación
                  </h3>
                  <p className="text-sm text-vet-gray-600">
                    Puedes solicitar la eliminación de tu información personal
                  </p>
                </div>
                <div className="border border-vet-gray-200 rounded-xl p-4">
                  <h3 className="font-semibold text-vet-gray-900 mb-2">
                    Portabilidad
                  </h3>
                  <p className="text-sm text-vet-gray-600">
                    Puedes obtener una copia de tu información en formato
                    portable
                  </p>
                </div>
                <div className="border border-vet-gray-200 rounded-xl p-4">
                  <h3 className="font-semibold text-vet-gray-900 mb-2">
                    Limitación
                  </h3>
                  <p className="text-sm text-vet-gray-600">
                    Puedes limitar cómo procesamos tu información personal
                  </p>
                </div>
              </div>
            </section>

            {/* Contacto */}
            <section className="bg-vet-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-vet-gray-900 mb-4">
                ¿Preguntas sobre Privacidad?
              </h2>
              <p className="text-vet-gray-700 mb-4">
                Si tienes preguntas sobre esta política de privacidad o cómo
                manejamos tu información, contáctanos:
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Email:</strong> privacidad@petla.com
                </p>
                <p>
                  <strong>Teléfono:</strong> (555) 123-4567 ext. 101
                </p>
                <p>
                  <strong>Dirección:</strong> Av. Principal 123, Centro Médico
                  Veterinario
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
