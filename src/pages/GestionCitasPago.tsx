import { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  PawPrint,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  CreditCard,
  AlertCircle,
  FileText,
  User,
} from "lucide-react";

const estadoColors = {
  en_validacion: "bg-yellow-100 text-yellow-800",
  aceptada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
  pendiente_pago: "bg-orange-100 text-orange-800",
};

const estadoLabels = {
  en_validacion: "En Validación",
  aceptada: "Confirmada",
  rechazada: "Rechazada",
  pendiente_pago: "Pendiente Pago",
};

export default function GestionCitasPago() {
  const { user, citas, usuarios, mascotas, updateCita } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCita, setSelectedCita] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter citas that need validation (en_validacion) or recently processed
  const citasValidacion = citas.filter(
    (cita) =>
      cita.estado === "en_validacion" ||
      (cita.comprobantePago && ["aceptada", "rechazada"].includes(cita.estado)),
  );

  // Apply search filter
  const filteredCitas = citasValidacion.filter((cita) => {
    const mascota = mascotas.find((m) => m.nombre === cita.mascota);
    const cliente = usuarios.find((u) => u.id === mascota?.clienteId);

    const matchesSearch =
      cita.mascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.veterinario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente?.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleViewProof = (cita: any) => {
    setSelectedCita(cita);
    setAdminNotes("");
    setIsDialogOpen(true);
  };

  const handleApproveCita = async () => {
    if (!selectedCita) return;

    setIsProcessing(true);
    setError("");

    try {
      updateCita(selectedCita.id, {
        estado: "aceptada",
        notasAdmin: adminNotes,
      });

      setSuccess(`Cita de ${selectedCita.mascota} aprobada exitosamente`);
      setIsDialogOpen(false);
      setSelectedCita(null);
    } catch (error) {
      setError("Error al aprobar la cita");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectCita = async () => {
    if (!selectedCita) return;

    setIsProcessing(true);
    setError("");

    try {
      updateCita(selectedCita.id, {
        estado: "rechazada",
        notasAdmin: adminNotes || "Comprobante de pago rechazado",
      });

      setSuccess(`Cita de ${selectedCita.mascota} rechazada`);
      setIsDialogOpen(false);
      setSelectedCita(null);
    } catch (error) {
      setError("Error al rechazar la cita");
    } finally {
      setIsProcessing(false);
    }
  };

  const getClienteInfo = (cita: any) => {
    const mascota = mascotas.find((m) => m.nombre === cita.mascota);
    const cliente = usuarios.find((u) => u.id === mascota?.clienteId);
    return cliente;
  };

  const stats = {
    pendientesValidacion: citasValidacion.filter(
      (c) => c.estado === "en_validacion",
    ).length,
    aprobadas: citasValidacion.filter((c) => c.estado === "aceptada").length,
    rechazadas: citasValidacion.filter((c) => c.estado === "rechazada").length,
  };

  if (!user || user.rol !== "admin") {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                Acceso restringido
              </h3>
              <p className="text-vet-gray-600">
                Solo los administradores pueden acceder a esta página
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div className="min-h-screen bg-vet-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-vet-primary rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-vet-gray-900">
                  Validación de Pagos
                </h1>
                <p className="text-vet-gray-600">
                  Revisa y valida los comprobantes de pago de las citas
                </p>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                    <p className="text-2xl sm:text-3xl font-bold text-vet-gray-900">
                      {stats.pendientesValidacion}
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
                      Aprobadas
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-vet-gray-900">
                      {stats.aprobadas}
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
                    <p className="text-2xl sm:text-3xl font-bold text-vet-gray-900">
                      {stats.rechazadas}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                <Input
                  placeholder="Buscar por mascota, cliente, veterinario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Citas Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Citas con Comprobantes ({filteredCitas.length})
              </CardTitle>
              <CardDescription>
                Gestiona la validación de comprobantes de pago
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente & Mascota</TableHead>
                      <TableHead>Cita</TableHead>
                      <TableHead>Veterinario</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCitas.map((cita) => {
                      const cliente = getClienteInfo(cita);
                      return (
                        <TableRow key={cita.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-vet-primary/10 rounded-full flex items-center justify-center">
                                <PawPrint className="w-5 h-5 text-vet-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-vet-gray-900">
                                  {cliente?.nombre || "Cliente desconocido"}
                                </p>
                                <p className="text-sm text-vet-gray-600">
                                  {cita.mascota} • {cita.especie}
                                </p>
                                <p className="text-xs text-vet-gray-500">
                                  {cliente?.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-vet-gray-900">
                                {cita.motivo}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-vet-gray-600 mt-1">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    {cita.fecha.toLocaleDateString("es-ES")}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {cita.fecha.toLocaleTimeString("es-ES", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-vet-gray-500 mt-1">
                                {cita.ubicacion}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-vet-gray-400" />
                              <span className="text-sm text-vet-gray-900">
                                {cita.veterinario}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={estadoColors[cita.estado]}>
                              {estadoLabels[cita.estado]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <CreditCard className="w-4 h-4 text-vet-gray-400" />
                              <span className="font-medium text-vet-gray-900">
                                S/. {cita.precio.toLocaleString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu modal={false}>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-vet-gray-900">
                                  Acciones
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleViewProof(cita)}
                                  className="flex items-center cursor-pointer hover:bg-vet-gray-50"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Comprobante
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {filteredCitas.length === 0 && (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-vet-gray-900 mb-2">
                      No hay citas para validar
                    </h3>
                    <p className="text-vet-gray-600">
                      {searchTerm
                        ? "No se encontraron citas con el término de búsqueda aplicado"
                        : "No hay citas con comprobantes pendientes de validación"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Validation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Validar Comprobante de Pago</DialogTitle>
            <DialogDescription>
              Revisa el comprobante y decide si aprobar o rechazar la cita
            </DialogDescription>
          </DialogHeader>

          {selectedCita && (
            <div className="space-y-4">
              <div className="bg-vet-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-vet-gray-900 mb-2">
                  Información de la Cita
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-vet-gray-600">Cliente:</span>{" "}
                    {getClienteInfo(selectedCita)?.nombre}
                  </div>
                  <div>
                    <span className="text-vet-gray-600">Mascota:</span>{" "}
                    {selectedCita.mascota}
                  </div>
                  <div>
                    <span className="text-vet-gray-600">Fecha:</span>{" "}
                    {selectedCita.fecha.toLocaleDateString("es-ES")}
                  </div>
                  <div>
                    <span className="text-vet-gray-600">Precio:</span> S/.{" "}
                    {selectedCita.precio.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Comprobante de Pago
                  </span>
                </div>
                <p className="text-sm text-blue-800">
                  Archivo:{" "}
                  {selectedCita.comprobantePago?.split("_")[1] ||
                    "comprobante.jpg"}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  En una app real, aquí se mostraría la imagen del comprobante
                </p>
              </div>

              <div>
                <Label htmlFor="adminNotes">Notas del administrador</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Comentarios sobre la validación..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleRejectCita}
                  disabled={isProcessing}
                  variant="outline"
                  className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {isProcessing ? "Procesando..." : "Rechazar"}
                </Button>
                <Button
                  onClick={handleApproveCita}
                  disabled={isProcessing}
                  className="flex-1 bg-vet-primary hover:bg-vet-primary-dark"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isProcessing ? "Procesando..." : "Aprobar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
