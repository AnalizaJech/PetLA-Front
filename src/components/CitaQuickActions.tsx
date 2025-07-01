import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Clock,
  PawPrint,
  Eye,
  Activity,
  FileText,
  MoreVertical,
  Phone,
  User,
  AlertCircle,
  CheckCircle,
  UserCheck,
  Mail,
  Info,
} from "lucide-react";
import type { CitaRelationData } from "@/lib/citaUtils";

interface CitaQuickActionsProps {
  cita?: any; // Legacy support
  citaData?: CitaRelationData; // New preferred prop
  className?: string;
}

export default function CitaQuickActions({
  cita,
  citaData,
  className = "",
}: CitaQuickActionsProps) {
  const { usuarios, mascotas, updateCita } = useAppContext();
  const navigate = useNavigate();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Support both old and new API
  const actualCita = citaData?.cita || cita;
  const mascota =
    citaData?.mascota || mascotas.find((m) => m.nombre === actualCita?.mascota);
  const cliente =
    citaData?.propietario || usuarios.find((u) => u.id === mascota?.clienteId);

  const estadoColors = {
    pendiente_pago: "bg-yellow-100 text-yellow-800 border-yellow-200",
    en_validacion: "bg-blue-100 text-blue-800 border-blue-200",
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

  const handleViewDetail = () => {
    navigate(`/mis-pacientes?cita=${actualCita.id}`);
  };

  const handleAttendCita = () => {
    navigate(`/mis-pacientes?cita=${actualCita.id}&action=attend`);
  };

  const handleViewHistory = () => {
    if (mascota) {
      navigate(`/historial-clinico-veterinario?mascota=${mascota.id}`);
    }
  };

  const getUrgencyBadge = () => {
    if (!citaData?.urgencyLevel) return null;

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

    const config = configs[citaData.urgencyLevel];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Botones principales */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewDetail}
          className="flex-1"
        >
          <Eye className="w-3 h-3 mr-1" />
          Ver
        </Button>

        {actualCita.estado === "aceptada" && (
          <Button
            size="sm"
            onClick={handleAttendCita}
            className="flex-1 bg-vet-primary hover:bg-vet-primary-dark"
          >
            <Activity className="w-3 h-3 mr-1" />
            Atender
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleViewDetail}>
              <Eye className="w-4 h-4 mr-2" />
              Ver detalle completo
            </DropdownMenuItem>
            {actualCita.estado === "aceptada" && (
              <DropdownMenuItem onClick={handleAttendCita}>
                <Activity className="w-4 h-4 mr-2" />
                Registrar consulta
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleViewHistory}>
              <FileText className="w-4 h-4 mr-2" />
              Historial clínico
            </DropdownMenuItem>
            {cliente?.telefono && (
              <DropdownMenuItem
                onClick={() => window.open(`tel:${cliente.telefono}`)}
              >
                <Phone className="w-4 h-4 mr-2" />
                Llamar propietario
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Modal de vista rápida */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <PawPrint className="w-5 h-5 text-vet-primary" />
              <span>Vista Rápida - {cita.mascota}</span>
            </DialogTitle>
            <DialogDescription>
              Información básica de la cita programada
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Estado y urgencia */}
            <div className="flex items-center justify-between">
              <Badge className={estadoColors[actualCita.estado]}>
                {estadoLabels[actualCita.estado]}
              </Badge>
              {getUrgencyBadge()}
            </div>

            {/* Información básica */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-vet-gray-900 mb-2">
                  Información del Paciente
                </h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Mascota:</strong> {actualCita.mascota}
                  </p>
                  <p>
                    <strong>Especie:</strong>{" "}
                    {mascota?.especie || "No especificado"}
                  </p>
                  {mascota?.raza && (
                    <p>
                      <strong>Raza:</strong> {mascota.raza}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-vet-gray-900 mb-2">
                  Información del Propietario
                </h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Nombre:</strong> {cliente?.nombre || "Sin asignar"}
                  </p>
                  {cliente?.telefono && (
                    <p>
                      <strong>Teléfono:</strong> {cliente.telefono}
                    </p>
                  )}
                  {cliente?.email && (
                    <p>
                      <strong>Email:</strong> {cliente.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Detalles de la cita */}
            <div>
              <h4 className="font-medium text-vet-gray-900 mb-2">
                Detalles de la Cita
              </h4>
              <div className="bg-vet-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-vet-gray-600" />
                  <span>
                    {new Date(actualCita.fecha).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-vet-gray-600" />
                  <span>
                    {new Date(actualCita.fecha).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="text-sm">
                  <strong>Motivo:</strong> {actualCita.motivo}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Cerrar
              </Button>
              <Button onClick={handleViewDetail} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Ver Completo
              </Button>
              {actualCita.estado === "aceptada" && (
                <Button
                  onClick={handleAttendCita}
                  className="bg-vet-primary hover:bg-vet-primary-dark"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Atender
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
