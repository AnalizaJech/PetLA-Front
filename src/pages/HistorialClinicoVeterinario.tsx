import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAppContext } from "@/contexts/AppContext";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  PawPrint,
  Calendar,
  Stethoscope,
  User,
  Phone,
  Search,
  Filter,
  Eye,
  Edit,
  Syringe,
  Pill,
  Activity,
  Download,
  Upload,
  X,
  CalendarDays,
  Clock,
  AlertCircle,
  CheckCircle,
  UserCheck,
  Heart,
  MapPin,
  Weight,
  Thermometer,
  Plus,
  ChevronRight,
  Info,
} from "lucide-react";

export default function HistorialClinicoVeterinario() {
  const {
    user,
    citas,
    usuarios,
    mascotas,
    historialClinico,
    getHistorialByMascota,
    updateCita,
  } = useAppContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Debug: verificar parámetros de URL
  console.log("HistorialClinicoVeterinario - Parámetros URL:", {
    mascotaId: searchParams.get("mascota"),
    nombre: searchParams.get("nombre"),
    especie: searchParams.get("especie"),
  });

  // Estados principales
  const [selectedMascota, setSelectedMascota] = useState(
    searchParams.get("mascota") || "",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("todos");
  const [filterType, setFilterType] = useState("todos");
  const [selectedView, setSelectedView] = useState("list"); // list, detail
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!user || user.rol !== "veterinario") {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                Acceso restringido
              </h3>
              <p className="text-vet-gray-600">
                Esta página es exclusiva para veterinarios
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Obtener mascotas de mis pacientes
  const misCitas = citas.filter((cita) => cita.veterinario === user.nombre);
  const misMascotas = mascotas.filter((mascota) =>
    misCitas.some((cita) => cita.mascota === mascota.nombre),
  );

  // Debug: verificar datos disponibles
  console.log("HistorialClinicoVeterinario - Datos disponibles:", {
    misCitasCount: misCitas.length,
    misMascotasCount: misMascotas.length,
    historialClinicoCount: historialClinico.length,
    selectedMascotaId: selectedMascota,
  });

  // Obtener clientes únicos
  const misClientes = usuarios.filter((usuario) =>
    misMascotas.some((mascota) => mascota.clienteId === usuario.id),
  );

  // Filtrar mascotas según criterios de búsqueda
  const filteredMascotas = misMascotas.filter((mascota) => {
    const cliente = usuarios.find((u) => u.id === mascota.clienteId);

    const matchesOwner =
      selectedOwner === "todos" || mascota.clienteId === selectedOwner;
    const matchesSearch =
      !searchTerm ||
      mascota.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mascota.especie.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mascota.raza.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesOwner && matchesSearch;
  });

  // Obtener historial de la mascota seleccionada
  let mascotaSeleccionada = misMascotas.find((m) => m.id === selectedMascota);

  // Si no encuentra por ID, buscar por nombre (fallback para mascotas temporales)
  if (!mascotaSeleccionada && searchParams.get("nombre")) {
    const nombreMascota = searchParams.get("nombre");
    mascotaSeleccionada = misMascotas.find((m) => m.nombre === nombreMascota);

    // Si se encuentra por nombre, actualizar el selectedMascota para que funcione el resto
    if (mascotaSeleccionada) {
      setSelectedMascota(mascotaSeleccionada.id);
    }
  }

  const clienteSeleccionado = mascotaSeleccionada
    ? usuarios.find((u) => u.id === mascotaSeleccionada.clienteId)
    : null;
  const historialMascota = mascotaSeleccionada
    ? getHistorialByMascota(mascotaSeleccionada.id)
    : [];

  // Debug: verificar mascota seleccionada y su historial
  console.log("HistorialClinicoVeterinario - Mascota seleccionada:", {
    searchedById: selectedMascota,
    searchedByName: searchParams.get("nombre"),
    mascotaSeleccionada,
    clienteSeleccionado,
    historialCount: historialMascota.length,
    historialData: historialMascota,
  });

  // Organizar datos por tipo con filtros aplicados
  const getFilteredRecords = () => {
    let records = [...historialMascota];

    if (filterType !== "todos") {
      switch (filterType) {
        case "consultas":
          records = records.filter(
            (r) =>
              r.tipoConsulta === "consulta_general" ||
              r.tipoConsulta === "grooming" ||
              r.tipoConsulta === "emergencia",
          );
          break;
        case "vacunas":
          records = records.filter((r) => r.tipoConsulta === "vacunacion");
          break;
        case "examenes":
          records = records.filter((r) => r.examenes && r.examenes.length > 0);
          break;
        case "urgencias":
          records = records.filter((r) => r.tipoConsulta === "emergencia");
          break;
      }
    }

    return records.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  };

  const filteredRecords = getFilteredRecords();

  // Obtener estadísticas de la mascota
  const getStats = () => {
    if (!selectedMascota)
      return { total: 0, consultas: 0, vacunas: 0, examenes: 0 };

    return {
      total: historialMascota.length,
      consultas: historialMascota.filter(
        (r) =>
          r.tipoConsulta === "consulta_general" ||
          r.tipoConsulta === "grooming" ||
          r.tipoConsulta === "emergencia",
      ).length,
      vacunas: historialMascota.filter((r) => r.tipoConsulta === "vacunacion")
        .length,
      examenes: historialMascota.filter(
        (r) => r.examenes && r.examenes.length > 0,
      ).length,
    };
  };

  const stats = getStats();

  // Función para mostrar detalles del registro
  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  // Función para atender una cita relacionada
  const handleAttendAppointment = (record) => {
    // Buscar si hay una cita pendiente para esta mascota
    const pendingCita = citas.find(
      (c) =>
        c.mascota === mascotaSeleccionada?.nombre &&
        c.estado === "aceptada" &&
        new Date(c.fecha).toDateString() === new Date().toDateString(),
    );

    if (pendingCita) {
      navigate(`/mis-pacientes?cita=${pendingCita.id}`);
    } else {
      navigate("/mis-pacientes");
    }
  };

  // Función para obtener el ícono según el tipo de consulta
  const getConsultationIcon = (tipo) => {
    switch (tipo) {
      case "vacunacion":
        return <Syringe className="w-4 h-4" />;
      case "emergencia":
        return <AlertCircle className="w-4 h-4" />;
      case "cirugia":
        return <Activity className="w-4 h-4" />;
      case "grooming":
        return <Heart className="w-4 h-4" />;
      default:
        return <Stethoscope className="w-4 h-4" />;
    }
  };

  // Función para obtener el color del badge según el tipo
  const getBadgeVariant = (tipo) => {
    switch (tipo) {
      case "vacunacion":
        return "bg-green-100 text-green-800";
      case "emergencia":
        return "bg-red-100 text-red-800";
      case "cirugia":
        return "bg-purple-100 text-purple-800";
      case "grooming":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <Layout user={user}>
      <div className="min-h-screen bg-vet-gray-50 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-vet-primary/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-vet-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-vet-gray-900">
                    Historial Clínico
                  </h1>
                  <p className="text-sm sm:text-base text-vet-gray-600">
                    Gestiona el historial médico de tus pacientes
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Panel izquierdo - Lista de mascotas */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PawPrint className="w-5 h-5 text-vet-primary" />
                    <span>Mis Pacientes</span>
                  </CardTitle>
                  <CardDescription>
                    Selecciona una mascota para ver su historial
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Búsqueda */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                    <Input
                      placeholder="Buscar mascota o dueño..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Filtro por propietario */}
                  <Select
                    value={selectedOwner}
                    onValueChange={setSelectedOwner}
                  >
                    <SelectTrigger>
                      <User className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filtrar por dueño" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los dueños</SelectItem>
                      {misClientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Lista de mascotas */}
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredMascotas.length === 0 ? (
                      <div className="text-center py-8">
                        <PawPrint className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
                        <p className="text-vet-gray-500 text-sm">
                          No se encontraron mascotas
                        </p>
                      </div>
                    ) : (
                      filteredMascotas.map((mascota) => {
                        const cliente = usuarios.find(
                          (u) => u.id === mascota.clienteId,
                        );
                        const isSelected = selectedMascota === mascota.id;

                        return (
                          <button
                            key={mascota.id}
                            onClick={() => setSelectedMascota(mascota.id)}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              isSelected
                                ? "border-vet-primary bg-vet-primary/5 shadow-sm"
                                : "border-vet-gray-200 hover:border-vet-primary/50 hover:bg-vet-gray-50"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  isSelected
                                    ? "bg-vet-primary/20"
                                    : "bg-vet-gray-100"
                                }`}
                              >
                                <PawPrint
                                  className={`w-5 h-5 ${
                                    isSelected
                                      ? "text-vet-primary"
                                      : "text-vet-gray-500"
                                  }`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-vet-gray-900 text-sm">
                                  {mascota.nombre}
                                </p>
                                <p className="text-xs text-vet-gray-600">
                                  {mascota.especie} • {mascota.raza}
                                </p>
                                <p className="text-xs text-vet-primary font-medium">
                                  Dueño: {cliente?.nombre || "No registrado"}
                                </p>
                              </div>
                              {isSelected && (
                                <ChevronRight className="w-4 h-4 text-vet-primary" />
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Panel derecho - Historial de la mascota seleccionada */}
            <div className="lg:col-span-3">
              {selectedMascota && mascotaSeleccionada ? (
                <div className="space-y-6">
                  {/* Información de la mascota */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-vet-primary/10 rounded-xl flex items-center justify-center">
                            <PawPrint className="w-8 h-8 text-vet-primary" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-vet-gray-900">
                              {mascotaSeleccionada.nombre}
                            </h2>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-vet-gray-600">
                                {mascotaSeleccionada.especie} •{" "}
                                {mascotaSeleccionada.raza}
                              </p>
                              {mascotaSeleccionada.peso && (
                                <div className="flex items-center space-x-1 text-vet-gray-600">
                                  <Weight className="w-4 h-4" />
                                  <span className="text-sm">
                                    {mascotaSeleccionada.peso} kg
                                  </span>
                                </div>
                              )}
                            </div>
                            {clienteSeleccionado && (
                              <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-vet-primary" />
                                  <span className="text-sm font-medium text-vet-primary">
                                    {clienteSeleccionado.nombre}
                                  </span>
                                </div>
                                {clienteSeleccionado.telefono && (
                                  <div className="flex items-center space-x-2">
                                    <Phone className="w-4 h-4 text-vet-gray-500" />
                                    <span className="text-sm text-vet-gray-600">
                                      {clienteSeleccionado.telefono}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleAttendAppointment(null)}
                            className="bg-vet-primary hover:bg-vet-primary-dark"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Nueva Consulta
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Estadísticas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-vet-primary">
                          {stats.total}
                        </div>
                        <div className="text-sm text-vet-gray-600">
                          Total Registros
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {stats.consultas}
                        </div>
                        <div className="text-sm text-vet-gray-600">
                          Consultas
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {stats.vacunas}
                        </div>
                        <div className="text-sm text-vet-gray-600">Vacunas</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {stats.examenes}
                        </div>
                        <div className="text-sm text-vet-gray-600">
                          Exámenes
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Filtros */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <Select
                            value={filterType}
                            onValueChange={setFilterType}
                          >
                            <SelectTrigger>
                              <Filter className="w-4 h-4 mr-2" />
                              <SelectValue placeholder="Filtrar por tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todos">
                                Todos los registros
                              </SelectItem>
                              <SelectItem value="consultas">
                                Solo consultas
                              </SelectItem>
                              <SelectItem value="vacunas">
                                Solo vacunas
                              </SelectItem>
                              <SelectItem value="examenes">
                                Solo exámenes
                              </SelectItem>
                              <SelectItem value="urgencias">
                                Urgencias
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setFilterType("todos")}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Limpiar Filtros
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Historial */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Historial Médico</span>
                        <Badge variant="outline">
                          {filteredRecords.length} registros
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {filteredRecords.length === 0 ? (
                        <div className="text-center py-12">
                          <FileText className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-vet-gray-900 mb-2">
                            No hay registros
                          </h3>
                          <p className="text-vet-gray-600 mb-4">
                            No se encontraron registros médicos para los filtros
                            aplicados
                          </p>
                          <Button
                            onClick={() => handleAttendAppointment(null)}
                            className="bg-vet-primary hover:bg-vet-primary-dark"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Crear Primera Consulta
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredRecords.map((record, index) => (
                            <div
                              key={record.id || index}
                              className="border border-vet-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4 flex-1">
                                  <div className="flex-shrink-0">
                                    <div
                                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${getBadgeVariant(record.tipoConsulta)}`}
                                    >
                                      {getConsultationIcon(record.tipoConsulta)}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h4 className="font-semibold text-vet-gray-900">
                                        {record.motivo || "Consulta médica"}
                                      </h4>
                                      <Badge
                                        className={getBadgeVariant(
                                          record.tipoConsulta,
                                        )}
                                      >
                                        {record.tipoConsulta.replace("_", " ")}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-vet-gray-600 mb-3">
                                      <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                          {new Date(
                                            record.fecha,
                                          ).toLocaleDateString("es-ES")}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Stethoscope className="w-4 h-4" />
                                        <span>Dr. {record.veterinario}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="capitalize">
                                          {record.estado}
                                        </span>
                                      </div>
                                    </div>
                                    {record.diagnostico && (
                                      <p className="text-sm text-vet-gray-700 mb-2">
                                        <span className="font-medium">
                                          Diagnóstico:
                                        </span>{" "}
                                        {record.diagnostico}
                                      </p>
                                    )}
                                    {record.tratamiento && (
                                      <p className="text-sm text-vet-gray-700 mb-2">
                                        <span className="font-medium">
                                          Tratamiento:
                                        </span>{" "}
                                        {record.tratamiento}
                                      </p>
                                    )}
                                    <div className="flex items-center space-x-4 text-xs text-vet-gray-500">
                                      {record.peso && (
                                        <div className="flex items-center space-x-1">
                                          <Weight className="w-3 h-3" />
                                          <span>{record.peso} kg</span>
                                        </div>
                                      )}
                                      {record.temperatura && (
                                        <div className="flex items-center space-x-1">
                                          <Thermometer className="w-3 h-3" />
                                          <span>{record.temperatura}°C</span>
                                        </div>
                                      )}
                                      {record.medicamentos &&
                                        record.medicamentos.length > 0 && (
                                          <div className="flex items-center space-x-1">
                                            <Pill className="w-3 h-3" />
                                            <span>
                                              {record.medicamentos.length}{" "}
                                              medicamento(s)
                                            </span>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewDetails(record)}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Ver Detalles
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <PawPrint className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-vet-gray-900 mb-2">
                      Selecciona una mascota
                    </h3>
                    <p className="text-vet-gray-600">
                      Elige una mascota de la lista para ver su historial
                      clínico completo
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Modal de detalles */}
          <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {selectedRecord &&
                    getConsultationIcon(selectedRecord.tipoConsulta)}
                  <span>Detalles del Registro Médico</span>
                </DialogTitle>
                <DialogDescription>
                  Información completa de la consulta
                </DialogDescription>
              </DialogHeader>

              {selectedRecord && (
                <div className="space-y-6">
                  {/* Información básica */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-vet-gray-700">
                        Fecha
                      </Label>
                      <p className="text-vet-gray-900">
                        {new Date(selectedRecord.fecha).toLocaleDateString(
                          "es-ES",
                        )}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-vet-gray-700">
                        Veterinario
                      </Label>
                      <p className="text-vet-gray-900">
                        Dr. {selectedRecord.veterinario}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-vet-gray-700">
                        Tipo de Consulta
                      </Label>
                      <Badge
                        className={getBadgeVariant(selectedRecord.tipoConsulta)}
                      >
                        {selectedRecord.tipoConsulta.replace("_", " ")}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-vet-gray-700">
                        Estado
                      </Label>
                      <p className="text-vet-gray-900 capitalize">
                        {selectedRecord.estado}
                      </p>
                    </div>
                  </div>

                  {/* Motivo */}
                  <div>
                    <Label className="text-sm font-medium text-vet-gray-700">
                      Motivo de la Consulta
                    </Label>
                    <p className="text-vet-gray-900 mt-1">
                      {selectedRecord.motivo}
                    </p>
                  </div>

                  {/* Diagnóstico */}
                  {selectedRecord.diagnostico && (
                    <div>
                      <Label className="text-sm font-medium text-vet-gray-700">
                        Diagnóstico
                      </Label>
                      <p className="text-vet-gray-900 mt-1">
                        {selectedRecord.diagnostico}
                      </p>
                    </div>
                  )}

                  {/* Tratamiento */}
                  {selectedRecord.tratamiento && (
                    <div>
                      <Label className="text-sm font-medium text-vet-gray-700">
                        Tratamiento
                      </Label>
                      <p className="text-vet-gray-900 mt-1">
                        {selectedRecord.tratamiento}
                      </p>
                    </div>
                  )}

                  {/* Signos vitales */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {selectedRecord.peso && (
                      <div>
                        <Label className="text-sm font-medium text-vet-gray-700">
                          Peso
                        </Label>
                        <p className="text-vet-gray-900">
                          {selectedRecord.peso} kg
                        </p>
                      </div>
                    )}
                    {selectedRecord.temperatura && (
                      <div>
                        <Label className="text-sm font-medium text-vet-gray-700">
                          Temperatura
                        </Label>
                        <p className="text-vet-gray-900">
                          {selectedRecord.temperatura}°C
                        </p>
                      </div>
                    )}
                    {selectedRecord.presionArterial && (
                      <div>
                        <Label className="text-sm font-medium text-vet-gray-700">
                          Presión Arterial
                        </Label>
                        <p className="text-vet-gray-900">
                          {selectedRecord.presionArterial}
                        </p>
                      </div>
                    )}
                    {selectedRecord.frecuenciaCardiaca && (
                      <div>
                        <Label className="text-sm font-medium text-vet-gray-700">
                          Frecuencia Cardíaca
                        </Label>
                        <p className="text-vet-gray-900">
                          {selectedRecord.frecuenciaCardiaca} bpm
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Medicamentos */}
                  {selectedRecord.medicamentos &&
                    selectedRecord.medicamentos.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-vet-gray-700">
                          Medicamentos Recetados
                        </Label>
                        <div className="mt-2 space-y-2">
                          {selectedRecord.medicamentos.map((med, index) => (
                            <div
                              key={index}
                              className="border border-vet-gray-200 rounded-lg p-3"
                            >
                              <div className="font-medium text-vet-gray-900">
                                {med.nombre}
                              </div>
                              <div className="text-sm text-vet-gray-600 mt-1">
                                <span>Dosis: {med.dosis}</span> •
                                <span> Frecuencia: {med.frecuencia}</span> •
                                <span> Duración: {med.duracion}</span>
                              </div>
                              {med.indicaciones && (
                                <div className="text-sm text-vet-gray-600 mt-1">
                                  <span className="font-medium">
                                    Indicaciones:
                                  </span>{" "}
                                  {med.indicaciones}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Exámenes */}
                  {selectedRecord.examenes &&
                    selectedRecord.examenes.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-vet-gray-700">
                          Exámenes Realizados
                        </Label>
                        <div className="mt-2 space-y-2">
                          {selectedRecord.examenes.map((exam, index) => (
                            <div
                              key={index}
                              className="border border-vet-gray-200 rounded-lg p-3"
                            >
                              <div className="font-medium text-vet-gray-900">
                                {exam.tipo}
                              </div>
                              <div className="text-sm text-vet-gray-600 mt-1">
                                <span className="font-medium">Resultado:</span>{" "}
                                {exam.resultado}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Observaciones */}
                  {selectedRecord.observaciones && (
                    <div>
                      <Label className="text-sm font-medium text-vet-gray-700">
                        Observaciones
                      </Label>
                      <p className="text-vet-gray-900 mt-1">
                        {selectedRecord.observaciones}
                      </p>
                    </div>
                  )}

                  {/* Próxima visita */}
                  {selectedRecord.proximaVisita && (
                    <div>
                      <Label className="text-sm font-medium text-vet-gray-700">
                        Próxima Visita
                      </Label>
                      <p className="text-vet-gray-900 mt-1">
                        {new Date(
                          selectedRecord.proximaVisita,
                        ).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
}
