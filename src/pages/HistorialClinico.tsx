import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
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
  FileText,
  PawPrint,
  Calendar,
  Syringe,
  Pill,
  Stethoscope,
  Download,
  Eye,
  Activity,
} from "lucide-react";

// Get user data from localStorage
const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (error) {
    console.error("Error reading user from localStorage:", error);
  }
  return null;
};

// Mock data for historial clínico
const mockHistorial = {
  Max: {
    consultas: [
      {
        id: "1",
        fecha: new Date("2024-01-10"),
        veterinario: "Dr. Carlos Ruiz",
        motivo: "Revisión dental",
        diagnostico: "Placa dental moderada",
        tratamiento: "Limpieza dental profesional",
        medicamentos: [
          { nombre: "Antibiótico", dosis: "250mg", duracion: "7 días" },
        ],
        proxima_cita: new Date("2024-07-10"),
        notas: "Evolución favorable. Control en 6 meses.",
      },
      {
        id: "2",
        fecha: new Date("2023-11-15"),
        veterinario: "Dr. Carlos Ruiz",
        motivo: "Consulta general",
        diagnostico: "Estado de salud óptimo",
        tratamiento: "Vacunación de rutina",
        medicamentos: [],
        proxima_cita: new Date("2024-11-15"),
        notas: "Peso ideal. Continuar con dieta actual.",
      },
    ],
    vacunas: [
      {
        id: "1",
        nombre: "Antirrábica",
        fecha: new Date("2023-11-15"),
        lote: "RAB-2023-456",
        veterinario: "Dr. Carlos Ruiz",
        proxima: new Date("2024-11-15"),
      },
      {
        id: "2",
        nombre: "Parvovirus",
        fecha: new Date("2023-11-15"),
        lote: "PAR-2023-789",
        veterinario: "Dr. Carlos Ruiz",
        proxima: new Date("2024-11-15"),
      },
    ],
    examenes: [
      {
        id: "1",
        tipo: "Análisis de sangre",
        fecha: new Date("2023-11-15"),
        resultados: "Normales",
        archivo: "analisis_sangre_max_nov2023.pdf",
      },
      {
        id: "2",
        tipo: "Radiografía dental",
        fecha: new Date("2024-01-10"),
        resultados: "Placa dental visible",
        archivo: "radiografia_dental_max_ene2024.pdf",
      },
    ],
  },
  Luna: {
    consultas: [
      {
        id: "3",
        fecha: new Date("2023-12-15"),
        veterinario: "Dra. Ana López",
        motivo: "Desparasitación",
        diagnostico: "Presencia de parásitos intestinales leves",
        tratamiento: "Desparasitación interna y externa",
        medicamentos: [
          {
            nombre: "Desparasitante",
            dosis: "1 comprimido",
            duracion: "Dosis única",
          },
        ],
        proxima_cita: new Date("2024-06-15"),
        notas: "Repetir tratamiento en 6 meses como prevención.",
      },
      {
        id: "4",
        fecha: new Date("2023-09-10"),
        veterinario: "Dra. Ana López",
        motivo: "Vacunación",
        diagnostico: "Salud excelente",
        tratamiento: "Vacuna antirrábica",
        medicamentos: [],
        proxima_cita: new Date("2024-09-10"),
        notas: "Gata muy cooperativa. Sin reacciones adversas.",
      },
    ],
    vacunas: [
      {
        id: "3",
        nombre: "Antirrábica",
        fecha: new Date("2023-09-10"),
        lote: "RAB-2023-123",
        veterinario: "Dra. Ana López",
        proxima: new Date("2024-09-10"),
      },
      {
        id: "4",
        nombre: "Triple Felina",
        fecha: new Date("2023-09-10"),
        lote: "TRI-2023-456",
        veterinario: "Dra. Ana López",
        proxima: new Date("2024-09-10"),
      },
    ],
    examenes: [
      {
        id: "3",
        tipo: "Examen coprológico",
        fecha: new Date("2023-12-15"),
        resultados: "Parásitos presentes",
        archivo: "coprologico_luna_dic2023.pdf",
      },
    ],
  },
};

// Use dynamic mascotas from context
const getMascotasNames = (mascotasList) => mascotasList.map((m) => m.nombre);

