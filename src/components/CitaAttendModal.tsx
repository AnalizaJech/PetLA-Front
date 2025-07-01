import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Activity,
  Save,
  FileText,
  Heart,
  Thermometer,
  Weight,
  CalendarPlus,
  Pill,
  ClipboardList,
  Edit3,
} from "lucide-react";
import type { CitaRelationData } from "@/lib/citaUtils";
import { findMascotaByName } from "@/lib/citaUtils";
import { useToast } from "@/hooks/use-toast";

interface CitaAttendModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCita: CitaRelationData | null;
  onSave?: () => void;
}

export default function CitaAttendModal({
  isOpen,
  onClose,
  selectedCita,
  onSave,
}: CitaAttendModalProps) {
  const { updateCita, user, addHistorialEntry, mascotas } = useAppContext();
  const { toast } = useToast();

  // Debug: verificar datos del contexto
  console.log("CitaAttendModal - Datos del contexto:", {
    mascotasCount: mascotas?.length || 0,
    user: user?.nombre,
    selectedCita: selectedCita?.cita?.mascota,
  });

  const [newConsulta, setNewConsulta] = useState({
    motivo: "",
    diagnostico: "",
    tratamiento: "",
    medicamentos: "",
    notas: "",
    peso: "",
    temperatura: "",
    proximaCita: "",
  });

  // Reset form when modal opens with new cita
  useEffect(() => {
    if (selectedCita && isOpen) {
      setNewConsulta((prev) => ({
        ...prev,
        motivo: selectedCita.cita.motivo,
      }));
    }
  }, [selectedCita, isOpen]);

  const handleSaveConsulta = () => {
    console.log("Intentando guardar consulta...", {
      selectedCita,
      user,
      newConsulta,
    });

    if (!selectedCita || !user) {
      console.error("Faltan datos requeridos:", { selectedCita, user });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Faltan datos requeridos para guardar la consulta",
      });
      return;
    }

    console.log("=== INICIO BÚSQUEDA DE MASCOTA ===");
    console.log("mascotas.length:", mascotas.length);
    console.log("selectedCita.mascota:", selectedCita.mascota);
    console.log("selectedCita.cita.mascota:", selectedCita.cita.mascota);

    // Encontrar la mascota asociada a la cita - usar utilidad robusta
    let mascota = selectedCita.mascota;

    // Si no hay mascota directa, usar la función de búsqueda robusta
    if (!mascota) {
      mascota = findMascotaByName(selectedCita.cita.mascota, mascotas);
    }

    // Como último recurso, buscar por ID si selectedCita.cita.mascota es un ID
    if (!mascota) {
      mascota = mascotas.find((m) => m.id === selectedCita.cita.mascota);
    }

    if (!mascota) {
      console.error("No se pudo encontrar la mascota para la cita:");
      console.error(
        "Datos completos de selectedCita:",
        JSON.stringify(selectedCita, null, 2),
      );
      console.error("Lista de mascotas:", JSON.stringify(mascotas, null, 2));

      // Si no hay mascotas cargadas, crear una mascota temporal basada en los datos de la cita
      console.log("=== VERIFICANDO SI CREAR MASCOTA TEMPORAL ===");
      console.log("mascotas.length === 0:", mascotas.length === 0);
      if (mascotas.length === 0) {
        console.log("✅ CREANDO MASCOTA TEMPORAL...");
        mascota = {
          id: `temp_${selectedCita.cita.id}`,
          nombre: selectedCita.cita.mascota,
          especie: selectedCita.cita.especie,
          raza: "No especificado",
          sexo: "No especificado",
          fechaNacimiento: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 año atrás por defecto
          estado: "activo",
          clienteId: "temp_cliente",
        };
        console.log("Mascota temporal creada:", mascota);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo encontrar la información de la mascota",
        });
        return;
      }
    }

    console.log("Datos de búsqueda de mascota:");
    console.log("- selectedCita.mascota:", selectedCita.mascota);
    console.log("- selectedCita.cita.mascota:", selectedCita.cita.mascota);
    console.log("- mascotas disponibles:", mascotas);
    console.log("- mascota encontrada:", mascota);

    // Validación básica
    if (!newConsulta.motivo && !selectedCita.cita.motivo) {
      toast({
        variant: "destructive",
        title: "Validación",
        description: "Por favor completa el motivo de la consulta",
      });
      return;
    }

    // Crear entrada en el historial clínico
    const historialEntry = {
      mascotaId: mascota.id,
      mascotaNombre: mascota.nombre,
      fecha: new Date(),
      veterinario: user.nombre,
      tipoConsulta: "consulta_general" as const,
      motivo: newConsulta.motivo || selectedCita.cita.motivo,
      diagnostico: newConsulta.diagnostico,
      tratamiento: newConsulta.tratamiento,
      medicamentos: newConsulta.medicamentos
        ? [
            {
              nombre: newConsulta.medicamentos,
              dosis: "",
              frecuencia: "",
              duracion: "",
            },
          ]
        : [],
      peso: newConsulta.peso,
      temperatura: newConsulta.temperatura,
      observaciones: newConsulta.notas,
      estado: "completada" as const,
      proximaVisita: newConsulta.proximaCita
        ? new Date(newConsulta.proximaCita)
        : undefined,
    };

    console.log("Guardando entrada en historial:", historialEntry);

    try {
      // Guardar en el historial clínico
      addHistorialEntry(historialEntry);
      console.log("Historial guardado exitosamente");

      // Marcar cita como atendida
      updateCita(selectedCita.cita.id, {
        estado: "atendida",
        notas: `Consulta registrada: ${newConsulta.diagnostico || "Sin diagnóstico específico"}`,
      });
      console.log("Cita actualizada exitosamente");

      // Toast de éxito con animación
      toast({
        title: "✅ ¡Consulta guardada!",
        description: `La consulta de ${mascota.nombre} se registró exitosamente`,
        className: "bg-green-50 border-green-200 text-green-800",
      });

      // Limpiar estado
      onClose();
    } catch (error) {
      console.error("Error al guardar la consulta:", error);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description:
          "No se pudo guardar la consulta. Por favor intenta nuevamente.",
      });
    }
    setNewConsulta({
      motivo: "",
      diagnostico: "",
      tratamiento: "",
      medicamentos: "",
      notas: "",
      peso: "",
      temperatura: "",
      proximaCita: "",
    });

    // Callback para actualizar la vista padre
    if (onSave) {
      onSave();
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setNewConsulta({
      motivo: "",
      diagnostico: "",
      tratamiento: "",
      medicamentos: "",
      notas: "",
      peso: "",
      temperatura: "",
      proximaCita: "",
    });
  };

  if (!selectedCita) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-vet-primary" />
            <span>Registrar Consulta</span>
          </DialogTitle>
          <DialogDescription>
            Completa la información de la consulta médica para{" "}
            {selectedCita.cita.mascota}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="motivo" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Motivo de consulta</span>
              </Label>
              <Input
                id="motivo"
                value={newConsulta.motivo}
                onChange={(e) =>
                  setNewConsulta({
                    ...newConsulta,
                    motivo: e.target.value,
                  })
                }
                placeholder="Ej: Revisión general"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="peso" className="flex items-center space-x-2">
                <Weight className="w-4 h-4" />
                <span>Peso (kg)</span>
              </Label>
              <Input
                id="peso"
                value={newConsulta.peso}
                onChange={(e) =>
                  setNewConsulta({
                    ...newConsulta,
                    peso: e.target.value,
                  })
                }
                placeholder="Ej: 25.5"
                type="number"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="temperatura"
                className="flex items-center space-x-2"
              >
                <Thermometer className="w-4 h-4" />
                <span>Temperatura (°C)</span>
              </Label>
              <Input
                id="temperatura"
                value={newConsulta.temperatura}
                onChange={(e) =>
                  setNewConsulta({
                    ...newConsulta,
                    temperatura: e.target.value,
                  })
                }
                placeholder="Ej: 38.2"
                type="number"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="proxima-cita"
                className="flex items-center space-x-2"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Próxima cita (opcional)</span>
              </Label>
              <Input
                id="proxima-cita"
                type="date"
                value={newConsulta.proximaCita}
                onChange={(e) =>
                  setNewConsulta({
                    ...newConsulta,
                    proximaCita: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="diagnostico"
              className="flex items-center space-x-2"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Diagnóstico</span>
            </Label>
            <Textarea
              id="diagnostico"
              value={newConsulta.diagnostico}
              onChange={(e) =>
                setNewConsulta({
                  ...newConsulta,
                  diagnostico: e.target.value,
                })
              }
              placeholder="Describe el diagnóstico encontrado..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="tratamiento"
              className="flex items-center space-x-2"
            >
              <Heart className="w-4 h-4" />
              <span>Tratamiento</span>
            </Label>
            <Textarea
              id="tratamiento"
              value={newConsulta.tratamiento}
              onChange={(e) =>
                setNewConsulta({
                  ...newConsulta,
                  tratamiento: e.target.value,
                })
              }
              placeholder="Describe el tratamiento aplicado o recomendado..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="medicamentos"
              className="flex items-center space-x-2"
            >
              <Pill className="w-4 h-4" />
              <span>Medicamentos recetados</span>
            </Label>
            <Textarea
              id="medicamentos"
              value={newConsulta.medicamentos}
              onChange={(e) =>
                setNewConsulta({
                  ...newConsulta,
                  medicamentos: e.target.value,
                })
              }
              placeholder="Medicamento, dosis, frecuencia y duración del tratamiento..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas" className="flex items-center space-x-2">
              <Edit3 className="w-4 h-4" />
              <span>Notas adicionales</span>
            </Label>
            <Textarea
              id="notas"
              value={newConsulta.notas}
              onChange={(e) =>
                setNewConsulta({
                  ...newConsulta,
                  notas: e.target.value,
                })
              }
              placeholder="Observaciones, recomendaciones para el propietario..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveConsulta}
              className="bg-vet-primary hover:bg-vet-primary-dark"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Consulta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
