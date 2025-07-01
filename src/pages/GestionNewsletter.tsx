import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  Users,
  Send,
  Calendar,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Image,
  Paperclip,
  Palette,
  MoreVertical,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function GestionNewsletter() {
  const {
    user,
    suscriptoresNewsletter,
    newsletterEmails,
    addNewsletterEmail,
    updateNewsletterEmail,
    deleteNewsletterEmail,
    deleteSuscriptorNewsletter,
    updateSuscriptorNewsletter,
  } = useAppContext();

  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({
    asunto: "",
    contenido: "",
    fechaEnvio: new Date().toISOString().split("T")[0],
    imagenes: [] as File[],
    archivos: [] as File[],
    colorTema: "#0ea5e9",
    plantilla: "moderna",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [suscriptorToDelete, setSuscriptorToDelete] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedNewsletterToView, setSelectedNewsletterToView] =
    useState<any>(null);
  const [editingNewsletter, setEditingNewsletter] = useState<string | null>(
    null,
  );
  const [showDeleteNewsletterConfirm, setShowDeleteNewsletterConfirm] =
    useState(false);
  const [newsletterToDelete, setNewsletterToDelete] = useState<any>(null);

  // Filter active subscribers
  const suscriptoresActivos = suscriptoresNewsletter.filter((s) => s.activo);

  // Redirect if not admin
  if (!user || user.rol !== "admin") {
    return (
      <div className="min-h-screen bg-vet-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-vet-gray-900 mb-2">
                Acceso Restringido
              </h2>
              <p className="text-vet-gray-600">
                Solo los administradores pueden acceder a esta página
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendEmail = async () => {
    if (!emailForm.asunto.trim() || !emailForm.contenido.trim()) {
      return;
    }

    const destinatarios = suscriptoresActivos.map((s) => s.email);

    try {
      // Convert images to base64
      const imagenesBase64 = await Promise.all(
        emailForm.imagenes.map(async (file) => ({
          name: file.name,
          data: await fileToBase64(file),
          size: file.size,
          type: file.type,
        })),
      );

      // Convert files to base64
      const archivosBase64 = await Promise.all(
        emailForm.archivos.map(async (file) => ({
          name: file.name,
          data: await fileToBase64(file),
          size: file.size,
          type: file.type,
        })),
      );

      const newsletterData = {
        asunto: emailForm.asunto,
        contenido: emailForm.contenido,
        fechaEnvio: new Date(emailForm.fechaEnvio),
        destinatarios,
        estado: "enviado" as const,
        colorTema: emailForm.colorTema,
        plantilla: emailForm.plantilla,
        imagenes: imagenesBase64,
        archivos: archivosBase64,
      };

      if (editingNewsletter) {
        // Update existing newsletter
        updateNewsletterEmail(editingNewsletter, newsletterData);
      } else {
        // Create new newsletter
        addNewsletterEmail(newsletterData);
      }

      resetNewsletterForm();
      setIsEmailDialogOpen(false);
    } catch (error) {
      console.error("Error al procesar archivos:", error);
      // Could add user notification here
    }
  };

  const handleToggleSubscriber = (id: string, activo: boolean) => {
    updateSuscriptorNewsletter(id, { activo: !activo });
  };

  const handleDeleteSubscriber = (id: string) => {
    const suscriptor = suscriptoresNewsletter.find((s) => s.id === id);
    setSuscriptorToDelete(suscriptor);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSubscriber = () => {
    if (suscriptorToDelete) {
      deleteSuscriptorNewsletter(suscriptorToDelete.id);
      setShowDeleteConfirm(false);
      setSuscriptorToDelete(null);
    }
  };

  const cancelDeleteSubscriber = () => {
    setShowDeleteConfirm(false);
    setSuscriptorToDelete(null);
  };

  const handleViewNewsletter = (newsletter: any) => {
    setSelectedNewsletterToView(newsletter);
    setIsViewDialogOpen(true);
  };

  const handleEditNewsletter = (newsletter: any) => {
    setEditingNewsletter(newsletter.id);

    // Convert saved base64 files back to File objects
    const imagenesFiles: File[] = [];
    const archivosFiles: File[] = [];

    if (newsletter.imagenes) {
      newsletter.imagenes.forEach((img: any) => {
        try {
          const file = base64ToFile(img.data, img.name);
          imagenesFiles.push(file);
        } catch (error) {
          console.error("Error converting image:", error);
        }
      });
    }

    if (newsletter.archivos) {
      newsletter.archivos.forEach((arch: any) => {
        try {
          const file = base64ToFile(arch.data, arch.name);
          archivosFiles.push(file);
        } catch (error) {
          console.error("Error converting file:", error);
        }
      });
    }

    setEmailForm({
      asunto: newsletter.asunto,
      contenido: newsletter.contenido,
      fechaEnvio: new Date(newsletter.fechaEnvio).toISOString().split("T")[0],
      imagenes: imagenesFiles,
      archivos: archivosFiles,
      colorTema: newsletter.colorTema || "#0ea5e9",
      plantilla: newsletter.plantilla || "moderna",
    });
    setIsEmailDialogOpen(true);
  };

  const handleDeleteNewsletter = (newsletter: any) => {
    setNewsletterToDelete(newsletter);
    setShowDeleteNewsletterConfirm(true);
  };

  const confirmDeleteNewsletter = () => {
    if (newsletterToDelete) {
      deleteNewsletterEmail(newsletterToDelete.id);
      setShowDeleteNewsletterConfirm(false);
      setNewsletterToDelete(null);
    }
  };

  const cancelDeleteNewsletter = () => {
    setShowDeleteNewsletterConfirm(false);
    setNewsletterToDelete(null);
  };

  const resetNewsletterForm = () => {
    setEmailForm({
      asunto: "",
      contenido: "",
      fechaEnvio: new Date().toISOString().split("T")[0],
      imagenes: [],
      archivos: [],
      colorTema: "#0ea5e9",
      plantilla: "moderna",
    });
    setEditingNewsletter(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEmailForm((prev) => ({
      ...prev,
      imagenes: [...prev.imagenes, ...files],
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEmailForm((prev) => ({
      ...prev,
      archivos: [...prev.archivos, ...files],
    }));
  };

  const removeImage = (index: number) => {
    setEmailForm((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index),
    }));
  };

  const removeFile = (index: number) => {
    setEmailForm((prev) => ({
      ...prev,
      archivos: prev.archivos.filter((_, i) => i !== index),
    }));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const getPlantillaStyles = (plantilla: string) => {
    switch (plantilla) {
      case "moderna":
        return {
          container:
            "bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl shadow-lg",
          header: "text-center mb-6 border-b-2 border-blue-200 pb-4",
          title:
            "text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
          content: "space-y-4 text-gray-700 leading-relaxed",
          footer:
            "mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500",
        };
      case "veterinaria":
        return {
          container:
            "bg-green-50 p-6 rounded-xl border-l-4 border-green-500 shadow-md",
          header: "flex items-center mb-6",
          title: "text-xl font-bold text-green-800 flex items-center",
          content:
            "bg-white p-4 rounded-lg shadow-sm text-gray-700 border border-green-200",
          footer:
            "mt-6 text-center text-xs text-green-600 bg-green-100 p-3 rounded-full",
        };
      case "clasica":
        return {
          container: "bg-white p-8 border-2 border-gray-400 shadow-md",
          header: "text-center mb-8 border-b-2 border-gray-400 pb-4",
          title: "text-xl font-serif text-gray-800 uppercase tracking-wide",
          content: "text-gray-700 leading-loose font-serif text-justify",
          footer:
            "mt-8 pt-4 border-t-2 border-gray-300 text-center text-sm font-serif",
        };
      case "minimalista":
        return {
          container: "bg-white p-8 shadow-2xl rounded-none border-l-4",
          header: "mb-8",
          title:
            "text-lg font-light text-gray-900 border-l-2 pl-4 border-gray-800",
          content: "text-gray-600 space-y-4 text-sm leading-relaxed font-light",
          footer: "mt-8 text-xs text-gray-400 text-center font-light",
        };
      default:
        return {
          container: "bg-white p-4 border",
          header: "mb-4",
          title: "font-bold text-lg",
          content: "text-gray-700",
          footer: "mt-4 text-sm text-gray-500",
        };
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-vet-gray-900">
            Gestión de Newsletter
          </h1>
          <p className="text-vet-gray-600 mt-2">
            Administra los suscriptores y envía noticias a tu comunidad
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Suscriptores Activos
              </CardTitle>
              <Users className="h-4 w-4 text-vet-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-vet-primary">
                {suscriptoresActivos.length}
              </div>
              <p className="text-xs text-vet-gray-600">
                Total de suscriptores: {suscriptoresNewsletter.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Emails Enviados
              </CardTitle>
              <Mail className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {newsletterEmails.filter((e) => e.estado === "enviado").length}
              </div>
              <p className="text-xs text-vet-gray-600">
                Total de emails: {newsletterEmails.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Última Suscripción
              </CardTitle>
              <Calendar className="h-4 w-4 text-vet-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-vet-secondary">
                {suscriptoresNewsletter.length > 0
                  ? format(
                      new Date(
                        Math.max(
                          ...suscriptoresNewsletter.map((s) =>
                            new Date(s.fechaSuscripcion).getTime(),
                          ),
                        ),
                      ),
                      "dd MMM",
                      { locale: es },
                    )
                  : "N/A"}
              </div>
              <p className="text-xs text-vet-gray-600">Este mes</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Newsletter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-vet-primary" />
                <span>Enviar Newsletter</span>
              </CardTitle>
              <CardDescription>
                Crea y envía un nuevo email a todos los suscriptores activos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog
                open={isEmailDialogOpen}
                onOpenChange={(open) => {
                  setIsEmailDialogOpen(open);
                  if (!open) resetNewsletterForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="w-full bg-vet-primary hover:bg-vet-primary-dark">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Newsletter
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingNewsletter
                        ? "Editar Newsletter"
                        : "Crear Nuevo Newsletter"}
                    </DialogTitle>
                    <DialogDescription>
                      Se enviará a {suscriptoresActivos.length} suscriptores
                      activos
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Información básica */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="asunto">Asunto *</Label>
                        <Input
                          id="asunto"
                          value={emailForm.asunto}
                          onChange={(e) =>
                            setEmailForm((prev) => ({
                              ...prev,
                              asunto: e.target.value,
                            }))
                          }
                          placeholder="Ej: Consejos de salud para tu mascota"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fecha">Fecha de envío</Label>
                        <Input
                          id="fecha"
                          type="date"
                          value={emailForm.fechaEnvio}
                          onChange={(e) =>
                            setEmailForm((prev) => ({
                              ...prev,
                              fechaEnvio: e.target.value,
                            }))
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Personalización */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="plantilla">Plantilla</Label>
                        <Select
                          value={emailForm.plantilla}
                          onValueChange={(value) =>
                            setEmailForm((prev) => ({
                              ...prev,
                              plantilla: value,
                            }))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Seleccionar plantilla" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="moderna">
                              🎨 Moderna - Gradientes y diseño colorido
                            </SelectItem>
                            <SelectItem value="clasica">
                              📰 Clásica - Estilo tradicional con serif
                            </SelectItem>
                            <SelectItem value="veterinaria">
                              🏥 Veterinaria - Temática de mascotas y salud
                            </SelectItem>
                            <SelectItem value="minimalista">
                              ✨ Minimalista - Limpio y simple
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="colorTema">Color del tema</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            id="colorTema"
                            type="color"
                            value={emailForm.colorTema}
                            onChange={(e) =>
                              setEmailForm((prev) => ({
                                ...prev,
                                colorTema: e.target.value,
                              }))
                            }
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input
                            value={emailForm.colorTema}
                            onChange={(e) =>
                              setEmailForm((prev) => ({
                                ...prev,
                                colorTema: e.target.value,
                              }))
                            }
                            placeholder="#0ea5e9"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div>
                      <Label htmlFor="contenido">Contenido *</Label>
                      <Textarea
                        id="contenido"
                        value={emailForm.contenido}
                        onChange={(e) =>
                          setEmailForm((prev) => ({
                            ...prev,
                            contenido: e.target.value,
                          }))
                        }
                        placeholder="Escribe aquí el contenido de tu newsletter..."
                        className="mt-1 min-h-[250px]"
                      />
                      <p className="text-xs text-vet-gray-500 mt-1">
                        Tip: Puedes usar HTML básico para dar formato a tu
                        contenido
                      </p>
                    </div>

                    {/* Archivos multimedia */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="imagenes">Imágenes</Label>
                        <div className="mt-1">
                          <input
                            id="imagenes"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document.getElementById("imagenes")?.click()
                            }
                            className="w-full"
                          >
                            <Image className="w-4 h-4 mr-2" />
                            Agregar Imágenes ({emailForm.imagenes.length})
                          </Button>
                        </div>
                        {emailForm.imagenes.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {emailForm.imagenes.map((img, index) => {
                              const imageUrl = URL.createObjectURL(img);
                              return (
                                <div
                                  key={index}
                                  className="flex items-center space-x-3 p-2 bg-white rounded border"
                                >
                                  <img
                                    src={imageUrl}
                                    alt={img.name}
                                    className="w-12 h-12 object-cover rounded border"
                                    onLoad={() => URL.revokeObjectURL(imageUrl)}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-vet-gray-900 truncate">
                                      {img.name}
                                    </p>
                                    <p className="text-xs text-vet-gray-500">
                                      {(img.size / 1024).toFixed(1)} KB
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeImage(index)}
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="archivos">Archivos adjuntos</Label>
                        <div className="mt-1">
                          <input
                            id="archivos"
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document.getElementById("archivos")?.click()
                            }
                            className="w-full"
                          >
                            <Paperclip className="w-4 h-4 mr-2" />
                            Agregar Archivos ({emailForm.archivos.length})
                          </Button>
                        </div>
                        {emailForm.archivos.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {emailForm.archivos.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-3 p-2 bg-white rounded border"
                              >
                                <div className="w-10 h-10 bg-vet-gray-100 rounded flex items-center justify-center">
                                  <Paperclip className="w-4 h-4 text-vet-gray-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-vet-gray-900 truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-vet-gray-500">
                                    {file.type} •{" "}
                                    {(file.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vista previa */}
                    <div className="border rounded-lg p-4 bg-vet-gray-50">
                      <h4 className="font-semibold text-vet-gray-900 mb-4 flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        Vista Previa - Plantilla: {emailForm.plantilla}
                      </h4>
                      <div className="bg-gray-100 p-4 rounded-lg">
                        {(() => {
                          const styles = getPlantillaStyles(
                            emailForm.plantilla,
                          );
                          return (
                            <div
                              className={styles.container}
                              style={{ borderLeftColor: emailForm.colorTema }}
                            >
                              <div className={styles.header}>
                                <h5
                                  className={styles.title}
                                  style={{ color: emailForm.colorTema }}
                                >
                                  {emailForm.plantilla === "veterinaria" &&
                                    "🏥 "}
                                  {emailForm.asunto || "Título del Newsletter"}
                                  {emailForm.plantilla === "veterinaria" &&
                                    " 🐾"}
                                </h5>
                                {emailForm.plantilla === "clasica" && (
                                  <p className="text-sm text-gray-600 font-serif italic">
                                    Newsletter Profesional de PetLA
                                  </p>
                                )}
                              </div>

                              <div className={styles.content}>
                                {emailForm.contenido ? (
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: emailForm.contenido.replace(
                                        /\n/g,
                                        "<br>",
                                      ),
                                    }}
                                  />
                                ) : (
                                  <p className="text-gray-500 italic">
                                    El contenido aparecerá aquí...
                                  </p>
                                )}

                                {/* Preview de imágenes */}
                                {emailForm.imagenes.length > 0 && (
                                  <div className="mt-4">
                                    <h6 className="text-sm font-semibold text-gray-700 mb-2">
                                      📸 Imágenes adjuntas:
                                    </h6>
                                    <div className="grid grid-cols-2 gap-2">
                                      {emailForm.imagenes
                                        .slice(0, 4)
                                        .map((img, index) => {
                                          const imageUrl =
                                            URL.createObjectURL(img);
                                          return (
                                            <div
                                              key={index}
                                              className="relative"
                                            >
                                              <img
                                                src={imageUrl}
                                                alt={img.name}
                                                className="w-full h-20 object-cover rounded border"
                                                onLoad={() =>
                                                  URL.revokeObjectURL(imageUrl)
                                                }
                                              />
                                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b">
                                                {img.name.length > 15
                                                  ? img.name.substring(0, 12) +
                                                    "..."
                                                  : img.name}
                                              </div>
                                            </div>
                                          );
                                        })}
                                    </div>
                                    {emailForm.imagenes.length > 4 && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        +{emailForm.imagenes.length - 4}{" "}
                                        imágenes más
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Preview de archivos */}
                                {emailForm.archivos.length > 0 && (
                                  <div className="mt-4">
                                    <h6 className="text-sm font-semibold text-gray-700 mb-2">
                                      📎 Archivos adjuntos:
                                    </h6>
                                    <div className="space-y-1">
                                      {emailForm.archivos.map((file, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 p-2 rounded"
                                        >
                                          <Paperclip className="w-3 h-3" />
                                          <span className="font-medium">
                                            {file.name}
                                          </span>
                                          <span className="text-gray-400">
                                            ({(file.size / 1024).toFixed(1)} KB)
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className={styles.footer}>
                                {emailForm.plantilla === "veterinaria" && (
                                  <p>
                                    🏥 PetLA - Cuidando a tus mascotas con amor
                                    🐾
                                  </p>
                                )}
                                {emailForm.plantilla === "moderna" && (
                                  <p>✨ Newsletter enviado con PetLA ✨</p>
                                )}
                                {emailForm.plantilla === "clasica" && (
                                  <p>— PetLA Newsletter —</p>
                                )}
                                {emailForm.plantilla === "minimalista" && (
                                  <p>PetLA</p>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setIsEmailDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSendEmail}
                        disabled={
                          !emailForm.asunto.trim() ||
                          !emailForm.contenido.trim()
                        }
                        className="bg-vet-primary hover:bg-vet-primary-dark"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {editingNewsletter
                          ? "Actualizar Newsletter"
                          : "Enviar Newsletter"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Recent Newsletters */}
              <div className="mt-6">
                <h4 className="font-semibold text-vet-gray-900 mb-3">
                  Newsletters Recientes
                </h4>
                <div className="space-y-2">
                  {newsletterEmails
                    .sort(
                      (a, b) =>
                        new Date(b.fechaEnvio).getTime() -
                        new Date(a.fechaEnvio).getTime(),
                    )
                    .slice(0, 5)
                    .map((email) => (
                      <div
                        key={email.id}
                        className="flex items-center justify-between p-3 bg-vet-gray-50 rounded-lg hover:bg-vet-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-vet-gray-900 text-sm">
                            {email.asunto}
                          </p>
                          <p className="text-xs text-vet-gray-600">
                            {format(new Date(email.fechaEnvio), "dd MMM yyyy", {
                              locale: es,
                            })}{" "}
                            • {email.destinatarios.length} destinatarios
                          </p>
                          {email.plantilla && (
                            <p className="text-xs text-vet-gray-500 mt-1">
                              📧 {email.plantilla}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            {email.estado}
                          </Badge>
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-vet-gray-200"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleViewNewsletter(email)}
                                className="flex items-center cursor-pointer"
                              >
                                <Eye className="w-4 h-4 mr-2 text-blue-600" />
                                Ver contenido
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditNewsletter(email)}
                                className="flex items-center cursor-pointer"
                              >
                                <Edit className="w-4 h-4 mr-2 text-vet-primary" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteNewsletter(email)}
                                className="flex items-center cursor-pointer text-red-600 focus:text-red-700"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  {newsletterEmails.length === 0 && (
                    <p className="text-vet-gray-500 text-sm text-center py-4">
                      No hay newsletters enviados aún
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscribers Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-vet-primary" />
                <span>Suscriptores</span>
              </CardTitle>
              <CardDescription>
                Gestiona la lista de suscriptores del newsletter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                {suscriptoresNewsletter.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suscriptoresNewsletter
                        .sort(
                          (a, b) =>
                            new Date(b.fechaSuscripcion).getTime() -
                            new Date(a.fechaSuscripcion).getTime(),
                        )
                        .map((suscriptor) => (
                          <TableRow key={suscriptor.id}>
                            <TableCell className="font-medium">
                              {suscriptor.email}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  suscriptor.activo ? "default" : "secondary"
                                }
                                className={
                                  suscriptor.activo
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {suscriptor.activo ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(
                                new Date(suscriptor.fechaSuscripcion),
                                "dd/MM/yyyy",
                                { locale: es },
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleToggleSubscriber(
                                      suscriptor.id,
                                      suscriptor.activo,
                                    )
                                  }
                                  className="h-8 w-8 p-0"
                                >
                                  {suscriptor.activo ? (
                                    <XCircle className="h-3 w-3" />
                                  ) : (
                                    <CheckCircle className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleDeleteSubscriber(suscriptor.id)
                                  }
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
                    <p className="text-vet-gray-500">No hay suscriptores aún</p>
                    <p className="text-sm text-vet-gray-400 mt-1">
                      Los usuarios que se suscriban aparecerán aquí
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Newsletter Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-vet-primary" />
              <span>Vista del Newsletter</span>
            </DialogTitle>
            <DialogDescription>
              {selectedNewsletterToView && (
                <span>
                  Enviado el{" "}
                  {format(
                    new Date(selectedNewsletterToView.fechaEnvio),
                    "dd 'de' MMMM 'de' yyyy",
                    { locale: es },
                  )}
                  • {selectedNewsletterToView.destinatarios.length}{" "}
                  destinatarios
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedNewsletterToView && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-vet-gray-50 rounded-lg">
                <div>
                  <Label className="text-xs font-medium text-vet-gray-600">
                    ASUNTO
                  </Label>
                  <p className="font-semibold text-vet-gray-900">
                    {selectedNewsletterToView.asunto}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-vet-gray-600">
                    PLANTILLA
                  </Label>
                  <p className="text-vet-gray-800">
                    {selectedNewsletterToView.plantilla || "moderna"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-vet-gray-600">
                    COLOR TEMA
                  </Label>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{
                        backgroundColor:
                          selectedNewsletterToView.colorTema || "#0ea5e9",
                      }}
                    />
                    <span className="text-vet-gray-800">
                      {selectedNewsletterToView.colorTema || "#0ea5e9"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-vet-gray-700">
                  Contenido:
                </Label>
                <div className="mt-2 bg-gray-100 p-4 rounded-lg">
                  {(() => {
                    const styles = getPlantillaStyles(
                      selectedNewsletterToView.plantilla || "moderna",
                    );
                    return (
                      <div
                        className={styles.container}
                        style={{
                          borderLeftColor:
                            selectedNewsletterToView.colorTema || "#0ea5e9",
                        }}
                      >
                        <div className={styles.header}>
                          <h5
                            className={styles.title}
                            style={{
                              color:
                                selectedNewsletterToView.colorTema || "#0ea5e9",
                            }}
                          >
                            {selectedNewsletterToView.plantilla ===
                              "veterinaria" && "🏥 "}
                            {selectedNewsletterToView.asunto}
                            {selectedNewsletterToView.plantilla ===
                              "veterinaria" && " 🐾"}
                          </h5>
                          {selectedNewsletterToView.plantilla === "clasica" && (
                            <p className="text-sm text-gray-600 font-serif italic">
                              Newsletter Profesional de PetLA
                            </p>
                          )}
                        </div>

                        <div className={styles.content}>
                          <div
                            dangerouslySetInnerHTML={{
                              __html:
                                selectedNewsletterToView.contenido.replace(
                                  /\n/g,
                                  "<br>",
                                ),
                            }}
                          />

                          {/* Mostrar imágenes guardadas */}
                          {selectedNewsletterToView.imagenes &&
                            selectedNewsletterToView.imagenes.length > 0 && (
                              <div className="mt-4">
                                <h6 className="text-sm font-semibold text-gray-700 mb-2">
                                  📸 Imágenes adjuntas:
                                </h6>
                                <div className="grid grid-cols-2 gap-2">
                                  {selectedNewsletterToView.imagenes
                                    .slice(0, 4)
                                    .map((img: any, index: number) => (
                                      <div key={index} className="relative">
                                        <img
                                          src={img.data}
                                          alt={img.name}
                                          className="w-full h-20 object-cover rounded border"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b">
                                          {img.name.length > 15
                                            ? img.name.substring(0, 12) + "..."
                                            : img.name}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                                {selectedNewsletterToView.imagenes.length >
                                  4 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    +
                                    {selectedNewsletterToView.imagenes.length -
                                      4}{" "}
                                    imágenes más
                                  </p>
                                )}
                              </div>
                            )}

                          {/* Mostrar archivos guardados */}
                          {selectedNewsletterToView.archivos &&
                            selectedNewsletterToView.archivos.length > 0 && (
                              <div className="mt-4">
                                <h6 className="text-sm font-semibold text-gray-700 mb-2">
                                  📎 Archivos adjuntos:
                                </h6>
                                <div className="space-y-1">
                                  {selectedNewsletterToView.archivos.map(
                                    (file: any, index: number) => (
                                      <div
                                        key={index}
                                        className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 p-2 rounded"
                                      >
                                        <Paperclip className="w-3 h-3" />
                                        <span className="font-medium">
                                          {file.name}
                                        </span>
                                        <span className="text-gray-400">
                                          ({(file.size / 1024).toFixed(1)} KB)
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                        </div>

                        <div className={styles.footer}>
                          {selectedNewsletterToView.plantilla ===
                            "veterinaria" && (
                            <p>
                              🏥 PetLA - Cuidando a tus mascotas con amor 🐾
                            </p>
                          )}
                          {selectedNewsletterToView.plantilla === "moderna" && (
                            <p>✨ Newsletter enviado con PetLA ✨</p>
                          )}
                          {selectedNewsletterToView.plantilla === "clasica" && (
                            <p>— PetLA Newsletter —</p>
                          )}
                          {selectedNewsletterToView.plantilla ===
                            "minimalista" && <p>PetLA</p>}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-vet-gray-600">
                  <span className="font-medium">
                    {selectedNewsletterToView.destinatarios.length}
                  </span>{" "}
                  personas recibieron este newsletter
                </div>
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Subscriber Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDeleteSubscriber}
        onClose={cancelDeleteSubscriber}
        title="Eliminar Suscriptor"
        description={`¿Estás seguro de que quieres eliminar la suscripción de ${suscriptorToDelete?.email}? Esta acción no se puede deshacer y el usuario ya no recibirá el newsletter.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />

      {/* Delete Newsletter Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteNewsletterConfirm}
        onConfirm={confirmDeleteNewsletter}
        onClose={cancelDeleteNewsletter}
        title="Eliminar Newsletter"
        description={`¿Estás seguro de que quieres eliminar el newsletter "${newsletterToDelete?.asunto}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </Layout>
  );
}
