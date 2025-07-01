import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  Stethoscope,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Award,
  Activity,
  Key,
} from "lucide-react";

interface VeterinarianFormData {
  nombre: string;
  email: string;
  telefono: string;
  password: string;
  especialidades: string;
  experiencia: string;
  certificaciones: string;
}

export default function Veterinarios() {
  const { usuarios, addUsuario, updateUsuario, deleteUsuario, citas } =
    useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVet, setEditingVet] = useState<string | null>(null);
  const [formData, setFormData] = useState<VeterinarianFormData>({
    nombre: "",
    email: "",
    telefono: "",
    password: "",
    especialidades: "",
    experiencia: "",
    certificaciones: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [veterinarioToDelete, setVeterinarioToDelete] = useState<any>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedVetForPassword, setSelectedVetForPassword] = useState<
    string | null
  >(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const veterinarios = usuarios.filter((u) => u.rol === "veterinario");

  // Get veterinarian stats
  const getVetStats = (vetName: string) => {
    const vetCitas = citas.filter((c) => c.veterinario === vetName);
    const citasAtendidas = vetCitas.filter((c) => c.estado === "atendida");
    const citasPendientes = vetCitas.filter(
      (c) => c.estado === "aceptada" || c.estado === "en_validacion",
    );

    return {
      totalCitas: vetCitas.length,
      citasAtendidas: citasAtendidas.length,
      citasPendientes: citasPendientes.length,
      rating: citasAtendidas.length > 0 ? 4.8 : 0, // Mock rating
    };
  };

  // Filter veterinarians
  const filteredVeterinarios = veterinarios.filter(
    (veterinario) =>
      veterinario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veterinario.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate email is unique
      const existingUser = usuarios.find(
        (u) => u.email === formData.email && u.id !== editingVet,
      );
      if (existingUser) {
        setError("Este email ya está registrado");
        setIsLoading(false);
        return;
      }

      // Validate password for new veterinarians
      if (!editingVet && !formData.password.trim()) {
        setError("La contraseña es obligatoria para nuevos veterinarios");
        setIsLoading(false);
        return;
      }

      if (formData.password && formData.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        setIsLoading(false);
        return;
      }

      if (editingVet) {
        // Update existing veterinarian
        const updateData: any = {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
        };

        // Only update password if provided
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }

        updateUsuario(editingVet, updateData);
        setSuccess("Veterinario actualizado exitosamente");
      } else {
        // Create new veterinarian
        addUsuario({
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          password: formData.password,
          rol: "veterinario",
        });
        setSuccess("Veterinario creado exitosamente");
      }

      // Reset form
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        password: "",
        especialidades: "",
        experiencia: "",
        certificaciones: "",
      });
      setIsDialogOpen(false);
      setEditingVet(null);
    } catch (error) {
      setError("Error al guardar el veterinario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (veterinario: any) => {
    setEditingVet(veterinario.id);
    setFormData({
      nombre: veterinario.nombre || "",
      email: veterinario.email || "",
      telefono: veterinario.telefono || "",
      password: "", // No mostramos la contraseña actual por seguridad
      especialidades: "",
      experiencia: "",
      certificaciones: "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const veterinario = usuarios.find((u) => u.id === id);
    setVeterinarioToDelete(veterinario);
    setShowDeleteConfirm(true);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVetForPassword || !newPassword.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      if (newPassword.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        setIsLoading(false);
        return;
      }

      updateUsuario(selectedVetForPassword, {
        password: newPassword,
        passwordResetAt: new Date(), // Mark password as recently reset
      });
      setSuccess("Contraseña actualizada exitosamente");
      setIsPasswordDialogOpen(false);
      setNewPassword("");
      setSelectedVetForPassword(null);
    } catch (error) {
      setError("Error al actualizar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset_Open = (vetId: string) => {
    setSelectedVetForPassword(vetId);
    setNewPassword("");
    setIsPasswordDialogOpen(true);
  };

  const confirmDelete = () => {
    if (veterinarioToDelete) {
      deleteUsuario(veterinarioToDelete.id);
      setSuccess(
        `Veterinario ${veterinarioToDelete.nombre} eliminado exitosamente`,
      );
      setShowDeleteConfirm(false);
      setVeterinarioToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setVeterinarioToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      email: "",
      telefono: "",
      password: "",
      especialidades: "",
      experiencia: "",
      certificaciones: "",
    });
    setEditingVet(null);
    setError("");
  };

  const stats = {
    total: veterinarios.length,
    activos: veterinarios.length, // All vets are considered active
    nuevos: veterinarios.filter((v) => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return v.fechaRegistro && v.fechaRegistro > oneMonthAgo;
    }).length,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-vet-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-vet-primary rounded-xl flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-vet-gray-900">
                  Gestión de Veterinarios
                </h1>
                <p className="text-vet-gray-600">
                  Administra el equipo de veterinarios
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
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-vet-primary/10 rounded-xl flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-vet-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Total Veterinarios
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
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Activos
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">
                      {stats.activos}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Nuevos (30 días)
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                      {stats.nuevos}
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
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                  <Input
                    placeholder="Buscar veterinarios por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>

                <Dialog
                  open={isDialogOpen}
                  onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-vet-primary hover:bg-vet-primary-dark">
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Veterinario
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
                    <DialogHeader className="pb-4 border-b border-vet-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-vet-primary/10 rounded-lg flex items-center justify-center">
                          <Stethoscope className="w-5 h-5 text-vet-primary" />
                        </div>
                        <div>
                          <DialogTitle className="text-xl font-semibold text-vet-gray-900">
                            {editingVet
                              ? "Editar Veterinario"
                              : "Nuevo Veterinario"}
                          </DialogTitle>
                          <DialogDescription className="text-vet-gray-600">
                            {editingVet
                              ? "Modifica la información del veterinario"
                              : "Registra un nuevo veterinario en el sistema"}
                          </DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                      {/* Información básica */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-vet-gray-900 flex items-center">
                          <User className="w-4 h-4 mr-2 text-vet-primary" />
                          Información Personal
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="nombre"
                              className="text-sm font-medium text-vet-gray-700"
                            >
                              Nombre completo *
                            </Label>
                            <Input
                              id="nombre"
                              value={formData.nombre}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  nombre: e.target.value,
                                })
                              }
                              placeholder="Dr./Dra. Nombre Apellido"
                              className="border-vet-gray-300 focus:border-vet-primary focus:ring-vet-primary"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="email"
                              className="text-sm font-medium text-vet-gray-700"
                            >
                              Email *
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  email: e.target.value,
                                })
                              }
                              placeholder="veterinario@petla.com"
                              className="border-vet-gray-300 focus:border-vet-primary focus:ring-vet-primary"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="telefono"
                            className="text-sm font-medium text-vet-gray-700"
                          >
                            Teléfono
                          </Label>
                          <Input
                            id="telefono"
                            type="tel"
                            value={formData.telefono}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                telefono: e.target.value,
                              })
                            }
                            placeholder="+52 55 1234 5678"
                            className="border-vet-gray-300 focus:border-vet-primary focus:ring-vet-primary"
                          />
                        </div>
                      </div>

                      {/* Seguridad */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-vet-gray-900 flex items-center">
                          <Activity className="w-4 h-4 mr-2 text-vet-primary" />
                          Acceso al Sistema
                        </h3>
                        <div className="space-y-2">
                          <Label
                            htmlFor="password"
                            className="text-sm font-medium text-vet-gray-700"
                          >
                            Contraseña {!editingVet && "*"}
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                            placeholder={
                              editingVet
                                ? "Dejar vacío para mantener actual"
                                : "Contraseña para iniciar sesión"
                            }
                            className="border-vet-gray-300 focus:border-vet-primary focus:ring-vet-primary"
                            required={!editingVet}
                          />
                          <p className="text-xs text-vet-gray-500">
                            {editingVet
                              ? "Solo completa si quieres cambiar la contraseña actual"
                              : "El veterinario usará esta contraseña para iniciar sesión"}
                          </p>
                        </div>

                        <Alert className="border-vet-primary/20 bg-vet-primary/5">
                          <Stethoscope className="w-4 h-4 text-vet-primary" />
                          <AlertDescription className="text-vet-gray-700">
                            <strong>Sistema de acceso:</strong> El veterinario
                            podrá iniciar sesión con su email y la contraseña
                            que asignes aquí. Esta contraseña es obligatoria y
                            debe ser comunicada al veterinario de forma segura.
                          </AlertDescription>
                        </Alert>
                      </div>

                      {/* Información profesional */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-vet-gray-900 flex items-center">
                          <Award className="w-4 h-4 mr-2 text-vet-primary" />
                          Información Profesional (Opcional)
                        </h3>

                        <div className="space-y-2">
                          <Label
                            htmlFor="especialidades"
                            className="text-sm font-medium text-vet-gray-700"
                          >
                            Especialidades
                          </Label>
                          <Textarea
                            id="especialidades"
                            value={formData.especialidades}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                especialidades: e.target.value,
                              })
                            }
                            placeholder="Ej: Medicina interna, Cirugía, Dermatología..."
                            rows={2}
                            className="border-vet-gray-300 focus:border-vet-primary focus:ring-vet-primary resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="experiencia"
                              className="text-sm font-medium text-vet-gray-700"
                            >
                              Años de experiencia
                            </Label>
                            <Input
                              id="experiencia"
                              value={formData.experiencia}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  experiencia: e.target.value,
                                })
                              }
                              placeholder="Ej: 5 años"
                              className="border-vet-gray-300 focus:border-vet-primary focus:ring-vet-primary"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="certificaciones"
                              className="text-sm font-medium text-vet-gray-700"
                            >
                              Certificaciones
                            </Label>
                            <Input
                              id="certificaciones"
                              value={formData.certificaciones}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  certificaciones: e.target.value,
                                })
                              }
                              placeholder="Ej: UNAM, Especialista..."
                              className="border-vet-gray-300 focus:border-vet-primary focus:ring-vet-primary"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-6 border-t border-vet-gray-200">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          className="flex-1 border-vet-gray-300 text-vet-gray-700 hover:bg-vet-gray-50"
                          disabled={isLoading}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 bg-vet-primary hover:bg-vet-primary-dark text-white"
                        >
                          {isLoading ? (
                            <div className="flex items-center">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Guardando...
                            </div>
                          ) : editingVet ? (
                            "Actualizar Veterinario"
                          ) : (
                            "Crear Veterinario"
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Veterinarios Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Veterinarios ({filteredVeterinarios.length})
              </CardTitle>
              <CardDescription>
                Lista de todos los veterinarios registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Veterinario</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Estadísticas</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Registro</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVeterinarios.map((veterinario) => {
                      const stats = getVetStats(veterinario.nombre);
                      return (
                        <TableRow key={veterinario.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-vet-primary/10 rounded-full flex items-center justify-center">
                                <Stethoscope className="w-5 h-5 text-vet-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-vet-gray-900">
                                  {veterinario.nombre}
                                </p>
                                <p className="text-sm text-vet-gray-500">
                                  Veterinario
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-sm text-vet-gray-600">
                                <Mail className="w-3 h-3" />
                                <span>{veterinario.email}</span>
                              </div>
                              {veterinario.telefono && (
                                <div className="flex items-center space-x-2 text-sm text-vet-gray-600">
                                  <Phone className="w-3 h-3" />
                                  <span>{veterinario.telefono}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="w-3 h-3 text-vet-gray-400" />
                                <span className="font-medium">
                                  {stats.totalCitas} citas totales
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-vet-gray-600">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span>{stats.citasAtendidas} atendidas</span>
                              </div>
                              {stats.citasPendientes > 0 && (
                                <div className="flex items-center space-x-2 text-sm text-vet-gray-600">
                                  <Clock className="w-3 h-3 text-orange-600" />
                                  <span>
                                    {stats.citasPendientes} pendientes
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <Activity className="w-3 h-3 mr-1" />
                              Activo
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2 text-sm text-vet-gray-600">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {veterinario.fechaRegistro?.toLocaleDateString(
                                  "es-ES",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                          </TableCell>
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
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(veterinario);
                                  }}
                                  className="flex items-center cursor-pointer hover:bg-vet-gray-50"
                                >
                                  <Edit className="w-4 h-4 mr-2 text-vet-primary" />
                                  Editar información
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center cursor-pointer hover:bg-vet-gray-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `mailto:${veterinario.email}`;
                                  }}
                                >
                                  <Mail className="w-4 h-4 mr-2 text-blue-600" />
                                  Enviar email
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePasswordReset_Open(veterinario.id);
                                  }}
                                  className="flex items-center cursor-pointer hover:bg-vet-gray-50"
                                >
                                  <Key className="w-4 h-4 mr-2 text-blue-600" />
                                  Resetear contraseña
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(veterinario.id);
                                  }}
                                  className="flex items-center cursor-pointer hover:bg-red-50 text-red-600 focus:bg-red-50 focus:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar veterinario
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {filteredVeterinarios.length === 0 && (
                  <div className="text-center py-12">
                    <Stethoscope className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-vet-gray-900 mb-2">
                      No hay veterinarios
                    </h3>
                    <p className="text-vet-gray-600 mb-4">
                      {searchTerm
                        ? "No se encontraron veterinarios con la búsqueda aplicada"
                        : "Aún no hay veterinarios registrados en el sistema"}
                    </p>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="bg-vet-primary hover:bg-vet-primary-dark"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Primer Veterinario
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Password Reset Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={(open) => {
          setIsPasswordDialogOpen(open);
          if (!open) {
            setNewPassword("");
            setSelectedVetForPassword(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resetear Contraseña</DialogTitle>
            <DialogDescription>
              Ingresa la nueva contraseña para el veterinario
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">Nueva contraseña *</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !newPassword.trim()}
                className="flex-1 bg-vet-primary hover:bg-vet-primary-dark"
              >
                {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onClose={cancelDelete}
        title="Eliminar Veterinario"
        description={`¿Estás seguro de que quieres eliminar al veterinario ${veterinarioToDelete?.nombre}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </Layout>
  );
}
