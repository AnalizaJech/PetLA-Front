import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import Layout from "@/components/Layout";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  PawPrint,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  User,
  Stethoscope,
  MapPin,
  CreditCard,
} from "lucide-react";

interface NuevaCitaData {
  mascotaId: string;
  tipoConsulta: string;
  veterinarioId?: string;
  fecha: string;
  hora: string;
  motivo: string;
  ubicacion: string;
  notas?: string;
}

const tiposConsulta = [
  {
    id: "consulta_general",
    nombre: "Consulta General",
    precio: 80,
    icono: "Stethoscope",
    descripcion: "Examen médico rutinario y evaluación de salud general"
  },
  {
    id: "vacunacion",
    nombre: "Vacunación",
    precio: 65,
    icono: "Syringe",
    descripcion: "Aplicación de vacunas preventivas y refuerzos"
  },
  {
    id: "emergencia",
    nombre: "Emergencia",
    precio: 150,
    icono: "AlertCircle",
    descripcion: "Atención médica urgente las 24 horas"
  },
  {
    id: "grooming",
    nombre: "Grooming",
    precio: 45,
    icono: "Heart",
    descripcion: "Baño, corte de pelo, limpieza de oídos y uñas"
  },
  {
    id: "cirugia",
    nombre: "Cirugía",
    precio: 250,
    icono: "Activity",
    descripcion: "Procedimientos quirúrgicos especializados"
  },
  {
    id: "diagnostico",
    nombre: "Diagnóstico",
    precio: 120,
    icono: "Search",
    descripcion: "Exámenes y análisis para determinar diagnósticos"
  },
];

const ubicaciones = [
  "Clínica Principal",
  "Sucursal Norte",
  "Sucursal Sur",
  "Atención a Domicilio",
];

const horasDisponibles = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

