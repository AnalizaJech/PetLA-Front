import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { animateCounters } from "@/lib/counter";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import Layout from "@/components/Layout";
import FeaturesCarousel from "@/components/FeaturesCarousel";
import NewsletterSection from "@/components/NewsletterSection";
import { useAppContext } from "@/contexts/AppContext";
import {
  Heart,
  Calendar,
  Shield,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Star,
  Users,
  Stethoscope,
  PawPrint,
  ArrowRight,
  TrendingUp,
  FileText,
  ChevronDown,
} from "lucide-react";
import { PreCitaFormData } from "@/lib/types";

export default function Index() {
  const location = useLocation();
  const { isAuthenticated, user, addPreCita } = useAppContext();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PreCitaFormData>({
    nombreMascota: "",
    tipoMascota: "perro",
    nombreDueno: "",
    telefono: "",
    email: "",
    motivoConsulta: "",
    fechaPreferida: "",
    horaPreferida: "",
  });

  // Handle hash routing for anchor links
  useEffect(() => {
    if (location.hash) {
      const elementId = location.hash.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location.hash]);

  // Animate counters on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      animateCounters();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create pre-cita using context
      addPreCita({
        nombreCliente: formData.nombreDueno,
        telefono: formData.telefono,
        email: formData.email,
        nombreMascota: formData.nombreMascota,
        tipoMascota: formData.tipoMascota,
        motivoConsulta: formData.motivoConsulta,
        fechaPreferida: new Date(formData.fechaPreferida),
        horaPreferida: formData.horaPreferida,
      });

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsLoading(false);
      setIsSubmitted(true);
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setIsLoading(false);
      alert("Error al enviar la pre-cita. Intenta nuevamente.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vet-primary/5 to-vet-secondary/5">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                  ¡Pre-cita enviada exitosamente!
                </h3>
                <p className="text-vet-gray-600 mb-6">
                  Hemos recibido tu solicitud. Te contactaremos pronto para
                  confirmar tu cita.
                </p>
                <Button
                  onClick={() => {
                    setIsSubmitted(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full bg-vet-primary hover:bg-vet-primary-dark"
                >
                  Volver al Inicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section
        id="inicio"
        className="relative bg-gradient-to-br from-vet-primary/10 via-white to-vet-secondary/10 py-20 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="animate-fade-in z-10 relative">
              <div className="flex items-center space-x-2 mb-6">
                <Badge className="bg-vet-primary/10 text-vet-primary border-vet-primary/20 hover:bg-vet-primary hover:text-white transition-all duration-300 cursor-default">
                  <Heart className="w-3 h-3 mr-1" />
                  Atención profesional 24/7
                </Badge>
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-vet-gray-900 mb-6">
                La salud de tus mascotas
                <span className="text-vet-primary block">
                  en las mejores manos
                </span>
              </h1>
              <p className="text-lg text-vet-gray-600 mb-8 max-w-xl">
                Sistema integral de gestión veterinaria con citas automatizadas,
                historial clínico digital y un equipo de veterinarios
                especializados comprometidos con el bienestar de tus compañeros
                de vida.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {isAuthenticated ? (
                  // Authenticated user buttons
                  <>
                    <Link to="/dashboard">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto bg-vet-primary hover:bg-vet-primary-dark text-white shadow-lg"
                      >
                        {user?.rol === "admin"
                          ? "Panel de Administración"
                          : user?.rol === "veterinario"
                            ? "Panel Veterinario"
                            : "Mi Dashboard"}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                    {user?.rol === "cliente" && (
                      <Link to="/mascotas">
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full sm:w-auto border-vet-primary text-vet-primary hover:bg-vet-primary hover:text-white"
                        >
                          Mis Mascotas
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  // Non-authenticated user buttons
                  <>
                    <Button
                      size="lg"
                      className="bg-vet-primary hover:bg-vet-primary-dark text-white shadow-lg"
                      onClick={() =>
                        document
                          .getElementById("pre-cita-form")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      Solicitar Cita Gratis
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <Link to="/login">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto border-vet-primary text-vet-primary hover:bg-vet-primary hover:text-white"
                      >
                        Portal de Clientes
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Trust indicators */}
              <div className="flex items-center space-x-6 text-sm text-vet-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-vet-primary" />
                  <span>Citas en 24h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-vet-primary" />
                  <span>Historial digital</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-vet-primary" />
                  <span>Pago seguro</span>
                </div>
              </div>
            </div>

            {/* Right Column - Hero Images */}
            <div className="relative">
              {/* Main hero image - Professional veterinary services */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-vet-primary/5 to-vet-primary/10">
                <div className="aspect-[4/3] bg-white flex items-center justify-center relative">
                  {/* Background pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-vet-primary/5 via-transparent to-vet-primary/10"></div>

                  {/* Veterinary service illustration */}
                  <div className="relative z-10 text-center p-8">
                    <div className="relative mb-6">
                      <div className="w-32 h-32 bg-vet-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                        <div className="w-24 h-24 bg-vet-primary rounded-full flex items-center justify-center">
                          <Stethoscope className="w-12 h-12 text-white" />
                        </div>
                        {/* Floating hearts */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-vet-secondary rounded-full flex items-center justify-center animate-bounce">
                          <Heart className="w-4 h-4 text-white fill-current" />
                        </div>
                        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                          <PawPrint className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-vet-gray-900 mb-2">
                      Cuidado Veterinario Profesional
                    </h3>
                    <p className="text-vet-gray-600 text-sm">
                      Tecnología moderna • Equipo especializado • Amor por los
                      animales
                    </p>

                    {/* Service icons */}
                    <div className="flex justify-center space-x-4 mt-6">
                      <div className="w-10 h-10 bg-vet-primary/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-vet-primary" />
                      </div>
                      <div className="w-10 h-10 bg-vet-primary/10 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-vet-primary" />
                      </div>
                      <div className="w-10 h-10 bg-vet-primary/10 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-vet-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating stats cards */}
              <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-4 z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-vet-gray-900">98%</p>
                    <p className="text-sm text-vet-gray-600">Satisfacción</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-vet-primary/10 rounded-full flex items-center justify-center">
                    <PawPrint className="w-5 h-5 text-vet-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-vet-gray-900">1000+</p>
                    <p className="text-sm text-vet-gray-600">Mascotas</p>
                  </div>
                </div>
              </div>

              {/* Small floating images */}
              <div className="absolute top-1/4 -left-8 w-16 h-16 bg-vet-secondary/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🐕</span>
              </div>
              <div className="absolute bottom-1/4 -right-8 w-16 h-16 bg-vet-primary/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🐱</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-vet-primary/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-vet-secondary/5 rounded-full translate-y-48 -translate-x-48"></div>
      </section>

      {/* Animated Counter Section */}
      <section
        id="estadisticas"
        className="py-20 bg-white relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-vet-primary/10 rounded-full mb-6">
              <TrendingUp className="w-4 h-4 text-vet-primary mr-2" />
              <span className="text-vet-primary font-semibold text-sm">
                NUESTRO IMPACTO
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-vet-gray-900 mb-4">
              Resultados que hablan por sí solos
            </h2>
            <p className="text-xl text-vet-gray-600 max-w-3xl mx-auto">
              Miles de familias han confiado en nosotros para cuidar la salud de
              sus mascotas. Estos números reflejan nuestro compromiso y
              dedicación.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Counter 1 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-vet-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-vet-primary group-hover:scale-110 transition-all duration-500">
                  <Users className="w-10 h-10 text-vet-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <div
                  className="counter text-4xl lg:text-5xl font-bold text-vet-primary mb-2"
                  data-target="500"
                >
                  0+
                </div>
                <p className="text-lg font-semibold text-vet-gray-900">
                  Familias Satisfechas
                </p>
                <p className="text-sm text-vet-gray-600">
                  Confiando en nuestro servicio
                </p>
              </div>
            </div>

            {/* Counter 2 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-vet-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-vet-secondary group-hover:scale-110 transition-all duration-500">
                  <Stethoscope className="w-10 h-10 text-vet-secondary group-hover:text-white transition-colors duration-300" />
                </div>
                <div
                  className="counter text-4xl lg:text-5xl font-bold text-vet-secondary mb-2"
                  data-target="15"
                >
                  0+
                </div>
                <p className="text-lg font-semibold text-vet-gray-900">
                  Veterinarios Expertos
                </p>
                <p className="text-sm text-vet-gray-600">
                  Especializados y certificados
                </p>
              </div>
            </div>

            {/* Counter 3 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500 group-hover:scale-110 transition-all duration-500">
                  <PawPrint className="w-10 h-10 text-green-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div
                  className="counter text-4xl lg:text-5xl font-bold text-green-600 mb-2"
                  data-target="2500"
                >
                  0+
                </div>
                <p className="text-lg font-semibold text-vet-gray-900">
                  Mascotas Atendidas
                </p>
                <p className="text-sm text-vet-gray-600">
                  Con resultados exitosos
                </p>
              </div>
            </div>

            {/* Counter 4 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-500 group-hover:scale-110 transition-all duration-500">
                  <Star className="w-10 h-10 text-yellow-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div
                  className="counter text-4xl lg:text-5xl font-bold text-yellow-600 mb-2"
                  data-target="4.9"
                >
                  0
                </div>
                <p className="text-lg font-semibold text-vet-gray-900">
                  Calificación Promedio
                </p>
                <div className="flex justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-500 fill-current"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle background decorations */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-vet-primary/5 rounded-full animate-float"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-vet-secondary/5 rounded-full animate-float delay-1000"></div>
      </section>

      {/* Why Choose PetLA - Carousel Section */}
      <div id="servicios">
        <FeaturesCarousel />
      </div>

      {/* Newsletter Section */}
      <div id="newsletter">
        <NewsletterSection />
      </div>
      {/* Pre-Cita Form Section */}
      <section id="pre-cita-form" className="py-20 bg-vet-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-vet-gray-900 mb-4">
              Solicita tu Pre-Cita
            </h2>
            <p className="text-lg text-vet-gray-600">
              Completa el formulario y nos pondremos en contacto contigo para
              confirmar tu cita y asignar el veterinario más adecuado.
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nombreDueno">Nombre completo *</Label>
                  <Input
                    id="nombreDueno"
                    name="nombreDueno"
                    value={formData.nombreDueno}
                    onChange={handleInputChange}
                    placeholder="Tu nombre completo"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="+1 234 567 8900"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Correo electrónico *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="nombreMascota">Nombre de la mascota *</Label>
                  <Input
                    id="nombreMascota"
                    name="nombreMascota"
                    value={formData.nombreMascota}
                    onChange={handleInputChange}
                    placeholder="Nombre de tu mascota"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="tipoMascota">Tipo de mascota *</Label>
                  <Select
                    value={formData.tipoMascota}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tipoMascota: value })
                    }
                    required
                  >
                    <SelectTrigger className="mt-1 w-full h-10">
                      <SelectValue placeholder="Selecciona tipo de mascota" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="perro">Perro</SelectItem>
                      <SelectItem value="gato">Gato</SelectItem>
                      <SelectItem value="ave">Ave</SelectItem>
                      <SelectItem value="roedor">Roedor</SelectItem>
                      <SelectItem value="reptil">Reptil</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fechaPreferida">Fecha preferida *</Label>
                  <div className="mt-1">
                    <DatePicker
                      selected={
                        formData.fechaPreferida
                          ? new Date(formData.fechaPreferida)
                          : null
                      }
                      onChange={(date) => {
                        setFormData({
                          ...formData,
                          fechaPreferida: date
                            ? date.toISOString().split("T")[0]
                            : "",
                        });
                      }}
                      minDate={new Date()}
                      placeholderText="Selecciona una fecha"
                      className="w-full h-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="horaPreferida">Hora preferida *</Label>
                  <Select
                    value={formData.horaPreferida}
                    onValueChange={(value) =>
                      setFormData({ ...formData, horaPreferida: value })
                    }
                    required
                  >
                    <SelectTrigger className="mt-1 w-full h-10">
                      <SelectValue placeholder="Selecciona una hora" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">
                        🌅 9:00 AM - Temprano
                      </SelectItem>
                      <SelectItem value="10:00">
                        ☀️ 10:00 AM - Mañana
                      </SelectItem>
                      <SelectItem value="11:00">
                        ☀️ 11:00 AM - Media Mañana
                      </SelectItem>
                      <SelectItem value="12:00">
                        🌞 12:00 PM - Mediodía
                      </SelectItem>
                      <SelectItem value="14:00">🌞 2:00 PM - Tarde</SelectItem>
                      <SelectItem value="15:00">
                        🌤️ 3:00 PM - Media Tarde
                      </SelectItem>
                      <SelectItem value="16:00">🌤️ 4:00 PM - Tarde</SelectItem>
                      <SelectItem value="17:00">
                        🌆 5:00 PM - Final del Día
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="motivoConsulta">Motivo de la consulta</Label>
                <div className="mt-1">
                  <Textarea
                    id="motivoConsulta"
                    name="motivoConsulta"
                    value={formData.motivoConsulta}
                    onChange={handleInputChange}
                    placeholder="Describe brevemente el motivo de la consulta veterinaria..."
                    className="w-full min-h-[100px] max-h-[100px] resize-none overflow-y-auto px-3 py-2 border border-vet-gray-300 rounded-lg focus:ring-2 focus:ring-vet-primary focus:border-vet-primary transition-all duration-200"
                  />
                  <p className="text-xs text-vet-gray-500 mt-1">
                    Máximo 500 caracteres. Describe síntomas, comportamientos o
                    motivos de la consulta.
                  </p>
                </div>
              </div>

              <div className="bg-vet-primary/5 border border-vet-primary/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-vet-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-vet-gray-700">
                    <p className="font-medium mb-1">Proceso de confirmación:</p>
                    <ul className="space-y-1 text-vet-gray-600">
                      <li>1. Revisaremos tu solicitud en 24 horas</li>
                      <li>2. Te contactaremos para confirmar la cita</li>
                      <li>3. Recibirás instrucciones de pago</li>
                      <li>4. Tu cita quedará confirmada al validar el pago</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-vet-primary hover:bg-vet-primary-dark"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Enviando solicitud...
                  </>
                ) : (
                  <>
                    Enviar Pre-Cita
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Emergency Section - Harmonious Design */}
      <section
        id="emergencias"
        className="py-24 bg-gradient-to-br from-vet-gray-50 via-white to-vet-primary/5 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Floating Emergency Badge */}
          <div className="absolute top-8 right-8 animate-bounce">
            <div className="bg-vet-secondary rounded-full p-4 shadow-lg">
              <div className="text-2xl font-bold text-white">24/7</div>
            </div>
          </div>

          {/* Emergency Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-8 py-4 bg-vet-secondary/10 rounded-full mb-8 backdrop-blur-sm border border-vet-secondary/20">
              <div className="w-8 h-8 bg-vet-secondary rounded-full flex items-center justify-center mr-4 animate-pulse">
                <Heart className="w-4 h-4 text-white fill-current" />
              </div>
              <span className="text-vet-secondary font-bold text-lg">
                EMERGENCIAS VETERINARIAS
              </span>
            </div>

            <h2 className="text-5xl lg:text-6xl font-bold text-vet-gray-900 mb-8 leading-tight">
              ¿Tu mascota está en
              <span className="text-vet-secondary block lg:inline lg:ml-4">
                peligro?
              </span>
            </h2>
            <p className="text-2xl text-vet-gray-700 mb-6 font-medium max-w-3xl mx-auto">
              No pierdas tiempo. Contacta a nuestro equipo de emergencias ahora
              mismo.
            </p>
            <p className="text-lg text-vet-gray-600 max-w-2xl mx-auto">
              Veterinarios especializados disponibles las 24 horas para salvar
              la vida de tu compañero.
            </p>
          </div>

          {/* Emergency Action Center */}
          <div className="max-w-5xl mx-auto mb-20">
            <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-vet-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Immediate Contact */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-vet-gray-900 mb-6">
                    Contacto Inmediato
                  </h3>

                  <a
                    href="tel:+5551234567"
                    className="group block bg-vet-primary/5 border-2 border-vet-primary/20 rounded-2xl p-6 hover:bg-vet-primary/10 hover:border-vet-primary/40 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-vet-primary rounded-2xl flex items-center justify-center group-hover:bg-vet-primary-dark transition-colors">
                        <Phone className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-vet-gray-900">
                          Llamar Ahora
                        </h4>
                        <p className="text-2xl font-bold text-vet-primary">
                          (555) 123-4567
                        </p>
                        <p className="text-vet-gray-600">
                          Respuesta inmediata garantizada
                        </p>
                      </div>
                      <div className="text-vet-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-6 h-6" />
                      </div>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/5551234567"
                    className="group block bg-green-50 border-2 border-green-200 rounded-2xl p-6 hover:bg-green-100 hover:border-green-300 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center group-hover:bg-green-600 transition-colors">
                        <svg
                          className="w-8 h-8 text-white"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm.01 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.83-1.26-4.38 0-4.54 3.7-8.24 8.24-8.24s8.24 3.7 8.24 8.24-3.69 8.24-8.23 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.31-.01-.47-.01-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05 0 1.21.88 2.37 1 2.54.12.17 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.48-.29z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-green-800">
                          WhatsApp
                        </h4>
                        <p className="text-lg font-semibold text-green-700">
                          Chat con veterinario
                        </p>
                        <p className="text-green-600">
                          Envío de fotos y videos
                        </p>
                      </div>
                      <div className="text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-6 h-6" />
                      </div>
                    </div>
                  </a>
                </div>

                {/* Emergency Info */}
                <div className="bg-vet-gray-50 rounded-2xl p-6 border border-vet-gray-200">
                  <h4 className="text-xl font-bold text-vet-gray-900 mb-6">
                    ¿Qué hacer mientras llegas?
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-vet-secondary rounded-full flex items-center justify-center mt-1">
                        <span className="text-white font-bold text-sm">1</span>
                      </div>
                      <div>
                        <p className="text-vet-gray-900 font-medium">
                          Mantén la calma
                        </p>
                        <p className="text-vet-gray-600 text-sm">
                          Tu mascota puede sentir tu ansiedad
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-vet-secondary rounded-full flex items-center justify-center mt-1">
                        <span className="text-white font-bold text-sm">2</span>
                      </div>
                      <div>
                        <p className="text-vet-gray-900 font-medium">
                          Observa los síntomas
                        </p>
                        <p className="text-vet-gray-600 text-sm">
                          Toma nota de lo que ves
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-vet-secondary rounded-full flex items-center justify-center mt-1">
                        <span className="text-white font-bold text-sm">3</span>
                      </div>
                      <div>
                        <p className="text-vet-gray-900 font-medium">
                          No mediques
                        </p>
                        <p className="text-vet-gray-600 text-sm">
                          Espera instrucciones del veterinario
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="group text-center bg-white rounded-3xl p-8 shadow-lg border border-vet-primary/20 hover:border-vet-primary/40 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-vet-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-vet-primary group-hover:scale-110 transition-all duration-300">
                <Clock className="w-8 h-8 text-vet-primary group-hover:text-white transition-colors" />
              </div>
              <div className="text-3xl font-bold text-vet-primary mb-2">
                &lt;5min
              </div>
              <p className="text-vet-gray-600 text-sm font-medium">
                Tiempo de respuesta promedio
              </p>
            </div>
            <div className="group text-center bg-white rounded-3xl p-8 shadow-lg border border-vet-secondary/20 hover:border-vet-secondary/40 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-vet-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-vet-secondary group-hover:scale-110 transition-all duration-300">
                <Heart className="w-8 h-8 text-vet-secondary group-hover:text-white transition-colors" />
              </div>
              <div className="text-3xl font-bold text-vet-secondary mb-2">
                24/7
              </div>
              <p className="text-vet-gray-600 text-sm font-medium">
                Disponibilidad completa
              </p>
            </div>
            <div className="group text-center bg-white rounded-3xl p-8 shadow-lg border border-green-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500 group-hover:scale-110 transition-all duration-300">
                <CheckCircle className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
              <p className="text-vet-gray-600 text-sm font-medium">
                Tasa de éxito en emergencias
              </p>
            </div>
            <div className="group text-center bg-white rounded-3xl p-8 shadow-lg border border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
                <Star className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <p className="text-vet-gray-600 text-sm font-medium">
                Vidas salvadas este año
              </p>
            </div>
          </div>
        </div>

        {/* Subtle Background Effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-40 h-40 bg-vet-primary/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-vet-secondary/10 rounded-full animate-float"></div>
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-vet-primary/30 rounded-full animate-ping"></div>
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-vet-secondary/40 rounded-full animate-pulse delay-500"></div>
          <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-vet-primary/20 rounded-full animate-bounce delay-1000"></div>
        </div>
      </section>
    </Layout>
  );
}
