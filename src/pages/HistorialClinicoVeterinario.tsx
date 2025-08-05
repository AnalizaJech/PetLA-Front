import { useState, useEffect, useMemo } from "react";
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
  UserX,
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
    validateDataRelationships,
    getCitaWithRelations,
    getMascotaWithOwner,
    repairDataIntegrity,
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
  const [selectedPetByName, setSelectedPetByName] = useState(
    searchParams.get("nombre") || "",
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

  // Get my appointments as veterinarian
  const misCitas = useMemo(
    () => citas.filter((cita) => cita.veterinario === user.nombre),
    [citas, user.nombre],
  );

  // Get pets related to my appointments with enhanced matching
  const misMascotas = useMemo(() => {
    const mascotasEncontradas = new Set<string>();
    const mascotasValidas: Mascota[] = [];

    misCitas.forEach((cita) => {
      // First try to find by mascotaId if available
      if (cita.mascotaId && !mascotasEncontradas.has(cita.mascotaId)) {
        const mascota = mascotas.find((m) => m.id === cita.mascotaId);
        if (mascota) {
          mascotasValidas.push(mascota);
          mascotasEncontradas.add(cita.mascotaId);
          return;
        }
      }

      // Fallback to name matching
      const mascotaPorNombre = mascotas.find((m) => {
        const nombreCoincide =
          m.nombre.toLowerCase() === cita.mascota.toLowerCase();
        return nombreCoincide && !mascotasEncontradas.has(m.id);
      });

      if (mascotaPorNombre) {
        mascotasValidas.push(mascotaPorNombre);
        mascotasEncontradas.add(mascotaPorNombre.id);
      }
    });

    return mascotasValidas;
  }, [misCitas, mascotas]);

  // Validate data relationships
  const dataValidation = useMemo(() => {
    const validation = validateDataRelationships();

    // Filter to only my patients
    const myOrphanedPets = validation.orphanedPets.filter((pet) =>
      misCitas.some(
        (cita) =>
          cita.mascota.toLowerCase() === pet.nombre.toLowerCase() ||
          cita.mascotaId === pet.id,
      ),
    );

    const myIncompleteCitas = validation.incompleteCitas.filter(
      (cita) => cita.veterinario === user.nombre,
    );

    const myGhostPets = validation.ghostPets.filter((nombre) =>
      misCitas.some((cita) => cita.mascota === nombre),
    );

    return {
      orphanedPets: myOrphanedPets,
      incompleteCitas: myIncompleteCitas,
      ghostPets: myGhostPets,
      totalIssues:
        myOrphanedPets.length + myIncompleteCitas.length + myGhostPets.length,
    };
  }, [validateDataRelationships, misCitas, user.nombre]);

  // Enhanced ghost pets detection with more details
  const mascotasFantasma = useMemo(() => {
    return dataValidation.ghostPets.map((nombre) => {
      const citasRelacionadas = misCitas.filter((c) => c.mascota === nombre);
      const ultimaCita = citasRelacionadas.sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      )[0];

      return {
        nombre,
        especie: ultimaCita?.especie || "Desconocida",
        citasRelacionadas: citasRelacionadas.length,
        ultimaCita: ultimaCita?.fecha,
        clienteId: ultimaCita?.clienteId,
        clienteNombre: ultimaCita?.clienteNombre,
      };
    });
  }, [dataValidation.ghostPets, misCitas]);

  // Debug: verificar datos disponibles
  console.log("HistorialClinicoVeterinario - Datos disponibles:", {
    misCitasCount: misCitas.length,
    misMascotasCount: misMascotas.length,
    historialClinicoCount: historialClinico.length,
    selectedMascotaId: selectedMascota,
    dataIssues: dataValidation.totalIssues,
    orphanedPets: dataValidation.orphanedPets.length,
    ghostPets: dataValidation.ghostPets.length,
  });

  // Get unique clients with enhanced validation
  const misClientes = useMemo(() => {
    const clienteIds = new Set<string>();

    // Add clients from properly linked pets
    misMascotas.forEach((mascota) => {
      const { propietario } = getMascotaWithOwner(mascota.id);
      if (propietario && propietario.rol === "cliente") {
        clienteIds.add(propietario.id);
      }
    });

    // Add clients from appointments with client information
    misCitas.forEach((cita) => {
      if (cita.clienteId) {
        const cliente = usuarios.find(
          (u) => u.id === cita.clienteId && u.rol === "cliente",
        );
        if (cliente) {
          clienteIds.add(cliente.id);
        }
      }
    });

    return usuarios.filter((u) => clienteIds.has(u.id));
  }, [misMascotas, misCitas, usuarios, getMascotaWithOwner]);

  // Detect pets without valid owners (enhanced)
  const mascotasSinPropietario = useMemo(() => {
    return misMascotas.filter((mascota) => {
      const { propietario } = getMascotaWithOwner(mascota.id);
      return !propietario;
    });
  }, [misMascotas, getMascotaWithOwner]);

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
    } else {
      // Si no hay mascota registrada pero tenemos datos de URL, crear entrada temporal para mostrar historial
      const especieBuscada = searchParams.get("especie");
      if (nombreMascota && especieBuscada) {
        console.log("Creating temporary pet entry for clinical history view:", {
          nombre: nombreMascota,
          especie: especieBuscada
        });
      }
    }
  }

  const clienteSeleccionado = mascotaSeleccionada
    ? usuarios.find((u) => u.id === mascotaSeleccionada.clienteId)
    : null;
  // Get clinical history for selected pet, including by name if pet is not registered
  const historialMascota = useMemo(() => {
    if (mascotaSeleccionada) {
      return getHistorialByMascota(mascotaSeleccionada.id);
    }

    // Search clinical history by pet name for unregistered pets
    const nombreBuscado = selectedPetByName || searchParams.get("nombre");
    if (nombreBuscado) {
      return historialClinico.filter(entry =>
        entry.mascotaNombre.toLowerCase() === nombreBuscado.toLowerCase()
      );
    }

    return [];
  }, [mascotaSeleccionada, selectedPetByName, searchParams, historialClinico, getHistorialByMascota]);

  // Debug: verificar mascota seleccionada y su historial
  console.log("HistorialClinicoVeterinario - Mascota seleccionada:", {
    searchedById: selectedMascota,
    searchedByName: searchParams.get("nombre"),
    mascotaSeleccionada,
    clienteSeleccionado,
    historialCount: historialMascota.length,
    historialData: historialMascota,
    mascotasFantasma: mascotasFantasma.length,
    mascotasSinPropietario: mascotasSinPropietario.length,
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
    if (!selectedMascota && !selectedPetByName && !searchParams.get("nombre"))
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

                  {/* Breadcrumb for current selection */}
                  {(selectedMascota || selectedPetByName || searchParams.get("nombre")) && (
                    <div className="flex items-center space-x-2 mt-2 text-sm text-vet-gray-500">
                      <span>Viendo:</span>
                      <ChevronRight className="w-3 h-3" />
                      <span className="font-medium text-vet-primary">
                        {mascotaSeleccionada?.nombre || selectedPetByName || searchParams.get("nombre")}
                      </span>
                      {!mascotaSeleccionada && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          No registrada
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => navigate("/mis-pacientes")}
                  variant="outline"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Mis Pacientes
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Panel izquierdo - Lista de mascotas */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <PawPrint className="w-5 h-5 text-vet-primary" />
                      <span>Mis Pacientes</span>
                    </div>
                    <Badge variant="outline">
                      {misMascotas.length} registradas
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Selecciona una mascota para ver su historial
                  </CardDescription>

                  {/* Enhanced alerts about data problems */}
                  {dataValidation.totalIssues > 0 && (
                    <div className="space-y-2">
                      {dataValidation.orphanedPets.length > 0 && (
                        <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded border">
                          ⚠️ {dataValidation.orphanedPets.length} mascotas sin
                          propietario válido
                        </div>
                      )}
                      {dataValidation.ghostPets.length > 0 && (
                        <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border">
                          👻 {dataValidation.ghostPets.length} mascotas en citas
                          pero no registradas
                        </div>
                      )}
                      {dataValidation.incompleteCitas.length > 0 && (
                        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border">
                          🔗 {dataValidation.incompleteCitas.length} citas con
                          información incompleta
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const result = repairDataIntegrity();
                          console.log("Data repair result:", result);
                          window.location.reload(); // Refresh to see the repaired data
                        }}
                        className="w-full text-xs mt-2"
                      >
                        🔧 Reparar Datos
                      </Button>
                    </div>
                  )}
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
                        {mascotasFantasma.length > 0 && (
                          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <p className="text-xs text-orange-800 font-medium mb-2">
                              Mascotas en citas pero no registradas en el
                              sistema:
                            </p>
                            {mascotasFantasma.map((fantasma, index) => (
                              <button
                                key={index}
                                onClick={() => setSelectedPetByName(fantasma.nombre)}
                                className="w-full text-left text-xs text-orange-700 mb-1 p-2 rounded hover:bg-orange-200 transition-colors"
                              >
                                • <strong>{fantasma.nombre}</strong> (
                                {fantasma.especie})
                                <br />
                                &nbsp;&nbsp;{fantasma.citasRelacionadas} citas
                                {fantasma.clienteNombre && (
                                  <span>
                                    {" "}
                                    - Cliente: {fantasma.clienteNombre}
                                  </span>
                                )}
                                {fantasma.ultimaCita && (
                                  <span>
                                    {" "}
                                    - Última:{" "}
                                    {new Date(
                                      fantasma.ultimaCita,
                                    ).toLocaleDateString("es-ES")}
                                  </span>
                                )}
                                <br />
                                <span className="text-orange-600 text-xs">
                                  👆 Click para ver historial
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      filteredMascotas.map((mascota) => {
                        const cliente = usuarios.find(
                          (u) => u.id === mascota.clienteId,
                        );
                        const isSelected = selectedMascota === mascota.id;
                        const tienePropietarioValido =
                          cliente && cliente.rol === "cliente";

                        return (
                          <button
                            key={mascota.id}
                            onClick={() => setSelectedMascota(mascota.id)}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              isSelected
                                ? "border-vet-primary bg-vet-primary/5 shadow-sm"
                                : tienePropietarioValido
                                  ? "border-vet-gray-200 hover:border-vet-primary/50 hover:bg-vet-gray-50"
                                  : "border-yellow-200 bg-yellow-50 hover:bg-yellow-100"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center relative ${
                                  isSelected
                                    ? "bg-vet-primary/20"
                                    : tienePropietarioValido
                                      ? "bg-vet-gray-100"
                                      : "bg-yellow-100"
                                }`}
                              >
                                <PawPrint
                                  className={`w-5 h-5 ${
                                    isSelected
                                      ? "text-vet-primary"
                                      : tienePropietarioValido
                                        ? "text-vet-gray-500"
                                        : "text-yellow-600"
                                  }`}
                                />
                                {!tienePropietarioValido && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-2 h-2 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-vet-gray-900 text-sm">
                                  {mascota.nombre}
                                </p>
                                <p className="text-xs text-vet-gray-600">
                                  {mascota.especie} • {mascota.raza}
                                </p>
                                <p
                                  className={`text-xs font-medium ${
                                    tienePropietarioValido
                                      ? "text-vet-primary"
                                      : "text-yellow-600"
                                  }`}
                                >
                                  Dueño:{" "}
                                  {tienePropietarioValido
                                    ? cliente.nombre
                                    : "⚠️ Sin asignar"}
                                </p>
                                {!tienePropietarioValido && (
                                  <p className="text-xs text-yellow-600">
                                    ID cliente:{" "}
                                    {mascota.clienteId || "No definido"}
                                  </p>
                                )}
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
              {(selectedMascota && mascotaSeleccionada) || selectedPetByName || (searchParams.get("nombre") && historialMascota.length > 0) ? (
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
                              {mascotaSeleccionada?.nombre || selectedPetByName || searchParams.get("nombre")}
                              {!mascotaSeleccionada && (selectedPetByName || searchParams.get("nombre")) && (
                                <span className="ml-3 text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                                  No registrada en el sistema
                                </span>
                              )}
                            </h2>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-vet-gray-600">
                                {mascotaSeleccionada?.especie || searchParams.get("especie") || "Especie no especificada"} •{" "}
                                {mascotaSeleccionada?.raza || "Raza no especificada"}
                              </p>
                              {mascotaSeleccionada?.peso && (
                                <div className="flex items-center space-x-1 text-vet-gray-600">
                                  <Weight className="w-4 h-4" />
                                  <span className="text-sm">
                                    {mascotaSeleccionada.peso} kg
                                  </span>
                                </div>
                              )}
                            </div>
                            {/* Información del propietario mejorada */}
                            <div
                              className={`flex items-center space-x-4 mt-2 p-2 rounded-lg ${
                                clienteSeleccionado
                                  ? "bg-green-50 border border-green-200"
                                  : mascotaSeleccionada
                                    ? "bg-red-50 border border-red-200"
                                    : "bg-yellow-50 border border-yellow-200"
                              }`}
                            >
                              {clienteSeleccionado ? (
                                <>
                                  <div className="flex items-center space-x-2">
                                    <UserCheck className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-800">
                                      {clienteSeleccionado.nombre}
                                    </span>
                                  </div>
                                  {clienteSeleccionado.telefono && (
                                    <div className="flex items-center space-x-2">
                                      <Phone className="w-4 h-4 text-green-600" />
                                      <span className="text-sm text-green-700">
                                        {clienteSeleccionado.telefono}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-2">
                                    <Info className="w-3 h-3 text-green-500" />
                                    <span className="text-xs text-green-600">
                                      ID: {clienteSeleccionado.id}
                                    </span>
                                  </div>
                                </>
                              ) : mascotaSeleccionada ? (
                                <>
                                  <UserX className="w-4 h-4 text-red-600" />
                                  <span className="text-sm font-medium text-red-800">
                                    ⚠️ Propietario no encontrado
                                  </span>
                                  <span className="text-xs text-red-600">
                                    ID cliente:{" "}
                                    {mascotaSeleccionada.clienteId ||
                                      "No definido"}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                                  <span className="text-sm font-medium text-yellow-800">
                                    Mascota no registrada - Solo historial médico disponible
                                  </span>
                                  <span className="text-xs text-yellow-600">
                                    Considere registrar la mascota para gestión completa
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => navigate("/mis-pacientes")}
                            variant="outline"
                          >
                            <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                            Volver a Pacientes
                          </Button>
                          <Button
                            onClick={() => handleAttendAppointment(null)}
                            className="bg-vet-primary hover:bg-vet-primary-dark"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Consulta
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Estadísticas mejoradas */}
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

                  {/* Alertas sobre el estado de la mascota */}
                  {mascotaSeleccionada && !clienteSeleccionado && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>Atención:</strong> Esta mascota no tiene un
                        propietario válido asignado. Esto puede afectar la
                        gestión del historial clínico y las notificaciones.
                        <br />
                        <small>
                          Cliente ID actual:{" "}
                          {mascotaSeleccionada.clienteId || "No definido"}
                        </small>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Alerta para mascotas no registradas */}
                  {!mascotaSeleccionada && (selectedPetByName || searchParams.get("nombre")) && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <Info className="w-4 h-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>Información:</strong> Esta mascota no está registrada en el sistema.
                        Para una gestión completa, considera registrarla con su propietario.
                        <br />
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate("/mis-mascotas")}
                            className="text-blue-700 border-blue-300 hover:bg-blue-100"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Registrar Mascota
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

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
                    <p className="text-vet-gray-600 mb-6">
                      Elige una mascota de la lista para ver su historial
                      clínico completo
                    </p>

                    <div className="space-y-3">
                      <Button
                        onClick={() => navigate("/mis-pacientes")}
                        className="bg-vet-primary hover:bg-vet-primary-dark"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Ver Mis Pacientes
                      </Button>

                      {dataValidation.ghostPets.length > 0 && (
                        <p className="text-sm text-orange-600">
                          💡 Tienes {dataValidation.ghostPets.length} mascotas con historial pero sin registrar.
                          Búscalas en la lista de la izquierda.
                        </p>
                      )}
                    </div>
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