export default function NuevaCita() {
  const navigate = useNavigate();
  const { user, mascotas, usuarios, citas, addCita, fixOrphanedPets } =
    useAppContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [citaData, setCitaData] = useState<NuevaCitaData>({
    mascotaId: "",
    tipoConsulta: "",
    veterinarioId: "any",
    fecha: "",
    hora: "",
    motivo: "",
    ubicacion: "Clínica Principal",
    notas: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  useEffect(() => {
    console.log("Mascotas changed:", mascotas);
    console.log("User changed:", user);
  }, [mascotas, user]);

  if (!user || user.rol !== "cliente") {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                Acceso requerido
              </h3>
              <p className="text-vet-gray-600">
                Debes iniciar sesión como cliente para agendar citas
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Get user's pets - explicit filtering
  const misMascotas = user?.id
    ? mascotas.filter((m) => m.clienteId === user.id)
    : [];

  // Debug info
  console.log("User ID:", user?.id);
  console.log("All mascotas:", mascotas);
  console.log("Filtered mascotas:", misMascotas);
  console.log("misMascotas length:", misMascotas.length);

  // Get available veterinarians
  const veterinarios = usuarios.filter((u) => u.rol === "veterinario");

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Validations
      if (!citaData.mascotaId) {
        setError("Debes seleccionar una mascota");
        setIsLoading(false);
        return;
      }

      if (!citaData.tipoConsulta) {
        setError("Debes seleccionar el tipo de consulta");
        setIsLoading(false);
        return;
      }

      if (!citaData.fecha || !citaData.hora) {
        setError("Debes seleccionar fecha y hora");
        setIsLoading(false);
        return;
      }

      if (!citaData.motivo.trim()) {
        setError("Debes describir el motivo de la consulta");
        setIsLoading(false);
        return;
      }

      // Get selected data
      const selectedMascota = misMascotas.find(
        (m) => m.id === citaData.mascotaId,
      );
      const selectedTipoConsulta = tiposConsulta.find(
        (t) => t.id === citaData.tipoConsulta,
      );
      if (!selectedMascota || !selectedTipoConsulta) {
        setError("Error en los datos seleccionados");
        setIsLoading(false);
        return;
      }

      // Assign veterinarian - check availability if none selected
      let assignedVeterinario = selectedVeterinario?.nombre;
      if (!assignedVeterinario && veterinarios.length > 0) {
        // Get appointment date and time
        const appointmentDateTime = new Date(
          `${citaData.fecha}T${citaData.hora}:00`,
        );

        // Find veterinarians who are available at this time
        const availableVeterinarios = veterinarios.filter((vet) => {
          // Check if this veterinarian has any appointments at the same date and time
          const hasConflict = citas.some((cita) => {
            if (cita.veterinario !== vet.nombre) return false;

            const citaDateTime = new Date(cita.fecha);
            const appointmentTime = appointmentDateTime.getTime();
            const citaTime = citaDateTime.getTime();

            // Check if it's the same date and hour (allowing 1 hour appointments)
            const timeDiff = Math.abs(appointmentTime - citaTime);
            return timeDiff < 60 * 60 * 1000; // Less than 1 hour difference = conflict
          });

          return !hasConflict;
        });

        // Assign randomly from available veterinarians
        if (availableVeterinarios.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * availableVeterinarios.length,
          );
          assignedVeterinario = availableVeterinarios[randomIndex].nombre;
        } else {
          // If no veterinarians are available, assign the first one anyway
          assignedVeterinario = veterinarios[0].nombre;
        }
      }

      // Fallback to first available veterinarian if still no assignment
      if (!assignedVeterinario && veterinarios.length > 0) {
        assignedVeterinario = veterinarios[0].nombre;
      }

      // Create appointment
      const nuevaCita = {
        mascota: selectedMascota.nombre,
        especie: selectedMascota.especie,
        fecha: new Date(`${citaData.fecha}T${citaData.hora}:00`),
        estado: "pendiente_pago" as const,
        veterinario: assignedVeterinario || "Veterinario no disponible",
        motivo: citaData.motivo,
        ubicacion: citaData.ubicacion,
        precio: selectedTipoConsulta.precio,
        notas: citaData.notas,
      };

      addCita(nuevaCita);
      setSuccess("Cita agendada exitosamente");

      // Redirect after success
      setTimeout(() => {
        navigate("/mis-citas");
      }, 2000);
    } catch (error) {
      setError("Error al agendar la cita");
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90); // 3 months ahead
    return maxDate.toISOString().split("T")[0];
  };

  const selectedTipoConsulta = tiposConsulta.find(
    (t) => t.id === citaData.tipoConsulta,
  );
  const selectedMascota = misMascotas.find((m) => m.id === citaData.mascotaId);
  const selectedVeterinario =
    citaData.veterinarioId !== "any"
      ? veterinarios.find((v) => v.id === citaData.veterinarioId)
      : null;

  return (
    <Layout user={user}>
      <div className="min-h-screen bg-vet-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <Button
                variant="outline"
                onClick={() => navigate("/mis-citas")}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-vet-gray-900">
                  Agendar Nueva Cita
                </h1>
                <p className="text-vet-gray-600">
                  Programa una cita médica para tu mascota
                </p>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex items-center ${step < 4 ? "flex-1" : ""}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step
                        ? "bg-vet-primary text-white"
                        : "bg-vet-gray-200 text-vet-gray-500"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`flex-1 h-1 mx-4 ${
                        currentStep > step
                          ? "bg-vet-primary"
                          : "bg-vet-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Step Content */}
          <Card>
            <CardContent className="p-8">
              {/* Step 1: Select Pet */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-vet-gray-900 mb-2">
                      Selecciona tu mascota
                    </h2>
                    <p className="text-vet-gray-600">
                      Elige cuál de tus mascotas necesita atención médica
                    </p>
                  </div>

                  {!misMascotas || misMascotas.length === 0 ? (
                    <div className="text-center py-12">
                      <PawPrint className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                        No tienes mascotas registradas
                      </h3>
                      <p className="text-vet-gray-600 mb-4">
                        Primero debes registrar una mascota para poder agendar
                        citas
                      </p>
                      <div className="flex justify-center">
                        <Button
                          onClick={() => navigate("/mis-mascotas")}
                          className="bg-vet-primary hover:bg-vet-primary-dark"
                        >
                          Registrar Mascota
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {misMascotas.map((mascota) => (
                        <Card
                          key={mascota.id}
                          className={`cursor-pointer transition-all ${
                            citaData.mascotaId === mascota.id
                              ? "ring-2 ring-vet-primary bg-vet-primary/5"
                              : "hover:shadow-md"
                          }`}
                          onClick={() =>
                            setCitaData({ ...citaData, mascotaId: mascota.id })
                          }
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-vet-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                                {mascota.foto ? (
                                  <img
                                    src={mascota.foto}
                                    alt={`Foto de ${mascota.nombre}`}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <PawPrint className="w-6 h-6 text-vet-primary" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-vet-gray-900">
                                  {mascota.nombre}
                                </h4>
                                <p className="text-sm text-vet-gray-600">
                                  {mascota.especie} • {mascota.raza}
                                </p>
                                <p className="text-xs text-vet-gray-500">
                                  {mascota.peso} kg • {mascota.sexo}
                                </p>
                              </div>
                              {citaData.mascotaId === mascota.id && (
                                <CheckCircle className="w-6 h-6 text-vet-primary" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Select Service Type */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-vet-gray-900 mb-2">
                      Tipo de consulta
                    </h2>
                    <p className="text-vet-gray-600">
                      Selecciona el tipo de atención que necesita tu mascota
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tiposConsulta.map((tipo) => (
                      <Card
                        key={tipo.id}
                        className={`cursor-pointer transition-all ${
                          citaData.tipoConsulta === tipo.id
                            ? "ring-2 ring-vet-primary bg-vet-primary/5"
                            : "hover:shadow-md"
                        }`}
                        onClick={() =>
                          setCitaData({ ...citaData, tipoConsulta: tipo.id })
                        }
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-vet-gray-900 mb-2">
                                {tipo.nombre}
                              </h4>
                              <Badge className="bg-vet-primary/10 text-vet-primary">
                                S/. {tipo.precio.toLocaleString()}
                              </Badge>
                            </div>
                            {citaData.tipoConsulta === tipo.id && (
                              <CheckCircle className="w-6 h-6 text-vet-primary" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="motivo">Motivo de la consulta *</Label>
                      <Textarea
                        id="motivo"
                        value={citaData.motivo}
                        onChange={(e) =>
                          setCitaData({ ...citaData, motivo: e.target.value })
                        }
                        placeholder="Describe los síntomas o el motivo de la consulta..."
                        className="mt-2"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="ubicacion">Ubicación</Label>
                      <Select
                        value={citaData.ubicacion}
                        onValueChange={(value) =>
                          setCitaData({ ...citaData, ubicacion: value })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecciona ubicación" />
                        </SelectTrigger>
                        <SelectContent>
                          {ubicaciones.map((ubicacion) => (
                            <SelectItem key={ubicacion} value={ubicacion}>
                              {ubicacion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Select Date and Time */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-vet-gray-900 mb-2">
                      Fecha y hora
                    </h2>
                    <p className="text-vet-gray-600">
                      Selecciona cuándo quieres la cita
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="fecha">Fecha preferida *</Label>
                      <Input
                        id="fecha"
                        type="date"
                        value={citaData.fecha}
                        onChange={(e) =>
                          setCitaData({ ...citaData, fecha: e.target.value })
                        }
                        min={getMinDate()}
                        max={getMaxDate()}
                        className="mt-2"
                      />
                      <p className="text-xs text-vet-gray-500 mt-1">
                        Puedes agendar hasta 3 meses por adelantado
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="hora">Hora preferida *</Label>
                      <Select
                        value={citaData.hora}
                        onValueChange={(value) =>
                          setCitaData({ ...citaData, hora: value })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecciona hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {horasDisponibles.map((hora) => (
                            <SelectItem key={hora} value={hora}>
                              {hora}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="veterinario">Veterinario (opcional)</Label>
                    <Select
                      value={citaData.veterinarioId}
                      onValueChange={(value) =>
                        setCitaData({ ...citaData, veterinarioId: value })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Cualquier veterinario disponible" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">
                          Cualquier veterinario disponible
                        </SelectItem>
                        {veterinarios.map((vet) => (
                          <SelectItem key={vet.id} value={vet.id}>
                            {vet.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notas">Notas adicionales</Label>
                    <Textarea
                      id="notas"
                      value={citaData.notas}
                      onChange={(e) =>
                        setCitaData({ ...citaData, notas: e.target.value })
                      }
                      placeholder="Información adicional que el veterinario deba saber..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-vet-gray-900 mb-2">
                      Confirmar cita
                    </h2>
                    <p className="text-vet-gray-600">
                      Revisa los detalles antes de confirmar tu cita
                    </p>
                  </div>

                  <div className="bg-vet-gray-50 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-vet-primary/10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {selectedMascota?.foto ? (
                            <img
                              src={selectedMascota.foto}
                              alt={`Foto de ${selectedMascota.nombre}`}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <PawPrint className="w-5 h-5 text-vet-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-vet-gray-600">Mascota</p>
                          <p className="font-medium text-vet-gray-900">
                            {selectedMascota?.nombre} (
                            {selectedMascota?.especie})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Stethoscope className="w-5 h-5 text-vet-primary" />
                        <div>
                          <p className="text-sm text-vet-gray-600">
                            Tipo de consulta
                          </p>
                          <p className="font-medium text-vet-gray-900">
                            {selectedTipoConsulta?.nombre}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-vet-primary" />
                        <div>
                          <p className="text-sm text-vet-gray-600">Fecha</p>
                          <p className="font-medium text-vet-gray-900">
                            {citaData.fecha &&
                              new Date(citaData.fecha).toLocaleDateString(
                                "es-ES",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-vet-primary" />
                        <div>
                          <p className="text-sm text-vet-gray-600">Hora</p>
                          <p className="font-medium text-vet-gray-900">
                            {citaData.hora}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-vet-primary" />
                        <div>
                          <p className="text-sm text-vet-gray-600">
                            Veterinario
                          </p>
                          <p className="font-medium text-vet-gray-900">
                            {selectedVeterinario?.nombre ||
                              "Cualquier veterinario disponible"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-vet-primary" />
                        <div>
                          <p className="text-sm text-vet-gray-600">Ubicación</p>
                          <p className="font-medium text-vet-gray-900">
                            {citaData.ubicacion}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-5 h-5 text-vet-primary" />
                        <div>
                          <p className="text-sm text-vet-gray-600">Precio</p>
                          <p className="font-medium text-vet-gray-900">
                            S/. {selectedTipoConsulta?.precio.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {citaData.motivo && (
                      <div>
                        <p className="text-sm text-vet-gray-600 mb-1">Motivo</p>
                        <p className="font-medium text-vet-gray-900">
                          {citaData.motivo}
                        </p>
                      </div>
                    )}

                    {citaData.notas && (
                      <div>
                        <p className="text-sm text-vet-gray-600 mb-1">
                          Notas adicionales
                        </p>
                        <p className="font-medium text-vet-gray-900">
                          {citaData.notas}
                        </p>
                      </div>
                    )}
                  </div>

                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <strong>Importante:</strong> Tu cita quedará en estado
                      "Pendiente de Pago". Deberás subir el comprobante de pago
                      para que sea confirmada.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>

                {currentStep < 4 ? (
                  <Button
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && !citaData.mascotaId) ||
                      (currentStep === 2 &&
                        (!citaData.tipoConsulta || !citaData.motivo.trim())) ||
                      (currentStep === 3 && (!citaData.fecha || !citaData.hora))
                    }
                    className="bg-vet-primary hover:bg-vet-primary-dark flex items-center"
                  >
                    Siguiente
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="bg-vet-primary hover:bg-vet-primary-dark flex items-center"
                  >
                    {isLoading ? "Agendando..." : "Confirmar Cita"}
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
