import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PawPrint,
  User,
  Calendar as CalendarIcon,
  Activity,
  FileText,
  Eye,
  Clock,
  AlertCircle,
  Info,
  CheckCircle,
} from "lucide-react";
import type { CitaRelationData } from "@/lib/citaUtils";

const estadoColors = {
  pendiente_pago: "bg-yellow-100 text-yellow-800 border-yellow-200",
  en_validacion: "bg-gray-100 text-gray-800 border-gray-200",
  aceptada: "bg-green-100 text-green-800 border-green-200",
  atendida: "bg-gray-100 text-gray-800 border-gray-200",
  cancelada: "bg-red-100 text-red-800 border-red-200",
  expirada: "bg-red-100 text-red-800 border-red-200",
  rechazada: "bg-red-100 text-red-800 border-red-200",
  no_asistio: "bg-orange-100 text-orange-800 border-orange-200",
};

const estadoLabels = {
  pendiente_pago: "Pendiente de Pago",
  en_validacion: "En Validación",
  aceptada: "Confirmada",
  atendida: "Completada",
  cancelada: "Cancelada",
  expirada: "Expirada",
  rechazada: "Rechazada",
  no_asistio: "No Asistió",
};

interface CitaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCita: CitaRelationData | null;
  onAttendCita?: (citaData: CitaRelationData) => void;
}

