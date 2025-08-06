import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import Layout from "@/components/Layout";
import CitaQuickActions from "@/components/CitaQuickActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Stethoscope,
  Calendar,
  Clock,
  PawPrint,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Eye,
  Activity,
  TrendingUp,
  Users,
  Search,
  FileText,
  Plus,
  Filter,
  UserCheck,
  Download,
  ArrowUp,
  ArrowDown,
  Target,
  Star,
  Heart,
  Zap,
  Award,
  ChevronRight,
  Calendar as CalendarIcon,
  ClipboardList,
  Timer,
} from "lucide-react";

export default function DashboardVeterinario() {
  const { user, citas, mascotas, usuarios, updateCita } = useAppContext();
  const navigate = useNavigate();
  const [searchPatientDialog, setSearchPatientDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [foundPatients, setFoundPatients] = useState<any[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Search patients function
  const handleSearchPatients = (term: string) => {
    setSearchTerm(term);
    if (term.length > 2) {
      const results = mascotas.filter((mascota) => {
        const propietario = usuarios.find((u) => u.id === mascota.clienteId);
        return (
          mascota.nombre?.toLowerCase().includes(term.toLowerCase()) ||
          mascota.especie?.toLowerCase().includes(term.toLowerCase()) ||
          mascota.raza?.toLowerCase().includes(term.toLowerCase()) ||
          propietario?.nombre?.toLowerCase().includes(term.toLowerCase())
        );
      });
      setFoundPatients(results);
    } else {
      setFoundPatients([]);
    }
  };

  // Quick action handlers
  const handleViewFullSchedule = () => {
    navigate("/calendario");
  };

  const handleRegisterConsultation = () => {
    navigate("/mis-pacientes");
  };

  const handleViewProfile = () => {
    navigate("/configuracion");
  };

  const handleViewPatientDetail = (citaId: string) => {
    navigate(`/gestion-citas?cita=${citaId}`);
  };

  const handleViewPatientHistory = () => {
    navigate("/historial-clinico-veterinario");
  };

  if (!user || user.rol !== "veterinario") {
    return null;
  }

  // Get citas for this veterinarian
  const misCitas = citas.filter((cita) => cita.veterinario === user.nombre);

  // Get today's appointments
  const hoy = new Date().toDateString();
  const citasHoy = misCitas.filter(
    (cita) => new Date(cita.fecha).toDateString() === hoy,
  );

  // Get upcoming appointments (next 7 days)
  const proximaSemana = new Date();
  proximaSemana.setDate(proximaSemana.getDate() + 7);
  const citasProximas = misCitas.filter((cita) => {
    const fechaCita = new Date(cita.fecha);
    const hoyDate = new Date();
    return fechaCita > hoyDate && fechaCita <= proximaSemana;
  });

  // Get recent completed appointments
  const citasCompletadas = misCitas
    .filter((cita) => cita.estado === "atendida")
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);

  // Calculate stats
  const stats = {
    totalCitas: misCitas.length,
    citasHoy: citasHoy.length,
    citasPendientes: misCitas.filter(
      (c) => c.estado === "aceptada" || c.estado === "en_validacion",
    ).length,
    citasCompletadas: misCitas.filter((c) => c.estado === "atendida").length,
    pacientesUnicos: [...new Set(misCitas.map((c) => c.mascota))].length,
  };

  // Calculate growth metrics
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const citasEsteMes = misCitas.filter((cita) => {
    const fechaCita = new Date(cita.fecha);
    const inicioMes = new Date();
    inicioMes.setDate(1);
    return fechaCita >= inicioMes;
  }).length;

  const citasMesPasado = misCitas.filter((cita) => {
    const fechaCita = new Date(cita.fecha);
    const inicioMesPasado = new Date();
    inicioMesPasado.setMonth(inicioMesPasado.getMonth() - 1);
    inicioMesPasado.setDate(1);
    const finMesPasado = new Date();
    finMesPasado.setDate(0);
    return fechaCita >= inicioMesPasado && fechaCita <= finMesPasado;
  }).length;

  const crecimientoCitas =
    citasMesPasado > 0
      ? (((citasEsteMes - citasMesPasado) / citasMesPasado) * 100).toFixed(1)
      : "0";

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "aceptada":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmada
          </Badge>
        );
      case "atendida":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Atendida
          </Badge>
        );
      case "en_validacion":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            En Proceso
          </Badge>
        );
      default:
        return null;
    }
  };

  const getUrgencyLevel = (motivo: string) => {
    if (!motivo) return null;

    const urgentKeywords = [
      "emergencia",
      "urgente",
      "dolor",
      "sangre",
      "herida",
      "vómito",
      "diarrea",
    ];
    const isUrgent = urgentKeywords.some((keyword) =>
      motivo.toLowerCase().includes(keyword),
    );

    if (isUrgent) {
      return (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertCircle className="w-3 h-3" />
          <span className="text-xs font-medium">Urgente</span>
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Modern Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    Panel Veterinario
                  </h1>
                  <p className="text-gray-600 flex items-center">
                    <span>Bienvenido, {user.nombre}</span>
                    <Award className="w-4 h-4 ml-2 text-amber-500" />
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setSearchPatientDialog(true)}
                  className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Buscar Paciente
                </Button>
                <Button
                  onClick={handleViewFullSchedule}
                  className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Mi Agenda
                </Button>
              </div>
            </div>

            {/* Date and Time */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">
                      {new Date().toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Timer className="w-5 h-5 text-green-600" />
                    <span className="text-gray-600">
                      {new Date().toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                {citasHoy.length > 0 && (
                  <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                    {citasHoy.length} citas hoy
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-medium mb-1">
                      Citas Hoy
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      {stats.citasHoy}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {stats.citasPendientes} pendientes
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-medium mb-1">
                      Completadas
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {stats.citasCompletadas}
                    </p>
                    <div className="flex items-center text-xs text-green-600 mt-1">
                      <ArrowUp className="w-3 h-3 mr-1" />+{crecimientoCitas}%
                      este mes
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700 font-medium mb-1">
                      Pacientes
                    </p>
                    <p className="text-3xl font-bold text-purple-900">
                      {stats.pacientesUnicos}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      Únicos atendidos
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <PawPrint className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/50 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-700 font-medium mb-1">
                      En Proceso
                    </p>
                    <p className="text-3xl font-bold text-amber-900">
                      {stats.citasPendientes}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Requieren atención
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Today's Schedule & Upcoming */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Appointments */}
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2 text-xl">
                        <div className="w-8 h-8 bg-vet-primary/10 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-vet-primary" />
                        </div>
                        <span>Agenda de Hoy</span>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {citasHoy.length > 0
                          ? `${citasHoy.length} citas programadas para hoy`
                          : "No tienes citas programadas para hoy"}
                      </CardDescription>
                    </div>
                    {citasHoy.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewFullSchedule}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        Ver todas
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {citasHoy.length > 0 ? (
                    <div className="space-y-4">
                      {citasHoy
                        .sort(
                          (a, b) =>
                            new Date(a.fecha).getTime() -
                            new Date(b.fecha).getTime(),
                        )
                        .slice(0, 4)
                        .map((cita) => {
                          const mascota = mascotas.find(
                            (m) => m.nombre === cita.mascota,
                          );
                          const propietario = usuarios.find(
                            (u) => u.id === mascota?.clienteId,
                          );

                          return (
                            <div
                              key={cita.id}
                              className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center space-x-4 flex-1">
                                <div className="flex flex-col items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    {new Date(cita.fecha).toLocaleTimeString(
                                      "es-ES",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </div>
                                  <div className="w-8 h-0.5 bg-blue-200 rounded mt-1"></div>
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <PawPrint className="w-4 h-4 text-blue-600" />
                                    <span className="font-medium text-gray-900">
                                      {cita.mascota}
                                    </span>
                                    {getStatusBadge(cita.estado)}
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <UserCheck className="w-3 h-3" />
                                    <span>
                                      {propietario?.nombre || "Sin asignar"}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {cita.tipoConsulta} •{" "}
                                    {cita.motivo.length > 30
                                      ? `${cita.motivo.substring(0, 30)}...`
                                      : cita.motivo}
                                  </p>
                                  {getUrgencyLevel(cita.motivo)}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <CitaQuickActions cita={cita} />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Día libre
                      </h3>
                      <p className="text-gray-600 mb-4">
                        No tienes citas programadas para hoy
                      </p>
                      <Button
                        onClick={handleViewFullSchedule}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Ver agenda completa
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Appointments */}
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <span>Próximas Citas</span>
                    {citasProximas.length > 0 && (
                      <Badge className="bg-amber-100 text-amber-800 ml-2">
                        {citasProximas.length}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Citas programadas para los próximos 7 días
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {citasProximas.length > 0 ? (
                    <div className="space-y-3">
                      {citasProximas
                        .sort(
                          (a, b) =>
                            new Date(a.fecha).getTime() -
                            new Date(b.fecha).getTime(),
                        )
                        .slice(0, 3)
                        .map((cita) => {
                          const mascota = mascotas.find(
                            (m) => m.nombre === cita.mascota,
                          );
                          const propietario = usuarios.find(
                            (u) => u.id === mascota?.clienteId,
                          );

                          return (
                            <div
                              key={cita.id}
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="text-center min-w-[60px]">
                                  <p className="text-sm font-medium text-gray-900">
                                    {new Date(cita.fecha).toLocaleDateString(
                                      "es-ES",
                                      {
                                        month: "short",
                                        day: "numeric",
                                      },
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {new Date(cita.fecha).toLocaleTimeString(
                                      "es-ES",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </p>
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <PawPrint className="w-3 h-3 text-amber-600" />
                                    <span className="text-sm font-medium text-gray-900">
                                      {cita.mascota}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {propietario?.nombre || "Sin asignar"} •{" "}
                                    {cita.tipoConsulta}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                {getStatusBadge(cita.estado)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    navigate(`/mis-pacientes?cita=${cita.id}`)
                                  }
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        No hay citas próximas programadas
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quick Actions & Performance */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-green-600" />
                    </div>
                    <span>Acciones Rápidas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 justify-start"
                    onClick={handleRegisterConsultation}
                  >
                    <ClipboardList className="w-4 h-4 mr-3" />
                    Gestionar Pacientes
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-200 hover:bg-gray-50"
                    onClick={handleViewFullSchedule}
                  >
                    <Calendar className="w-4 h-4 mr-3" />
                    Mi Agenda Completa
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-200 hover:bg-gray-50"
                    onClick={handleViewPatientHistory}
                  >
                    <FileText className="w-4 h-4 mr-3" />
                    Historiales Clínicos
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-200 hover:bg-gray-50"
                    onClick={() => {
                      const currentMonth = new Date().toLocaleDateString(
                        "es-ES",
                        {
                          month: "long",
                          year: "numeric",
                        },
                      );

                      const reportData = {
                        veterinario: user?.nombre || "Veterinario",
                        periodo: currentMonth,
                        citasCompletadas: stats.citasCompletadas,
                        pacientesUnicos: stats.pacientesUnicos,
                        fecha: new Date().toLocaleDateString("es-ES"),
                      };

                      const reportContent = `
REPORTE MENSUAL VETERINARIO
===========================

Veterinario: ${reportData.veterinario}
Período: ${reportData.periodo}
Fecha de generación: ${reportData.fecha}

ESTADÍSTICAS:
- Citas completadas: ${reportData.citasCompletadas}
- Pacientes únicos: ${reportData.pacientesUnicos}
- Crecimiento: +${crecimientoCitas}%

Generado automáticamente por PetLA
                      `;

                      const blob = new Blob([reportContent], {
                        type: "text/plain",
                      });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `reporte_${currentMonth.replace(" ", "_")}_${user?.nombre?.replace(" ", "_") || "veterinario"}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="w-4 h-4 mr-3" />
                    Descargar Reporte
                  </Button>
                </CardContent>
              </Card>

              {/* Performance Summary */}
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <span>Resumen del Mes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-blue-900">
                          Citas completadas
                        </span>
                      </div>
                      <span className="font-bold text-blue-900">
                        {stats.citasCompletadas}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                          <PawPrint className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-purple-900">
                          Pacientes únicos
                        </span>
                      </div>
                      <span className="font-bold text-purple-900">
                        {stats.pacientesUnicos}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-amber-900">
                          Satisfacción
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-bold text-amber-900">4.9</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-green-900">
                          Crecimiento
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ArrowUp className="w-3 h-3 text-green-600" />
                        <span className="font-bold text-green-900">
                          +{crecimientoCitas}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Patients */}
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>Pacientes Recientes</span>
                  </CardTitle>
                  <CardDescription>
                    Últimas consultas completadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {citasCompletadas.length > 0 ? (
                    <div className="space-y-3">
                      {citasCompletadas.slice(0, 3).map((cita) => {
                        const mascota = mascotas.find(
                          (m) => m.nombre === cita.mascota,
                        );
                        const propietario = usuarios.find(
                          (u) => u.id === mascota?.clienteId,
                        );

                        return (
                          <div
                            key={cita.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() =>
                              navigate(`/mis-pacientes?cita=${cita.id}`)
                            }
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <PawPrint className="w-3 h-3 text-blue-600" />
                                <span className="text-sm font-medium">
                                  {cita.mascota}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 mb-1">
                                <UserCheck className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600">
                                  {propietario?.nombre || "Sin asignar"}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {new Date(cita.fecha).toLocaleDateString(
                                  "es-ES",
                                )}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Heart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        No hay consultas recientes
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Patient Search Dialog */}
          <Dialog
            open={searchPatientDialog}
            onOpenChange={setSearchPatientDialog}
          >
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-hide">
              <DialogHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Search className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                      Buscar Paciente
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Encuentra pacientes por nombre, especie, raza o
                      propietario
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre del paciente, propietario, especie..."
                    value={searchTerm}
                    onChange={(e) => handleSearchPatients(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {searchTerm.length > 2 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">
                      Resultados de búsqueda ({foundPatients.length})
                    </h4>

                    {foundPatients.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {foundPatients.map((mascota) => {
                          const citasPaciente = misCitas.filter(
                            (c) => c.mascota === mascota.nombre,
                          );
                          const ultimaCita = citasPaciente.sort(
                            (a, b) =>
                              new Date(b.fecha).getTime() -
                              new Date(a.fecha).getTime(),
                          )[0];

                          const propietario = usuarios.find(
                            (u) => u.id === mascota.clienteId,
                          );

                          return (
                            <div
                              key={mascota.id}
                              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => {
                                if (ultimaCita) {
                                  navigate(
                                    `/mis-pacientes?cita=${ultimaCita.id}`,
                                  );
                                } else {
                                  navigate(
                                    `/historial-clinico-veterinario?mascota=${mascota.id}`,
                                  );
                                }
                                setSearchPatientDialog(false);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <PawPrint className="w-4 h-4 text-blue-600" />
                                    <span className="font-medium text-gray-900">
                                      {mascota.nombre}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      ({mascota.especie})
                                    </span>
                                  </div>

                                  <div className="bg-gray-50 p-2 rounded">
                                    <div className="flex items-center space-x-2 text-sm">
                                      <UserCheck className="w-3 h-3 text-blue-600" />
                                      <span className="font-medium">
                                        {propietario?.nombre || "Sin asignar"}
                                      </span>
                                    </div>
                                    {propietario?.telefono && (
                                      <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                                        <Phone className="w-3 h-3" />
                                        <span>{propietario.telefono}</span>
                                      </div>
                                    )}
                                  </div>

                                  {mascota.raza && (
                                    <p className="text-xs text-gray-500">
                                      Raza: {mascota.raza}
                                    </p>
                                  )}
                                  {ultimaCita && (
                                    <p className="text-xs text-gray-500">
                                      Última cita:{" "}
                                      {new Date(
                                        ultimaCita.fecha,
                                      ).toLocaleDateString("es-ES")}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                  {citasPaciente.length > 0 && (
                                    <Badge className="bg-green-100 text-green-800">
                                      {citasPaciente.length} cita
                                      {citasPaciente.length !== 1 ? "s" : ""}
                                    </Badge>
                                  )}
                                  <Eye className="w-4 h-4 text-gray-400" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No se encontraron pacientes
                        </h3>
                        <p className="text-gray-600">
                          Intenta con otros términos de búsqueda
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {searchTerm.length <= 2 && searchTerm.length > 0 && (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Escribe al menos 3 caracteres para buscar
                    </p>
                  </div>
                )}

                {searchTerm.length === 0 && (
                  <div className="text-center py-8">
                    <PawPrint className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Buscar Pacientes
                    </h3>
                    <p className="text-gray-600">
                      Comienza a escribir para buscar entre tus pacientes
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
}
