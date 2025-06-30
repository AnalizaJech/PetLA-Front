import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAppContext } from "@/contexts/AppContext";
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
} from "lucide-react";

const estadoColors = {
  pendiente_pago: "bg-yellow-100 text-yellow-800 border-yellow-200",
  en_validacion: "bg-blue-100 text-blue-800 border-blue-200",
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

export default function Calendario() {
  const { user, citas, usuarios, mascotas } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [filterStatus, setFilterStatus] = useState<string>("todas");
  const [viewMode, setViewMode] = useState<"month" | "list">("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filtrar citas del veterinario actual
  const veterinarianCitas = citas.filter(
    (cita) => cita.veterinario === user?.nombre,
  );

  // Función para obtener citas de una fecha específica
  const getCitasForDate = (date: Date) => {
    return veterinarianCitas.filter((cita) => {
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

  // Función para obtener información completa de la cita
  const getEnhancedCita = (cita: any) => {
    const mascota = mascotas.find((m) => m.nombre === cita.mascota);
    const cliente = usuarios.find((u) => u.id === mascota?.clienteId);
    return {
      ...cita,
      mascotaInfo: mascota,
      clienteInfo: cliente,
    };
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

  // Estadísticas rápidas
  const stats = {
    total: veterinarianCitas.length,
    hoy: getCitasForDate(today).length,
    confirmadas: veterinarianCitas.filter((c) => c.estado === "aceptada")
      .length,
    pendientes: veterinarianCitas.filter((c) => c.estado === "en_validacion")
      .length,
    completadas: veterinarianCitas.filter((c) => c.estado === "atendida")
      .length,
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

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                  <Input
                    placeholder="Buscar paciente o motivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-auto">
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

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-vet-primary">
                    {stats.total}
                  </p>
                  <p className="text-xs sm:text-sm text-vet-gray-600">Total</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                    {stats.hoy}
                  </p>
                  <p className="text-xs sm:text-sm text-vet-gray-600">Hoy</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {stats.confirmadas}
                  </p>
                  <p className="text-xs sm:text-sm text-vet-gray-600">
                    Confirmadas
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                    {stats.pendientes}
                  </p>
                  <p className="text-xs sm:text-sm text-vet-gray-600">
                    Pendientes
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-600">
                    {stats.completadas}
                  </p>
                  <p className="text-xs sm:text-sm text-vet-gray-600">
                    Completadas
                  </p>
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

              {/* Citas del día seleccionado */}
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
                      <div className="space-y-3">
                        {getCitasForDate(selectedDate).length === 0 ? (
                          <p className="text-vet-gray-500 text-center py-8">
                            No hay citas programadas para este día
                          </p>
                        ) : (
                          getCitasForDate(selectedDate)
                            .sort(
                              (a, b) =>
                                new Date(a.fecha).getTime() -
                                new Date(b.fecha).getTime(),
                            )
                            .map((cita) => {
                              const enhancedCita = getEnhancedCita(cita);
                              return (
                                <div
                                  key={cita.id}
                                  className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <Clock className="w-4 h-4 text-vet-gray-600" />
                                      <span className="font-medium">
                                        {new Date(
                                          cita.fecha,
                                        ).toLocaleTimeString("es-ES", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className={estadoColors[cita.estado]}
                                    >
                                      {estadoLabels[cita.estado]}
                                    </Badge>
                                  </div>

                                  <div className="space-y-1 text-sm">
                                    <div className="flex items-center space-x-2">
                                      <PawPrint className="w-4 h-4 text-vet-secondary" />
                                      <span className="font-medium">
                                        {cita.mascota}
                                      </span>
                                    </div>

                                    {enhancedCita.clienteInfo && (
                                      <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4 text-vet-gray-600" />
                                        <span>
                                          {enhancedCita.clienteInfo.nombre}
                                        </span>
                                      </div>
                                    )}

                                    <div className="flex items-center space-x-2">
                                      <CalendarIcon className="w-4 h-4 text-vet-gray-600" />
                                      <span className="text-vet-gray-600">
                                        {cita.motivo}
                                      </span>
                                    </div>

                                    {enhancedCita.clienteInfo?.telefono && (
                                      <div className="flex items-center space-x-2">
                                        <Phone className="w-4 h-4 text-vet-gray-600" />
                                        <span className="text-vet-gray-600">
                                          {enhancedCita.clienteInfo.telefono}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex justify-end mt-3 space-x-2">
                                    {cita.estado === "aceptada" && (
                                      <Button
                                        size="sm"
                                        className="bg-vet-primary hover:bg-vet-primary-dark"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Atender
                                      </Button>
                                    )}
                                    <Button size="sm" variant="outline">
                                      <Eye className="w-4 h-4 mr-1" />
                                      Detalle
                                    </Button>
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    ) : (
                      <p className="text-vet-gray-500 text-center py-8">
                        Haz clic en una fecha del calendario para ver las citas
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            // Vista de lista
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
                  <div className="space-y-3">
                    {(() => {
                      let allCitas = veterinarianCitas
                        .filter((cita) => {
                          const matchesStatus =
                            filterStatus === "todas" ||
                            cita.estado === filterStatus;
                          const matchesSearch =
                            !searchTerm ||
                            cita.mascota
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            cita.motivo
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase());
                          const showThisCita =
                            showCompleted || cita.estado !== "atendida";
                          return matchesStatus && matchesSearch && showThisCita;
                        })
                        .sort(
                          (a, b) =>
                            new Date(a.fecha).getTime() -
                            new Date(b.fecha).getTime(),
                        );

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

                      return allCitas.map((cita) => {
                        const enhancedCita = getEnhancedCita(cita);
                        const isToday =
                          new Date(cita.fecha).toDateString() ===
                          new Date().toDateString();
                        const isPast = new Date(cita.fecha) < new Date();

                        return (
                          <Card
                            key={cita.id}
                            className={`transition-all duration-200 hover:shadow-md ${
                              isToday
                                ? "border-l-4 border-l-vet-primary bg-vet-primary/5"
                                : ""
                            } ${isPast && cita.estado !== "atendida" ? "opacity-60" : ""}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-start space-x-4">
                                  <div className="w-12 h-12 bg-vet-primary/10 rounded-full flex items-center justify-center">
                                    <PawPrint className="w-6 h-6 text-vet-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h4 className="font-semibold text-vet-gray-900">
                                        {cita.mascota}
                                      </h4>
                                      <Badge
                                        className={estadoColors[cita.estado]}
                                      >
                                        {estadoLabels[cita.estado]}
                                      </Badge>
                                      {isToday && (
                                        <Badge
                                          variant="secondary"
                                          className="bg-vet-primary text-white"
                                        >
                                          HOY
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
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

                                      <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4 text-vet-gray-600" />
                                        <span>
                                          {enhancedCita.clienteInfo?.nombre ||
                                            "Sin asignar"}
                                        </span>
                                      </div>

                                      <div className="flex items-center space-x-2">
                                        <FileText className="w-4 h-4 text-vet-gray-600" />
                                        <span className="truncate">
                                          {cita.motivo}
                                        </span>
                                      </div>

                                      {enhancedCita.clienteInfo?.telefono && (
                                        <div className="flex items-center space-x-2">
                                          <Phone className="w-4 h-4 text-vet-gray-600" />
                                          <span>
                                            {enhancedCita.clienteInfo.telefono}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col space-y-2">
                                  {cita.estado === "aceptada" && (
                                    <Button
                                      size="sm"
                                      className="bg-vet-primary hover:bg-vet-primary-dark"
                                      onClick={() => {
                                        // Marcar como atendida y navegar al historial
                                      }}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Atender
                                    </Button>
                                  )}
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Ver Detalle
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
        </div>
      </div>
    </Layout>
  );
}
