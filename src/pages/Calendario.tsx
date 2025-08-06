import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAppContext } from "@/contexts/AppContext";
import CitaQuickActions from "@/components/CitaQuickActions";
import CitaDetailModal from "@/components/CitaDetailModal";
import CitaAttendModal from "@/components/CitaAttendModal";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Calendar as CalendarIcon,
  Clock,
  PawPrint,
  User,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  CheckCircle,
  Search,
  List,
  Grid,
  AlertCircle,
  FileText,
  Edit,
  MoreVertical,
  UserCheck,
  Mail,
  Info,
  Activity,
} from "lucide-react";
import {
  enhanceMultipleCitas,
  filterCitas,
  sortCitas,
  getCitasStats,
  getUrgencyLevel,
  type CitaFilter,
  type SortBy,
  type CitaRelationData,
} from "@/lib/citaUtils";

const estadoColors = {
  pendiente_pago: "bg-yellow-100 text-yellow-800 border-yellow-300",
  en_validacion: "bg-blue-100 text-blue-800 border-blue-300",
  aceptada: "bg-green-100 text-green-800 border-green-300",
  atendida: "bg-emerald-100 text-emerald-800 border-emerald-300",
  cancelada: "bg-red-100 text-red-800 border-red-300",
  expirada: "bg-red-100 text-red-800 border-red-300",
  rechazada: "bg-red-100 text-red-800 border-red-300",
  no_asistio: "bg-orange-100 text-orange-800 border-orange-300",
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
  cancelada: AlertCircle,
  expirada: AlertCircle,
  rechazada: AlertCircle,
  no_asistio: AlertCircle,
};