export default function CitaDetailModal({
  isOpen,
  onClose,
  selectedCita,
  onAttendCita,
}: CitaDetailModalProps) {
  const navigate = useNavigate();

  const getUrgencyBadge = (urgencyLevel: "alta" | "media" | "baja") => {
    const configs = {
      alta: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Urgente",
        icon: AlertCircle,
      },
      media: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Moderada",
        icon: Clock,
      },
      baja: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Normal",
        icon: Info,
      },
    };

    const config = configs[urgencyLevel];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (!selectedCita) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-vet-primary" />
            <span>Detalle de la Cita</span>
          </DialogTitle>
          <DialogDescription>
            Información completa de la cita de {selectedCita.cita.mascota}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Datos de la mascota */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <PawPrint className="w-5 h-5 text-vet-primary" />
                  <span>Datos del Paciente</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-vet-gray-600">
                    Nombre
                  </Label>
                  <p className="font-semibold text-vet-gray-900">
                    {selectedCita.cita.mascota}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-vet-gray-600">
                    Especie
                  </Label>
                  <p className="text-vet-gray-900">
                    {selectedCita.mascota?.especie || "No especificado"}
                  </p>
                </div>
                {selectedCita.mascota?.raza && (
                  <div>
                    <Label className="text-sm font-medium text-vet-gray-600">
                      Raza
                    </Label>
                    <p className="text-vet-gray-900">
                      {selectedCita.mascota.raza}
                    </p>
                  </div>
                )}
                {selectedCita.mascota?.fechaNacimiento && (
                  <div>
                    <Label className="text-sm font-medium text-vet-gray-600">
                      Edad
                    </Label>
                    <p className="text-vet-gray-900">
                      {(() => {
                        const birthDate = new Date(selectedCita.mascota.fechaNacimiento);
                        const today = new Date();
                        const ageInYears = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                        const ageInMonths = Math.floor((today.getTime() - birthDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000));

                        if (ageInYears >= 2) {
                          return `${ageInYears} años`;
                        } else if (ageInYears === 1) {
                          const extraMonths = ageInMonths - 12;
                          return extraMonths > 0 ? `1 año ${extraMonths} mes${extraMonths > 1 ? 'es' : ''}` : '1 año';
                        } else {
                          return `${ageInMonths} mes${ageInMonths > 1 ? 'es' : ''}`;
                        }
                      })()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Datos del propietario */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <User className="w-5 h-5 text-vet-primary" />
                  <span>Datos del Propietario</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-vet-gray-600">
                    Nombre
                  </Label>
                  <p className="font-semibold text-vet-gray-900">
                    {selectedCita.propietario?.nombre || "Sin asignar"}
                  </p>
                </div>
                {selectedCita.propietario?.telefono && (
                  <div>
                    <Label className="text-sm font-medium text-vet-gray-600">
                      Teléfono
                    </Label>
                    <p className="text-vet-gray-900">
                      {selectedCita.propietario.telefono}
                    </p>
                  </div>
                )}
                {selectedCita.propietario?.email && (
                  <div>
                    <Label className="text-sm font-medium text-vet-gray-600">
                      Email
                    </Label>
                    <p className="text-vet-gray-900">
                      {selectedCita.propietario.email}
                    </p>
                  </div>
                )}
                {selectedCita.propietario?.direccion && (
                  <div>
                    <Label className="text-sm font-medium text-vet-gray-600">
                      Dirección
                    </Label>
                    <p className="text-vet-gray-900">
                      {selectedCita.propietario.direccion}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detalles de la cita */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <CalendarIcon className="w-5 h-5 text-vet-primary" />
                <span>Detalles de la Cita</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-vet-gray-600">
                    Fecha
                  </Label>
                  <p className="text-vet-gray-900">
                    {new Date(selectedCita.cita.fecha).toLocaleDateString(
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
                <div>
                  <Label className="text-sm font-medium text-vet-gray-600">
                    Hora
                  </Label>
                  <p className="text-vet-gray-900">
                    {new Date(selectedCita.cita.fecha).toLocaleTimeString(
                      "es-ES",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-vet-gray-600">
                    Estado
                  </Label>
                  <div className="mt-1">
                    <Badge className={estadoColors[selectedCita.cita.estado]}>
                      {estadoLabels[selectedCita.cita.estado]}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-vet-gray-600">
                  Motivo de la consulta
                </Label>
                <p className="text-vet-gray-900 mt-1 p-3 bg-vet-gray-50 rounded-lg">
                  {selectedCita.cita.motivo}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-vet-gray-600">
                  Nivel de urgencia
                </Label>
                <div className="mt-1">
                  {getUrgencyBadge(selectedCita.urgencyLevel)}
                </div>
              </div>

              {selectedCita.cita.notas && (
                <div>
                  <Label className="text-sm font-medium text-vet-gray-600">
                    Notas
                  </Label>
                  <p className="text-vet-gray-900 mt-1 p-3 bg-vet-gray-50 rounded-lg">
                    {selectedCita.cita.notas}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información del servicio */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Activity className="w-5 h-5 text-vet-primary" />
                <span>Información del Servicio</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-vet-gray-600">
                    Tipo de Consulta
                  </Label>
                  <p className="text-vet-gray-900 font-medium">
                    {selectedCita.cita.tipoConsulta ?
                      selectedCita.cita.tipoConsulta.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) :
                      'Consulta General'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-vet-gray-600">
                    Ubicación
                  </Label>
                  <p className="text-vet-gray-900">
                    {selectedCita.cita.ubicacion || 'Clínica'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-vet-gray-600">
                    Precio del Servicio
                  </Label>
                  <p className="text-vet-gray-900 font-semibold text-lg">
                    ${selectedCita.cita.precio ? selectedCita.cita.precio.toLocaleString() : '0'} MXN
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-vet-gray-600">
                  Veterinario Asignado
                </Label>
                <p className="text-vet-gray-900 font-medium">
                  Dr. {selectedCita.cita.veterinario}
                </p>
              </div>

              {/* Descripción del servicio según el tipo */}
              <div>
                <Label className="text-sm font-medium text-vet-gray-600">
                  Descripción del Servicio
                </Label>
                <div className="mt-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-900 text-sm">
                    {(() => {
                      switch (selectedCita.cita.tipoConsulta) {
                        case 'consulta_general':
                          return 'Revisión médica completa, evaluación del estado general de salud, revisión de signos vitales y recomendaciones preventivas.';
                        case 'vacunacion':
                          return 'Aplicación de vacunas según el esquema de vacunación apropiado para la edad y especie de la mascota.';
                        case 'emergencia':
                          return 'Atención médica urgente para casos que requieren intervención inmediata para preservar la salud del animal.';
                        case 'grooming':
                          return 'Servicios de higiene y estética que incluyen baño, corte de pelo, limpieza de oídos y corte de uñas.';
                        case 'cirugia':
                          return 'Procedimiento quirúrgico especializado realizado en instalaciones equipadas con la tecnología necesaria.';
                        case 'diagnostico':
                          return 'Estudios y análisis especializados para determinar el diagnóstico correcto mediante pruebas específicas.';
                        default:
                          return 'Servicio veterinario profesional adaptado a las necesidades específicas de su mascota.';
                      }
                    })()}
                  </p>
                </div>
              </div>

              {/* Estado del pago */}
              {selectedCita.cita.comprobanteData && (
                <div>
                  <Label className="text-sm font-medium text-vet-gray-600">
                    Comprobante de Pago
                  </Label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Pago Verificado
                    </Badge>
                    <span className="text-sm text-vet-gray-600">
                      {selectedCita.cita.comprobanteData.originalName}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>

            {selectedCita.cita.estado === "aceptada" && onAttendCita && (
              <Button
                onClick={() => {
                  onAttendCita(selectedCita);
                  onClose();
                }}
                className="bg-vet-primary hover:bg-vet-primary-dark"
              >
                <Activity className="w-4 h-4 mr-2" />
                Atender Cita
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => {
                if (selectedCita.mascota) {
                  navigate(
                    `/historial-clinico-veterinario?mascota=${selectedCita.mascota.id}&nombre=${encodeURIComponent(selectedCita.mascota.nombre)}`,
                  );
                } else {
                  // Fallback para cuando no hay mascota, usar datos de la cita
                  navigate(
                    `/historial-clinico-veterinario?nombre=${encodeURIComponent(selectedCita.cita.mascota)}&especie=${encodeURIComponent(selectedCita.cita.especie)}`,
                  );
                }
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Ver Historial
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
