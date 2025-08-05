import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Calendar,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  PawPrint,
  AlertCircle,
  User,
  Stethoscope,
  Coins,
  Edit,
  Trash2,
  Eye,
  MapPin,
  FileText,
  Shield,
  UserCheck,
  Download,
} from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function GestionCitas() {
  const {
    citas,
    usuarios,
    mascotas,
    updateCita,
    deleteCita,
    user,
    getComprobante,
  } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedCita, setSelectedCita] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogMode, setDialogMode] = useState<"view" | "validate" | "attend">(
    "view",
  );
  const [message, setMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [citaToDelete, setCitaToDelete] = useState<any>(null);
  const [validationNotes, setValidationNotes] = useState("");
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherModalMode, setVoucherModalMode] = useState<"view" | "validate">(
    "view",
  );
  const [currentReceiptData, setCurrentReceiptData] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get enhanced citas with user and pet info
  const enhancedCitas = citas.map((cita) => {
    const mascota = mascotas.find((m) => m.nombre === cita.mascota);
    const veterinario = usuarios.find((u) => u.nombre === cita.veterinario);
    return {
      ...cita,
      mascotaInfo: mascota,
      veterinarioInfo: veterinario,
    };
  });

  // Filter citas
  const filteredCitas = enhancedCitas.filter((cita) => {
    const matchesSearch =
      cita.mascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.veterinario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.motivo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "todos" || cita.estado === selectedStatus;

    const matchesDate =
      !selectedDate || cita.fecha.toISOString().split("T")[0] === selectedDate;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleUpdateCita = async (id: string, updates: any) => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateCita(id, updates);
      setMessage("Cita actualizada exitosamente");
      setIsDialogOpen(false);
    } catch (error) {
      setMessage("Error al actualizar la cita");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleValidatePayment = async (
    id: string,
    approved: boolean,
    notes?: string,
  ) => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get the current appointment
      const currentCita = citas.find((c) => c.id === id);
      let updates: any = {
        estado: approved ? "aceptada" : "rechazada",
        notasAdmin: notes || "",
      };

      // If approved and veterinarian is "Por asignar" or "Cualquier veterinario disponible", assign randomly
      if (
        approved &&
        currentCita &&
        (currentCita.veterinario === "Por asignar" ||
          currentCita.veterinario === "Cualquier veterinario disponible")
      ) {
        const veterinarios = usuarios.filter((u) => u.rol === "veterinario");
        if (veterinarios.length > 0) {
          const randomIndex = Math.floor(Math.random() * veterinarios.length);
          updates.veterinario = veterinarios[randomIndex].nombre;
        }
      }

      updateCita(id, updates);
      setMessage(
        `Comprobante ${approved ? "aprobado" : "rechazado"} exitosamente`,
      );
      setIsDialogOpen(false);
    } catch (error) {
      setMessage("Error al validar el comprobante");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleMarkAttendance = async (
    id: string,
    attended: boolean,
    notes?: string,
  ) => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const updates = {
        estado: attended ? "atendida" : "no_asistio",
        notas: notes || selectedCita.notas,
      };
      updateCita(id, updates);
      setMessage(
        `Cita marcada como ${attended ? "atendida" : "no asistió"} exitosamente`,
      );
      setIsDialogOpen(false);
    } catch (error) {
      setMessage("Error al registrar la atención");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDeleteCita = (cita: any) => {
    setCitaToDelete(cita);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCita = async () => {
    if (citaToDelete) {
      setIsProcessing(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        deleteCita(citaToDelete.id);
        setMessage("Cita eliminada exitosamente");
        setTimeout(() => setMessage(""), 3000);
        setCitaToDelete(null);
      } catch (error) {
        setMessage("Error al eliminar la cita");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const openDialog = (cita: any, mode: "view" | "validate" | "attend") => {
    setSelectedCita(cita);
    setDialogMode(mode);
    setValidationNotes("");
    setShowVoucherModal(false);
    setIsDialogOpen(true);
  };

  const canEditState = (estado: string) => {
    return !["atendida", "cancelada", "no_asistio"].includes(estado);
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "pendiente_pago":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <Coins className="w-3 h-3 mr-1" />
            Pendiente Pago
          </Badge>
        );
      case "en_validacion":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <Clock className="w-3 h-3 mr-1" />
            En Validación
          </Badge>
        );
      case "aceptada":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmada
          </Badge>
        );
      case "atendida":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Atendida
          </Badge>
        );
      case "cancelada":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelada
          </Badge>
        );
      case "rechazada":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazada
          </Badge>
        );
      case "no_asistio":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <XCircle className="w-3 h-3 mr-1" />
            No Asistió
          </Badge>
        );
      default:
        return null;
    }
  };

  const stats = {
    total: citas.length,
    pendientes: citas.filter(
      (c) => c.estado === "pendiente_pago" || c.estado === "en_validacion",
    ).length,
    confirmadas: citas.filter((c) => c.estado === "aceptada").length,
    completadas: citas.filter((c) => c.estado === "atendida").length,
    hoy: citas.filter((c) => {
      const today = new Date().toDateString();
      return new Date(c.fecha).toDateString() === today;
    }).length,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-vet-gray-50 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-vet-primary/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-vet-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-vet-gray-900">
                    Gestión de Citas
                  </h1>
                  <p className="text-sm sm:text-base text-vet-gray-600">
                    Administra todas las citas médicas del sistema
                  </p>
                </div>
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
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-vet-primary/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-vet-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Total Citas
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
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Pendientes
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-600">
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
                      Confirmadas
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">
                      {stats.confirmadas}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Completadas
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                      {stats.completadas}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">Hoy</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-600">
                      {stats.hoy}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                    <Input
                      placeholder="Buscar por mascota, veterinario..."
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
                      <SelectItem value="pendiente_pago">
                        Pendiente Pago
                      </SelectItem>
                      <SelectItem value="en_validacion">
                        En Validación
                      </SelectItem>
                      <SelectItem value="aceptada">Confirmada</SelectItem>
                      <SelectItem value="atendida">Atendida</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                      <SelectItem value="rechazada">Rechazada</SelectItem>
                      <SelectItem value="no_asistio">No Asisti��</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full sm:w-48"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Citas Table */}
          <Card>
            <CardHeader>
              <CardTitle>Citas ({filteredCitas.length})</CardTitle>
              <CardDescription>
                Lista de todas las citas programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mascota & Veterinario</TableHead>
                      <TableHead>Fecha & Hora</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Ubicación & Precio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCitas.map((cita) => (
                      <TableRow key={cita.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <PawPrint className="w-4 h-4 text-vet-secondary" />
                              <p className="font-medium text-vet-gray-900">
                                {cita.mascota} ({cita.especie})
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Stethoscope className="w-4 h-4 text-vet-primary" />
                              <p className="text-sm text-vet-gray-600">
                                {cita.veterinario}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="w-3 h-3 text-vet-gray-400" />
                              <span className="font-medium">
                                {new Date(cita.fecha).toLocaleDateString(
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
                              <span>
                                {new Date(cita.fecha).toLocaleTimeString(
                                  "es-ES",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-vet-gray-700 max-w-xs">
                            <span className="font-medium text-vet-primary">
                              {cita.tipoConsulta}
                            </span>
                            <br />
                            {cita.motivo}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <MapPin className="w-3 h-3 text-vet-gray-400" />
                              <span className="font-medium">
                                {cita.ubicacion}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-vet-gray-600">
                              <Coins className="w-3 h-3" />
                              <span className="font-semibold text-green-600">
                                S/. {cita.precio.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(cita.estado)}</TableCell>
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
                              {/* View Details - Always available */}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDialog(cita, "view");
                                }}
                                className="flex items-center cursor-pointer hover:bg-vet-gray-50"
                              >
                                <Eye className="w-4 h-4 mr-2 text-vet-gray-600" />
                                Ver detalles
                              </DropdownMenuItem>

                              {/* Voucher related options for admin */}
                              {user?.rol === "admin" &&
                                cita.comprobantePago && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCita(cita);
                                        setVoucherModalMode("view");
                                        // Cargar datos del comprobante
                                        const receiptData = getComprobante(
                                          cita.id,
                                        );
                                        setCurrentReceiptData(receiptData);
                                        setShowVoucherModal(true);
                                      }}
                                      className="flex items-center cursor-pointer hover:bg-vet-gray-50"
                                    >
                                      <FileText className="w-4 h-4 mr-2 text-purple-600" />
                                      Ver Comprobante
                                    </DropdownMenuItem>
                                  </>
                                )}

                              {/* Attendance option for veterinarians */}
                              {user?.rol === "veterinario" &&
                                cita.estado === "aceptada" && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDialog(cita, "attend");
                                    }}
                                    className="flex items-center cursor-pointer hover:bg-vet-gray-50"
                                  >
                                    <UserCheck className="w-4 h-4 mr-2 text-green-600" />
                                    Registrar Atención
                                  </DropdownMenuItem>
                                )}
                              {user?.rol === "admin" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCita(cita);
                                    }}
                                    className="flex items-center cursor-pointer hover:bg-red-50 text-red-600 focus:bg-red-50 focus:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar cita
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredCitas.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-vet-gray-900 mb-2">
                      No hay citas
                    </h3>
                    <p className="text-vet-gray-600">
                      {searchTerm || selectedStatus !== "todos" || selectedDate
                        ? "No se encontraron citas con los filtros aplicados"
                        : "Aún no hay citas programadas"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cita Details/Management Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="w-full max-w-4xl h-[90vh] overflow-hidden">
              <div className="h-full overflow-y-auto scrollbar-hide pt-4">
                <DialogHeader className="pb-4 border-b border-vet-gray-200">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        dialogMode === "validate"
                          ? "bg-orange-100"
                          : dialogMode === "attend"
                            ? "bg-green-100"
                            : "bg-vet-primary/10"
                      }`}
                    >
                      {dialogMode === "validate" ? (
                        <Shield className="w-5 h-5 text-orange-600" />
                      ) : dialogMode === "attend" ? (
                        <UserCheck className="w-5 h-5 text-green-600" />
                      ) : (
                        <Calendar className="w-5 h-5 text-vet-primary" />
                      )}
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-semibold text-vet-gray-900">
                        {dialogMode === "validate"
                          ? "Validar Comprobante de Pago"
                          : dialogMode === "attend"
                            ? "Registrar Atención"
                            : "Detalles de la Cita"}
                      </DialogTitle>
                      <DialogDescription className="text-vet-gray-600">
                        {selectedCita && (
                          <>
                            Cita de {selectedCita.mascota} con{" "}
                            {selectedCita.veterinario}
                          </>
                        )}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                {selectedCita && (
                  <div className="space-y-6 pt-6">
                    {/* Información de la cita */}
                    <div className="bg-vet-gray-50 rounded-lg p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <PawPrint className="w-5 h-5 text-vet-primary" />
                        <h4 className="font-semibold text-vet-gray-900">
                          Información de la Cita
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-vet-gray-500 uppercase tracking-wide">
                            Mascota
                          </span>
                          <div className="flex items-center space-x-2">
                            <PawPrint className="w-4 h-4 text-vet-secondary" />
                            <p className="font-medium text-vet-gray-900">
                              {selectedCita.mascota}
                            </p>
                          </div>
                          <p className="text-sm text-vet-gray-600">
                            ({selectedCita.especie})
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-medium text-vet-gray-500 uppercase tracking-wide">
                            Veterinario
                          </span>
                          <div className="flex items-center space-x-2">
                            <Stethoscope className="w-4 h-4 text-vet-primary" />
                            <p className="font-medium text-vet-gray-900">
                              {selectedCita.veterinario}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-medium text-vet-gray-500 uppercase tracking-wide">
                            Fecha y Hora
                          </span>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <p className="font-medium text-vet-gray-900">
                              {new Date(selectedCita.fecha).toLocaleString(
                                "es-ES",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-medium text-vet-gray-500 uppercase tracking-wide">
                            Ubicación
                          </span>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-orange-600" />
                            <p className="font-medium text-vet-gray-900">
                              {selectedCita.ubicacion}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-medium text-vet-gray-500 uppercase tracking-wide">
                            Precio
                          </span>
                          <div className="flex items-center space-x-2">
                            <Coins className="w-4 h-4 text-green-600" />
                            <p className="font-medium text-green-600">
                              S/. {selectedCita.precio.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-medium text-vet-gray-500 uppercase tracking-wide">
                            Estado
                          </span>
                          <div>{getStatusBadge(selectedCita.estado)}</div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-vet-gray-200">
                        <span className="text-xs font-medium text-vet-gray-500 uppercase tracking-wide">
                          Tipo de Consulta
                        </span>
                        <p className="mt-1 font-medium text-vet-primary">
                          {selectedCita.tipoConsulta}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-vet-gray-200">
                        <span className="text-xs font-medium text-vet-gray-500 uppercase tracking-wide">
                          Motivo de la Cita
                        </span>
                        <p className="mt-1 font-medium text-vet-gray-900">
                          {selectedCita.motivo}
                        </p>
                      </div>

                      {selectedCita.notas && (
                        <div className="mt-4 pt-4 border-t border-vet-gray-200">
                          <span className="text-xs font-medium text-vet-gray-500 uppercase tracking-wide">
                            Notas del Cliente
                          </span>
                          <p className="mt-1 text-vet-gray-700 bg-white p-3 rounded border border-vet-gray-200">
                            {selectedCita.notas}
                          </p>
                        </div>
                      )}

                      {selectedCita.notasAdmin && (
                        <div className="mt-4 pt-4 border-t border-vet-gray-200">
                          <span className="text-xs font-medium text-vet-gray-500 uppercase tracking-wide">
                            Notas Administrativas
                          </span>
                          <p
                            className={`mt-1 p-3 rounded border ${
                              selectedCita.estado === "rechazada"
                                ? "text-red-700 bg-red-50 border-red-200"
                                : "text-vet-gray-700 bg-white border-vet-gray-200"
                            }`}
                          >
                            {selectedCita.notasAdmin}
                          </p>
                        </div>
                      )}

                      {selectedCita.comprobantePago && (
                        <div className="mt-4 pt-4 border-t border-vet-gray-200">
                          <span className="text-xs font-medium text-vet-gray-500 uppercase tracking-wide">
                            Comprobante de Pago
                          </span>
                          <div className="mt-2 flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded">
                            <FileText className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-900">
                              Comprobante subido por el cliente
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Validation Section */}
                    {dialogMode === "validate" && (
                      <div className="bg-orange-50 rounded-lg p-6 space-y-4">
                        <div className="flex items-center space-x-2 mb-4">
                          <Shield className="w-5 h-5 text-orange-600" />
                          <h4 className="font-semibold text-vet-gray-900">
                            Validación de Comprobante
                          </h4>
                        </div>

                        <Alert className="border-vet-gray-200 bg-vet-gray-50">
                          <AlertCircle className="w-4 h-4 text-vet-gray-600" />
                          <AlertDescription className="text-vet-gray-800">
                            El cliente ha subido su comprobante de pago. Revisa
                            la información y decide si aprobar o rechazar la
                            cita.
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-3">
                          <Label
                            htmlFor="validation-notes"
                            className="text-sm font-medium text-vet-gray-700"
                          >
                            Notas de validación (opcional)
                          </Label>
                          <Textarea
                            id="validation-notes"
                            value={validationNotes}
                            onChange={(e) => setValidationNotes(e.target.value)}
                            placeholder="Agregar comentarios sobre la validación del comprobante..."
                            rows={3}
                            className="border-vet-gray-300 focus:border-vet-primary focus:ring-vet-primary resize-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Attendance Registration Section */}
                    {dialogMode === "attend" && (
                      <div className="bg-green-50 rounded-lg p-6 space-y-4">
                        <div className="flex items-center space-x-2 mb-4">
                          <UserCheck className="w-5 h-5 text-green-600" />
                          <h4 className="font-semibold text-vet-gray-900">
                            Registrar Atención
                          </h4>
                        </div>

                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            Registra si el paciente asistió a la cita y fue
                            atendido.
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-3">
                          <Label
                            htmlFor="attendance-notes"
                            className="text-sm font-medium text-vet-gray-700"
                          >
                            Observaciones de la consulta (opcional)
                          </Label>
                          <Textarea
                            id="attendance-notes"
                            value={validationNotes}
                            onChange={(e) => setValidationNotes(e.target.value)}
                            placeholder="Observaciones sobre la consulta realizada..."
                            rows={3}
                            className="border-vet-gray-300 focus:border-vet-primary focus:ring-vet-primary resize-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6 border-t border-vet-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1 border-vet-gray-300 text-vet-gray-700 hover:bg-vet-gray-50"
                        disabled={isProcessing}
                      >
                        {dialogMode === "view" ? "Cerrar" : "Cancelar"}
                      </Button>

                      {dialogMode === "validate" && (
                        <>
                          <Button
                            onClick={() =>
                              handleValidatePayment(
                                selectedCita.id,
                                false,
                                validationNotes,
                              )
                            }
                            disabled={isProcessing}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                          >
                            {isProcessing ? (
                              <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                Procesando...
                              </div>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Rechazar
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() =>
                              handleValidatePayment(
                                selectedCita.id,
                                true,
                                validationNotes,
                              )
                            }
                            disabled={isProcessing}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isProcessing ? (
                              <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Procesando...
                              </div>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Aprobar
                              </>
                            )}
                          </Button>
                        </>
                      )}

                      {dialogMode === "attend" && (
                        <>
                          <Button
                            onClick={() =>
                              handleMarkAttendance(
                                selectedCita.id,
                                false,
                                validationNotes,
                              )
                            }
                            disabled={isProcessing}
                            variant="outline"
                            className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                          >
                            {isProcessing ? (
                              <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                Procesando...
                              </div>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                No Asistió
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() =>
                              handleMarkAttendance(
                                selectedCita.id,
                                true,
                                validationNotes,
                              )
                            }
                            disabled={isProcessing}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isProcessing ? (
                              <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Procesando...
                              </div>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Atendida
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setCitaToDelete(null);
        }}
        onConfirm={confirmDeleteCita}
        title="Eliminar cita"
        description={`¿Estás seguro de que quieres eliminar la cita de ${citaToDelete?.mascota}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Voucher Preview Modal */}
      <Dialog
        open={showVoucherModal}
        onOpenChange={(open) => {
          setShowVoucherModal(open);
          if (!open) {
            setCurrentReceiptData(null);
          }
        }}
      >
        <DialogContent className="w-full max-w-3xl max-h-[90vh]">
          <div className="max-h-[calc(90vh-8rem)] overflow-y-auto scrollbar-hide">
            <DialogHeader className="pb-4 border-b border-vet-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-vet-gray-900">
                    {voucherModalMode === "validate"
                      ? "Validar Comprobante de Pago"
                      : "Ver Comprobante de Pago"}
                  </DialogTitle>
                  <DialogDescription className="text-vet-gray-600">
                    {voucherModalMode === "validate"
                      ? "Revisa y valida el comprobante subido por el cliente"
                      : `Comprobante subido por el cliente para la cita de ${selectedCita?.mascota}`}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 pt-6">
              {/* Cita Info Summary */}
              <div className="bg-vet-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-vet-gray-500">Mascota:</span>
                    <p className="font-medium">{selectedCita?.mascota}</p>
                  </div>
                  <div>
                    <span className="text-vet-gray-500">Fecha:</span>
                    <p className="font-medium">
                      {selectedCita &&
                        new Date(selectedCita.fecha).toLocaleDateString(
                          "es-ES",
                        )}
                    </p>
                  </div>
                  <div>
                    <span className="text-vet-gray-500">Monto:</span>
                    <p className="font-medium text-green-600">
                      S/. {selectedCita?.precio.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Voucher Preview */}
              <div className="border rounded-lg overflow-hidden bg-white">
                {selectedCita?.comprobantePago ? (
                  <div className="space-y-4">
                    {/* File Info */}
                    <div className="bg-green-50 p-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-green-600" />
                        <div>
                          <h4 className="font-medium text-green-900">
                            Comprobante de Pago
                          </h4>
                          <p className="text-sm text-green-700">
                            Archivo subido por el cliente
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Voucher Preview */}
                    <div className="p-6">
                      <div className="border rounded-lg overflow-hidden bg-white">
                        <h4 className="font-medium text-vet-gray-900 mb-4 px-4 pt-4">
                          Vista previa del comprobante
                        </h4>
                        {currentReceiptData ? (
                          <div className="px-4 pb-4">
                            {/* Información del archivo */}
                            <div className="bg-vet-gray-100 rounded p-4 mb-4 text-left">
                              <p className="text-xs text-vet-gray-600 mb-2">
                                Información del archivo:
                              </p>
                              <p className="text-sm font-mono text-vet-gray-800">
                                {currentReceiptData.originalName}
                              </p>
                              <p className="text-xs text-vet-gray-500 mt-1">
                                Tamaño:{" "}
                                {(currentReceiptData.size / 1024).toFixed(1)} KB
                              </p>
                              <p className="text-xs text-vet-gray-500">
                                Subido:{" "}
                                {new Date(
                                  currentReceiptData.timestamp,
                                ).toLocaleString("es-ES")}
                              </p>
                              <Badge variant="outline" className="text-xs mt-2">
                                {currentReceiptData.type.includes("pdf")
                                  ? "PDF"
                                  : "Imagen"}
                              </Badge>
                            </div>

                            {/* Visualización del archivo */}
                            <div className="border rounded-lg overflow-hidden bg-white">
                              {currentReceiptData.type.startsWith("image/") ? (
                                <div className="relative">
                                  <img
                                    src={currentReceiptData.data}
                                    alt="Comprobante de pago"
                                    className="w-full h-auto max-h-[400px] object-contain"
                                  />
                                </div>
                              ) : currentReceiptData.type ===
                                "application/pdf" ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                  <FileText className="w-16 h-16 text-vet-gray-400 mb-4" />
                                  <h4 className="font-medium text-vet-gray-900 mb-2">
                                    Documento PDF
                                  </h4>
                                  <p className="text-sm text-vet-gray-600 mb-4">
                                    {currentReceiptData.originalName}
                                  </p>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      const link = document.createElement("a");
                                      link.href = currentReceiptData.data;
                                      link.download =
                                        currentReceiptData.originalName;
                                      link.click();
                                    }}
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Descargar PDF
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                  <FileText className="w-16 h-16 text-vet-gray-400 mb-4" />
                                  <h4 className="font-medium text-vet-gray-900 mb-2">
                                    Archivo no compatible
                                  </h4>
                                  <p className="text-sm text-vet-gray-600">
                                    Tipo de archivo: {currentReceiptData.type}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : selectedCita?.comprobantePago?.includes(
                            "uploaded_",
                          ) ? (
                          <div className="px-4 pb-4">
                            <div className="border-2 border-dashed border-vet-gray-300 rounded-lg p-8 text-center">
                              <FileText className="w-16 h-16 text-vet-primary mx-auto mb-4" />
                              <p className="text-sm text-vet-gray-600 mb-4">
                                Comprobante subido por el cliente (formato
                                anterior)
                              </p>
                              <div className="bg-vet-gray-100 rounded p-4 text-left max-w-md mx-auto">
                                <p className="text-xs text-vet-gray-600 mb-2">
                                  Información del archivo:
                                </p>
                                <p className="text-sm font-mono text-vet-gray-800">
                                  {selectedCita?.comprobantePago?.split(
                                    "_",
                                  )[1] || "comprobante.jpg"}
                                </p>
                                <p className="text-xs text-vet-gray-500 mt-2">
                                  Fecha:{" "}
                                  {new Date(
                                    parseInt(
                                      selectedCita?.comprobantePago?.split(
                                        "_",
                                      )[2] || "0",
                                    ),
                                  ).toLocaleString("es-ES")}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="px-4 pb-4">
                            <div className="border-2 border-dashed border-vet-gray-300 rounded-lg p-8 text-center">
                              <FileText className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                              <p className="text-sm text-vet-gray-600">
                                No hay comprobante disponible
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Validation Instructions */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800 mb-1">
                            Instrucciones de Validación
                          </h4>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            <li>
                              • Verificar que el monto coincida con el precio de
                              la cita
                            </li>
                            <li>
                              • Confirmar que la fecha del pago sea reciente
                            </li>
                            <li>
                              • Validar que la información sea legible y
                              completa
                            </li>
                            <li>
                              • Verificar que corresponda a los datos de la cita
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <FileText className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                    <h4 className="font-medium text-vet-gray-900 mb-2">
                      No hay comprobante disponible
                    </h4>
                    <p className="text-sm text-vet-gray-600">
                      El cliente aún no ha subido un comprobante de pago para
                      esta cita.
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 pt-4 border-t border-vet-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowVoucherModal(false)}
                  className="flex-1"
                >
                  Cerrar
                </Button>
                {voucherModalMode === "validate" &&
                  selectedCita?.comprobantePago && (
                    <>
                      <Button
                        onClick={() => {
                          setShowVoucherModal(false);
                          handleValidatePayment(
                            selectedCita.id,
                            false,
                            "Comprobante no válido - revisar información",
                          );
                        }}
                        variant="outline"
                        className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rechazar
                      </Button>
                      <Button
                        onClick={() => {
                          setShowVoucherModal(false);
                          handleValidatePayment(
                            selectedCita.id,
                            true,
                            "Comprobante validado correctamente",
                          );
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprobar
                      </Button>
                    </>
                  )}
                {voucherModalMode === "view" &&
                  selectedCita?.estado !== "aceptada" &&
                  selectedCita?.estado !== "rechazada" && (
                    <Button
                      onClick={() => {
                        setVoucherModalMode("validate");
                        // Cargar datos del comprobante si no están cargados
                        if (!currentReceiptData && selectedCita) {
                          const receiptData = getComprobante(selectedCita.id);
                          setCurrentReceiptData(receiptData);
                        }
                      }}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Ir a Validar
                    </Button>
                  )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
