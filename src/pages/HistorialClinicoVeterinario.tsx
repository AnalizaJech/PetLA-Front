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
} from "lucide-react";

// Mock data removed - using real data from context

export default function HistorialClinicoVeterinario() {
  const { user, citas, usuarios, mascotas } = useAppContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedMascota, setSelectedMascota] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("consultas");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [filterType, setFilterType] = useState("todos");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");

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

  // Obtener clientes únicos
  const misClientes = usuarios.filter((usuario) =>
    misMascotas.some((mascota) => mascota.clienteId === usuario.id),
  );

  // Filtrar mascotas
  const filteredMascotas = misMascotas.filter((mascota) => {
    const matchesOwner =
      selectedOwner === "todos" || mascota.clienteId === selectedOwner;
    const matchesSearch =
      !searchTerm ||
      mascota.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mascota.especie.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuarios
        .find((u) => u.id === mascota.clienteId)
        ?.nombre.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesOwner && matchesSearch;
  });

  const historialMascota = selectedMascota
    ? mockHistorialData[selectedMascota] || {
        consultas: [],
        vacunas: [],
        examenes: [],
      }
    : { consultas: [], vacunas: [], examenes: [] };

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
                    Consulta y registra el historial médico de tus pacientes
                  </p>
                </div>
              </div>

              <Button
                onClick={() => navigate("/mis-pacientes")}
                variant="outline"
              >
                <Stethoscope className="w-4 h-4 mr-2" />
                Mis Pacientes
              </Button>
            </div>
          </div>

          {/* Filtros Avanzados */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Filter className="w-5 h-5 text-vet-primary" />
                <span>Filtros Avanzados</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                  <Input
                    placeholder="Buscar por mascota, especie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                  <SelectTrigger>
                    <User className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Propietario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">
                      Todos los propietarios
                    </SelectItem>
                    {misClientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <FileText className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Tipo de registro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los registros</SelectItem>
                    <SelectItem value="consultas">Solo consultas</SelectItem>
                    <SelectItem value="vacunas">Solo vacunas</SelectItem>
                    <SelectItem value="examenes">Solo exámenes</SelectItem>
                    <SelectItem value="urgencias">Urgencias</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => setShowExportDialog(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Datos
                </Button>
              </div>

              {/* Filtro de fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha-desde">Desde</Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                    <Input
                      id="fecha-desde"
                      type="date"
                      value={dateRange.from}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, from: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha-hasta">Hasta</Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                    <Input
                      id="fecha-hasta"
                      type="date"
                      value={dateRange.to}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, to: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de filtros rápidos */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0];
                    setDateRange({ from: today, to: today });
                  }}
                >
                  Hoy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    const weekAgo = new Date(
                      today.getTime() - 7 * 24 * 60 * 60 * 1000,
                    );
                    setDateRange({
                      from: weekAgo.toISOString().split("T")[0],
                      to: today.toISOString().split("T")[0],
                    });
                  }}
                >
                  Última semana
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    const monthAgo = new Date(
                      today.getFullYear(),
                      today.getMonth() - 1,
                      today.getDate(),
                    );
                    setDateRange({
                      from: monthAgo.toISOString().split("T")[0],
                      to: today.toISOString().split("T")[0],
                    });
                  }}
                >
                  Último mes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange({ from: "", to: "" })}
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpiar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dialog de Exportación */}
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Exportar Historial Clínico</DialogTitle>
                <DialogDescription>
                  Selecciona el formato y opciones de exportación
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Formato de exportación</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">
                        PDF - Reporte completo
                      </SelectItem>
                      <SelectItem value="excel">
                        Excel - Datos tabulares
                      </SelectItem>
                      <SelectItem value="csv">CSV - Datos en texto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Información a incluir</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="include-consultas"
                        defaultChecked
                      />
                      <Label htmlFor="include-consultas">
                        Consultas médicas
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="include-vacunas"
                        defaultChecked
                      />
                      <Label htmlFor="include-vacunas">Vacunas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="include-examenes"
                        defaultChecked
                      />
                      <Label htmlFor="include-examenes">Exámenes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="include-medicamentos"
                        defaultChecked
                      />
                      <Label htmlFor="include-medicamentos">Medicamentos</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowExportDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      // Aquí iría la lógica de exportación
                      console.log("Exportando en formato:", exportFormat);
                      setShowExportDialog(false);
                    }}
                    className="bg-vet-primary hover:bg-vet-primary-dark"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Lista de mascotas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Panel izquierdo - Lista de mascotas */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <PawPrint className="w-5 h-5 text-vet-primary" />
                    <span>Mis Pacientes</span>
                  </CardTitle>
                  <CardDescription>
                    Selecciona un paciente para ver su historial
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {filteredMascotas.length === 0 ? (
                      <div className="p-4 text-center text-vet-gray-500">
                        No se encontraron pacientes
                      </div>
                    ) : (
                      filteredMascotas.map((mascota) => {
                        const cliente = usuarios.find(
                          (u) => u.id === mascota.clienteId,
                        );
                        return (
                          <button
                            key={mascota.id}
                            onClick={() => setSelectedMascota(mascota.nombre)}
                            className={`w-full text-left p-4 hover:bg-vet-gray-50 border-b border-vet-gray-100 transition-colors ${
                              selectedMascota === mascota.nombre
                                ? "bg-vet-primary/5 border-l-4 border-l-vet-primary"
                                : ""
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-vet-primary/10 rounded-full flex items-center justify-center">
                                <PawPrint className="w-5 h-5 text-vet-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-vet-gray-900">
                                  {mascota.nombre}
                                </p>
                                <p className="text-sm text-vet-gray-600">
                                  {mascota.especie} • {cliente?.nombre}
                                </p>
                                <p className="text-xs text-vet-gray-500">
                                  {mascota.raza}
                                </p>
                              </div>
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
            <div className="md:col-span-2">
              {selectedMascota ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Historial de {selectedMascota}</span>
                      <Badge variant="secondary">
                        {
                          filteredMascotas.find(
                            (m) => m.nombre === selectedMascota,
                          )?.especie
                        }
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs
                      value={selectedTab}
                      onValueChange={setSelectedTab}
                      className="space-y-4"
                    >
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger
                          value="consultas"
                          className="flex items-center space-x-2"
                        >
                          <Stethoscope className="w-4 h-4" />
                          <span>Consultas</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="vacunas"
                          className="flex items-center space-x-2"
                        >
                          <Syringe className="w-4 h-4" />
                          <span>Vacunas</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="examenes"
                          className="flex items-center space-x-2"
                        >
                          <Activity className="w-4 h-4" />
                          <span>Exámenes</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="consultas" className="space-y-4">
                        {historialMascota.consultas.length === 0 ? (
                          <div className="text-center py-8">
                            <Stethoscope className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
                            <p className="text-vet-gray-500">
                              No hay consultas registradas
                            </p>
                          </div>
                        ) : (
                          historialMascota.consultas.map((consulta) => (
                            <Card
                              key={consulta.id}
                              className="border-l-4 border-l-vet-primary"
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-semibold text-vet-gray-900">
                                      {consulta.motivo}
                                    </h4>
                                    <p className="text-sm text-vet-gray-600">
                                      {consulta.fecha.toLocaleDateString(
                                        "es-ES",
                                      )}
                                    </p>
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button variant="ghost" size="sm">
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                  <div>
                                    <span className="font-medium">Peso:</span>{" "}
                                    {consulta.peso}
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Temperatura:
                                    </span>{" "}
                                    {consulta.temperatura}
                                  </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="font-medium">
                                      Diagnóstico:
                                    </span>{" "}
                                    {consulta.diagnostico}
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Tratamiento:
                                    </span>{" "}
                                    {consulta.tratamiento}
                                  </div>
                                  {consulta.notas && (
                                    <div>
                                      <span className="font-medium">
                                        Notas:
                                      </span>{" "}
                                      {consulta.notas}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </TabsContent>

                      <TabsContent value="vacunas" className="space-y-4">
                        {historialMascota.vacunas.length === 0 ? (
                          <div className="text-center py-8">
                            <Syringe className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
                            <p className="text-vet-gray-500">
                              No hay vacunas registradas
                            </p>
                          </div>
                        ) : (
                          historialMascota.vacunas.map((vacuna) => (
                            <Card key={vacuna.id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-semibold text-vet-gray-900">
                                      {vacuna.nombre}
                                    </h4>
                                    <p className="text-sm text-vet-gray-600">
                                      Aplicada:{" "}
                                      {vacuna.fecha.toLocaleDateString("es-ES")}
                                    </p>
                                    <p className="text-sm text-vet-gray-600">
                                      Próxima:{" "}
                                      {vacuna.proxima.toLocaleDateString(
                                        "es-ES",
                                      )}
                                    </p>
                                    <p className="text-xs text-vet-gray-500">
                                      Lote: {vacuna.lote}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </TabsContent>

                      <TabsContent value="examenes" className="space-y-4">
                        {historialMascota.examenes.length === 0 ? (
                          <div className="text-center py-8">
                            <Activity className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
                            <p className="text-vet-gray-500">
                              No hay exámenes registrados
                            </p>
                          </div>
                        ) : (
                          historialMascota.examenes.map((examen) => (
                            <Card key={examen.id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-semibold text-vet-gray-900">
                                      {examen.tipo}
                                    </h4>
                                    <p className="text-sm text-vet-gray-600">
                                      {examen.fecha.toLocaleDateString("es-ES")}
                                    </p>
                                    <p className="text-sm text-vet-gray-600">
                                      Resultados: {examen.resultados}
                                    </p>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Descargar
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                      Selecciona un paciente
                    </h3>
                    <p className="text-vet-gray-600">
                      Elige una mascota de la lista para ver su historial médico
                      completo
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
