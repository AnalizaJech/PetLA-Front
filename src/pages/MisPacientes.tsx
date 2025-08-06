import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import Layout from "@/components/Layout";
import CitaDetailModal from "@/components/CitaDetailModal";
import CitaAttendModal from "@/components/CitaAttendModal";
import {
  enhanceMultipleCitas,
  filterCitas,
  sortCitas,
  getCitasStats,
  validateCitaData,
  getUrgencyLevel,
  type CitaFilter,
  type SortBy,
  type CitaRelationData,
} from "@/lib/citaUtils";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
  Calendar,
  Calendar as CalendarIcon,
  Clock,
  PawPrint,
  FileText,
  User,
  Phone,
  Search,
  Plus,
  Save,
  Eye,
  CheckCircle,
  AlertCircle,
  Filter,
  UserCheck,
  Mail,
  MapPin,
  Edit3,
  Activity,
  Heart,
  Thermometer,
  Weight,
  CalendarPlus,
  Pill,
  ClipboardList,
  Info,
  UserX,
  X,
} from "lucide-react";

const estadoColors = {
  pendiente_pago: "bg-yellow-100 text-yellow-800 border-yellow-200",
  en_validacion: "bg-gray-100 text-gray-800 border-gray-200",
  aceptada: "bg-green-100 text-green-800 border-green-200",
  atendida: "bg-gray-100 text-gray-800 border-gray-200",
  cancelada: "bg-red-100 text-red-800 border-red-200",
  expirada: "bg-red-100 text-red-800 border-red-200",
  rechazada: "bg-red-100 text-red-800 border-red-200",
  no_asistio: "bg-orange-100 text-orange-800 border-orange-200",
};

const estadoLabels = {
  pendiente_pago: "Pendiente de Pago",
  en_validacion: "En Validación",
  aceptada: "Confirmada",
  atendida: "Completada",
  cancelada: "Cancelada",
  expirada: "Expirada",
  rechazada: "Rechazada",
  no_asistio: "No Asistió",
};

const estadoIcons = {
  pendiente_pago: Clock,
  en_validacion: AlertCircle,
  aceptada: CheckCircle,
  atendida: CheckCircle,
  cancelada: X,
  expirada: AlertCircle,
  rechazada: X,
  no_asistio: UserX,
};