export default function Calendario() {
  const { user, citas, usuarios, mascotas, historialClinico } = useAppContext();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [filterStatus, setFilterStatus] = useState<string>("todas");
  const [viewMode, setViewMode] = useState<"month" | "list">("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedCita, setSelectedCita] = useState<CitaRelationData | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAttendModalOpen, setIsAttendModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filtrar y mejorar citas del veterinario actual
  const misCitas = useMemo(
    () => citas.filter((cita) => cita.veterinario === user?.nombre),
    [citas, user?.nombre],
  );

  // Mejorar citas con información relacionada
  const enhancedCitas = useMemo(
    () => enhanceMultipleCitas(misCitas, mascotas, usuarios, historialClinico),
    [misCitas, mascotas, usuarios, historialClinico],
  );

  // Función para obtener citas de una fecha específica
  const getCitasForDate = (date: Date): CitaRelationData[] => {
    return enhancedCitas.filter(({ cita }) => {
      const citaDate = new Date(cita.fecha);
      const matchesDate = citaDate.toDateString() === date.toDateString();
      const matchesStatus =
        filterStatus === "todas" || cita.estado === filterStatus;
      const matchesSearch =
        !searchTerm ||
        cita.mascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.motivo.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDate && matchesStatus && matchesSearch;
    });
  };

  // Función para obtener citas filtradas para vista de lista
  const getFilteredCitas = (): CitaRelationData[] => {
    let filtered = enhancedCitas.filter(({ cita }) => {
      const matchesStatus =
        filterStatus === "todas" || cita.estado === filterStatus;
      const matchesSearch =
        !searchTerm ||
        cita.mascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.motivo.toLowerCase().includes(searchTerm.toLowerCase());
      const showThisCita = showCompleted || cita.estado !== "atendida";
      return matchesStatus && matchesSearch && showThisCita;
    });

    return sortCitas(filtered, "fecha_asc");
  };

  // Generar días del mes actual
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Días del mes anterior para completar la primera semana
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Días del siguiente mes para completar la última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();

  // Navegación del calendario
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + (direction === "next" ? 1 : -1),
        1,
      ),
    );
  };

  // Estadísticas usando utilidades mejoradas
  const stats = useMemo(() => {
    const citasStats = getCitasStats(enhancedCitas);
    return {
      total: citasStats.total,
      hoy: citasStats.hoy,
      confirmadas: enhancedCitas.filter(
        ({ cita }) => cita.estado === "aceptada",
      ).length,
      pendientes: citasStats.pendientes,
      completadas: citasStats.completadas,
      urgentes: citasStats.urgentes,
    };
  }, [enhancedCitas]);

  // Funciones de navegación mejoradas
  const handleViewDetail = (citaData: CitaRelationData) => {
    setSelectedCita(citaData);
    setIsDetailModalOpen(true);
  };

  const handleAttendCita = (citaData: CitaRelationData) => {
    setSelectedCita(citaData);
    setIsAttendModalOpen(true);
  };

  const handleNavigateToPatients = (citaId?: string) => {
    if (citaId) {
      navigate(`/mis-pacientes?cita=${citaId}`);
    } else {
      navigate("/mis-pacientes");
    }
  };

  const getUrgencyBadge = (urgencyLevel: "alta" | "media" | "baja") => {
    const configs = {
      alta: {
        color: "bg-red-100 text-red-800 border-red-300",
        label: "Urgente",
        icon: AlertCircle,
      },
      media: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        label: "Moderada",
        icon: Clock,
      },
      baja: {
        color: "bg-green-100 text-green-800 border-green-300",
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

  if (!user || user.rol !== "veterinario") {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <CalendarIcon className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
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

  return (
    <Layout user={user}>
      <div className="min-h-screen bg-vet-gray-50 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-vet-primary/10 rounded-xl flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-vet-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-vet-gray-900">
                    Agenda Médica
                  </h1>
                  <p className="text-sm sm:text-base text-vet-gray-600">
                    Consulta y gestiona tus citas programadas
                  </p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-2 lg:space-y-0 lg:space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                  <Input
                    placeholder="Buscar paciente o motivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full lg:w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full lg:w-auto">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las citas</SelectItem>
                    <SelectItem value="aceptada">Confirmadas</SelectItem>
                    <SelectItem value="en_validacion">En validación</SelectItem>
                    <SelectItem value="atendida">Completadas</SelectItem>
                    <SelectItem value="pendiente_pago">Pendientes</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex space-x-2">
                  <Button
                    variant={viewMode === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("month")}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
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
                    <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-vet-primary" />
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
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl font-bold text-green-600">
                      {stats.confirmadas}
                    </p>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Confirmadas
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

          {/* Vista de Calendario o Lista */}
          {viewMode === "month" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg sm:text-xl">
                        {currentDate.toLocaleDateString("es-ES", {
                          month: "long",
                          year: "numeric",
                        })}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigateMonth("prev")}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentDate(new Date())}
                        >
                          Hoy
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigateMonth("next")}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Días de la semana */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(
                        (day) => (
                          <div
                            key={day}
                            className="text-center text-xs sm:text-sm font-medium text-vet-gray-600 p-2"
                          >
                            {day}
                          </div>
                        ),
                      )}
                    </div>

                    {/* Días del calendario */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, index) => {
                        const citasDelDia = getCitasForDate(day.date);
                        const isToday =
                          day.date.toDateString() === today.toDateString();
                        const isSelected =
                          selectedDate &&
                          day.date.toDateString() ===
                            selectedDate.toDateString();

                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedDate(day.date)}
                            className={`
                              relative p-2 text-sm hover:bg-vet-gray-100 rounded-lg transition-colors min-h-[60px] flex flex-col items-center justify-start
                              ${!day.isCurrentMonth ? "text-vet-gray-400" : "text-vet-gray-900"}
                              ${isToday ? "bg-vet-primary text-white hover:bg-vet-primary-dark" : ""}
                              ${isSelected ? "ring-2 ring-vet-primary" : ""}
                            `}
                          >
                            <span
                              className={`text-xs sm:text-sm ${isToday ? "font-bold" : ""}`}
                            >
                              {day.date.getDate()}
                            </span>
                            {citasDelDia.length > 0 && (
                              <div className="flex space-x-1 mt-1">
                                {citasDelDia.slice(0, 2).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isToday ? "bg-white" : "bg-vet-primary"
                                    }`}
                                  />
                                ))}
                                {citasDelDia.length > 2 && (
                                  <span
                                    className={`text-xs ${isToday ? "text-white" : "text-vet-primary"}`}
                                  >
                                    +{citasDelDia.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Citas del día seleccionado mejoradas */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-vet-primary" />
                      <span>
                        {selectedDate
                          ? selectedDate.toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "long",
                            })
                          : "Selecciona un día"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedDate ? (
                      <div className="space-y-4">
                        {getCitasForDate(selectedDate).length === 0 ? (
                          <div className="text-center py-8">
                            <CalendarIcon className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
                            <p className="text-vet-gray-500">
                              No hay citas programadas para este día
                            </p>
                          </div>
                        ) : (
                          getCitasForDate(selectedDate)
                            .sort(
                              (a, b) =>
                                new Date(a.cita.fecha).getTime() -
                                new Date(b.cita.fecha).getTime(),
                            )
                            .map((citaData) => {
                              const {
                                cita,
                                mascota,
                                propietario,
                                urgencyLevel,
                              } = citaData;
                              const StatusIcon = estadoIcons[cita.estado];

                              return (
                                <Card
                                  key={cita.id}
                                  className="hover:shadow-md transition-all duration-200"
                                >
                                  <CardContent className="p-4">
                                    {/* Header con hora y estado */}
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4 text-vet-primary" />
                                        <span className="font-bold text-vet-primary text-sm sm:text-base">
                                          {new Date(
                                            cita.fecha,
                                          ).toLocaleTimeString("es-ES", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                        <Badge
                                          variant="secondary"
                                          className={estadoColors[cita.estado]}
                                        >
                                          <StatusIcon className="w-3 h-3 mr-1" />
                                          {estadoLabels[cita.estado]}
                                        </Badge>
                                        {getUrgencyBadge(urgencyLevel)}
                                      </div>
                                    </div>

                                    {/* Información del paciente */}
                                    <div className="space-y-2 mb-3">
                                      <div className="flex items-center space-x-2">
                                        <PawPrint className="w-4 h-4 text-vet-secondary" />
                                        <span className="font-medium text-vet-gray-900">
                                          {cita.mascota}
                                        </span>
                                        {mascota?.especie && (
                                          <span className="text-sm text-vet-gray-600">
                                            ({mascota.especie})
                                          </span>
                                        )}
                                      </div>

                                      {/* Información del propietario */}
                                      <div className="bg-vet-gray-50 p-2 rounded">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <UserCheck className="w-3 h-3 text-vet-primary" />
                                          <span className="text-sm font-medium">
                                            {propietario?.nombre ||
                                              "Sin asignar"}
                                          </span>
                                        </div>
                                        {propietario?.telefono && (
                                          <div className="flex items-center space-x-2">
                                            <Phone className="w-3 h-3 text-vet-gray-600" />
                                            <span className="text-xs text-vet-gray-600">
                                              {propietario.telefono}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Motivo de la consulta */}
                                      <div className="flex items-start space-x-2">
                                        <FileText className="w-4 h-4 text-vet-gray-600 mt-0.5" />
                                        <span className="text-sm text-vet-gray-600 flex-1">
                                          {cita.motivo}
                                        </span>
                                      </div>

                                      {/* Información adicional de la mascota */}
                                      {mascota?.raza && (
                                        <div className="flex items-center space-x-2">
                                          <Info className="w-3 h-3 text-vet-gray-600" />
                                          <span className="text-xs text-vet-gray-600">
                                            Raza: {mascota.raza}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Botones de acción */}
                                    <div className="flex flex-col sm:flex-row justify-end mt-3 gap-2">
                                      {cita.estado === "aceptada" && (
                                        <Button
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAttendCita(citaData);
                                          }}
                                          className="bg-vet-primary hover:bg-vet-primary-dark w-full sm:w-auto"
                                        >
                                          <Activity className="w-4 h-4 mr-1" />
                                          Atender
                                        </Button>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleViewDetail(citaData);
                                        }}
                                        className="w-full sm:w-auto"
                                      >
                                        <Eye className="w-4 h-4 mr-1" />
                                        Detalle de la Cita
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (mascota) {
                                            const propietario =
                                              selectedCita.propietario;
                                            navigate(
                                              `/historial-clinico-veterinario?view=history&ownerId=${propietario?.id || "unknown"}&petId=${mascota.id}`,
                                            );
                                          } else {
                                            // Fallback para mascotas no registradas
                                            navigate(
                                              `/historial-clinico-veterinario?view=history&petName=${encodeURIComponent(cita.mascota)}&especie=${encodeURIComponent(cita.especie)}`,
                                            );
                                          }
                                        }}
                                      >
                                        <FileText className="w-4 h-4 mr-1" />
                                        Ver Historial
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
                        <p className="text-vet-gray-500">
                          Haz clic en una fecha del calendario para ver las
                          citas
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            // Vista de lista mejorada
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Lista de Citas</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentDate(new Date())}
                      >
                        Hoy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCompleted(!showCompleted)}
                      >
                        {showCompleted ? "Ocultar" : "Mostrar"} Completadas
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      const allCitas = getFilteredCitas();

                      if (allCitas.length === 0) {
                        return (
                          <div className="text-center py-12">
                            <CalendarIcon className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                              No hay citas
                            </h3>
                            <p className="text-vet-gray-600">
                              No se encontraron citas que coincidan con los
                              filtros.
                            </p>
                          </div>
                        );
                      }

                      return allCitas.map((citaData) => {
                        const { cita, mascota, propietario, urgencyLevel } =
                          citaData;
                        const isToday =
                          new Date(cita.fecha).toDateString() ===
                          new Date().toDateString();
                        const isPast = new Date(cita.fecha) < new Date();
                        const StatusIcon = estadoIcons[cita.estado];

                        return (
                          <Card
                            key={cita.id}
                            className={`transition-all duration-200 hover:shadow-lg ${
                              isToday
                                ? "border-l-4 border-l-vet-primary bg-vet-primary/5"
                                : ""
                            } ${isPast && cita.estado !== "atendida" ? "opacity-60" : ""}`}
                          >
                            <CardContent className="p-4 sm:p-6">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                                <div className="flex items-start space-x-4 flex-1">
                                  <div className="w-12 h-12 bg-vet-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <PawPrint className="w-6 h-6 text-vet-primary" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                      <h4 className="font-bold text-lg text-vet-gray-900">
                                        {cita.mascota}
                                      </h4>
                                      <Badge
                                        className={estadoColors[cita.estado]}
                                      >
                                        <StatusIcon className="w-3 h-3 mr-1" />
                                        {estadoLabels[cita.estado]}
                                      </Badge>
                                      {getUrgencyBadge(urgencyLevel)}
                                      {isToday && (
                                        <Badge
                                          variant="secondary"
                                          className="bg-vet-primary text-white"
                                        >
                                          HOY
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Información del propietario destacada */}
                                    <div className="bg-vet-gray-50 p-3 rounded-lg mb-3">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <UserCheck className="w-4 h-4 text-vet-primary" />
                                        <span className="font-medium text-vet-gray-900">
                                          Propietario:{" "}
                                          {propietario?.nombre || "Sin asignar"}
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-vet-gray-600">
                                        {propietario?.telefono && (
                                          <div className="flex items-center space-x-2">
                                            <Phone className="w-3 h-3" />
                                            <span>{propietario.telefono}</span>
                                          </div>
                                        )}
                                        {propietario?.email && (
                                          <div className="flex items-center space-x-2">
                                            <Mail className="w-3 h-3" />
                                            <span>{propietario.email}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                      <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                          <CalendarIcon className="w-4 h-4 text-vet-gray-600" />
                                          <span>
                                            {new Date(
                                              cita.fecha,
                                            ).toLocaleDateString("es-ES", {
                                              weekday: "long",
                                              day: "numeric",
                                              month: "long",
                                            })}
                                          </span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                          <Clock className="w-4 h-4 text-vet-gray-600" />
                                          <span>
                                            {new Date(
                                              cita.fecha,
                                            ).toLocaleTimeString("es-ES", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                          <PawPrint className="w-4 h-4 text-vet-gray-600" />
                                          <span>
                                            <strong>Especie:</strong>{" "}
                                            {mascota?.especie ||
                                              "No especificado"}
                                          </span>
                                        </div>

                                        {mascota?.raza && (
                                          <div className="flex items-center space-x-2">
                                            <Info className="w-4 h-4 text-vet-gray-600" />
                                            <span>
                                              <strong>Raza:</strong>{" "}
                                              {mascota.raza}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      <div className="md:col-span-2">
                                        <div className="flex items-start space-x-2">
                                          <FileText className="w-4 h-4 text-vet-gray-600 mt-0.5" />
                                          <span>
                                            <strong>Motivo:</strong>{" "}
                                            {cita.motivo}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex flex-col space-y-2 sm:ml-4 sm:flex-shrink-0">
                                  {cita.estado === "aceptada" && (
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAttendCita(citaData);
                                      }}
                                      className="bg-vet-primary hover:bg-vet-primary-dark h-9"
                                    >
                                      <Activity className="w-4 h-4 mr-2" />
                                      Atender
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDetail(citaData);
                                    }}
                                    className="h-9"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Detalle de la Cita
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (mascota) {
                                        const propietario = usuarios.find(
                                          (u) => u.id === mascota.clienteId,
                                        );
                                        navigate(
                                          `/historial-clinico-veterinario?view=history&ownerId=${propietario?.id || "unknown"}&petId=${mascota.id}`,
                                        );
                                      } else {
                                        // Fallback para mascotas no registradas
                                        navigate(
                                          `/historial-clinico-veterinario?view=history&petName=${encodeURIComponent(cita.mascota)}&especie=${encodeURIComponent(cita.especie)}`,
                                        );
                                      }
                                    }}
                                    className="h-9"
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Historial
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      });
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Modales reutilizables */}
          <CitaDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            selectedCita={selectedCita}
            onAttendCita={handleAttendCita}
          />

          <CitaAttendModal
            isOpen={isAttendModalOpen}
            onClose={() => setIsAttendModalOpen(false)}
            selectedCita={selectedCita}
            onSave={() => {
              // Refrescar datos si es necesario
              window.location.reload();
            }}
          />
        </div>
      </div>
    </Layout>
  );
}
