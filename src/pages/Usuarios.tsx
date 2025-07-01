import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  Key,
  UserCheck,
  Clock,
  Eye,
} from "lucide-react";

interface ClientFormData {
  nombre: string;
  email: string;
  telefono: string;
  password?: string;
}

export default function Usuarios() {
  const { usuarios, addUsuario, updateUsuario, deleteUsuario, user, preCitas } =
    useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccountStatus, setSelectedAccountStatus] =
    useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<
    string | null
  >(null);
  const [formData, setFormData] = useState<ClientFormData>({
    nombre: "",
    email: "",
    telefono: "",
    password: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter only clients
  const clientes = usuarios.filter((usuario) => usuario.rol === "cliente");

  // Function to get account status
  const getAccountStatus = (cliente: any) => {
    // Check if recently added (within last 24 hours)
    if (cliente.fechaRegistro) {
      const now = new Date();
      const registrationDate = new Date(cliente.fechaRegistro);
      const hoursSinceRegistration =
        (now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60);

      if (hoursSinceRegistration <= 24) {
        return "recien_añadido";
      }
    }

    // Check if password was recently reset (stored in passwordResetAt field)
    if (cliente.passwordResetAt) {
      const now = new Date();
      const resetDate = new Date(cliente.passwordResetAt);
      const hoursSinceReset =
        (now.getTime() - resetDate.getTime()) / (1000 * 60 * 60);

      if (hoursSinceReset <= 24) {
        return "password_reseteada";
      }
    }

    return "activo";
  };

  // Apply search and status filters
  const filteredClientes = clientes.filter((cliente) => {
    const matchesSearch =
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cliente.telefono && cliente.telefono.includes(searchTerm));

    const accountStatus = getAccountStatus(cliente);
    const matchesStatus =
      selectedAccountStatus === "todos" ||
      accountStatus === selectedAccountStatus;

    return matchesSearch && matchesStatus;
  });

  // Get pre-citas that could become client accounts
  const preCitasPendientes = preCitas.filter(
    (preCita) =>
      preCita.estado === "pendiente" &&
      !usuarios.find((u) => u.email === preCita.email),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!editingUser) {
        setError("Error: No hay usuario seleccionado para editar");
        setIsLoading(false);
        return;
      }

      // Validate email is unique
      const existingUser = usuarios.find(
        (u) => u.email === formData.email && u.id !== editingUser,
      );
      if (existingUser) {
        setError("Este email ya está registrado");
        setIsLoading(false);
        return;
      }

      // Update existing client
      const updateData: any = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
      };

      // Only update password if provided
      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password;
      }

      updateUsuario(editingUser, updateData);
      setSuccess("Cliente actualizado exitosamente");

      // Reset form
      setFormData({ nombre: "", email: "", telefono: "", password: "" });
      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      setError("Error al actualizar el cliente");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword || !newPassword.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      if (newPassword.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        setIsLoading(false);
        return;
      }

      updateUsuario(selectedUserForPassword, {
        password: newPassword,
        passwordResetAt: new Date(), // Mark password as recently reset
      });
      setSuccess("Contraseña actualizada exitosamente");
      setIsPasswordDialogOpen(false);
      setNewPassword("");
      setSelectedUserForPassword(null);
    } catch (error) {
      setError("Error al actualizar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (cliente: any) => {
    setEditingUser(cliente.id);
    setFormData({
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono || "",
      password: "", // Don't pre-fill password for security
    });
    setIsDialogOpen(true);
  };

  const handlePasswordReset_Open = (clienteId: string) => {
    setSelectedUserForPassword(clienteId);
    setNewPassword("");
    setIsPasswordDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const cliente = usuarios.find((u) => u.id === id);
    setClienteToDelete(cliente);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (clienteToDelete) {
      deleteUsuario(clienteToDelete.id);
      setSuccess(`Cliente ${clienteToDelete.nombre} eliminado exitosamente`);
      setShowDeleteConfirm(false);
      setClienteToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setClienteToDelete(null);
  };

  const createClientFromPreCita = (preCita: any) => {
    const clienteData = {
      nombre: preCita.nombreCliente,
      email: preCita.email,
      telefono: preCita.telefono,
      password: "cliente123", // Default password
      rol: "cliente" as const,
      fechaRegistro: new Date(), // Mark as recently added
    };

    addUsuario(clienteData);
    setSuccess(
      `Cuenta creada para ${preCita.nombreCliente}. Contraseña por defecto: cliente123`,
    );
  };

  const resetForm = () => {
    setFormData({ nombre: "", email: "", telefono: "", password: "" });
    setEditingUser(null);
    setError("");
  };

  // Function to get account status badge
  const getAccountStatusBadge = (cliente: any) => {
    const status = getAccountStatus(cliente);

    switch (status) {
      case "recien_añadido":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <UserPlus className="w-3 h-3 mr-1" />
            Recién Añadido
          </Badge>
        );
      case "password_reseteada":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            <Key className="w-3 h-3 mr-1" />
            Password Reseteada
          </Badge>
        );
      case "activo":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Activo
          </Badge>
        );
      default:
        return null;
    }
  };

  const stats = {
    totalClientes: clientes.length,
    clientesActivos: clientes.filter((c) => getAccountStatus(c) === "activo")
      .length,
    recienAñadidos: clientes.filter(
      (c) => getAccountStatus(c) === "recien_añadido",
    ).length,
    preCitasPendientes: preCitasPendientes.length,
    passwordReseteadas: clientes.filter(
      (c) => getAccountStatus(c) === "password_reseteada",
    ).length,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-vet-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-vet-primary rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-vet-gray-900">
                  Gestión de Clientes
                </h1>
                <p className="text-vet-gray-600">
                  Administra las cuentas de clientes y crea nuevas desde
                  pre-citas
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-vet-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-vet-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Total Clientes
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-vet-gray-900">
                      {stats.totalClientes}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Activos
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">
                      {stats.clientesActivos}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Recién Añadidos
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                      {stats.recienAñadidos}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Key className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Password Reseteada
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                      {stats.passwordReseteadas}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pre-Citas que pueden convertirse en cuentas */}
          {preCitasPendientes.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span>
                    Pre-Citas Sin Cuenta ({preCitasPendientes.length})
                  </span>
                </CardTitle>
                <CardDescription>
                  Estas personas enviaron pre-citas pero no tienen cuenta de
                  cliente. Puedes crearles una cuenta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {preCitasPendientes.slice(0, 5).map((preCita) => (
                    <div
                      key={preCita.id}
                      className="flex items-center justify-between p-4 border border-vet-gray-200 rounded-lg bg-yellow-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium text-vet-gray-900">
                              {preCita.nombreCliente}
                            </p>
                            <p className="text-sm text-vet-gray-600">
                              {preCita.email}
                            </p>
                            <p className="text-xs text-vet-gray-500">
                              Mascota: {preCita.nombreMascota} •{" "}
                              {preCita.motivoConsulta}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => createClientFromPreCita(preCita)}
                          className="bg-vet-primary hover:bg-vet-primary-dark"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Crear Cuenta
                        </Button>
                      </div>
                    </div>
                  ))}
                  {preCitasPendientes.length > 5 && (
                    <p className="text-sm text-vet-gray-500 text-center">
                      Y {preCitasPendientes.length - 5} pre-citas más...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Controls */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                    <Input
                      placeholder="Buscar cliente por nombre, email o teléfono..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-96"
                    />
                  </div>
                  <Select
                    value={selectedAccountStatus}
                    onValueChange={setSelectedAccountStatus}
                  >
                    <SelectTrigger className="w-full sm:w-64">
                      <SelectValue placeholder="Filtrar por estado de cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="activo">Activos</SelectItem>
                      <SelectItem value="recien_añadido">
                        Recién Añadidos
                      </SelectItem>
                      <SelectItem value="password_reseteada">
                        Password Reseteada
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Client Dialog */}
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Editar Cliente</DialogTitle>
                <DialogDescription>
                  Modifica la información del cliente
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre completo *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    placeholder="Nombre completo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@ejemplo.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
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
                  />
                </div>

                <div>
                  <Label htmlFor="password">
                    Contraseña (dejar en blanco para mantener actual)
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
                    placeholder="Nueva contraseña (opcional)"
                    minLength={6}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-vet-primary hover:bg-vet-primary-dark"
                  >
                    {isLoading ? "Guardando..." : "Actualizar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Password Reset Dialog */}
          <Dialog
            open={isPasswordDialogOpen}
            onOpenChange={(open) => {
              setIsPasswordDialogOpen(open);
              if (!open) {
                setNewPassword("");
                setSelectedUserForPassword(null);
              }
            }}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Resetear Contraseña</DialogTitle>
                <DialogDescription>
                  Ingresa la nueva contraseña para el cliente
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

          {/* Clients Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Clientes Registrados ({filteredClientes.length})
              </CardTitle>
              <CardDescription>
                Lista de todos los clientes con cuenta en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Estado Cuenta</TableHead>
                      <TableHead>Fecha Registro</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClientes.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-vet-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-vet-primary">
                                {cliente.nombre.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-vet-gray-900">
                                {cliente.nombre}
                              </p>
                              <p className="text-sm text-vet-gray-500">
                                {cliente.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {cliente.telefono && (
                              <div className="flex items-center space-x-2 text-sm text-vet-gray-600">
                                <Phone className="w-3 h-3" />
                                <span>{cliente.telefono}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2 text-sm text-vet-gray-600">
                              <Mail className="w-3 h-3" />
                              <span>{cliente.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getAccountStatusBadge(cliente)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 text-sm text-vet-gray-600">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {cliente.fechaRegistro?.toLocaleDateString(
                                "es-ES",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              ) || "No registrada"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {cliente.id !== user?.id && (
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
                                    handleEdit(cliente);
                                  }}
                                  className="flex items-center cursor-pointer hover:bg-vet-gray-50"
                                >
                                  <Edit className="w-4 h-4 mr-2 text-vet-primary" />
                                  Editar información
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePasswordReset_Open(cliente.id);
                                  }}
                                  className="flex items-center cursor-pointer hover:bg-blue-50"
                                >
                                  <Key className="w-4 h-4 mr-2 text-blue-600" />
                                  Resetear contraseña
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center cursor-pointer hover:bg-vet-gray-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `mailto:${cliente.email}`;
                                  }}
                                >
                                  <Mail className="w-4 h-4 mr-2 text-green-600" />
                                  Enviar email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(cliente.id);
                                  }}
                                  className="flex items-center cursor-pointer hover:bg-red-50 text-red-600 focus:bg-red-50 focus:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar cliente
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredClientes.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-vet-gray-900 mb-2">
                      No hay clientes
                    </h3>
                    <p className="text-vet-gray-600 mb-4">
                      {searchTerm
                        ? "No se encontraron clientes con el término de búsqueda aplicado"
                        : "Aún no hay clientes registrados en el sistema"}
                    </p>
                    {searchTerm && (
                      <Button
                        onClick={() => setSearchTerm("")}
                        variant="outline"
                      >
                        Limpiar búsqueda
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onClose={cancelDelete}
        title="Eliminar Cliente"
        description={`¿Estás seguro de que quieres eliminar la cuenta de ${clienteToDelete?.nombre}? Esta acción no se puede deshacer y eliminará todos sus datos asociados.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </Layout>
  );
}
