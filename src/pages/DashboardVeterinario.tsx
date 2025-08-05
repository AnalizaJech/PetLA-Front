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
    // Navigate to patients list to select patient and register consultation
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

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "aceptada":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmada
          </Badge>
        );
      case "atendida":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Atendida
          </Badge>
        );
      case "en_validacion":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <Clock className="w-3 h-3 mr-1" />
            En Validación
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
                  Panel Veterinario
                </h1>
                <p className="text-vet-gray-600">Bienvenido, {user.nombre}</p>
              </div>
            </div>

            {/* Welcome Alert */}
            <Alert className="border-vet-primary/20 bg-vet-primary/5">
              <Stethoscope className="w-4 h-4 text-vet-primary" />
              <AlertDescription className="text-vet-primary">
                <strong>¡Bienvenido a tu panel profesional!</strong> Aquí puedes
                gestionar tus citas, revisar pacientes y mantener actualizado el
                historial clínico.
              </AlertDescription>
            </Alert>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-vet-primary/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-vet-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Total Citas
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-vet-gray-900">
                      {stats.totalCitas}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">Hoy</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-600">
                      {stats.citasHoy}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Pendientes
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                      {stats.citasPendientes}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Completadas
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">
                      {stats.citasCompletadas}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <PawPrint className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-vet-gray-600">
                      Pacientes
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                      {stats.pacientesUnicos}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Today's Schedule */}
            <div className="lg:col-span-2 space-y-8">
              {/* Today's Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-vet-primary" />
                    <span>Citas de Hoy</span>
                    {stats.citasHoy > 0 && (
                      <Badge className="bg-gray-100 text-gray-800">
                        {stats.citasHoy}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {new Date().toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {citasHoy.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Hora</TableHead>
                            <TableHead>Paciente & Propietario</TableHead>
                            <TableHead>Motivo</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-center">
                              Acciones
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {citasHoy
                            .sort(
                              (a, b) =>
                                new Date(a.fecha).getTime() -
                                new Date(b.fecha).getTime(),
                            )
                            .map((cita) => {
                              const mascota = mascotas.find(
                                (m) => m.nombre === cita.mascota,
                              );
                              const propietario = usuarios.find(
                                (u) => u.id === mascota?.clienteId,
                              );

                              return (
                                <TableRow
                                  key={cita.id}
                                  className="hover:bg-vet-gray-50"
                                >
                                  <TableCell className="font-medium">
                                    {new Date(cita.fecha).toLocaleTimeString(
                                      "es-ES",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <PawPrint className="w-4 h-4 text-vet-secondary" />
                                        <span className="font-medium">
                                          {cita.mascota}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2 text-sm text-vet-gray-600">
                                        <UserCheck className="w-3 h-3" />
                                        <span>
                                          {propietario?.nombre || "Sin asignar"}
                                        </span>
                                      </div>
                                      <p className="text-xs text-vet-gray-500">
                                        {mascota?.especie}{" "}
                                        {mascota?.raza && `• ${mascota.raza}`}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <p className="text-sm">
                                        <span className="font-medium text-vet-primary">
                                          {cita.tipoConsulta}
                                        </span>
                                        <br />
                                        {cita.motivo.length > 40
                                          ? `${cita.motivo.substring(0, 40)}...`
                                          : cita.motivo}
                                      </p>
                                      {getUrgencyLevel(cita.motivo)}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {getStatusBadge(cita.estado)}
                                  </TableCell>
                                  <TableCell>
                                    <CitaQuickActions cita={cita} />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-vet-gray-900 mb-2">
                        No hay citas hoy
                      </h3>
                      <p className="text-vet-gray-600">
                        Disfruta de tu día libre o aprovecha para ponerte al día
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-vet-primary" />
                    <span>Próximas Citas (7 días)</span>
                    {citasProximas.length > 0 && (
                      <Badge className="bg-orange-100 text-orange-800">
                        {citasProximas.length}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Citas programadas para la próxima semana
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {citasProximas.length > 0 ? (
                    <div className="space-y-4">
                      {citasProximas
                        .sort(
                          (a, b) =>
                            new Date(a.fecha).getTime() -
                            new Date(b.fecha).getTime(),
                        )
                        .slice(0, 5)
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
                              className="flex items-center justify-between p-4 border border-vet-gray-200 rounded-lg hover:bg-vet-gray-50 transition-colors"
                            >
                              <div className="flex items-center space-x-4 flex-1">
                                <div className="text-center">
                                  <p className="text-sm font-medium text-vet-gray-900">
                                    {new Date(cita.fecha).toLocaleDateString(
                                      "es-ES",
                                      {
                                        month: "short",
                                        day: "numeric",
                                      },
                                    )}
                                  </p>
                                  <p className="text-xs text-vet-gray-600">
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
                                    <PawPrint className="w-4 h-4 text-vet-secondary" />
                                    <span className="font-medium text-vet-gray-900">
                                      {cita.mascota}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <UserCheck className="w-3 h-3 text-vet-gray-600" />
                                    <span className="text-sm text-vet-gray-600">
                                      {propietario?.nombre || "Sin asignar"}
                                    </span>
                                  </div>
                                  <p className="text-sm text-vet-gray-600">
                                    <span className="font-medium text-vet-primary">
                                      {cita.tipoConsulta}
                                    </span>
                                    <br />
                                    {cita.motivo.length > 40
                                      ? `${cita.motivo.substring(0, 40)}...`
                                      : cita.motivo}
                                  </p>
                                  {getUrgencyLevel(cita.motivo)}
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                {getStatusBadge(cita.estado)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    navigate(`/mis-pacientes?cita=${cita.id}`)
                                  }
                                  title="Ver detalles de la cita"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-vet-gray-900 mb-2">
                        No hay citas próximas
                      </h3>
                      <p className="text-vet-gray-600">
                        Tu agenda está libre para los próximos 7 días
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quick Stats and Actions */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-vet-primary" />
                    <span>Acciones Rápidas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full bg-vet-primary hover:bg-vet-primary-dark"
                    onClick={handleViewFullSchedule}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver Agenda Completa
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSearchPatientDialog(true)}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Paciente
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // Generate and download a summary report
                      const currentMonth = new Date().toLocaleDateString("es-ES", {
                        month: "long",
                        year: "numeric"
                      });

                      const reportData = {
                        veterinario: user?.nombre || "Veterinario",
                        periodo: currentMonth,
                        citasCompletadas: monthlyStats.citasCompletadas,
                        pacientesUnicos: monthlyStats.pacientesUnicos,
                        fecha: new Date().toLocaleDateString("es-ES")
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
- Satisfacción promedio: 4.9/5

Generado automáticamente por PetLA
                      `;

                      const blob = new Blob([reportContent], { type: 'text/plain' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `reporte_${currentMonth.replace(' ', '_')}_${user?.nombre?.replace(' ', '_') || 'veterinario'}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Reporte
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleViewPatientHistory}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Historial Clínico
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Patients */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PawPrint className="w-5 h-5 text-vet-primary" />
                    <span>Pacientes Recientes</span>
                  </CardTitle>
                  <CardDescription>
                    Últimas consultas completadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {citasCompletadas.length > 0 ? (
                    <div className="space-y-4">
                      {citasCompletadas.map((cita) => {
                        const mascota = mascotas.find(
                          (m) => m.nombre === cita.mascota,
                        );
                        const propietario = usuarios.find(
                          (u) => u.id === mascota?.clienteId,
                        );

                        return (
                          <div
                            key={cita.id}
                            className="flex items-center justify-between p-3 border border-vet-gray-200 rounded-lg hover:bg-vet-gray-50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <PawPrint className="w-3 h-3 text-vet-secondary" />
                                <span className="font-medium text-sm">
                                  {cita.mascota}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 mb-1">
                                <UserCheck className="w-3 h-3 text-vet-gray-500" />
                                <span className="text-xs text-vet-gray-600">
                                  {propietario?.nombre || "Sin asignar"}
                                </span>
                              </div>
                              <p className="text-xs text-vet-gray-600">
                                {new Date(cita.fecha).toLocaleDateString(
                                  "es-ES",
                                )}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(`/mis-pacientes?cita=${cita.id}`)
                              }
                              title="Ver historial del paciente"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <PawPrint className="w-8 h-8 text-vet-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-vet-gray-600">
                        No hay consultas recientes
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-vet-primary" />
                    <span>Resumen del Mes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-vet-gray-600">
                        Citas completadas
                      </span>
                      <span className="font-medium">
                        {stats.citasCompletadas}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-vet-gray-600">
                        Pacientes únicos
                      </span>
                      <span className="font-medium">
                        {stats.pacientesUnicos}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-vet-gray-600">
                        Satisfacción
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-yellow-600">4.9</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-yellow-500 text-xs">
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
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
                  <div className="w-10 h-10 bg-vet-primary/10 rounded-lg flex items-center justify-center">
                    <Search className="w-5 h-5 text-vet-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold text-vet-gray-900">
                      Buscar Paciente
                    </DialogTitle>
                    <DialogDescription className="text-vet-gray-600">
                      Encuentra pacientes por nombre, especie, raza o
                      propietario
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                  <Input
                    placeholder="Buscar por nombre del paciente, propietario, especie..."
                    value={searchTerm}
                    onChange={(e) => handleSearchPatients(e.target.value)}
                    className="pl-10 border-vet-gray-300 focus:border-vet-primary focus:ring-vet-primary"
                  />
                </div>

                {searchTerm.length > 2 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-vet-gray-900">
                      Resultados de búsqueda ({foundPatients.length})
                    </h4>

                    {foundPatients.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {foundPatients.map((mascota) => {
                          // Find appointments for this pet with this vet
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
                              className="p-4 border border-vet-gray-200 rounded-lg hover:bg-vet-gray-50 cursor-pointer transition-colors"
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
                                    <PawPrint className="w-4 h-4 text-vet-secondary" />
                                    <span className="font-medium text-vet-gray-900">
                                      {mascota.nombre}
                                    </span>
                                    <span className="text-sm text-vet-gray-600">
                                      ({mascota.especie})
                                    </span>
                                  </div>

                                  <div className="bg-vet-gray-50 p-2 rounded">
                                    <div className="flex items-center space-x-2 text-sm">
                                      <UserCheck className="w-3 h-3 text-vet-primary" />
                                      <span className="font-medium">
                                        {propietario?.nombre || "Sin asignar"}
                                      </span>
                                    </div>
                                    {propietario?.telefono && (
                                      <div className="flex items-center space-x-2 text-xs text-vet-gray-600 mt-1">
                                        <Phone className="w-3 h-3" />
                                        <span>{propietario.telefono}</span>
                                      </div>
                                    )}
                                  </div>

                                  {mascota.raza && (
                                    <p className="text-xs text-vet-gray-500">
                                      Raza: {mascota.raza}
                                    </p>
                                  )}
                                  {ultimaCita && (
                                    <p className="text-xs text-vet-gray-500">
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
                                  <Eye className="w-4 h-4 text-vet-gray-400" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Search className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-vet-gray-900 mb-2">
                          No se encontraron pacientes
                        </h3>
                        <p className="text-vet-gray-600">
                          Intenta con otros términos de búsqueda
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {searchTerm.length <= 2 && searchTerm.length > 0 && (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
                    <p className="text-vet-gray-600">
                      Escribe al menos 3 caracteres para buscar
                    </p>
                  </div>
                )}

                {searchTerm.length === 0 && (
                  <div className="text-center py-8">
                    <PawPrint className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-vet-gray-900 mb-2">
                      Buscar Pacientes
                    </h3>
                    <p className="text-vet-gray-600">
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