export default function MisPacientes() {
  const {
    citas,
    usuarios,
    mascotas,
    updateCita,
    user,
    addHistorialEntry,
    historialClinico,
    validateDataRelationships,
    getMascotaWithOwner,
    getCitaWithRelations,
    repairDataIntegrity,
  } = useAppContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Debug: verificar datos del contexto
  console.log("MisPacientes - Datos del contexto:", {
    citasCount: citas?.length || 0,
    mascotasCount: mascotas?.length || 0,
    usuariosCount: usuarios?.length || 0,
    user: user?.nombre,
  });

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOwner, setFilterOwner] = useState("todos");
  const [filterEspecie, setFilterEspecie] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [sortBy, setSortBy] = useState<SortBy>("fecha_desc");
  const [showDataIssues, setShowDataIssues] = useState(false);

  // Estados para modales
  const [selectedCita, setSelectedCita] = useState<CitaRelationData | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAttendModalOpen, setIsAttendModalOpen] = useState(false);

  // Estados limpios - la funcionalidad de consulta está en el modal reutilizable

  if (!user || user.rol !== "veterinario") {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <Stethoscope className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
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

  // Procesar datos con utilidades mejoradas
  const misCitas = useMemo(
    () => citas.filter((cita) => cita.veterinario === user.nombre),
    [citas, user.nombre],
  );

  // Validar integridad de datos con mejoras
  const {
    valid: validCitas,
    invalid: invalidCitas,
    fixable: fixableCitas,
  } = useMemo(
    () => validateCitaData(misCitas, mascotas, usuarios),
    [misCitas, mascotas, usuarios],
  );

  // Mejorar citas con información relacionada
  const enhancedCitas = useMemo(
    () => enhanceMultipleCitas(misCitas, mascotas, usuarios, historialClinico),
    [misCitas, mascotas, usuarios, historialClinico],
  );

  // Obtener clientes únicos del veterinario
  const misClientes = useMemo(() => {
    const clienteIds = new Set(
      enhancedCitas.map(({ propietario }) => propietario?.id).filter(Boolean),
    );
    return usuarios.filter((usuario) => clienteIds.has(usuario.id));
  }, [enhancedCitas, usuarios]);

  // Obtener especies únicas
  const especiesUnicas = useMemo(() => {
    const especies = new Set(
      enhancedCitas.map(({ mascota }) => mascota?.especie).filter(Boolean),
    );
    return Array.from(especies);
  }, [enhancedCitas]);

  // Aplicar filtros usando utilidades mejoradas
  const filteredCitas = useMemo(() => {
    let filtered = enhancedCitas;

    // Aplicar filtros
    const filter: CitaFilter = {
      ...(filterOwner !== "todos" && { propietarioId: filterOwner }),
      ...(filterEspecie !== "todos" && { especie: filterEspecie }),
      ...(filterEstado !== "todos" && { estado: filterEstado as any }),
      ...(searchTerm.trim() && { searchTerm }),
    };

    filtered = filterCitas(filtered, filter);

    // Ordenar resultados
    return sortCitas(filtered, sortBy);
  }, [
    enhancedCitas,
    filterOwner,
    filterEspecie,
    filterEstado,
    searchTerm,
    sortBy,
  ]);

  // Enhanced statistics with data validation
  const stats = useMemo(() => {
    const citasStats = getCitasStats(enhancedCitas);
    const dataValidation = validateDataRelationships();

    // Filter validation results to only include this veterinarian's patients
    const myDataIssues = {
      orphanedPets: dataValidation.orphanedPets.filter((pet) =>
        misCitas.some(
          (cita) =>
            cita.mascota.toLowerCase() === pet.nombre.toLowerCase() ||
            cita.mascotaId === pet.id,
        ),
      ).length,
      incompleteCitas: dataValidation.incompleteCitas.filter(
        (cita) => cita.veterinario === user?.nombre,
      ).length,
      ghostPets: dataValidation.ghostPets.filter((nombre) =>
        misCitas.some((cita) => cita.mascota === nombre),
      ).length,
    };

    return {
      total: citasStats.total,
      hoy: citasStats.hoy,
      proximas: citasStats.proximas,
      pendientes: citasStats.pendientes,
      completadas: citasStats.completadas,
      urgentes: citasStats.urgentes,
      sinPropietario: myDataIssues.orphanedPets,
      sinMascota: myDataIssues.ghostPets,
      problemasData:
        myDataIssues.orphanedPets +
        myDataIssues.incompleteCitas +
        myDataIssues.ghostPets,
      propietariosUnicos: citasStats.propietariosUnicos,
      mascotasUnicas: citasStats.mascotasUnicas,
      citasIncompletas: myDataIssues.incompleteCitas,
    };
  }, [enhancedCitas, validateDataRelationships, misCitas, user?.nombre]);


  useEffect(() => {
    window.scrollTo(0, 0);

    // Verificar si hay una cita específica en la URL
    const citaId = searchParams.get("cita");
    if (citaId) {
      const enhancedCita = enhancedCitas.find(({ cita }) => cita.id === citaId);
      if (enhancedCita && enhancedCita.cita.veterinario === user?.nombre) {
        setSelectedCita(enhancedCita);
        setIsDetailModalOpen(true);
      }
    }
  }, [searchParams, enhancedCitas, user]);

  const handleViewDetail = (citaData: CitaRelationData) => {
    setSelectedCita(citaData);
    setIsDetailModalOpen(true);
    // Actualizar URL sin recargar la página
    setSearchParams({ cita: citaData.cita.id });
  };

  const handleAttendCita = (citaData: CitaRelationData) => {
    setSelectedCita(citaData);
    setIsAttendModalOpen(true);
  };

  // La funcionalidad de guardar consulta está ahora en CitaAttendModal

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCita(null);
    // Limpiar parámetro de URL
    setSearchParams({});
  };

  const getUrgencyBadge = (urgencyLevel: "alta" | "media" | "baja") => {
    const configs = {
      alta: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Urgente",
        icon: AlertCircle,
      },
      media: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Moderada",
        icon: Clock,
      },
      baja: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Normal",
        icon: Info,
      },
    };

    const config = configs[urgencyLevel];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
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
                  <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-vet-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-vet-gray-900">
                    Mis Pacientes
                  </h1>
                  <p className="text-sm sm:text-base text-vet-gray-600">
                    Gestiona las citas y consultas de tus pacientes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats mejoradas */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-vet-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-vet-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl font-bold text-vet-primary">
                      {stats.total}
                    </p>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl font-bold text-gray-600">
                      {stats.hoy}
                    </p>
                    <p className="text-xs sm:text-sm text-vet-gray-600">Hoy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl font-bold text-green-600">
                      {stats.proximas}
                    </p>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Próximas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl font-bold text-yellow-600">
                      {stats.pendientes}
                    </p>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Pendientes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl font-bold text-gray-600">
                      {stats.completadas}
                    </p>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Completadas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl font-bold text-red-600">
                      {stats.urgentes}
                    </p>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Urgentes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas sobre problemas de datos */}
          {(invalidCitas.length > 0 || fixableCitas.length > 0) && (
            <div className="space-y-4 mb-6">
              {/* Problemas críticos */}
              {invalidCitas.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>
                      Se detectaron {invalidCitas.length} citas con problemas
                      críticos.
                    </strong>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setShowDataIssues(!showDataIssues)}
                      className="text-red-800 underline p-0 ml-2"
                    >
                      {showDataIssues ? "Ocultar" : "Ver detalles"}
                    </Button>
                    {showDataIssues && (
                      <div className="mt-2 space-y-1">
                        {invalidCitas.slice(0, 3).map(({ cita, issues }) => (
                          <div key={cita.id} className="text-sm">
                            • <strong>{cita.mascota}</strong>:{" "}
                            {issues.join(", ")}
                          </div>
                        ))}
                        {invalidCitas.length > 3 && (
                          <div className="text-sm">
                            ... y {invalidCitas.length - 3} más
                          </div>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Información sobre mascotas no registradas - Solo informativo */}
              {stats.sinMascota > 0 && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <div>
                      <strong>
                        {stats.sinMascota} citas tienen mascotas que requieren registro.
                      </strong>
                      <div className="mt-2 text-sm">
                        Las mascotas deben ser registradas por sus propietarios antes de la consulta.
                        Como veterinario, puede proceder con la atención utilizando los datos básicos de la cita.
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Stats adicionales con más detalles */}
          {(stats.sinPropietario > 0 ||
            stats.sinMascota > 0 ||
            stats.problemasData > 0) && (
            <div className="space-y-3 mb-6">
              {stats.sinPropietario > 0 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <User className="w-4 h-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>{stats.sinPropietario} citas</strong> no tienen
                    propietario asignado correctamente.
                  </AlertDescription>
                </Alert>
              )}

              {stats.sinMascota > 0 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <PawPrint className="w-4 h-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>{stats.sinMascota} citas</strong> tienen mascotas no
                    registradas en el sistema.
                  </AlertDescription>
                </Alert>
              )}

              {stats.citasIncompletas > 0 && (
                <Alert className="border-purple-200 bg-purple-50">
                  <Info className="w-4 h-4 text-purple-600" />
                  <AlertDescription className="text-purple-800">
                    <strong>{stats.citasIncompletas} citas</strong> tienen
                    información de relación incompleta.
                  </AlertDescription>
                </Alert>
              )}

              {stats.problemasData > 0 && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Resumen:{" "}
                    <strong>
                      {stats.propietariosUnicos} propietarios únicos
                    </strong>
                    ,<strong> {stats.mascotasUnicas} mascotas únicas</strong> en{" "}
                    {stats.total} citas.
                    {stats.problemasData > 0 && (
                      <>
                        <br />
                        Total de problemas detectados:{" "}
                        <strong>{stats.problemasData}</strong>
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Filtros mejorados */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                  <Input
                    placeholder="Buscar por mascota, dueño, motivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterOwner} onValueChange={setFilterOwner}>
                  <SelectTrigger>
                    <User className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Propietario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {misClientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterEspecie} onValueChange={setFilterEspecie}>
                  <SelectTrigger>
                    <PawPrint className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Especie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    {especiesUnicas.map((especie) => (
                      <SelectItem key={especie} value={especie}>
                        {especie}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterEstado} onValueChange={setFilterEstado}>
                  <SelectTrigger>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="aceptada">Confirmadas</SelectItem>
                    <SelectItem value="atendida">Completadas</SelectItem>
                    <SelectItem value="en_validacion">En validación</SelectItem>
                    <SelectItem value="pendiente_pago">
                      Pendiente pago
                    </SelectItem>
                    <SelectItem value="cancelada">Canceladas</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fecha_desc">Fecha ↓</SelectItem>
                    <SelectItem value="fecha_asc">Fecha ↑</SelectItem>
                    <SelectItem value="urgencia">Urgencia</SelectItem>
                    <SelectItem value="mascota">Mascota A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(filterOwner !== "todos" ||
                filterEspecie !== "todos" ||
                filterEstado !== "todos" ||
                searchTerm) && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-vet-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-vet-gray-600">
                    <Filter className="w-4 h-4" />
                    <span>
                      Filtros activos: {filteredCitas.length} resultado
                      {filteredCitas.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterOwner("todos");
                      setFilterEspecie("todos");
                      setFilterEstado("todos");
                      setSearchTerm("");
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de citas */}
          <div className="space-y-4">
            {filteredCitas.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Stethoscope className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                    No hay pacientes
                  </h3>
                  <p className="text-vet-gray-600">
                    No se encontraron citas que coincidan con los filtros
                    seleccionados
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredCitas.map((citaData) => {
                const { cita, mascota, propietario, urgencyLevel } = citaData;
                const StatusIcon = estadoIcons[cita.estado];

                return (
                  <Card
                    key={cita.id}
                    className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-vet-primary"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0 gap-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-vet-primary/10 rounded-full flex items-center justify-center flex-shrink-0 relative">
                            {mascota?.foto ? (
                              <img
                                src={mascota.foto}
                                alt={`${cita.mascota}`}
                                className="w-full h-full rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  e.currentTarget.nextElementSibling?.classList.remove(
                                    "hidden",
                                  );
                                }}
                              />
                            ) : null}
                            <PawPrint
                              className={`w-6 h-6 text-vet-primary ${mascota?.foto ? "hidden" : ""}`}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <h4 className="font-bold text-lg text-vet-gray-900">
                                {cita.mascota}
                              </h4>
                              <Badge
                                variant="secondary"
                                className={estadoColors[cita.estado]}
                              >
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {estadoLabels[cita.estado]}
                              </Badge>
                              {getUrgencyBadge(urgencyLevel)}
                            </div>

                            {/* Información del propietario - Mejorada */}
                            <div
                              className={`p-3 rounded-lg mb-3 ${
                                propietario
                                  ? "bg-vet-gray-50 border border-vet-gray-200"
                                  : "bg-red-50 border border-red-200"
                              }`}
                            >
                              <div className="flex items-center space-x-2 mb-2">
                                {propietario ? (
                                  <UserCheck className="w-4 h-4 text-vet-primary" />
                                ) : (
                                  <UserX className="w-4 h-4 text-red-600" />
                                )}
                                <span
                                  className={`font-medium ${
                                    propietario
                                      ? "text-vet-gray-900"
                                      : "text-red-900"
                                  }`}
                                >
                                  Propietario:{" "}
                                  {propietario?.nombre || "Sin asignar"}
                                </span>
                                {!propietario && (
                                  <Badge className="bg-red-100 text-red-800 border-red-200">
                                    Requiere atención
                                  </Badge>
                                )}
                              </div>
                              {propietario ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-vet-gray-600">
                                  {propietario.telefono && (
                                    <div className="flex items-center space-x-2">
                                      <Phone className="w-3 h-3" />
                                      <span>{propietario.telefono}</span>
                                    </div>
                                  )}
                                  {propietario.email && (
                                    <div className="flex items-center space-x-2">
                                      <Mail className="w-3 h-3" />
                                      <span>{propietario.email}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-2 text-xs text-vet-gray-500">
                                    <Info className="w-3 h-3" />
                                    <span>ID: {propietario.id}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-red-600">
                                  Esta mascota necesita ser asignada a un
                                  propietario
                                </div>
                              )}
                            </div>

                            {/* Informaci��n de la mascota */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <PawPrint className="w-4 h-4 text-vet-gray-600" />
                                  <span>
                                    <strong>Especie:</strong>{" "}
                                    {mascota?.especie ||
                                      cita.especie ||
                                      "No especificado"}
                                  </span>
                                  {!mascota && (
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                    Pendiente registro
                                  </Badge>
                                )}
                                </div>
                                {/* Always show breed information if available, even for unregistered pets */}
                                <div className="flex items-center space-x-2">
                                  <Info className="w-4 h-4 text-vet-gray-600" />
                                  <span>
                                    <strong>Raza:</strong>{" "}
                                    {mascota?.raza || "No especificada"}
                                    {!mascota?.raza && (
                                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs ml-2">
                                        Sin registrar
                                      </Badge>
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-vet-gray-600" />
                                  <span>
                                    <strong>Fecha:</strong>{" "}
                                    {new Date(cita.fecha).toLocaleDateString(
                                      "es-ES",
                                      {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      },
                                    )}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-vet-gray-600" />
                                  <span>
                                    <strong>Hora:</strong>{" "}
                                    {new Date(cita.fecha).toLocaleTimeString(
                                      "es-ES",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-start space-x-2">
                                  <FileText className="w-4 h-4 text-vet-gray-600 mt-0.5" />
                                  <span>
                                    <strong>Motivo:</strong> {cita.motivo}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2 lg:ml-4 lg:flex-shrink-0 lg:min-w-[140px] w-full sm:w-auto lg:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(citaData)}
                            className="h-9 text-xs sm:text-sm w-full sm:flex-1 lg:w-full"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="truncate">Ver Detalle</span>
                          </Button>

                          {cita.estado === "aceptada" && (
                            <Button
                              size="sm"
                              onClick={() => handleAttendCita(citaData)}
                              className="bg-vet-primary hover:bg-vet-primary-dark h-9 text-xs sm:text-sm w-full sm:flex-1 lg:w-full"
                            >
                              <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              <span className="truncate">Atender</span>
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (mascota) {
                                navigate(
                                  `/historial-clinico-veterinario?view=history&ownerId=${propietario?.id || "unknown"}&petId=${mascota.id}`,
                                );
                              } else {
                                // Fallback para cuando no hay mascota, usar datos de la cita
                                navigate(
                                  `/historial-clinico-veterinario?view=history&petName=${encodeURIComponent(cita.mascota)}&especie=${encodeURIComponent(cita.especie)}`,
                                );
                              }
                            }}
                            className="h-9 text-xs sm:text-sm w-full sm:flex-1 lg:w-full"
                          >
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="truncate">Historial</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Modales reutilizables */}
          <CitaDetailModal
            isOpen={isDetailModalOpen}
            onClose={closeDetailModal}
            selectedCita={selectedCita}
            onAttendCita={handleAttendCita}
          />

          <CitaAttendModal
            isOpen={isAttendModalOpen}
            onClose={() => setIsAttendModalOpen(false)}
            selectedCita={selectedCita}
            onSave={() => {
              // Los datos se actualizan automáticamente por el contexto
            }}
          />
        </div>
      </div>
    </Layout>
  );
}
