import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dog, Mail, Lock, User, Phone, Eye, EyeOff, MapPin, Calendar, UserCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoginFormData, RegistroClienteFormData } from "@/lib/types";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Determinar pestaña inicial basada en la ruta
  const isRegisterRoute = location.pathname === "/registro";
  const defaultTab = isRegisterRoute ? "register" : "login";

  // Login form state
  const [loginData, setLoginData] = useState<LoginFormData>({
    identifier: "",
    password: "",
  });

  // Registration form state
  const [registerData, setRegisterData] = useState<RegistroClienteFormData>({
    nombre: "",
    apellidos: "",
    username: "",
    email: "",
    telefono: "",
    direccion: "",
    fechaNacimiento: "",
    genero: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const user = await login(loginData.identifier, loginData.password);

      if (user) {
        navigate("/dashboard");
      } else {
        setError("Credenciales inválidas. Verifica tu email/teléfono/usuario y contraseña.");
      }
    } catch (error) {
      setError("Error al iniciar sesión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (registerData.password !== registerData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const userData = {
        nombre: registerData.nombre,
        apellidos: registerData.apellidos,
        username: registerData.username,
        email: registerData.email,
        telefono: registerData.telefono,
        direccion: registerData.direccion,
        fechaNacimiento: registerData.fechaNacimiento ? new Date(registerData.fechaNacimiento) : undefined,
        genero: registerData.genero,
        rol: "cliente" as const,
        password: registerData.password,
      };

      const user = await register(userData);

      if (user) {
        navigate("/dashboard");
      } else {
        setError(
          "Email ya registrado. Intenta iniciar sesión o usa otro email.",
        );
      }
    } catch (error) {
      setError("Error al crear la cuenta. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-vet-gray-900 mb-4">
          Bienvenido a PetLA
        </h2>
        <p className="text-lg text-vet-gray-600">
          Accede a tu cuenta o crea una nueva
        </p>
      </div>

      <Tabs
        defaultValue={defaultTab}
        className="w-full max-w-2xl mx-auto"
        onValueChange={(value) => {
          if (value === "login") {
            navigate("/login");
          } else if (value === "register") {
            navigate("/registro");
          }
        }}
      >
        <TabsList className="grid w-full grid-cols-2 h-12 mb-8">
          <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
          <TabsTrigger value="register">Registrarse</TabsTrigger>
        </TabsList>

        {/* Login Tab */}
        <TabsContent value="login">
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-vet-primary" />
                <span>Iniciar Sesión</span>
              </CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder a tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-identifier">Correo / Teléfono / Usuario</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                    <Input
                      id="login-identifier"
                      type="text"
                      placeholder="correo@vetcare.com"
                      className="pl-10 h-10 border-vet-gray-200 focus:border-vet-primary focus:ring-vet-primary/10"
                      value={loginData.identifier}
                      onChange={(e) =>
                        setLoginData({ ...loginData, identifier: e.target.value })
                      }
                      required
                    />
                  </div>
                  <p className="text-xs text-vet-gray-500">
                    Puedes usar tu correo electrónico, número de teléfono o nombre de usuario
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tu contraseña"
                      className="pl-10 pr-10 h-10 border-vet-gray-200 focus:border-vet-primary focus:ring-vet-primary/10"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-vet-gray-400 hover:text-vet-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-4 h-4 rounded border-vet-gray-300 text-vet-primary focus:ring-vet-primary/20 focus:ring-2"
                    />
                    <Label htmlFor="remember" className="text-sm">
                      Recordarme
                    </Label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-vet-primary hover:text-vet-primary-dark"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-vet-primary hover:bg-vet-primary-dark text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Register Tab */}
        <TabsContent value="register">
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Dog className="w-5 h-5 text-vet-primary" />
                <span>Crear Cuenta</span>
              </CardTitle>
              <CardDescription>
                Regístrate para acceder a todos nuestros servicios
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nombres</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Ej: Carlos"
                        className="pl-10 h-10 border-vet-gray-200 focus:border-vet-primary focus:ring-vet-primary/10"
                        value={registerData.nombre}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            nombre: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-apellidos">Apellidos</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                      <Input
                        id="register-apellidos"
                        type="text"
                        placeholder="Ej: Ramírez"
                        className="pl-10 h-10 border-vet-gray-200 focus:border-vet-primary focus:ring-vet-primary/10"
                        value={registerData.apellidos}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            apellidos: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-username">Nombre de usuario</Label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Ej: carlos123"
                      className="pl-10 h-12 border-vet-gray-200 focus:border-vet-primary focus:ring-vet-primary/10"
                      value={registerData.username}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          username: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="tu@email.com"
                      className="pl-10 h-12 border-vet-gray-200 focus:border-vet-primary focus:ring-vet-primary/10"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="+52 55 1234 5678"
                      className="pl-10 h-12 border-vet-gray-200 focus:border-vet-primary focus:ring-vet-primary/10"
                      value={registerData.telefono}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          telefono: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-direccion">Dirección (opcional)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                    <Input
                      id="register-direccion"
                      type="text"
                      placeholder="Tu dirección completa"
                      className="pl-10 h-12 border-vet-gray-200 focus:border-vet-primary focus:ring-vet-primary/10"
                      value={registerData.direccion}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          direccion: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-birthdate">Fecha de nacimiento (opcional)</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                      <Input
                        id="register-birthdate"
                        type="date"
                        className="pl-10 h-12 border-vet-gray-200 focus:border-vet-primary focus:ring-vet-primary/10"
                        value={registerData.fechaNacimiento}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            fechaNacimiento: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-genero">Género (opcional)</Label>
                    <Select
                      value={registerData.genero}
                      onValueChange={(value) =>
                        setRegisterData({
                          ...registerData,
                          genero: value,
                        })
                      }
                    >
                      <SelectTrigger className="h-12 border-vet-gray-200 focus:border-vet-primary focus:ring-vet-primary/10">
                        <SelectValue placeholder="Seleccionar género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                        <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      className="pl-10 pr-10 h-12 border-vet-gray-200 focus:border-vet-primary focus:ring-vet-primary/10"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-vet-gray-400 hover:text-vet-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                    <Input
                      id="register-confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repite tu contraseña"
                      className="pl-10 h-12 border-vet-gray-200 focus:border-vet-primary focus:ring-vet-primary/10"
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1.5 w-4 h-4 rounded border-vet-gray-300 text-vet-primary focus:ring-vet-primary/20 focus:ring-2"
                    required
                  />
                  <Label htmlFor="terms" className="text-sm text-vet-gray-600">
                    Acepto los{" "}
                    <Link
                      to="/terminos"
                      className="text-vet-primary hover:text-vet-primary-dark"
                    >
                      términos y condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link
                      to="/privacidad"
                      className="text-vet-primary hover:text-vet-primary-dark"
                    >
                      política de privacidad
                    </Link>
                    .
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-vet-primary hover:bg-vet-primary-dark text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear Cuenta"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
