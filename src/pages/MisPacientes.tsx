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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Clock,
  PawPrint,
  FileText,
  User,
  Phone,
  Search,
  Plus,
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

  // Crear lista de mascotas únicas con información esencial
  const mascotasUnicas = useMemo(() => {
    const mascotasMap = new Map();

    enhancedCitas.forEach(({ cita, mascota, propietario }) => {
      const mascotaKey = mascota?.id || cita.mascota.toLowerCase();
      
      if (!mascotasMap.has(mascotaKey)) {
        // Encontrar próxima cita
        const proximasCitas = enhancedCitas
          .filter(({ cita: c, mascota: m }) => 
            (m?.id === mascota?.id || c.mascota.toLowerCase() === cita.mascota.toLowerCase()) &&
            new Date(c.fecha) > new Date() &&
            c.estado === "aceptada"
          )
          .sort((a, b) => new Date(a.cita.fecha).getTime() - new Date(b.cita.fecha).getTime());

        mascotasMap.set(mascotaKey, {
          id: mascota?.id || `temp-${cita.mascota}`,
          nombre: cita.mascota,
          especie: mascota?.especie || cita.especie || "No especificado",
          foto: mascota?.foto,
          propietario: propietario,
          proximaCita: proximasCitas[0]?.cita || null,
          ultimaVisita: cita,
          citasCount: enhancedCitas.filter(({ cita: c, mascota: m }) => 
            m?.id === mascota?.id || c.mascota.toLowerCase() === cita.mascota.toLowerCase()
          ).length
        });
      }
    });

    return Array.from(mascotasMap.values());
  }, [enhancedCitas]);

  // Aplicar filtros
  const filteredMascotas = useMemo(() => {
    let filtered = mascotasUnicas;

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(mascota =>
        mascota.nombre.toLowerCase().includes(search) ||
        mascota.propietario?.nombre.toLowerCase().includes(search) ||
        mascota.especie.toLowerCase().includes(search)
      );
    }

    if (filterOwner !== "todos") {
      filtered = filtered.filter(mascota => mascota.propietario?.id === filterOwner);
    }

    if (filterEspecie !== "todos") {
      filtered = filtered.filter(mascota => mascota.especie === filterEspecie);
    }

    return filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [mascotasUnicas, searchTerm, filterOwner, filterEspecie]);

  // Enhanced statistics
  const stats = useMemo(() => {
    const citasStats = getCitasStats(enhancedCitas);
    return {
      total: citasStats.total,
      hoy: citasStats.hoy,
      proximas: citasStats.proximas,
      pendientes: citasStats.pendientes,
      completadas: citasStats.completadas,
      urgentes: citasStats.urgentes,
      mascotasUnicas: mascotasUnicas.length,
      propietariosUnicos: misClientes.length,
    };
  }, [enhancedCitas, mascotasUnicas.length, misClientes.length]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleViewHistory = (mascota: any) => {
    if (mascota.propietario) {
      navigate(
        `/historial-clinico-veterinario?view=history&ownerId=${mascota.propietario.id}&petId=${mascota.id}`,
      );
    } else {
      navigate(
        `/historial-clinico-veterinario?view=history&petName=${encodeURIComponent(mascota.nombre)}&especie=${encodeURIComponent(mascota.especie)}`,
      );
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
                  <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-vet-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-vet-gray-900">
                    Mis Pacientes
                  </h1>
                  <p className="text-sm sm:text-base text-vet-gray-600">
                    Gestiona tus pacientes y su historial médico
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats mejoradas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-vet-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PawPrint className="w-4 h-4 sm:w-5 sm:h-5 text-vet-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl font-bold text-vet-primary">
                      {stats.mascotasUnicas}
                    </p>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Mascotas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl font-bold text-blue-600">
                      {stats.propietariosUnicos}
                    </p>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Propietarios
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
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
          </div>

          {/* Filtros simplificados */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                  <Input
                    placeholder="Buscar mascota, dueño..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterOwner} onValueChange={setFilterOwner}>
                  <SelectTrigger>
                    <User className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Dueño" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Dueño</SelectItem>
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
                    <SelectItem value="todos">Especie</SelectItem>
                    {especiesUnicas.map((especie) => (
                      <SelectItem key={especie} value={especie}>
                        {especie}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(filterOwner !== "todos" ||
                filterEspecie !== "todos" ||
                searchTerm) && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-vet-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-vet-gray-600">
                    <Filter className="w-4 h-4" />
                    <span>
                      {filteredMascotas.length} mascota{filteredMascotas.length !== 1 ? "s" : ""} encontrada{filteredMascotas.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterOwner("todos");
                      setFilterEspecie("todos");
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

          {/* Lista simplificada de mascotas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMascotas.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-12 text-center">
                    <PawPrint className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                      No hay mascotas
                    </h3>
                    <p className="text-vet-gray-600">
                      No se encontraron mascotas que coincidan con los filtros
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              filteredMascotas.map((mascota) => (
                <Card
                  key={mascota.id}
                  className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-vet-primary"
                >
                  <CardContent className="p-4">
                    {/* Header con foto y nombre */}
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-12 h-12 bg-vet-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        {mascota.foto ? (
                          <img
                            src={mascota.foto}
                            alt={mascota.nombre}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <PawPrint className="w-6 h-6 text-vet-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-vet-gray-900 truncate">
                          {mascota.nombre}
                        </h4>
                        <p className="text-sm text-vet-gray-600">
                          {mascota.especie}
                        </p>
                      </div>
                    </div>

                    {/* Información del propietario */}
                    <div className="mb-4 p-3 bg-vet-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-vet-primary" />
                        <span className="font-medium text-vet-gray-900">
                          {mascota.propietario?.nombre || "Sin propietario"}
                        </span>
                      </div>
                      {mascota.propietario?.telefono && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Phone className="w-3 h-3 text-vet-gray-600" />
                          <span className="text-sm text-vet-gray-600">
                            {mascota.propietario.telefono}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Próxima cita */}
                    <div className="mb-4">
                      {mascota.proximaCita ? (
                        <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-900">
                              Próxima cita
                            </p>
                            <p className="text-xs text-green-700">
                              {new Date(mascota.proximaCita.fecha).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })} a las {new Date(mascota.proximaCita.fecha).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                            {mascota.proximaCita.tipoConsulta && (
                              <Badge className="bg-green-100 text-green-800 text-xs mt-1">
                                {mascota.proximaCita.tipoConsulta}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <p className="text-sm text-gray-600">
                            Sin citas programadas
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Botón de historial */}
                    <Button
                      onClick={() => handleViewHistory(mascota)}
                      className="w-full bg-vet-primary hover:bg-vet-primary-dark"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Ver Historial Médico
                    </Button>

                    {/* Info adicional */}
                    <div className="mt-3 text-xs text-vet-gray-500 text-center">
                      {mascota.citasCount} cita{mascota.citasCount !== 1 ? 's' : ''} registrada{mascota.citasCount !== 1 ? 's' : ''}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
