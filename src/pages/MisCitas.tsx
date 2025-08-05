import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  Calendar,
  Clock,
  PawPrint,
  FileText,
  Upload,
  Phone,
  Plus,
  MapPin,
  CheckCircle,
  Stethoscope,
  User,
  Eye,
  RefreshCw,
  X,
  AlertCircle,
  Trash2,
  Download,
} from "lucide-react";

const estadoColors = {
  pendiente_pago: "bg-yellow-100 text-yellow-800",
  en_validacion: "bg-gray-100 text-gray-800",
  aceptada: "bg-green-100 text-green-800",
  atendida: "bg-gray-100 text-gray-800",
  cancelada: "bg-red-100 text-red-800",
  expirada: "bg-red-100 text-red-800",
  rechazada: "bg-red-100 text-red-800",
  no_asistio: "bg-orange-100 text-orange-800",
};

const estadoLabels = {
  pendiente_pago: "Pendiente de Pago",
  en_validacion: "En Validación",
  aceptada: "Confirmada",
  atendida: "Completada",
  cancelada: "Cancelada",
  expirada: "Expirada",
  rechazada: "Comprobante Rechazado",
  no_asistio: "No Asistió",
};

export default function MisCitas() {
  const navigate = useNavigate();
  const {
    user,
    citas,
    usuarios,
    mascotas,
    updateCita,
    deleteCita,
    saveComprobante,
    getComprobante,
  } = useAppContext();
  const [selectedTab, setSelectedTab] = useState("todas");
  const [uploadingCitaId, setUploadingCitaId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentCitaId, setCurrentCitaId] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [citaToDelete, setCitaToDelete] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUploadProof = (citaId: string) => {
    setUploadingCitaId(citaId);
    setCurrentCitaId(citaId);
    // Create file input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setPreviewFile(file);
        // Create preview URL for images
        if (file.type.startsWith("image/")) {
          const url = URL.createObjectURL(file);
          setPreviewURL(url);
        } else {
          setPreviewURL(null); // For PDFs we'll show file info only
        }
        setShowPreviewModal(true);
        setUploadingCitaId(null);
      }
    };
    input.click();
  };

  const handleConfirmUpload = async () => {
    if (previewFile && currentCitaId) {
      setUploadingCitaId(currentCitaId); // Show loading state

      try {
        const success = await saveComprobante(currentCitaId, previewFile);

        if (success) {
          console.log("✅ Comprobante subido exitosamente");
        } else {
          console.error("❌ Error al subir comprobante");
          // Fallback to old method
          updateCita(currentCitaId, {
            estado: "en_validacion",
            comprobantePago: `uploaded_${previewFile.name}_${Date.now()}`,
            notasAdmin: "",
          });
        }
      } catch (error) {
        console.error("❌ Error durante la subida:", error);
      } finally {
        setUploadingCitaId(null);
        handleClosePreview();
      }
    }
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setPreviewFile(null);
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
      setPreviewURL(null);
    }
    setCurrentCitaId(null);
  };

  const handleViewReceipt = (citaId: string) => {
    const receiptData = getComprobante(citaId);
    if (receiptData) {
      setCurrentReceipt(receiptData);
      setShowReceiptModal(true);
    } else {
      console.warn("No se encontró comprobante para la cita:", citaId);
    }
  };

  const handleCloseReceiptModal = () => {
    setShowReceiptModal(false);
    setCurrentReceipt(null);
  };

  const handleChangeFile = () => {
    handleClosePreview();
    if (currentCitaId) {
      // Trigger file selection again
      setTimeout(() => handleUploadProof(currentCitaId), 100);
    }
  };

  const handleDeleteCita = (citaId: string) => {
    setCitaToDelete(citaId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCita = () => {
    if (citaToDelete) {
      deleteCita(citaToDelete);
      setCitaToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  // Filtrar citas según el rol del usuario
  const userCitas =
    user?.rol === "veterinario"
      ? citas.filter((cita) => cita.veterinario === user.nombre)
      : citas.filter((cita) => {
          const mascota = mascotas.find((m) => m.nombre === cita.mascota);
          // If mascota is found, check if it belongs to current user
          if (mascota) {
            return mascota.clienteId === user?.id;
          }
          // For orphaned appointments (mascota not found), we need to handle them
          // This could happen due to data persistence issues
          return false; // For now, don't show orphaned appointments
        });

  const filterCitas = (filter) => {
    const now = new Date();
    switch (filter) {
      case "proximas":
        return userCitas.filter(
          (cita) =>
            new Date(cita.fecha) > now &&
            (cita.estado === "aceptada" || cita.estado === "en_validacion"),
        );
      case "pendientes":
        return userCitas.filter((cita) => cita.estado === "pendiente_pago");
      case "completadas":
        return userCitas.filter((cita) => cita.estado === "atendida");
      case "todas":
      default:
        return userCitas.sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
        );
    }
  };

  const filteredCitas = filterCitas(selectedTab);

  if (!user) {
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
                Debes iniciar sesión para ver tus citas
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-vet-primary/10 rounded-xl flex items-center justify-center">
                  {user?.rol === "veterinario" ? (
                    <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-vet-primary" />
                  ) : (
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-vet-primary" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-vet-gray-900">
                    {user?.rol === "veterinario"
                      ? "Mis Pacientes"
                      : "Mis Citas"}
                  </h1>
                  <p className="text-sm sm:text-base text-vet-gray-600">
                    {user?.rol === "veterinario"
                      ? "Gestiona las citas de tus pacientes"
                      : "Gestiona las citas médicas de tus mascotas"}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => navigate("/nueva-cita")}
                className="w-full sm:w-auto bg-vet-primary hover:bg-vet-primary-dark"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cita
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-vet-gray-600">
                        Próximas
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-vet-primary">
                        {filterCitas("proximas").length}
                      </p>
                    </div>
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-vet-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-vet-gray-600">
                        Pendientes
                      </p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {filterCitas("pendientes").length}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-vet-gray-600">
                        Completadas
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {filterCitas("completadas").length}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-vet-gray-600">
                        Total
                      </p>
                      <p className="text-2xl font-bold text-vet-gray-900">
                        {citas.length}
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-vet-gray-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="space-y-8"
          >
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
              <TabsTrigger value="proximas">Próximas</TabsTrigger>
              <TabsTrigger value="completadas">Completadas</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="space-y-4">
              {filteredCitas.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                      No hay citas
                    </h3>
                    <p className="text-vet-gray-600 mb-6">
                      {selectedTab === "todas"
                        ? "No has programado ninguna cita"
                        : selectedTab === "pendientes"
                          ? "No tienes citas pendientes de pago"
                          : selectedTab === "proximas"
                            ? "No tienes citas próximas confirmadas"
                            : "No tienes citas completadas aún"}
                    </p>
                    <Button
                      onClick={() => navigate("/nueva-cita")}
                      className="bg-vet-primary hover:bg-vet-primary-dark"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Programar Primera Cita
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredCitas.map((cita) => (
                  <Card
                    key={cita.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-4">
                          {(() => {
                            const mascota = mascotas.find(
                              (m) => m.nombre === cita.mascota,
                            );
                            return mascota?.foto ? (
                              <img
                                src={mascota.foto}
                                alt={cita.mascota}
                                className="w-12 h-12 rounded-full object-cover border-2 border-vet-primary/20"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-vet-primary/10 rounded-full flex items-center justify-center">
                                <PawPrint className="w-6 h-6 text-vet-primary" />
                              </div>
                            );
                          })()}
                          <div>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
                              <h4 className="font-semibold text-base sm:text-lg text-vet-gray-900">
                                {cita.mascota}
                              </h4>
                              <div className="flex space-x-2">
                                <Badge className="text-xs sm:text-sm">{cita.especie}</Badge>
                                <Badge className={estadoColors[cita.estado]}>
                                  {estadoLabels[cita.estado]}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm sm:text-base text-vet-gray-600 mb-3">
                              <span className="font-medium text-vet-primary">
                                {cita.tipoConsulta}
                              </span>
                              <span className="block sm:inline"> • {cita.motivo}</span>
                              <span className="block sm:inline"> • {cita.veterinario}</span>
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm sm:text-base text-vet-gray-500">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-5 h-5 sm:w-4 sm:h-4 text-vet-primary" />
                                <span className="font-medium">
                                  {cita.fecha.toLocaleDateString("es-ES", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 sm:w-4 sm:h-4 text-vet-primary" />
                                <span className="font-medium">
                                  {cita.fecha.toLocaleTimeString("es-ES", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-5 h-5 sm:w-4 sm:h-4 text-vet-primary" />
                                <span className="font-medium">{cita.ubicacion}</span>
                              </div>
                            </div>
                            {cita.notas && (
                              <p className="text-sm text-vet-gray-600 mt-2 bg-vet-gray-50 rounded p-2">
                                <strong>Notas:</strong> {cita.notas}
                              </p>
                            )}
                            {cita.notasAdmin && cita.estado === "rechazada" && (
                              <div className="mt-2 bg-red-50 rounded p-3 border border-red-200">
                                <p className="text-sm text-red-700 mb-2">
                                  <strong>Comprobante rechazado:</strong>{" "}
                                  {cita.notasAdmin}
                                </p>
                                <p className="text-xs text-red-600">
                                  Debes subir un nuevo comprobante de pago
                                  válido para continuar con tu cita.
                                </p>
                              </div>
                            )}
                            {cita.notasAdmin && cita.estado === "aceptada" && (
                              <p className="text-sm text-green-700 mt-2 bg-green-50 rounded p-2 border border-green-200">
                                <strong>Comentarios:</strong> {cita.notasAdmin}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-vet-gray-900 mb-2 sm:mb-3">
                            S/. {cita.precio.toLocaleString()}
                          </div>
                          <div className="flex flex-col sm:flex-col gap-2">
                            {user?.rol === "veterinario" ? (
                              <>
                                {cita.estado === "aceptada" && (
                                  <Button
                                    className="bg-vet-primary hover:bg-vet-primary-dark w-full sm:w-auto"
                                    onClick={() => {
                                      // Marcar como atendida y navegar al historial
                                      // Esta lógica se implementaría con el contexto
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Registrar Consulta
                                  </Button>
                                )}
                                {cita.estado === "atendida" && (
                                  <Button
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Ver Historial
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  className="w-full sm:w-auto"
                                >
                                  <User className="w-4 h-4 mr-2" />
                                  Info Paciente
                                </Button>
                              </>
                            ) : (
                              <>
                                {cita.estado === "pendiente_pago" && (
                                  <Button
                                    onClick={() => handleUploadProof(cita.id)}
                                    disabled={uploadingCitaId === cita.id}
                                    className="bg-vet-primary hover:bg-vet-primary-dark w-full sm:w-auto"
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {uploadingCitaId === cita.id
                                      ? "Subiendo..."
                                      : "Subir Comprobante"}
                                  </Button>
                                )}
                                {(cita.estado === "en_validacion" ||
                                  cita.estado === "aceptada") &&
                                  cita.comprobantePago && (
                                    <Button
                                      variant="outline"
                                      onClick={() => handleViewReceipt(cita.id)}
                                      className="border-vet-primary text-vet-primary hover:bg-vet-primary/10 w-full sm:w-auto"
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      Ver Comprobante
                                    </Button>
                                  )}
                                {cita.estado === "rechazada" && (
                                  <Button
                                    onClick={() => handleDeleteCita(cita.id)}
                                    variant="outline"
                                    className="border-red-300 text-red-700 hover:bg-red-50 w-full sm:w-auto"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar Cita
                                  </Button>
                                )}
                                {cita.estado === "atendida" && (
                                  <Button
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Ver Reporte
                                  </Button>
                                )}
                                {cita.estado === "aceptada" && (
                                  <Button
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                  >
                                    <Phone className="w-4 h-4 mr-2" />
                                    Contactar
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modal de previsualización de comprobante */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-vet-primary" />
              <span>Previsualizar Comprobante</span>
            </DialogTitle>
            <DialogDescription>
              Verifica que el comprobante sea correcto antes de enviarlo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {previewFile && (
              <div className="border rounded-lg p-4 bg-vet-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-vet-gray-900">
                      Archivo seleccionado
                    </h4>
                    <p className="text-sm text-vet-gray-600">
                      {previewFile.name}
                    </p>
                    <p className="text-xs text-vet-gray-500">
                      Tamaño: {(previewFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {previewFile.type.includes("pdf") ? "PDF" : "Imagen"}
                  </Badge>
                </div>

                {/* Previsualización del contenido */}
                <div className="border rounded-lg overflow-hidden bg-white">
                  {previewFile.type.startsWith("image/") ? (
                    <div className="relative">
                      <img
                        src={previewURL || ""}
                        alt="Previsualización del comprobante"
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    </div>
                  ) : previewFile.type === "application/pdf" ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <FileText className="w-16 h-16 text-vet-primary mb-4" />
                      <h4 className="font-medium text-vet-gray-900 mb-2">
                        Archivo PDF seleccionado
                      </h4>
                      <p className="text-sm text-vet-gray-600 mb-4">
                        {previewFile.name}
                      </p>
                      <p className="text-xs text-vet-gray-500">
                        El archivo PDF se procesará cuando confirmes el envío
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <FileText className="w-16 h-16 text-vet-gray-400 mb-4" />
                      <h4 className="font-medium text-vet-gray-900 mb-2">
                        Archivo no previsualizable
                      </h4>
                      <p className="text-sm text-vet-gray-600">
                        Tipo de archivo: {previewFile.type}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">
                    Información importante
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Asegúrate de que el comprobante sea legible</li>
                    <li>
                      • Verifica que contenga la información completa del pago
                    </li>
                    <li>
                      • El archivo debe mostrar claramente el monto y fecha
                    </li>
                    <li>• Una vez enviado, será revisado por nuestro equipo</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleChangeFile}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Cambiar Archivo</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleClosePreview}
              className="flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancelar</span>
            </Button>
            <Button
              onClick={handleConfirmUpload}
              className="bg-vet-primary hover:bg-vet-primary-dark flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Confirmar y Enviar</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para mostrar comprobante guardado */}
      <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center space-x-2 text-vet-primary">
              <Eye className="w-5 h-5" />
              <span>Comprobante de Pago</span>
            </DialogTitle>
            <DialogDescription>
              Comprobante de pago subido para esta cita
            </DialogDescription>
          </DialogHeader>

          {currentReceipt && (
            <div className="space-y-4">
              {/* Información del archivo */}
              <div className="border rounded-lg p-4 bg-vet-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-vet-gray-900">
                      Información del archivo
                    </h4>
                    <p className="text-sm text-vet-gray-600">
                      {currentReceipt.originalName}
                    </p>
                    <p className="text-xs text-vet-gray-500">
                      Tamaño: {(currentReceipt.size / 1024).toFixed(1)} KB
                    </p>
                    <p className="text-xs text-vet-gray-500">
                      Subido:{" "}
                      {new Date(currentReceipt.timestamp).toLocaleString(
                        "es-ES",
                      )}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {currentReceipt.type.includes("pdf") ? "PDF" : "Imagen"}
                  </Badge>
                </div>
              </div>

              {/* Visualización del archivo */}
              <div className="border rounded-lg overflow-hidden bg-white">
                {currentReceipt.type.startsWith("image/") ? (
                  <div className="relative">
                    <img
                      src={currentReceipt.data}
                      alt="Comprobante de pago"
                      className="w-full h-auto max-h-[400px] object-contain"
                    />
                  </div>
                ) : currentReceipt.type === "application/pdf" ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <FileText className="w-16 h-16 text-vet-gray-400 mb-4" />
                    <h4 className="font-medium text-vet-gray-900 mb-2">
                      Documento PDF
                    </h4>
                    <p className="text-sm text-vet-gray-600 mb-4">
                      {currentReceipt.originalName}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = currentReceipt.data;
                        link.download = currentReceipt.originalName;
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
                      Tipo de archivo: {currentReceipt.type}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseReceiptModal}
              className="flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cerrar</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setCitaToDelete(null);
        }}
        onConfirm={confirmDeleteCita}
        title="Eliminar cita rechazada"
        description="¿Estás seguro de que quieres eliminar esta cita? Una vez eliminada no podrás recuperarla."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </Layout>
  );
}
