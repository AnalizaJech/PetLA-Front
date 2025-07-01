import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  User,
  Stethoscope,
} from "lucide-react";

export default function NotasAdmin() {
  const { user, preCitas } = useAppContext();

  if (!user || user.rol !== "cliente") {
    return null;
  }

  // Get pre-citas for this client that have admin notes
  const misPreCitasConNotas = preCitas.filter(
    (preCita) =>
      preCita.email === user.email &&
      preCita.notasAdmin &&
      preCita.notasAdmin.trim() !== "",
  );

  if (misPreCitasConNotas.length === 0) {
    return null;
  }

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case "aceptada":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aceptada
          </Badge>
        );
      case "rechazada":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazada
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "aceptada":
        return "border-green-200 bg-green-50";
      case "rechazada":
        return "border-red-200 bg-red-50";
      default:
        return "border-yellow-200 bg-yellow-50";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-vet-primary" />
          <span>Mensajes de la Clínica</span>
          <Badge className="bg-vet-primary/10 text-vet-primary">
            {misPreCitasConNotas.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          Comunicaciones y actualizaciones sobre tus solicitudes de citas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {misPreCitasConNotas
            .sort(
              (a, b) =>
                new Date(b.fechaCreacion).getTime() -
                new Date(a.fechaCreacion).getTime(),
            )
            .map((preCita) => (
              <Alert
                key={preCita.id}
                className={getStatusColor(preCita.estado)}
              >
                <div className="w-full space-y-3">
                  {/* Header with pet info and status */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-vet-gray-600" />
                        <span className="font-medium text-vet-gray-900">
                          Cita para {preCita.nombreMascota}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-vet-gray-600">
                        <span>
                          Fecha solicitada:{" "}
                          {preCita.fechaPreferida.toLocaleDateString("es-ES")} a
                          las {preCita.horaPreferida}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(preCita.estado)}
                  </div>

                  {/* Admin notes */}
                  <div className="bg-white/70 p-3 rounded-lg border border-white/50">
                    <div className="flex items-start space-x-2 mb-2">
                      <User className="w-4 h-4 text-vet-primary mt-0.5" />
                      <span className="text-sm font-medium text-vet-primary">
                        Mensaje de la clínica:
                      </span>
                    </div>
                    <p className="text-sm text-vet-gray-800 leading-relaxed">
                      {preCita.notasAdmin}
                    </p>
                  </div>

                  {/* Veterinarian assignment if available */}
                  {preCita.veterinarioAsignado &&
                    preCita.estado === "aceptada" && (
                      <div className="bg-white/70 p-3 rounded-lg border border-white/50">
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            Veterinario asignado: {preCita.veterinarioAsignado}
                          </span>
                        </div>
                      </div>
                    )}

                  {/* Date updated if available */}
                  {preCita.fechaNueva && (
                    <div className="bg-white/70 p-3 rounded-lg border border-white/50">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          Nueva fecha programada:{" "}
                          {preCita.fechaNueva.toLocaleDateString("es-ES")}
                          {preCita.horaNueva && ` a las ${preCita.horaNueva}`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Footer with timestamp */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/30">
                    <span className="text-xs text-vet-gray-500">
                      Actualizado el{" "}
                      {preCita.fechaCreacion.toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {preCita.estado === "aceptada" && (
                      <span className="text-xs text-green-600 font-medium">
                        ✓ Confirmada
                      </span>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
        </div>

        {/* Call to action based on status */}
        <div className="mt-6 p-4 bg-vet-primary/5 border border-vet-primary/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-vet-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-vet-primary mb-1">
                ¿Necesitas hacer cambios en tu cita?
              </p>
              <p className="text-vet-gray-600">
                Contáctanos por teléfono al{" "}
                <a
                  href="tel:+5551234567"
                  className="text-vet-primary hover:underline font-medium"
                >
                  (555) 123-4567
                </a>{" "}
                o envíanos un email a{" "}
                <a
                  href="mailto:info@petla.com"
                  className="text-vet-primary hover:underline font-medium"
                >
                  info@petla.com
                </a>{" "}
                para reprogramar o hacer ajustes.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
