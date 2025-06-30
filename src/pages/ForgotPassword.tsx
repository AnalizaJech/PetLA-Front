import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft, CheckCircle, Shield } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock validation
    if (email) {
      setIsEmailSent(true);
    } else {
      setError("Por favor ingresa un email válido");
    }
    setIsLoading(false);
  };

  if (isEmailSent) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-vet-gray-900 mb-4">
            ¡Email enviado!
          </h2>
          <p className="text-vet-gray-600 max-w-md mx-auto">
            Te hemos enviado un enlace para restablecer tu contraseña a{" "}
            <span className="font-semibold text-vet-primary">{email}</span>
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-vet-gray-900 mb-4">
                  Próximos pasos:
                </h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-vet-primary/20 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold text-vet-primary">
                        1
                      </span>
                    </div>
                    <p className="text-sm text-vet-gray-700">
                      Revisa tu bandeja de entrada y spam
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-vet-primary/20 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold text-vet-primary">
                        2
                      </span>
                    </div>
                    <p className="text-sm text-vet-gray-700">
                      Haz clic en el enlace de restablecimiento
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-vet-primary/20 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold text-vet-primary">
                        3
                      </span>
                    </div>
                    <p className="text-sm text-vet-gray-700">
                      Crea tu nueva contraseña segura
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-vet-gray-50 rounded-xl p-4 mt-6">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-vet-primary" />
                  <div>
                    <p className="text-sm font-medium text-vet-gray-900">
                      Enlace válido por 24 horas
                    </p>
                    <p className="text-xs text-vet-gray-600">
                      Por seguridad, el enlace expirará automáticamente
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3 pt-4">
                <Button
                  onClick={() => {
                    setIsEmailSent(false);
                    setEmail("");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Enviar nuevamente
                </Button>
                <Link to="/login">
                  <Button className="w-full bg-vet-primary hover:bg-vet-primary-dark">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Volver al login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-vet-primary/10 rounded-2xl mb-6">
          <Mail className="w-8 h-8 text-vet-primary" />
        </div>
        <h2 className="text-3xl font-bold text-vet-gray-900">
          ¿Olvidaste tu contraseña?
        </h2>
        <p className="mt-2 text-vet-gray-600">
          No te preocupes, te ayudamos a recuperar el acceso
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Restablecer contraseña</CardTitle>
          <CardDescription className="text-center">
            Ingresa tu email y te enviaremos un enlace para crear una nueva
            contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-vet-gray-500">
                Te enviaremos las instrucciones a este email
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-vet-primary hover:bg-vet-primary-dark"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 w-4 h-4" />
                  Enviar enlace de restablecimiento
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-vet-gray-600 hover:text-vet-primary transition-colors"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Volver a iniciar sesión
        </Link>
      </div>

      <div className="bg-vet-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-vet-gray-900 mb-3 text-center">
          ¿Necesitas ayuda?
        </h3>
        <div className="space-y-2 text-sm text-vet-gray-600 text-center">
          <p>
            Si no recibes el email en unos minutos, revisa tu carpeta de spam
          </p>
          <p>
            ¿Sigues teniendo problemas?{" "}
            <a
              href="mailto:soporte@petla.com"
              className="text-vet-primary hover:text-vet-primary-dark font-medium"
            >
              Contacta soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
