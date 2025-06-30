import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAppContext } from "@/contexts/AppContext";
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
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Stethoscope,
  Calendar,
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

export default function MisPacientes() {
  const { user, citas, usuarios, mascotas, updateCita } = useAppContext();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("proximas");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOwner, setFilterOwner] = useState("todos");
  const [isCreatingConsulta, setIsCreatingConsulta] = useState(false);
  const [selectedCitaForConsulta, setSelectedCitaForConsulta] = useState(null);
  const [newConsulta, setNewConsulta] = useState({
    motivo: "",
    diagnostico: "",
    tratamiento: "",
    medicamentos: "",
    notas: "",
    peso: "",
    temperatura: "",
    proximaCita: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  // Filtrar citas del veterinario actual
  const misCitas = citas.filter((cita) => cita.veterinario === user.nombre);

  // Obtener clientes únicos del veterinario
  const misClientes = usuarios.filter((usuario) =>
    misCitas.some((cita) => {
      const mascota = mascotas.find((m) => m.nombre === cita.mascota);
      return mascota?.clienteId === usuario.id;
    }),
  );

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

  // Filtrar citas
  const filterCitas = (filter: string) => {
    const now = new Date();
    let filtered = misCitas;

    // Filtrar por estado/tiempo
    switch (filter) {
      case "proximas":
        filtered = filtered.filter(
          (cita) =>
            new Date(cita.fecha) > now &&
            (cita.estado === "aceptada" || cita.estado === "en_validacion"),
        );
        break;
      case "hoy":
        const today = new Date().toDateString();
        filtered = filtered.filter(
          (cita) => new Date(cita.fecha).toDateString() === today,
        );
        break;
      case "pendientes":
        filtered = filtered.filter(
          (cita) =>
            cita.estado === "en_validacion" || cita.estado === "pendiente_pago",
        );
        break;
      case "completadas":
        filtered = filtered.filter((cita) => cita.estado === "atendida");
        break;
      default:
        filtered = filtered.sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
        );
    }

    // Filtrar por propietario
    if (filterOwner !== "todos") {
      filtered = filtered.filter((cita) => {
        const mascota = mascotas.find((m) => m.nombre === cita.mascota);
        return mascota?.clienteId === filterOwner;
      });
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter((cita) => {
        const enhancedCita = getEnhancedCita(cita);
        return (
          cita.mascota?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cita.motivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enhancedCita.clienteInfo?.nombre
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      });
    }

    return filtered;
  };

  const filteredCitas = filterCitas(selectedTab);

  // Estadísticas
  const stats = {
    total: misCitas.length,
    hoy: filterCitas("hoy").length,
    proximas: filterCitas("proximas").length,
    pendientes: filterCitas("pendientes").length,
    completadas: filterCitas("completadas").length,
  };

  const handleRegistrarConsulta = (cita: any) => {
    // Abrir diálogo para registrar consulta
    setSelectedCitaForConsulta(cita);
    setNewConsulta((prev) => ({ ...prev, motivo: cita.motivo }));
    setIsCreatingConsulta(true);
  };

  const handleSaveConsulta = () => {
    // Aquí se guardaría la consulta en el contexto/base de datos
    console.log("Guardando consulta:", newConsulta);

    // Marcar como atendida
    if (selectedCitaForConsulta) {
      updateCita(selectedCitaForConsulta.id, { estado: "atendida" });
    }

    // Limpiar estado
    setIsCreatingConsulta(false);
    setSelectedCitaForConsulta(null);
    setNewConsulta({
      motivo: "",
      diagnostico: "",
      tratamiento: "",
      medicamentos: "",
      notas: "",
      peso: "",
      temperatura: "",
      proximaCita: "",
    });
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

              <Button
                onClick={() => navigate("/calendario")}
                className="w-full sm:w-auto bg-vet-primary hover:bg-vet-primary-dark"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Ver Agenda
              </Button>
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
                    {stats.proximas}
                  </p>
                  <p className="text-xs sm:text-sm text-vet-gray-600">
                    Próximas
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

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
              <Input
                placeholder="Buscar por mascota, motivo o propietario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterOwner} onValueChange={setFilterOwner}>
              <SelectTrigger className="w-full sm:w-auto sm:min-w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los propietarios</SelectItem>
                {misClientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="space-y-4 sm:space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
              <TabsTrigger
                value="proximas"
                className="text-xs sm:text-sm p-2 sm:p-3"
              >
                Próximas
              </TabsTrigger>
              <TabsTrigger
                value="hoy"
                className="text-xs sm:text-sm p-2 sm:p-3"
              >
                Hoy
              </TabsTrigger>
              <TabsTrigger
                value="pendientes"
                className="text-xs sm:text-sm p-2 sm:p-3"
              >
                Pendientes
              </TabsTrigger>
              <TabsTrigger
                value="completadas"
                className="text-xs sm:text-sm p-2 sm:p-3"
              >
                Completadas
              </TabsTrigger>
              <TabsTrigger
                value="todas"
                className="text-xs sm:text-sm p-2 sm:p-3"
              >
                Todas
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="space-y-4">
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
                filteredCitas.map((cita) => {
                  const enhancedCita = getEnhancedCita(cita);
                  return (
                    <Card
                      key={cita.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-vet-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <PawPrint className="w-6 h-6 text-vet-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h4 className="font-semibold text-vet-gray-900">
                                  {cita.mascota}
                                </h4>
                                <Badge
                                  variant="secondary"
                                  className={estadoColors[cita.estado]}
                                >
                                  {estadoLabels[cita.estado]}
                                </Badge>
                              </div>

                              <div className="space-y-1 text-sm">
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-vet-gray-600" />
                                  <span>
                                    {enhancedCita.clienteInfo?.nombre ||
                                      "Sin asignar"}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-vet-gray-600" />
                                  <span className="text-vet-gray-600">
                                    {cita.motivo}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-vet-gray-600" />
                                  <span className="text-vet-gray-600">
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

                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-vet-gray-600" />
                                  <span className="text-vet-gray-600">
                                    {new Date(cita.fecha).toLocaleTimeString(
                                      "es-ES",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
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
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2 sm:ml-4">
                            {cita.estado === "aceptada" && (
                              <Button
                                size="sm"
                                onClick={() => handleRegistrarConsulta(cita)}
                                className="bg-vet-primary hover:bg-vet-primary-dark"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Registrar Consulta
                              </Button>
                            )}
                            {cita.estado === "atendida" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(`/historial-clinico?cita=${cita.id}`)
                                }
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Ver Historial
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
                })
              )}
            </TabsContent>
          </Tabs>

          {/* Dialog de Registro de Consulta */}
          <Dialog
            open={isCreatingConsulta}
            onOpenChange={setIsCreatingConsulta}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Consulta</DialogTitle>
                <DialogDescription>
                  Completa la información de la consulta médica para{" "}
                  {selectedCitaForConsulta?.mascota}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="motivo">Motivo de consulta</Label>
                    <Input
                      id="motivo"
                      value={newConsulta.motivo}
                      onChange={(e) =>
                        setNewConsulta({
                          ...newConsulta,
                          motivo: e.target.value,
                        })
                      }
                      placeholder="Ej: Revisión general"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                      id="peso"
                      value={newConsulta.peso}
                      onChange={(e) =>
                        setNewConsulta({
                          ...newConsulta,
                          peso: e.target.value,
                        })
                      }
                      placeholder="Ej: 25.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperatura">Temperatura (°C)</Label>
                    <Input
                      id="temperatura"
                      value={newConsulta.temperatura}
                      onChange={(e) =>
                        setNewConsulta({
                          ...newConsulta,
                          temperatura: e.target.value,
                        })
                      }
                      placeholder="Ej: 38.2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proxima-cita">
                      Próxima cita (opcional)
                    </Label>
                    <Input
                      id="proxima-cita"
                      type="date"
                      value={newConsulta.proximaCita}
                      onChange={(e) =>
                        setNewConsulta({
                          ...newConsulta,
                          proximaCita: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnostico">Diagnóstico</Label>
                  <Textarea
                    id="diagnostico"
                    value={newConsulta.diagnostico}
                    onChange={(e) =>
                      setNewConsulta({
                        ...newConsulta,
                        diagnostico: e.target.value,
                      })
                    }
                    placeholder="Describe el diagnóstico..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tratamiento">Tratamiento</Label>
                  <Textarea
                    id="tratamiento"
                    value={newConsulta.tratamiento}
                    onChange={(e) =>
                      setNewConsulta({
                        ...newConsulta,
                        tratamiento: e.target.value,
                      })
                    }
                    placeholder="Describe el tratamiento aplicado..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicamentos">Medicamentos recetados</Label>
                  <Textarea
                    id="medicamentos"
                    value={newConsulta.medicamentos}
                    onChange={(e) =>
                      setNewConsulta({
                        ...newConsulta,
                        medicamentos: e.target.value,
                      })
                    }
                    placeholder="Medicamento, dosis, duración..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notas">Notas adicionales</Label>
                  <Textarea
                    id="notas"
                    value={newConsulta.notas}
                    onChange={(e) =>
                      setNewConsulta({
                        ...newConsulta,
                        notas: e.target.value,
                      })
                    }
                    placeholder="Observaciones, recomendaciones..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingConsulta(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveConsulta}
                    className="bg-vet-primary hover:bg-vet-primary-dark"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Consulta
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
}
