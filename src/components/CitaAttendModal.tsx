import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Stethoscope,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Pill,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Save,
} from "lucide-react";
import type { CitaRelationData } from "@/lib/citaUtils";

interface CitaAttendModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCita: CitaRelationData | null;
  onSave?: () => void;
}

interface Medicamento {
  nombre: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  indicaciones?: string;
}

interface Examen {
  tipo: string;
  resultado: string;
}

export default function CitaAttendModal({
  isOpen,
  onClose,
  selectedCita,
  onSave,
}: CitaAttendModalProps) {
  const { user, updateCita, addHistorialEntry } = useAppContext();

  // Form state
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Medical consultation form data
  const [formData, setFormData] = useState({
    peso: "",
    temperatura: "",
    presionArterial: "",
    frecuenciaCardiaca: "",
    diagnostico: "",
    tratamiento: "",
    observaciones: "",
    proximaVisita: "",
  });

  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [attended, setAttended] = useState<boolean | null>(null);

  const resetForm = () => {
    setFormData({
      peso: "",
      temperatura: "",
      presionArterial: "",
      frecuenciaCardiaca: "",
      diagnostico: "",
      tratamiento: "",
      observaciones: "",
      proximaVisita: "",
    });
    setMedicamentos([]);
    setExamenes([]);
    setAttended(null);
    setMessage("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addMedicamento = () => {
    setMedicamentos([
      ...medicamentos,
      { nombre: "", dosis: "", frecuencia: "", duracion: "", indicaciones: "" },
    ]);
  };

  const removeMedicamento = (index: number) => {
    setMedicamentos(medicamentos.filter((_, i) => i !== index));
  };

  const updateMedicamento = (
    index: number,
    field: keyof Medicamento,
    value: string,
  ) => {
    const updated = [...medicamentos];
    updated[index] = { ...updated[index], [field]: value };
    setMedicamentos(updated);
  };

  const addExamen = () => {
    setExamenes([...examenes, { tipo: "", resultado: "" }]);
  };

  const removeExamen = (index: number) => {
    setExamenes(examenes.filter((_, i) => i !== index));
  };

  const updateExamen = (index: number, field: keyof Examen, value: string) => {
    const updated = [...examenes];
    updated[index] = { ...updated[index], [field]: value };
    setExamenes(updated);
  };

  const handleSaveConsultation = async () => {
    if (!selectedCita || !user || attended === null) {
      setError("Información incompleta para registrar la consulta");
      return;
    }

    if (attended && !formData.diagnostico.trim()) {
      setError("El diagnóstico es requerido para consultas atendidas");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Update appointment status
      await updateCita(selectedCita.cita.id, {
        estado: attended ? "atendida" : "no_asistio",
        notas: attended
          ? formData.observaciones
          : "El paciente no asistió a la cita",
      });

      // If attended, create medical history entry
      if (attended) {
        // Ensure we have minimum required data for clinical history
        const mascotaData = selectedCita.mascota;
        const mascotaId =
          mascotaData?.id || `temp_${selectedCita.cita.id}_${Date.now()}`;
        const mascotaNombre = mascotaData?.nombre || selectedCita.cita.mascota;

        const historialEntry = {
          mascotaId: mascotaId,
          mascotaNombre: mascotaNombre,
          fecha: new Date(),
          veterinario: user.nombre,
          tipoConsulta: selectedCita.cita.tipoConsulta as any,
          motivo: selectedCita.cita.motivo || "Consulta médica",
          diagnostico: formData.diagnostico,
          tratamiento: formData.tratamiento || "",
          medicamentos: medicamentos.filter((m) => m.nombre.trim()),
          examenes: examenes.filter((e) => e.tipo.trim()),
          peso: formData.peso || undefined,
          temperatura: formData.temperatura || undefined,
          presionArterial: formData.presionArterial || undefined,
          frecuenciaCardiaca: formData.frecuenciaCardiaca || undefined,
          observaciones: formData.observaciones || "",
          proximaVisita: formData.proximaVisita
            ? new Date(formData.proximaVisita)
            : undefined,
          estado: "completada" as const,
        };

        console.log("Creating clinical history entry:", historialEntry);
        await addHistorialEntry(historialEntry);

        // Log success for debugging
        console.log("Clinical history entry created successfully for:", {
          mascotaId,
          mascotaNombre,
          citaId: selectedCita.cita.id,
          veterinario: user.nombre,
        });
      }

      setMessage(
        attended
          ? "Consulta registrada exitosamente"
          : "Marcado como no asistió",
      );

      setTimeout(() => {
        handleClose();
        onSave?.();
      }, 1500);
    } catch (error) {
      console.error("Error saving consultation:", error);
      setError("Error al guardar la consulta");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedCita) return null;

  const { cita, mascota, propietario } = selectedCita;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-vet-primary/10 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-vet-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-vet-gray-900">
                Registrar Atención Médica
              </DialogTitle>
              <DialogDescription className="text-vet-gray-600">
                Registra la consulta médica para {cita.mascota}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Patient Information */}
          <div className="bg-vet-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-vet-gray-900 mb-3 flex items-center">
              <Stethoscope className="w-4 h-4 mr-2 text-vet-primary" />
              Información del Paciente
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-vet-gray-700">Mascota:</span>{" "}
                {cita.mascota}
                {!mascota && (
                  <span className="ml-2 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                    No registrada
                  </span>
                )}
              </div>
              <div>
                <span className="font-medium text-vet-gray-700">Especie:</span>{" "}
                {mascota?.especie || cita.especie}
              </div>
              <div>
                <span className="font-medium text-vet-gray-700">Raza:</span>{" "}
                {mascota?.raza || "No especificada"}
                {mascota && !mascota.raza && (
                  <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                    Sin registrar
                  </span>
                )}
              </div>
              <div>
                <span className="font-medium text-vet-gray-700">
                  Propietario:
                </span>{" "}
                {propietario?.nombre || "Sin asignar"}
                {!propietario && (
                  <span className="ml-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                    Requerido
                  </span>
                )}
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-vet-gray-700">Motivo:</span>{" "}
                {cita.motivo}
              </div>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Attendance Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium text-vet-gray-900">
              ¿El paciente asistió a la consulta?
            </Label>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={attended === true ? "default" : "outline"}
                onClick={() => setAttended(true)}
                className={
                  attended === true ? "bg-green-600 hover:bg-green-700" : ""
                }
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Sí, fue atendido
              </Button>
              <Button
                type="button"
                variant={attended === false ? "default" : "outline"}
                onClick={() => setAttended(false)}
                className={
                  attended === false ? "bg-orange-600 hover:bg-orange-700" : ""
                }
              >
                <X className="w-4 h-4 mr-2" />
                No asistió
              </Button>
            </div>
          </div>

          {/* Medical Form - Only show if attended */}
          {attended === true && (
            <div className="space-y-6">
              {/* Vital Signs */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-vet-gray-900 mb-3 flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-blue-600" />
                  Signos Vitales
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="peso" className="flex items-center">
                      <Weight className="w-3 h-3 mr-1" />
                      Peso (kg)
                    </Label>
                    <Input
                      id="peso"
                      value={formData.peso}
                      onChange={(e) =>
                        setFormData({ ...formData, peso: e.target.value })
                      }
                      placeholder="Ej: 5.2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="temperatura" className="flex items-center">
                      <Thermometer className="w-3 h-3 mr-1" />
                      Temperatura (°C)
                    </Label>
                    <Input
                      id="temperatura"
                      value={formData.temperatura}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          temperatura: e.target.value,
                        })
                      }
                      placeholder="Ej: 38.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="presionArterial">Presión Arterial</Label>
                    <Input
                      id="presionArterial"
                      value={formData.presionArterial}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          presionArterial: e.target.value,
                        })
                      }
                      placeholder="Ej: 120/80"
                    />
                  </div>
                  <div>
                    <Label htmlFor="frecuenciaCardiaca">
                      Frecuencia Cardíaca (bpm)
                    </Label>
                    <Input
                      id="frecuenciaCardiaca"
                      value={formData.frecuenciaCardiaca}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          frecuenciaCardiaca: e.target.value,
                        })
                      }
                      placeholder="Ej: 80"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis and Treatment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="diagnostico">Diagnóstico *</Label>
                  <Textarea
                    id="diagnostico"
                    value={formData.diagnostico}
                    onChange={(e) =>
                      setFormData({ ...formData, diagnostico: e.target.value })
                    }
                    placeholder="Describe el diagnóstico médico..."
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tratamiento">Tratamiento</Label>
                  <Textarea
                    id="tratamiento"
                    value={formData.tratamiento}
                    onChange={(e) =>
                      setFormData({ ...formData, tratamiento: e.target.value })
                    }
                    placeholder="Describe el plan de tratamiento..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Medications */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium flex items-center">
                    <Pill className="w-4 h-4 mr-2 text-vet-primary" />
                    Medicamentos Recetados
                  </Label>
                  <Button
                    type="button"
                    onClick={addMedicamento}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>
                {medicamentos.map((med, index) => (
                  <div
                    key={index}
                    className="border border-vet-gray-200 rounded-lg p-4 mb-3"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-medium text-vet-gray-900">
                        Medicamento {index + 1}
                      </h5>
                      <Button
                        type="button"
                        onClick={() => removeMedicamento(index)}
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Nombre del medicamento</Label>
                        <Input
                          value={med.nombre}
                          onChange={(e) =>
                            updateMedicamento(index, "nombre", e.target.value)
                          }
                          placeholder="Ej: Amoxicilina"
                        />
                      </div>
                      <div>
                        <Label>Dosis</Label>
                        <Input
                          value={med.dosis}
                          onChange={(e) =>
                            updateMedicamento(index, "dosis", e.target.value)
                          }
                          placeholder="Ej: 250mg"
                        />
                      </div>
                      <div>
                        <Label>Frecuencia</Label>
                        <Input
                          value={med.frecuencia}
                          onChange={(e) =>
                            updateMedicamento(
                              index,
                              "frecuencia",
                              e.target.value,
                            )
                          }
                          placeholder="Ej: Cada 8 horas"
                        />
                      </div>
                      <div>
                        <Label>Duración</Label>
                        <Input
                          value={med.duracion}
                          onChange={(e) =>
                            updateMedicamento(index, "duracion", e.target.value)
                          }
                          placeholder="Ej: 7 días"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Indicaciones especiales</Label>
                        <Input
                          value={med.indicaciones}
                          onChange={(e) =>
                            updateMedicamento(
                              index,
                              "indicaciones",
                              e.target.value,
                            )
                          }
                          placeholder="Instrucciones adicionales..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Exams */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium">
                    Exámenes Realizados
                  </Label>
                  <Button
                    type="button"
                    onClick={addExamen}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>
                {examenes.map((exam, index) => (
                  <div
                    key={index}
                    className="border border-vet-gray-200 rounded-lg p-4 mb-3"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-medium text-vet-gray-900">
                        Examen {index + 1}
                      </h5>
                      <Button
                        type="button"
                        onClick={() => removeExamen(index)}
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Tipo de examen</Label>
                        <Input
                          value={exam.tipo}
                          onChange={(e) =>
                            updateExamen(index, "tipo", e.target.value)
                          }
                          placeholder="Ej: Radiografía, Análisis de sangre"
                        />
                      </div>
                      <div>
                        <Label>Resultado</Label>
                        <Input
                          value={exam.resultado}
                          onChange={(e) =>
                            updateExamen(index, "resultado", e.target.value)
                          }
                          placeholder="Resultado del examen..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Observations and Follow-up */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="observaciones">Observaciones Generales</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        observaciones: e.target.value,
                      })
                    }
                    placeholder="Observaciones adicionales sobre la consulta..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="proximaVisita">
                    Próxima Visita (opcional)
                  </Label>
                  <Input
                    id="proximaVisita"
                    type="date"
                    value={formData.proximaVisita}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        proximaVisita: e.target.value,
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-vet-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveConsultation}
              disabled={isProcessing || attended === null}
              className="bg-vet-primary hover:bg-vet-primary-dark"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Guardando...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Consulta
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
