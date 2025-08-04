import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Calendar,
  Phone,
  Mail,
  PawPrint,
  AlertCircle,
  Filter,
  User,
  Stethoscope,
} from "lucide-react";

export default function PreCitas() {
  const { usuarios, preCitas, updatePreCita } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [selectedPreCita, setSelectedPreCita] = useState<PreCita | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assignedVet, setAssignedVet] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [processAction, setProcessAction] = useState<
    "aceptar" | "rechazar" | "cambiar_fecha" | ""
  >("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const veterinarios = usuarios.filter((u) => u.rol === "veterinario");

  // Filter pre-citas
  const filteredPreCitas = preCitas.filter((preCita) => {
    const matchesSearch =
      preCita.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preCita.nombreMascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preCita.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "todos" || preCita.estado === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleProcessPreCita = async (
    id: string,
    action: "aceptar" | "rechazar" | "cambiar_fecha",
  ) => {
    // Validate required fields
    if (!adminNotes.trim()) {
      setError("Las notas administrativas son obligatorias");
      return;
    }

    if (action === "aceptar" && !assignedVet) {
      setError("Debe asignar un veterinario para aceptar la pre-cita");
      return;
    }

    if (action === "cambiar_fecha" && (!newDate || !newTime)) {
      setError("Debe especificar la nueva fecha y hora");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updates: any = {
        notasAdmin: adminNotes,
      };

      if (action === "aceptar") {
        updates.estado = "aceptada";
        if (assignedVet) {
          const veterinario = usuarios.find((u) => u.id === assignedVet);
          updates.veterinarioAsignado = veterinario?.nombre;
        }
      } else if (action === "rechazar") {
        updates.estado = "rechazada";
      } else if (action === "cambiar_fecha") {
        updates.estado = "pendiente";
        updates.fechaNueva = new Date(`${newDate}T${newTime}`);
        updates.horaNueva = newTime;
        if (assignedVet) {
          const veterinario = usuarios.find((u) => u.id === assignedVet);
          updates.veterinarioAsignado = veterinario?.nombre;
        }
      }

      updatePreCita(id, updates);

      let successMessage = "";
      switch (action) {
        case "aceptar":
          successMessage =
            "Pre-cita aceptada exitosamente. El cliente será notificado.";
          break;
        case "rechazar":
          successMessage =
            "Pre-cita rechazada. El cliente será notificado con las razones.";
          break;
        case "cambiar_fecha":
          successMessage =
            "Fecha cambiada exitosamente. El cliente será notificado de la nueva fecha.";
          break;
      }

      setMessage(successMessage);
      setIsDialogOpen(false);
      resetFormState();
    } catch (error) {
      setMessage("Error al procesar la pre-cita");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const resetFormState = () => {
    setAssignedVet("");
    setAdminNotes("");
    setNewDate("");
    setNewTime("");
    setProcessAction("");
    setError("");
  };

  const openProcessDialog = (preCita: any) => {
    setSelectedPreCita(preCita);
    setIsDialogOpen(true);
    resetFormState();
  };

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

  const stats = {
    total: preCitas.length,
    pendientes: preCitas.filter((p) => p.estado === "pendiente").length,
    aceptadas: preCitas.filter((p) => p.estado === "aceptada").length,
    rechazadas: preCitas.filter((p) => p.estado === "rechazada").length,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-vet-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-vet-primary rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-vet-gray-900">
                  Gestión de Pre-Citas
                </h1>
                <p className="text-vet-gray-600">
                  Revisa y procesa las solicitudes de pre-citas
                </p>
              </div>
            </div>

            {message && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-vet-primary/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-vet-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Total Pre-Citas
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-vet-gray-900">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Pendientes
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
                      {stats.pendientes}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Aceptadas
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">
                      {stats.aceptadas}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Rechazadas
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-red-600">
                      {stats.rechazadas}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                    <Input
                      placeholder="Buscar por cliente, mascota o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="pendiente">Pendientes</SelectItem>
                      <SelectItem value="aceptada">Aceptadas</SelectItem>
                      <SelectItem value="rechazada">Rechazadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pre-Citas Table */}
          <Card>
            <CardHeader>
              <CardTitle>Pre-Citas ({filteredPreCitas.length})</CardTitle>
              <CardDescription>
                Lista de todas las solicitudes de pre-citas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente & Mascota</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Fecha Preferida</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPreCitas.map((preCita) => (
                      <TableRow key={preCita.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-vet-gray-400" />
                              <p className="font-medium text-vet-gray-900">
                                {preCita.nombreCliente}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <PawPrint className="w-4 h-4 text-vet-secondary" />
                              <p className="text-sm text-vet-gray-600">
                                {preCita.nombreMascota} ({preCita.tipoMascota})
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm text-vet-gray-600">
                              <Phone className="w-3 h-3" />
                              <span>{preCita.telefono}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-vet-gray-600">
                              <Mail className="w-3 h-3" />
                              <span>{preCita.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-vet-gray-700 max-w-xs">
                            {preCita.motivoConsulta}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="w-3 h-3 text-vet-gray-400" />
                              <span className="font-medium">
                                {preCita.fechaPreferida.toLocaleDateString(
                                  "es-ES",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-vet-gray-600">
                              <Clock className="w-3 h-3" />
                              <span>{preCita.horaPreferida}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(preCita.estado)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-vet-gray-100 focus:bg-vet-gray-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Abrir menú</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="text-vet-gray-900">
                                Acciones
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {preCita.estado === "pendiente" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openProcessDialog(preCita);
                                    }}
                                    className="flex items-center cursor-pointer hover:bg-green-50 text-green-600 focus:bg-green-50"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Procesar pre-cita
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem
                                className="flex items-center cursor-pointer hover:bg-vet-gray-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `tel:${preCita.telefono}`;
                                }}
                              >
                                <Phone className="w-4 h-4 mr-2 text-blue-600" />
                                Llamar cliente
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center cursor-pointer hover:bg-vet-gray-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `mailto:${preCita.email}`;
                                }}
                              >
                                <Mail className="w-4 h-4 mr-2 text-orange-600" />
                                Enviar email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredPreCitas.length === 0 && (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-vet-gray-900 mb-2">
                      No hay pre-citas
                    </h3>
                    <p className="text-vet-gray-600">
                      {searchTerm || selectedStatus !== "todos"
                        ? "No se encontraron pre-citas con los filtros aplicados"
                        : "Aún no hay solicitudes de pre-citas"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Process Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="w-full max-w-3xl max-h-[90vh]">
              <div className="max-h-[calc(90vh-8rem)] overflow-y-auto scrollbar-hide">
                <DialogHeader className="pb-4 border-b border-vet-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-vet-primary/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-vet-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-semibold text-vet-gray-900">
                        Procesar Pre-Cita
                      </DialogTitle>
                      <DialogDescription className="text-vet-gray-600">
                        {selectedPreCita && (
                          <>
                            Pre-cita de {selectedPreCita.nombreCliente} para{" "}
                            {selectedPreCita.nombreMascota}
                          </>
                        )}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                {selectedPreCita && (
                  <div className="space-y-6 pt-6">
                    {/* Información de la solicitud */}
                    <div className="bg-vet-gray-50 rounded-lg p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <PawPrint className="w-5 h-5 text-vet-primary" />
                        <h4 className="font-semibold text-vet-gray-900">
                          Detalles de la Solicitud
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-vet-gray-500 uppercase tracking-wide">
                            Cliente
                          </span>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-vet-primary" />
                            <p className="font-medium text-vet-gray-900">
                              {selectedPreCita.nombreCliente}
                            </p>
                          </div>
                          <p className="text-sm text-vet-gray-600">
                            {selectedPreCita.email}
                          </p>
                          <p className="text-sm text-vet-gray-600">
                            {selectedPreCita.telefono}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-medium text-vet-gray-500 uppercase tracking-wide">
                            Mascota
                          </span>
                          <div className="flex items-center space-x-2">
                            <PawPrint className="w-4 h-4 text-vet-secondary" />
                            <p className="font-medium text-vet-gray-900">
                              {selectedPreCita.nombreMascota}
                            </p>
                          </div>
                          <p className="text-sm text-vet-gray-600">
                            ({selectedPreCita.tipoMascota})
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-medium text-vet-gray-500 uppercase tracking-wide">
                            Fecha Preferida
                          </span>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <p className="font-medium text-vet-gray-900">
                              {selectedPreCita.fechaPreferida.toLocaleDateString(
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

                        <div className="space-y-1">
                          <span className="text-xs font-medium text-vet-gray-500 uppercase tracking-wide">
                            Hora Preferida
                          </span>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <p className="font-medium text-vet-gray-900">
                              {selectedPreCita.horaPreferida}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-vet-gray-200">
                        <span className="text-xs font-medium text-vet-gray-500 uppercase tracking-wide">
                          Motivo de la Consulta
                        </span>
                        <p className="mt-1 font-medium text-vet-gray-900">
                          {selectedPreCita.motivoConsulta}
                        </p>
                      </div>

                      {selectedPreCita.notasAdmin && (
                        <div className="mt-4 pt-4 border-t border-vet-gray-200">
                          <span className="text-xs font-medium text-vet-gray-500 uppercase tracking-wide">
                            Notas Previas
                          </span>
                          <p className="mt-1 text-blue-700 bg-blue-50 p-3 rounded border border-blue-200">
                            {selectedPreCita.notasAdmin}
                          </p>
                        </div>
                      )}

                      {selectedPreCita.veterinarioAsignado && (
                        <div className="mt-4 pt-4 border-t border-vet-gray-200">
                          <span className="text-xs font-medium text-vet-gray-500 uppercase tracking-wide">
                            Veterinario Asignado
                          </span>
                          <div className="flex items-center space-x-2 mt-1">
                            <Stethoscope className="w-4 h-4 text-green-600" />
                            <p className="font-medium text-green-700">
                              {selectedPreCita.veterinarioAsignado}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Selection */}
                    <div className="space-y-3">
                      <Label>Acción a realizar *</Label>
                      <div className="grid grid-cols-1 gap-3">
                        <div
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            processAction === "aceptar"
                              ? "border-green-300 bg-green-50"
                              : "border-vet-gray-200 hover:bg-vet-gray-50"
                          }`}
                          onClick={() => setProcessAction("aceptar")}
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={processAction === "aceptar"}
                              readOnly
                              className="text-green-600"
                            />
                            <div>
                              <p className="font-medium text-green-800">
                                Aceptar pre-cita
                              </p>
                              <p className="text-sm text-green-600">
                                Confirmar con la fecha y hora solicitada
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            processAction === "cambiar_fecha"
                              ? "border-blue-300 bg-blue-50"
                              : "border-vet-gray-200 hover:bg-vet-gray-50"
                          }`}
                          onClick={() => setProcessAction("cambiar_fecha")}
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={processAction === "cambiar_fecha"}
                              readOnly
                              className="text-blue-600"
                            />
                            <div>
                              <p className="font-medium text-blue-800">
                                Cambiar fecha
                              </p>
                              <p className="text-sm text-blue-600">
                                Proponer nueva fecha por cancelación/cambio del
                                cliente
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            processAction === "rechazar"
                              ? "border-red-300 bg-red-50"
                              : "border-vet-gray-200 hover:bg-vet-gray-50"
                          }`}
                          onClick={() => setProcessAction("rechazar")}
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={processAction === "rechazar"}
                              readOnly
                              className="text-red-600"
                            />
                            <div>
                              <p className="font-medium text-red-800">
                                Rechazar pre-cita
                              </p>
                              <p className="text-sm text-red-600">
                                No es posible atender la solicitud
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* New Date Selection - only show if changing date */}
                    {processAction === "cambiar_fecha" && (
                      <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900">
                          Nueva fecha y hora
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="nueva-fecha">Nueva fecha *</Label>
                            <DatePicker
                              date={newDate ? new Date(newDate) : undefined}
                              onDateChange={(date) => {
                                setNewDate(
                                  date ? date.toISOString().split("T")[0] : "",
                                );
                              }}
                              placeholder="Selecciona fecha"
                              fromYear={new Date().getFullYear()}
                              toYear={new Date().getFullYear() + 1}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nueva-hora">Nueva hora *</Label>
                            <Input
                              id="nueva-hora"
                              type="time"
                              value={newTime}
                              onChange={(e) => setNewTime(e.target.value)}
                              className="h-10"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Veterinarian Assignment */}
                    {(processAction === "aceptar" ||
                      processAction === "cambiar_fecha") && (
                      <div>
                        <Label htmlFor="veterinario">
                          Asignar Veterinario *
                        </Label>
                        <Select
                          value={assignedVet}
                          onValueChange={setAssignedVet}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar veterinario" />
                          </SelectTrigger>
                          <SelectContent>
                            {veterinarios.map((vet) => (
                              <SelectItem key={vet.id} value={vet.id}>
                                <div className="flex items-center space-x-2">
                                  <Stethoscope className="w-4 h-4" />
                                  <span>{vet.nombre}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="notas">Notas administrativas *</Label>
                      <Textarea
                        id="notas"
                        value={adminNotes}
                        onChange={(e) => {
                          setAdminNotes(e.target.value);
                          if (error && e.target.value.trim()) {
                            setError("");
                          }
                        }}
                        placeholder={
                          processAction === "cambiar_fecha"
                            ? "OBLIGATORIO: Explica el motivo del cambio de fecha (ej: 'Cliente solicitó cambio por viaje', 'Veterinario no disponible', etc.)"
                            : processAction === "rechazar"
                              ? "OBLIGATORIO: Explica la razón del rechazo (ej: 'No tenemos especialista disponible', 'Fuera de horario de atención', etc.)"
                              : "OBLIGATORIO: Confirma la aceptación y cualquier instrucción especial para el cliente"
                        }
                        rows={4}
                        className={
                          error && !adminNotes.trim() ? "border-red-300" : ""
                        }
                      />
                      <p className="text-xs text-vet-gray-600 mt-1">
                        Estas notas serán visibles para el cliente si está
                        registrado en el sistema
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => {
                          if (processAction) {
                            handleProcessPreCita(
                              selectedPreCita.id,
                              processAction,
                            );
                          } else {
                            setError("Debe seleccionar una acción");
                          }
                        }}
                        disabled={isProcessing || !processAction}
                        className={`flex-1 ${
                          processAction === "rechazar"
                            ? "bg-red-600 hover:bg-red-700"
                            : processAction === "cambiar_fecha"
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-vet-primary hover:bg-vet-primary-dark"
                        }`}
                      >
                        {isProcessing
                          ? "Procesando..."
                          : processAction === "aceptar"
                            ? "Aceptar Pre-cita"
                            : processAction === "cambiar_fecha"
                              ? "Cambiar Fecha"
                              : processAction === "rechazar"
                                ? "Rechazar Pre-cita"
                                : "Seleccionar Acción"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
}
