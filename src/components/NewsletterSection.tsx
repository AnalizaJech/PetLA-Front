import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Mail, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsSubscribed(true);
  };

  if (isSubscribed) {
    return (
      <section
        id="newsletter"
        className="py-20 bg-gradient-to-br from-vet-primary/5 to-vet-secondary/5 relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-lg">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-vet-gray-900 mb-4">
              ¡Bienvenido a la familia PetLA! 🎉
            </h3>
            <p className="text-lg text-vet-gray-600 mb-8">
              Te has suscrito exitosamente. Recibirás consejos veterinarios,
              recordatorios y ofertas especiales directamente en tu email.
            </p>
            <div className="flex items-center justify-center space-x-4 text-vet-gray-500">
              <span>📧 Primer email en camino</span>
              <span>•</span>
              <span>🎁 Descuento de bienvenida incluido</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="newsletter"
      className="py-20 bg-gradient-to-br from-vet-primary/5 to-vet-secondary/5 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center px-4 py-2 bg-vet-primary/10 rounded-full mb-6">
              <Mail className="w-4 h-4 text-vet-primary mr-2" />
              <span className="text-vet-primary font-semibold text-sm">
                NEWSLETTER VETERINARIO
              </span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-vet-gray-900 mb-6">
              Mantente conectado con
              <span className="text-vet-primary block lg:inline lg:ml-3">
                PetLA
              </span>
            </h2>

            <p className="text-xl text-vet-gray-600 mb-8 leading-relaxed">
              Recibe consejos veterinarios exclusivos, recordatorios de vacunas
              personalizados y ofertas especiales para el cuidado de tus
              mascotas.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-vet-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-vet-primary" />
                </div>
                <span className="text-vet-gray-700">
                  Consejos veterinarios semanales
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-vet-secondary/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-vet-secondary" />
                </div>
                <span className="text-vet-gray-700">
                  Recordatorios de vacunas automáticos
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-vet-gray-700">
                  Descuentos exclusivos para suscriptores
                </span>
              </div>
            </div>

            {/* Newsletter Form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 h-14 px-6 text-lg border-2 border-vet-gray-300 focus:border-vet-primary"
                required
              />
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className={`h-14 px-8 bg-vet-primary hover:bg-vet-primary-dark text-white font-semibold transition-all duration-300 ${
                  isLoading
                    ? "animate-pulse scale-95"
                    : "hover:scale-105 hover:shadow-lg active:scale-95"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Suscribiendo...
                  </>
                ) : (
                  <>
                    Suscribirme Gratis
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-sm text-vet-gray-500 mt-4">
              Sin spam. Cancela cuando quieras. 💜 Más de 1,000 veterinarios
              confían en nosotros.
            </p>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-vet-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-vet-primary" />
                </div>
                <h3 className="text-xl font-bold text-vet-gray-900">
                  Newsletter Semanal
                </h3>
              </div>

              {/* Mock Email Preview */}
              <div className="bg-vet-gray-50 rounded-xl p-6 text-left">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-vet-primary rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-vet-gray-900">
                      PetLA Newsletter
                    </p>
                    <p className="text-sm text-vet-gray-500">
                      Consejos para esta semana
                    </p>
                  </div>
                </div>
                <h4 className="font-semibold text-vet-gray-900 mb-2">
                  5 señales de que tu perro necesita atención veterinaria
                </h4>
                <p className="text-sm text-vet-gray-600 mb-4">
                  Aprende a identificar síntomas tempranos y cuándo es momento
                  de programar una consulta...
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-vet-gray-500">
                    Tiempo de lectura: 3 min
                  </span>
                  <Link
                    to="/newsletter-info"
                    className="text-vet-primary text-sm font-semibold hover:text-vet-primary-dark transition-colors"
                  >
                    Leer más →
                  </Link>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-vet-secondary/20 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-xl">🐕</span>
            </div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-vet-primary/20 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-xl">🐱</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background decorations */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-vet-primary/5 rounded-full animate-float"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-vet-secondary/5 rounded-full animate-float delay-1000"></div>
    </section>
  );
}
