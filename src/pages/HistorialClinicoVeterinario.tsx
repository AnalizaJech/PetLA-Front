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
  FileText,
  PawPrint,
  Calendar,
  Stethoscope,
  User,
  Phone,
  Search,
  Filter,
  Eye,
  Activity,
  Download,
  X,
  AlertCircle,
  CheckCircle,
  UserCheck,
  Heart,
  Weight,
  Thermometer,
  Plus,
  ChevronRight,
  Info,
  ArrowLeft,
  Pill,
  Syringe,
  Mail,
  MapPin,
} from "lucide-react";
import jsPDF from "jspdf";

export default function HistorialClinicoVeterinario() {
  const {
    user,
    citas,
    usuarios,
    mascotas,
    historialClinico,
    getHistorialByMascota,
    addHistorialEntry,
  } = useAppContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Navigation states - check URL params for direct navigation
  const [currentView, setCurrentView] = useState<"owners" | "pets" | "history">(
    searchParams.get("view") === "history" ? "history" : "owners",
  );
  const [selectedOwner, setSelectedOwner] = useState<any>(null);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [filterSex, setFilterSex] = useState("todos");
  const [filterSpecies, setFilterSpecies] = useState("todos");

  useEffect(() => {
    window.scrollTo(0, 0);

    // Handle direct navigation from URL parameters
    const view = searchParams.get("view");
    const ownerId = searchParams.get("ownerId");
    const petId = searchParams.get("petId");
    const petName = searchParams.get("petName");

    if (view === "history") {
      if (petId) {
        // Direct navigation to specific pet by ID
        const pet = mascotas.find((m) => m.id === petId);
        if (pet) {
          const owner = usuarios.find((u) => u.id === pet.clienteId);
          setSelectedPet(pet);
          setSelectedOwner(owner || null);
          setCurrentView("history");
        }
      } else if (petName) {
        // Fallback: navigation to pet by name (for unregistered pets)
        const pet = mascotas.find(
          (m) => m.nombre.toLowerCase() === petName.toLowerCase(),
        );
        if (pet) {
          const owner = usuarios.find((u) => u.id === pet.clienteId);
          setSelectedPet(pet);
          setSelectedOwner(owner || null);
          setCurrentView("history");
        } else {
          // Create a temporary pet object for unregistered pets
          const tempPet = {
            id: `temp-${petName}`,
            nombre: petName,
            especie: searchParams.get("especie") || "Desconocida",
            raza: "Por determinar",
            sexo: "No especificado",
          };
          setSelectedPet(tempPet);
          setCurrentView("history");
        }
      }
    }
  }, [searchParams, mascotas, usuarios]);

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

  // Get all clients with pets that have clinical history
  const clientesConHistorial = useMemo(() => {
    const clienteIds = new Set<string>();

    // Get clients from pets with clinical history
    historialClinico.forEach((entry) => {
      const mascota = mascotas.find((m) => m.id === entry.mascotaId);
      if (mascota) {
        clienteIds.add(mascota.clienteId);
      }
    });

    // Get clients from appointments
    misCitas.forEach((cita) => {
      if (cita.clienteId) {
        clienteIds.add(cita.clienteId);
      }
    });

    return usuarios.filter((u) => u.rol === "cliente" && clienteIds.has(u.id));
  }, [usuarios, mascotas, historialClinico, misCitas]);

  // Get pets for selected owner
  const mascotasDelDueño = useMemo(() => {
    if (!selectedOwner) return [];

    return mascotas.filter((m) => m.clienteId === selectedOwner.id);
  }, [mascotas, selectedOwner]);

  // Get clinical history for selected pet
  const historialMascota = useMemo(() => {
    if (!selectedPet) return [];

    // Try to get by pet ID first
    let records = getHistorialByMascota(selectedPet.id);

    // If no records by ID, search by pet name (for unregistered pets or name matches)
    if (records.length === 0 && selectedPet.nombre) {
      records = historialClinico.filter(
        (entry) =>
          entry.mascotaNombre.toLowerCase() ===
          selectedPet.nombre.toLowerCase(),
      );
    }

    return records.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );
  }, [selectedPet, getHistorialByMascota, historialClinico]);

  // Filter clients based on search
  const filteredClientes = useMemo(() => {
    return clientesConHistorial.filter((cliente) => {
      const matchesSearch =
        !searchTerm ||
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefono?.includes(searchTerm);

      return matchesSearch;
    });
  }, [clientesConHistorial, searchTerm]);

  // Filter pets based on search and filters
  const filteredPets = useMemo(() => {
    return mascotasDelDueño.filter((pet) => {
      const matchesSearch =
        !searchTerm ||
        pet.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.especie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.raza.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecies =
        filterSpecies === "todos" || pet.especie === filterSpecies;
      const matchesSex = filterSex === "todos" || pet.sexo === filterSex;

      return matchesSearch && matchesSpecies && matchesSex;
    });
  }, [mascotasDelDueño, searchTerm, filterSpecies, filterSex]);

  // Filter clinical history
  const filteredHistory = useMemo(() => {
    return historialMascota.filter((record) => {
      if (filterType === "todos") return true;

      switch (filterType) {
        case "consultas":
          return ["consulta_general", "grooming", "emergencia"].includes(
            record.tipoConsulta,
          );
        case "vacunas":
          return record.tipoConsulta === "vacunacion";
        case "examenes":
          return record.examenes && record.examenes.length > 0;
        case "urgencias":
          return record.tipoConsulta === "emergencia";
        default:
          return true;
      }
    });
  }, [historialMascota, filterType]);

  // Get unique species for filter
  const especiesUnicas = useMemo(() => {
    const especies = new Set(mascotas.map((m) => m.especie));
    return Array.from(especies);
  }, [mascotas]);

  // Download clinical history as PDF
  const downloadHistorialPDF = () => {
    if (!selectedPet || !historialMascota.length) return;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("Historial Clínico Veterinario", 20, 20);

    doc.setFontSize(12);
    doc.text(`Generado: ${new Date().toLocaleDateString("es-ES")}`, 20, 30);

    // Pet information
    doc.setFontSize(14);
    doc.text("INFORMACIÓN DE LA MASCOTA", 20, 45);
    doc.setFontSize(11);
    doc.text(`Nombre: ${selectedPet.nombre}`, 20, 55);
    doc.text(`Especie: ${selectedPet.especie}`, 20, 62);
    doc.text(`Raza: ${selectedPet.raza || "No especificada"}`, 20, 69);
    doc.text(`Sexo: ${selectedPet.sexo || "No especificado"}`, 20, 76);

    // Calculate and show age
    if (selectedPet.fechaNacimiento) {
      const birthDate = new Date(selectedPet.fechaNacimiento);
      const today = new Date();
      const ageInYears = Math.floor(
        (today.getTime() - birthDate.getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
      );
      const ageInMonths = Math.floor(
        (today.getTime() - birthDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000),
      );

      let ageText;
      if (ageInYears >= 2) {
        ageText = `${ageInYears} años`;
      } else if (ageInYears === 1) {
        const extraMonths = ageInMonths - 12;
        ageText =
          extraMonths > 0
            ? `1 año ${extraMonths} mes${extraMonths > 1 ? "es" : ""}`
            : "1 año";
      } else {
        ageText = `${ageInMonths} mes${ageInMonths > 1 ? "es" : ""}`;
      }

      doc.text(`Edad: ${ageText}`, 20, 83);
      doc.text(
        `Fecha de nacimiento: ${birthDate.toLocaleDateString("es-ES")}`,
        20,
        90,
      );
    }

    if (selectedPet.peso) {
      doc.text(`Peso actual: ${selectedPet.peso} kg`, 20, 97);
    }

    if (selectedOwner) {
      doc.text(`Propietario: ${selectedOwner.nombre}`, 20, 104);
      if (selectedOwner.telefono) {
        doc.text(`Teléfono: ${selectedOwner.telefono}`, 20, 111);
      }
    }

    let y = 125;

    // Medical records header
    doc.setFontSize(14);
    doc.text("REGISTROS MÉDICOS", 20, y);
    y += 15;

    filteredHistory.forEach((record, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(12);
      doc.text(
        `${index + 1}. ${new Date(record.fecha).toLocaleDateString("es-ES")}`,
        20,
        y,
      );
      y += 8;

      doc.setFontSize(10);
      doc.text(`Veterinario: Dr. ${record.veterinario}`, 30, y);
      y += 6;
      doc.text(
        `Tipo: ${record.tipoConsulta.replace("_", " ").toUpperCase()}`,
        30,
        y,
      );
      y += 6;
      doc.text(`Motivo: ${record.motivo}`, 30, y);
      y += 6;
      doc.text(`Diagnóstico: ${record.diagnostico}`, 30, y);
      y += 6;

      if (record.tratamiento) {
        doc.text(`Tratamiento: ${record.tratamiento}`, 30, y);
        y += 6;
      }

      // Vital signs
      if (record.peso || record.temperatura) {
        doc.text(`Signos vitales:`, 30, y);
        y += 6;
        if (record.peso) {
          doc.text(`  - Peso: ${record.peso} kg`, 35, y);
          y += 5;
        }
        if (record.temperatura) {
          doc.text(`  - Temperatura: ${record.temperatura}°C`, 35, y);
          y += 5;
        }
      }

      // Medications
      if (record.medicamentos && record.medicamentos.length > 0) {
        doc.text(`Medicamentos:`, 30, y);
        y += 6;
        record.medicamentos.forEach((med) => {
          doc.text(
            `  - ${med.nombre}: ${med.dosis}, ${med.frecuencia}, ${med.duracion}`,
            35,
            y,
          );
          y += 5;
        });
      }

      if (record.observaciones) {
        doc.text(`Observaciones: ${record.observaciones}`, 30, y);
        y += 6;
      }

      y += 8; // Space between records
    });

    doc.save(
      `historial_${selectedPet.nombre}_${new Date().toISOString().split("T")[0]}.pdf`,
    );
  };

  // Navigation functions
  const handleSelectOwner = (owner: any) => {
    setSelectedOwner(owner);
    setCurrentView("pets");
    setSelectedPet(null);
  };

  const handleSelectPet = (pet: any) => {
    setSelectedPet(pet);
    setCurrentView("history");
  };

  const handleBackToOwners = () => {
    setCurrentView("owners");
    setSelectedOwner(null);
    setSelectedPet(null);
  };

  const handleBackToPets = () => {
    setCurrentView("pets");
    setSelectedPet(null);
  };

  const getConsultationIcon = (tipo: string) => {
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

  const getBadgeVariant = (tipo: string) => {
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
                    Gestiona el historial médico completo
                  </p>

                  {/* Breadcrumb */}
                  <div className="flex items-center space-x-2 mt-2 text-sm text-vet-gray-500">
                    <span
                      className={`cursor-pointer hover:text-vet-primary ${currentView === "owners" ? "text-vet-primary font-medium" : ""}`}
                      onClick={handleBackToOwners}
                    >
                      Propietarios
                    </span>
                    {selectedOwner && (
                      <>
                        <ChevronRight className="w-3 h-3" />
                        <span
                          className={`cursor-pointer hover:text-vet-primary ${currentView === "pets" ? "text-vet-primary font-medium" : ""}`}
                          onClick={handleBackToPets}
                        >
                          {selectedOwner.nombre}
                        </span>
                      </>
                    )}
                    {selectedPet && (
                      <>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-vet-primary font-medium">
                          {selectedPet.nombre}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {currentView === "history" &&
                selectedPet &&
                historialMascota.length > 0 && (
                  <Button
                    onClick={downloadHistorialPDF}
                    className="bg-vet-primary hover:bg-vet-primary-dark"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar PDF
                  </Button>
                )}
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                    <Input
                      placeholder={
                        currentView === "owners"
                          ? "Buscar propietarios..."
                          : currentView === "pets"
                            ? "Buscar mascotas..."
                            : "Buscar en historial..."
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {currentView === "pets" && (
                  <>
                    <Select
                      value={filterSpecies}
                      onValueChange={setFilterSpecies}
                    >
                      <SelectTrigger>
                        <PawPrint className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Especie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">
                          Todas las especies
                        </SelectItem>
                        {especiesUnicas.map((especie) => (
                          <SelectItem key={especie} value={especie}>
                            {especie}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filterSex} onValueChange={setFilterSex}>
                      <SelectTrigger>
                        <Heart className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Sexo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="Macho">Macho</SelectItem>
                        <SelectItem value="Hembra">Hembra</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}

                {currentView === "history" && (
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los registros</SelectItem>
                      <SelectItem value="consultas">Solo consultas</SelectItem>
                      <SelectItem value="vacunas">Solo vacunas</SelectItem>
                      <SelectItem value="examenes">Solo exámenes</SelectItem>
                      <SelectItem value="urgencias">Urgencias</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {(filterSpecies !== "todos" ||
                  filterSex !== "todos" ||
                  filterType !== "todos") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilterSpecies("todos");
                      setFilterSex("todos");
                      setFilterType("todos");
                    }}
                    className="md:col-start-4"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content based on current view */}
          {currentView === "owners" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClientes.length === 0 ? (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="p-12 text-center">
                      <User className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                        No hay propietarios
                      </h3>
                      <p className="text-vet-gray-600">
                        No se encontraron propietarios con historial clínico
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                filteredClientes.map((cliente) => {
                  const mascotasCount = mascotas.filter(
                    (m) => m.clienteId === cliente.id,
                  ).length;
                  const historialCount = historialClinico.filter((h) => {
                    const mascota = mascotas.find((m) => m.id === h.mascotaId);
                    return mascota && mascota.clienteId === cliente.id;
                  }).length;

                  return (
                    <Card
                      key={cliente.id}
                      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-vet-primary"
                      onClick={() => handleSelectOwner(cliente)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-vet-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-vet-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg text-vet-gray-900 mb-1">
                              {cliente.nombre}
                            </h4>
                            <div className="space-y-1 text-sm text-vet-gray-600">
                              {cliente.email && (
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4" />
                                  <span>{cliente.email}</span>
                                </div>
                              )}
                              {cliente.telefono && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{cliente.telefono}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-3">
                              <Badge variant="outline">
                                {mascotasCount} mascota
                                {mascotasCount !== 1 ? "s" : ""}
                              </Badge>
                              <Badge className="bg-vet-primary/10 text-vet-primary">
                                {historialCount} registro
                                {historialCount !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-vet-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {currentView === "pets" && selectedOwner && (
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <Button
                  variant="outline"
                  onClick={handleBackToOwners}
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <div>
                  <h2 className="text-xl font-bold text-vet-gray-900">
                    Mascotas de {selectedOwner.nombre}
                  </h2>
                  <p className="text-vet-gray-600">
                    {filteredPets.length} mascota
                    {filteredPets.length !== 1 ? "s" : ""} encontrada
                    {filteredPets.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPets.length === 0 ? (
                  <div className="col-span-full">
                    <Card>
                      <CardContent className="p-12 text-center">
                        <PawPrint className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                          No hay mascotas
                        </h3>
                        <p className="text-vet-gray-600">
                          No se encontraron mascotas que coincidan con los
                          filtros
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  filteredPets.map((pet) => {
                    const historialCount = getHistorialByMascota(pet.id).length;
                    const ultimaVisita = getHistorialByMascota(pet.id).sort(
                      (a, b) =>
                        new Date(b.fecha).getTime() -
                        new Date(a.fecha).getTime(),
                    )[0];

                    return (
                      <Card
                        key={pet.id}
                        className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-vet-secondary"
                        onClick={() => handleSelectPet(pet)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-vet-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 relative">
                              {pet.foto ? (
                                <img
                                  src={pet.foto}
                                  alt={pet.nombre}
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
                                className={`w-6 h-6 text-vet-secondary ${pet.foto ? "hidden" : ""}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg text-vet-gray-900 mb-1">
                                {pet.nombre}
                              </h4>
                              <div className="space-y-1 text-sm text-vet-gray-600">
                                <p>
                                  <strong>Especie:</strong> {pet.especie}
                                </p>
                                <p>
                                  <strong>Raza:</strong>{" "}
                                  {pet.raza || "No especificada"}
                                  {!pet.raza && (
                                    <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-1 py-0.5 rounded">
                                      Sin registrar
                                    </span>
                                  )}
                                </p>
                                <p>
                                  <strong>Sexo:</strong>{" "}
                                  {pet.sexo || "No especificado"}
                                  {!pet.sexo && (
                                    <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-1 py-0.5 rounded">
                                      Sin registrar
                                    </span>
                                  )}
                                </p>
                                {pet.fechaNacimiento && (
                                  <p>
                                    <strong>Edad:</strong>{" "}
                                    {(() => {
                                      const birthDate = new Date(
                                        pet.fechaNacimiento,
                                      );
                                      const today = new Date();
                                      const ageInYears = Math.floor(
                                        (today.getTime() -
                                          birthDate.getTime()) /
                                          (365.25 * 24 * 60 * 60 * 1000),
                                      );
                                      const ageInMonths = Math.floor(
                                        (today.getTime() -
                                          birthDate.getTime()) /
                                          (30.44 * 24 * 60 * 60 * 1000),
                                      );

                                      if (ageInYears >= 2) {
                                        return `${ageInYears} años`;
                                      } else if (ageInYears === 1) {
                                        const extraMonths = ageInMonths - 12;
                                        return extraMonths > 0
                                          ? `1 año ${extraMonths} mes${extraMonths > 1 ? "es" : ""}`
                                          : "1 año";
                                      } else {
                                        return `${ageInMonths} mes${ageInMonths > 1 ? "es" : ""}`;
                                      }
                                    })()}
                                  </p>
                                )}
                                {pet.peso && (
                                  <p>
                                    <strong>Peso:</strong> {pet.peso} kg
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 mt-3">
                                <Badge className="bg-green-100 text-green-800">
                                  {historialCount} registro
                                  {historialCount !== 1 ? "s" : ""}
                                </Badge>
                                {ultimaVisita && (
                                  <Badge variant="outline" className="text-xs">
                                    Última:{" "}
                                    {new Date(
                                      ultimaVisita.fecha,
                                    ).toLocaleDateString("es-ES")}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-vet-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {currentView === "history" && selectedPet && selectedOwner && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={handleBackToPets}
                    size="sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>
                  <div>
                    <h2 className="text-xl font-bold text-vet-gray-900">
                      Historial de {selectedPet.nombre}
                    </h2>
                    <p className="text-vet-gray-600">
                      Propietario: {selectedOwner.nombre} •{" "}
                      {filteredHistory.length} registro
                      {filteredHistory.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {historialMascota.length > 0 && (
                  <Button
                    onClick={downloadHistorialPDF}
                    className="bg-vet-primary hover:bg-vet-primary-dark"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar PDF
                  </Button>
                )}
              </div>

              {/* Pet info card */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-vet-primary/10 rounded-xl flex items-center justify-center">
                      <PawPrint className="w-8 h-8 text-vet-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-vet-gray-900">
                        {selectedPet.nombre}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-vet-gray-600">
                        <div>
                          <strong>Especie:</strong> {selectedPet.especie}
                        </div>
                        <div>
                          <strong>Raza:</strong>{" "}
                          {selectedPet.raza || "No especificada"}
                          {!selectedPet.raza && (
                            <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                              Sin registrar
                            </span>
                          )}
                        </div>
                        <div>
                          <strong>Sexo:</strong>{" "}
                          {selectedPet.sexo || "No especificado"}
                          {!selectedPet.sexo && (
                            <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                              Sin registrar
                            </span>
                          )}
                        </div>
                        {selectedPet.peso && (
                          <div>
                            <strong>Peso:</strong> {selectedPet.peso} kg
                          </div>
                        )}
                        {selectedPet.fechaNacimiento && (
                          <div>
                            <strong>Edad:</strong>{" "}
                            {(() => {
                              const birthDate = new Date(
                                selectedPet.fechaNacimiento,
                              );
                              const today = new Date();
                              const ageInYears = Math.floor(
                                (today.getTime() - birthDate.getTime()) /
                                  (365.25 * 24 * 60 * 60 * 1000),
                              );
                              const ageInMonths = Math.floor(
                                (today.getTime() - birthDate.getTime()) /
                                  (30.44 * 24 * 60 * 60 * 1000),
                              );

                              if (ageInYears >= 2) {
                                return `${ageInYears} años`;
                              } else if (ageInYears === 1) {
                                const extraMonths = ageInMonths - 12;
                                return extraMonths > 0
                                  ? `1 año ${extraMonths} mes${extraMonths > 1 ? "es" : ""}`
                                  : "1 año";
                              } else {
                                return `${ageInMonths} mes${ageInMonths > 1 ? "es" : ""}`;
                              }
                            })()}
                          </div>
                        )}
                        {selectedPet.microchip && (
                          <div>
                            <strong>Microchip:</strong> {selectedPet.microchip}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Clinical history */}
              {filteredHistory.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                      No hay registros médicos
                    </h3>
                    <p className="text-vet-gray-600 mb-4">
                      No se encontraron registros médicos para esta mascota
                    </p>

                    {/* Debug information */}
                    <div className="text-left bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Información de depuración:
                      </h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>
                          <strong>Mascota ID:</strong> {selectedPet?.id}
                        </p>
                        <p>
                          <strong>Nombre:</strong> {selectedPet?.nombre}
                        </p>
                        <p>
                          <strong>Total de registros en sistema:</strong>{" "}
                          {historialClinico.length}
                        </p>
                        <p>
                          <strong>
                            Registros encontrados para esta mascota:
                          </strong>{" "}
                          {historialMascota.length}
                        </p>
                        <p>
                          <strong>Registros después de filtros:</strong>{" "}
                          {filteredHistory.length}
                        </p>

                        {historialClinico.length > 0 && (
                          <div className="mt-2">
                            <p>
                              <strong>Ejemplos de mascotaId en sistema:</strong>
                            </p>
                            <ul className="list-disc ml-4">
                              {historialClinico.slice(0, 3).map((record, i) => (
                                <li key={i}>
                                  ID: {record.mascotaId}, Nombre:{" "}
                                  {record.mascotaNombre}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Test button to create sample record */}
                        <div className="mt-4">
                          <Button
                            onClick={async () => {
                              if (selectedPet && addHistorialEntry) {
                                const testRecord = {
                                  mascotaId: selectedPet.id,
                                  mascotaNombre: selectedPet.nombre,
                                  fecha: new Date(),
                                  veterinario:
                                    user?.nombre || "Veterinario Test",
                                  tipoConsulta: "consulta_general" as const,
                                  motivo: "Consulta de prueba",
                                  diagnostico:
                                    "Diagnóstico de prueba para verificar funcionamiento",
                                  tratamiento: "Tratamiento de prueba",
                                  medicamentos: [],
                                  examenes: [],
                                  observaciones:
                                    "Registro creado para prueba del sistema",
                                  estado: "completada" as const,
                                };

                                if (
                                  window.confirm(
                                    "¿Crear registro de prueba para esta mascota?",
                                  )
                                ) {
                                  try {
                                    console.log(
                                      "Creating test record:",
                                      testRecord,
                                    );
                                    await addHistorialEntry(testRecord);
                                    alert(
                                      "Registro de prueba creado exitosamente!",
                                    );
                                    // The component should re-render automatically due to context update
                                  } catch (error) {
                                    console.error(
                                      "Error creating test record:",
                                      error,
                                    );
                                    alert(
                                      "Error al crear el registro de prueba",
                                    );
                                  }
                                }
                              }
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Crear Registro de Prueba
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredHistory.map((record, index) => (
                    <Card
                      key={record.id || index}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
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
                                    {new Date(record.fecha).toLocaleDateString(
                                      "es-ES",
                                    )}
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowDetailModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Detail Modal */}
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
                  {/* Basic information */}
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

                  {/* Reason */}
                  <div>
                    <Label className="text-sm font-medium text-vet-gray-700">
                      Motivo de la Consulta
                    </Label>
                    <p className="text-vet-gray-900 mt-1">
                      {selectedRecord.motivo}
                    </p>
                  </div>

                  {/* Diagnosis */}
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

                  {/* Treatment */}
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

                  {/* Vital signs */}
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

                  {/* Medications */}
                  {selectedRecord.medicamentos &&
                    selectedRecord.medicamentos.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-vet-gray-700">
                          Medicamentos Recetados
                        </Label>
                        <div className="mt-2 space-y-2">
                          {selectedRecord.medicamentos.map(
                            (med: any, index: number) => (
                              <div
                                key={index}
                                className="border border-vet-gray-200 rounded-lg p-3"
                              >
                                <div className="font-medium text-vet-gray-900">
                                  {med.nombre}
                                </div>
                                <div className="text-sm text-vet-gray-600 mt-1">
                                  <span>Dosis: {med.dosis}</span> •{" "}
                                  <span>Frecuencia: {med.frecuencia}</span> •{" "}
                                  <span>Duración: {med.duracion}</span>
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
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {/* Exams */}
                  {selectedRecord.examenes &&
                    selectedRecord.examenes.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-vet-gray-700">
                          Exámenes Realizados
                        </Label>
                        <div className="mt-2 space-y-2">
                          {selectedRecord.examenes.map(
                            (exam: any, index: number) => (
                              <div
                                key={index}
                                className="border border-vet-gray-200 rounded-lg p-3"
                              >
                                <div className="font-medium text-vet-gray-900">
                                  {exam.tipo}
                                </div>
                                <div className="text-sm text-vet-gray-600 mt-1">
                                  <span className="font-medium">
                                    Resultado:
                                  </span>{" "}
                                  {exam.resultado}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {/* Observations */}
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

                  {/* Next visit */}
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