export default function HistorialClinico() {
  const { user, mascotas, usuarios, citas } = useAppContext();
  const [selectedMascota, setSelectedMascota] = useState("Max");
  const [selectedTab, setSelectedTab] = useState("consultas");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filtrar mascotas según el rol
  const availableMascotas =
    user?.rol === "veterinario"
      ? mascotas.filter((mascota) => {
          // Para veterinarios: mostrar mascotas que tienen citas con este veterinario
          return citas.some(
            (cita) =>
              cita.mascota === mascota.nombre &&
              cita.veterinario === user.nombre,
          );
        })
      : mascotas.filter((mascota) => mascota.clienteId === user?.id);

  const historialMascota = mockHistorial[selectedMascota] || {
    consultas: [],
    vacunas: [],
    examenes: [],
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                Acceso requerido
              </h3>
              <p className="text-vet-gray-600">
                Debes iniciar sesión para ver el historial clínico
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-vet-primary/10 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-vet-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-vet-gray-900">
                  {user?.rol === "veterinario"
                    ? "Historial de Pacientes"
                    : "Historial Clínico"}
                </h1>
                <p className="text-sm sm:text-base text-vet-gray-600">
                  {user?.rol === "veterinario"
                    ? "Consulta y gestiona el historial médico de tus pacientes"
                    : "Consulta el historial médico completo de tus mascotas"}
                </p>
              </div>
            </div>

            {/* Selector de mascota */}
            <div className="flex flex-wrap gap-2 mb-6">
              {getMascotasNames(availableMascotas).map((mascota) => (
                <Button
                  key={mascota}
                  variant={selectedMascota === mascota ? "default" : "outline"}
                  onClick={() => setSelectedMascota(mascota)}
                  className={
                    selectedMascota === mascota
                      ? "bg-vet-primary hover:bg-vet-primary-dark"
                      : ""
                  }
                >
                  <PawPrint className="w-4 h-4 mr-2" />
                  {mascota}
                </Button>
              ))}
            </div>
          </div>

          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="space-y-6"
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

            {/* Consultas Tab */}
            <TabsContent value="consultas" className="space-y-4">
              {historialMascota.consultas.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Stethoscope className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                      Sin consultas registradas
                    </h3>
                    <p className="text-vet-gray-600">
                      {selectedMascota} no tiene consultas en su historial
                    </p>
                  </CardContent>
                </Card>
              ) : (
                historialMascota.consultas.map((consulta) => (
                  <Card key={consulta.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-vet-primary" />
                            <span>{consulta.motivo}</span>
                          </CardTitle>
                          <CardDescription>
                            {consulta.fecha.toLocaleDateString("es-ES", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}{" "}
                            • {consulta.veterinario}
                          </CardDescription>
                        </div>
                        <Badge className="bg-vet-primary/10 text-vet-primary">
                          Completada
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-vet-gray-900 mb-2">
                            Diagnóstico
                          </h4>
                          <p className="text-vet-gray-700 mb-4">
                            {consulta.diagnostico}
                          </p>

                          <h4 className="font-semibold text-vet-gray-900 mb-2">
                            Tratamiento
                          </h4>
                          <p className="text-vet-gray-700">
                            {consulta.tratamiento}
                          </p>
                        </div>

                        <div>
                          {consulta.medicamentos.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-vet-gray-900 mb-2">
                                Medicamentos
                              </h4>
                              <div className="space-y-2">
                                {consulta.medicamentos.map((med, index) => (
                                  <div
                                    key={index}
                                    className="bg-vet-gray-50 rounded-lg p-3"
                                  >
                                    <div className="flex items-center space-x-2 mb-1">
                                      <Pill className="w-4 h-4 text-vet-primary" />
                                      <span className="font-medium">
                                        {med.nombre}
                                      </span>
                                    </div>
                                    <p className="text-sm text-vet-gray-600">
                                      {med.dosis} • {med.duracion}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {consulta.proxima_cita && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-vet-gray-900 mb-2">
                                Próximo control
                              </h4>
                              <p className="text-vet-gray-700">
                                {consulta.proxima_cita.toLocaleDateString(
                                  "es-ES",
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {consulta.notas && (
                        <div className="mt-4 p-4 bg-vet-primary/5 rounded-lg border border-vet-primary/20">
                          <h4 className="font-semibold text-vet-primary mb-2">
                            Notas del veterinario
                          </h4>
                          <p className="text-vet-gray-700">{consulta.notas}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Vacunas Tab */}
            <TabsContent value="vacunas" className="space-y-4">
              {historialMascota.vacunas.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Syringe className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                      Sin vacunas registradas
                    </h3>
                    <p className="text-vet-gray-600">
                      {selectedMascota} no tiene vacunas en su historial
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {historialMascota.vacunas.map((vacuna) => (
                    <Card key={vacuna.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Syringe className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-vet-gray-900">
                              {vacuna.nombre}
                            </h3>
                            <p className="text-sm text-vet-gray-600">
                              Lote: {vacuna.lote}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-vet-gray-600">
                              Fecha aplicación:
                            </span>
                            <span className="font-medium">
                              {vacuna.fecha.toLocaleDateString("es-ES")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-vet-gray-600">
                              Veterinario:
                            </span>
                            <span className="font-medium">
                              {vacuna.veterinario}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-vet-gray-600">
                              Próxima dosis:
                            </span>
                            <span className="font-medium text-vet-primary">
                              {vacuna.proxima.toLocaleDateString("es-ES")}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <Badge
                            className={
                              vacuna.proxima > new Date()
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {vacuna.proxima > new Date()
                              ? "Al día"
                              : "Requiere refuerzo"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Exámenes Tab */}
            <TabsContent value="examenes" className="space-y-4">
              {historialMascota.examenes.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Activity className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                      Sin exámenes registrados
                    </h3>
                    <p className="text-vet-gray-600">
                      {selectedMascota} no tiene exámenes en su historial
                    </p>
                  </CardContent>
                </Card>
              ) : (
                historialMascota.examenes.map((examen) => (
                  <Card key={examen.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-vet-secondary/10 rounded-full flex items-center justify-center">
                            <Activity className="w-6 h-6 text-vet-secondary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-vet-gray-900">
                              {examen.tipo}
                            </h3>
                            <p className="text-vet-gray-600">
                              {examen.fecha.toLocaleDateString("es-ES")}
                            </p>
                            <p className="text-sm text-vet-gray-600 mt-1">
                              Resultado: {examen.resultados}
                            </p>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Descargar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
