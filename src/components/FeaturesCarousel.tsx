import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  Shield,
  Clock,
  Stethoscope,
  Heart,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Smartphone,
  FileText,
  Zap,
  Award,
  HeartHandshake,
} from "lucide-react";

const features = [
  {
    id: 1,
    icon: Smartphone,
    title: "Citas Inteligentes",
    description:
      "Sistema automatizado que agenda tu cita en menos de 2 minutos con confirmación instantánea.",
    highlights: ["Disponible 24/7", "Recordatorios automáticos", "Sin esperas"],
    color: "vet-primary",
    bgColor: "vet-primary/10",
  },
  {
    id: 2,
    icon: FileText,
    title: "Historial Digital Completo",
    description:
      "Acceso inmediato a todo el historial médico de tu mascota desde cualquier dispositivo.",
    highlights: ["Acceso 24/7", "Información completa", "Siempre actualizado"],
    color: "vet-secondary",
    bgColor: "vet-secondary/10",
  },
  {
    id: 3,
    icon: Zap,
    title: "Atención Sin Esperas",
    description:
      "Consultas puntuales de 30 minutos con emergencias atendidas las 24 horas del día.",
    highlights: [
      "30 min consultas",
      "Emergencias 24h",
      "Seguimiento post-consulta",
    ],
    color: "green-600",
    bgColor: "green-100",
  },
  {
    id: 4,
    icon: Award,
    title: "Veterinarios Certificados",
    description:
      "Equipo especializado con más de 10 años de experiencia en diferentes áreas médicas.",
    highlights: [
      "10+ años experiencia",
      "Especializaciones",
      "Certificaciones",
    ],
    color: "blue-600",
    bgColor: "blue-100",
  },
  {
    id: 5,
    icon: HeartHandshake,
    title: "Cuidado Integral",
    description:
      "Desde medicina preventiva hasta cirugías especializadas para todas las especies.",
    highlights: [
      "Medicina preventiva",
      "Cirugías avanzadas",
      "Todas las especies",
    ],
    color: "purple-600",
    bgColor: "purple-100",
  },
];

export default function FeaturesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  // Auto-play functionality - ultra smooth
  useEffect(() => {
    if (isDragging) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 4500); // Optimized timing for smooth flow

    return () => clearInterval(interval);
  }, [isDragging]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Touch and drag handlers
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setCurrentX(clientX);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    setCurrentX(clientX);
  };

  const handleEnd = () => {
    if (!isDragging) return;

    const diff = startX - currentX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left - next slide
        setCurrentIndex((prev) => (prev + 1) % features.length);
      } else {
        // Swipe right - previous slide
        setCurrentIndex(
          (prev) => (prev - 1 + features.length) % features.length,
        );
      }
    }

    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Get visible features (current + 2 next)
  const getVisibleFeatures = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % features.length;
      visible.push({ ...features[index], position: i });
    }
    return visible;
  };

  const visibleFeatures = getVisibleFeatures();

  return (
    <section
      id="caracteristicas"
      className="py-24 bg-vet-gray-50 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-vet-primary/10 rounded-full mb-6">
            <Stethoscope className="w-4 h-4 text-vet-primary mr-2" />
            <span className="text-vet-primary font-semibold text-sm">
              CARACTERÍSTICAS ÚNICAS
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-vet-gray-900 mb-6">
            ¿Por qué elegir
            <span className="text-vet-primary block lg:inline lg:ml-3">
              PetLA?
            </span>
          </h2>
          <p className="text-xl text-vet-gray-600 max-w-3xl mx-auto leading-relaxed">
            Combinamos experiencia veterinaria, tecnología moderna y amor
            genuino por los animales para brindar el mejor cuidado a tus
            mascotas.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Main Carousel */}
          <div
            className={`flex items-center justify-center space-x-4 md:space-x-8 mb-12 cursor-grab ${isDragging ? "cursor-grabbing" : ""}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {visibleFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const isCenter = index === 1;

              return (
                <Card
                  key={`${feature.id}-${feature.position}`}
                  className={`transition-all duration-1000 ease-in-out select-none ${
                    isCenter
                      ? "scale-110 shadow-2xl z-10 bg-white border-vet-primary/20"
                      : "scale-95 opacity-70 hover:opacity-90"
                  } ${index === 0 ? "hidden md:block" : ""} ${index === 2 ? "hidden md:block" : ""}`}
                >
                  <div className="p-8 text-center">
                    <div
                      className={`mx-auto flex items-center justify-center w-16 h-16 rounded-2xl mb-6 transition-all duration-1000 ease-in-out ${
                        isCenter
                          ? feature.color === "vet-primary"
                            ? "bg-vet-primary scale-110"
                            : feature.color === "vet-secondary"
                              ? "bg-vet-secondary scale-110"
                              : feature.color === "green-600"
                                ? "bg-green-600 scale-110"
                                : feature.color === "blue-600"
                                  ? "bg-blue-600 scale-110"
                                  : "bg-purple-600 scale-110"
                          : feature.bgColor === "vet-primary/10"
                            ? "bg-vet-primary/10 scale-100"
                            : feature.bgColor === "vet-secondary/10"
                              ? "bg-vet-secondary/10 scale-100"
                              : feature.bgColor === "green-100"
                                ? "bg-green-100 scale-100"
                                : feature.bgColor === "blue-100"
                                  ? "bg-blue-100 scale-100"
                                  : "bg-purple-100 scale-100"
                      }`}
                    >
                      <Icon
                        className={`w-8 h-8 transition-all duration-1000 ease-in-out ${
                          isCenter
                            ? "text-white scale-110"
                            : feature.color === "vet-primary"
                              ? "text-vet-primary scale-100"
                              : feature.color === "vet-secondary"
                                ? "text-vet-secondary scale-100"
                                : feature.color === "green-600"
                                  ? "text-green-600 scale-100"
                                  : feature.color === "blue-600"
                                    ? "text-blue-600 scale-100"
                                    : "text-purple-600 scale-100"
                        }`}
                      />
                    </div>

                    <h3 className="text-xl font-bold text-vet-gray-900 mb-4">
                      {feature.title}
                    </h3>

                    <p className="text-vet-gray-600 leading-relaxed mb-6">
                      {feature.description}
                    </p>

                    {isCenter && (
                      <div className="space-y-2 animate-fade-in">
                        {feature.highlights.map((highlight, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-center space-x-2 text-sm text-vet-gray-700"
                          >
                            <CheckCircle className="w-4 h-4 text-vet-primary" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mt-8">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-vet-primary scale-125 shadow-md"
                    : "bg-vet-gray-300 hover:bg-vet-primary/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-20 right-20 w-20 h-20 bg-vet-primary/5 rounded-full animate-float"></div>
      <div className="absolute bottom-20 left-20 w-32 h-32 bg-vet-secondary/5 rounded-full animate-float delay-1000"></div>
    </section>
  );
}
