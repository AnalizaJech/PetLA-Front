import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Cookie, Settings, Eye, BarChart, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Cookies() {
  const [cookieSettings, setCookieSettings] = useState({
    essential: true, // Always enabled
    analytics: true,
    marketing: false,
    preferences: true,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSaveSettings = () => {
    // Here you would save the cookie preferences
    console.log("Cookie settings saved:", cookieSettings);
    // Show success message or redirect
  };

  return (
    <Layout>
      <div className="min-h-screen bg-vet-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-6">
              <Cookie className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-4xl font-bold text-vet-gray-900 mb-4">
              Política de Cookies
            </h1>
            <p className="text-xl text-vet-gray-600 max-w-2xl mx-auto">
              Entende cómo PetLA utiliza cookies para mejorar tu experiencia y
              personalizar nuestros servicios.
            </p>
            <div className="inline-flex items-center text-sm text-vet-gray-500 mt-4">
              <Clock className="w-4 h-4 mr-2" />
              Última actualización: 15 de Enero, 2024
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* ¿Qué son las cookies? */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-vet-gray-900">
                  ¿Qué son las cookies?
                </h2>
              </div>
              <p className="text-vet-gray-700 mb-4">
                Las cookies son pequeños archivos de texto que se almacenan en
                tu dispositivo cuando visitas nuestro sitio web. Nos ayudan a
                recordar tus preferencias, mejorar la seguridad y personalizar
                tu experiencia con PetLA.
              </p>
              <div className="bg-vet-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-vet-gray-900 mb-3">
                  ¿Por qué usamos cookies?
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-vet-gray-700">
                  <li>Mantener tu sesión activa mientras navegas</li>
                  <li>Recordar tus preferencias de idioma y configuración</li>
                  <li>Analizar cómo usas nuestra plataforma para mejorarla</li>
                  <li>Personalizar el contenido que te mostramos</li>
                  <li>Proteger tu cuenta contra actividades sospechosas</li>
                </ul>
              </div>
            </div>

            {/* Tipos de cookies */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-vet-gray-900 mb-6">
                Tipos de Cookies que Utilizamos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cookies Esenciales */}
                <div className="border border-green-200 rounded-xl p-6 bg-green-50">
                  <div className="flex items-center space-x-3 mb-4">
                    <Shield className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-800">
                      Cookies Esenciales
                    </h3>
                  </div>
                  <p className="text-sm text-green-700 mb-3">
                    Necesarias para el funcionamiento básico del sitio. No se
                    pueden desactivar.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-green-600">
                    <li>Autenticación de usuario</li>
                    <li>Seguridad de la sesión</li>
                    <li>Preferencias de idioma</li>
                    <li>Funcionalidad del carrito</li>
                  </ul>
                </div>

                {/* Cookies de Rendimiento */}
                <div className="border border-vet-primary/30 rounded-xl p-6 bg-vet-primary/5">
                  <div className="flex items-center space-x-3 mb-4">
                    <BarChart className="w-6 h-6 text-vet-primary" />
                    <h3 className="text-lg font-semibold text-vet-primary">
                      Cookies de Análisis
                    </h3>
                  </div>
                  <p className="text-sm text-vet-gray-700 mb-3">
                    Nos ayudan a entender cómo los usuarios interactúan con
                    PetLA.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-vet-gray-600">
                    <li>Google Analytics</li>
                    <li>Análisis de comportamiento</li>
                    <li>Métricas de rendimiento</li>
                    <li>Informes de errores</li>
                  </ul>
                </div>

                {/* Cookies de Marketing */}
                <div className="border border-vet-secondary/30 rounded-xl p-6 bg-vet-secondary/5">
                  <div className="flex items-center space-x-3 mb-4">
                    <Eye className="w-6 h-6 text-vet-secondary" />
                    <h3 className="text-lg font-semibold text-vet-secondary">
                      Cookies de Marketing
                    </h3>
                  </div>
                  <p className="text-sm text-vet-gray-700 mb-3">
                    Para mostrar anuncios relevantes y medir la efectividad de
                    campañas.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-vet-gray-600">
                    <li>Facebook Pixel</li>
                    <li>Google Ads</li>
                    <li>Remarketing</li>
                    <li>Análisis de conversiones</li>
                  </ul>
                </div>

                {/* Cookies de Preferencias */}
                <div className="border border-purple-200 rounded-xl p-6 bg-purple-50">
                  <div className="flex items-center space-x-3 mb-4">
                    <Settings className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-purple-700">
                      Cookies de Preferencias
                    </h3>
                  </div>
                  <p className="text-sm text-purple-700 mb-3">
                    Personalizan tu experiencia recordando tus configuraciones.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-purple-600">
                    <li>Tema de la interfaz</li>
                    <li>Configuraciones de notificaciones</li>
                    <li>Preferencias de visualización</li>
                    <li>Configuración de dashboard</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Configuración de Cookies */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-vet-primary/10 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-vet-primary" />
                </div>
                <h2 className="text-2xl font-bold text-vet-gray-900">
                  Configurar tus Preferencias de Cookies
                </h2>
              </div>

              <p className="text-vet-gray-700 mb-6">
                Puedes controlar qué tipos de cookies quieres permitir. Las
                cookies esenciales no se pueden desactivar ya que son necesarias
                para el funcionamiento del sitio.
              </p>

              <div className="space-y-4">
                {/* Cookies Esenciales */}
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                  <div>
                    <h3 className="font-semibold text-green-800">
                      Cookies Esenciales
                    </h3>
                    <p className="text-sm text-green-700">
                      Siempre activas (requeridas)
                    </p>
                  </div>
                  <div className="w-12 h-6 bg-green-500 rounded-full flex items-center p-1">
                    <div className="w-4 h-4 bg-white rounded-full ml-auto transition-all duration-300"></div>
                  </div>
                </div>

                {/* Cookies de Análisis */}
                <div className="flex items-center justify-between p-4 bg-vet-gray-50 rounded-xl border border-vet-gray-200">
                  <div>
                    <h3 className="font-semibold text-vet-gray-900">
                      Cookies de Análisis
                    </h3>
                    <p className="text-sm text-vet-gray-700">
                      Nos ayudan a mejorar PetLA
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setCookieSettings((prev) => ({
                        ...prev,
                        analytics: !prev.analytics,
                      }))
                    }
                    className={`w-12 h-6 rounded-full flex items-center p-1 transition-all duration-300 ${
                      cookieSettings.analytics
                        ? "bg-vet-primary"
                        : "bg-vet-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                        cookieSettings.analytics ? "ml-auto" : ""
                      }`}
                    ></div>
                  </button>
                </div>

                {/* Cookies de Marketing */}
                <div className="flex items-center justify-between p-4 bg-vet-gray-50 rounded-xl border border-vet-gray-200">
                  <div>
                    <h3 className="font-semibold text-vet-gray-900">
                      Cookies de Marketing
                    </h3>
                    <p className="text-sm text-vet-gray-700">
                      Para anuncios personalizados
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setCookieSettings((prev) => ({
                        ...prev,
                        marketing: !prev.marketing,
                      }))
                    }
                    className={`w-12 h-6 rounded-full flex items-center p-1 transition-all duration-300 ${
                      cookieSettings.marketing
                        ? "bg-vet-secondary"
                        : "bg-vet-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                        cookieSettings.marketing ? "ml-auto" : ""
                      }`}
                    ></div>
                  </button>
                </div>

                {/* Cookies de Preferencias */}
                <div className="flex items-center justify-between p-4 bg-vet-gray-50 rounded-xl border border-vet-gray-200">
                  <div>
                    <h3 className="font-semibold text-vet-gray-900">
                      Cookies de Preferencias
                    </h3>
                    <p className="text-sm text-vet-gray-700">
                      Personalizan tu experiencia
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setCookieSettings((prev) => ({
                        ...prev,
                        preferences: !prev.preferences,
                      }))
                    }
                    className={`w-12 h-6 rounded-full flex items-center p-1 transition-all duration-300 ${
                      cookieSettings.preferences
                        ? "bg-purple-500"
                        : "bg-vet-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                        cookieSettings.preferences ? "ml-auto" : ""
                      }`}
                    ></div>
                  </button>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <Button
                  onClick={handleSaveSettings}
                  className="bg-vet-primary hover:bg-vet-primary-dark text-white"
                >
                  Guardar Preferencias
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCookieSettings({
                      essential: true,
                      analytics: false,
                      marketing: false,
                      preferences: false,
                    })
                  }
                >
                  Rechazar Todas (Excepto Esenciales)
                </Button>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-vet-gray-900 mb-6">
                Control de Cookies en tu Navegador
              </h2>
              <p className="text-vet-gray-700 mb-4">
                También puedes controlar las cookies directamente desde la
                configuración de tu navegador:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-vet-gray-200 rounded-xl p-4 text-center">
                  <h3 className="font-semibold text-vet-gray-900 mb-2">
                    Chrome
                  </h3>
                  <p className="text-sm text-vet-gray-600">
                    Configuración → Privacidad y seguridad → Cookies
                  </p>
                </div>
                <div className="border border-vet-gray-200 rounded-xl p-4 text-center">
                  <h3 className="font-semibold text-vet-gray-900 mb-2">
                    Firefox
                  </h3>
                  <p className="text-sm text-vet-gray-600">
                    Opciones → Privacidad y seguridad → Cookies
                  </p>
                </div>
                <div className="border border-vet-gray-200 rounded-xl p-4 text-center">
                  <h3 className="font-semibold text-vet-gray-900 mb-2">
                    Safari
                  </h3>
                  <p className="text-sm text-vet-gray-600">
                    Preferencias → Privacidad → Cookies
                  </p>
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="bg-vet-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-vet-gray-900 mb-4">
                ¿Preguntas sobre las Cookies?
              </h2>
              <p className="text-vet-gray-700 mb-4">
                Si tienes preguntas sobre nuestra política de cookies,
                contáctanos:
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Email:</strong> cookies@petla.com
                </p>
                <p>
                  <strong>Teléfono:</strong> (555) 123-4567 ext. 103
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
