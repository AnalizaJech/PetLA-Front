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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ChevronDown,
  Calendar as CalendarIcon,
  Clock,
  Edit,
} from "lucide-react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

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
  const [filterHistoryType, setFilterHistoryType] = useState("todos");

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
            clienteId: "unknown",
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

  // Get clients with pets that have appointments with this veterinarian
  const misClientes = useMemo(() => {
    const citasVeterinario = citas.filter(
      (cita) => cita.veterinario === user.nombre,
    );
    const clienteIds = new Set(
      citasVeterinario
        .map((cita) => {
          const mascota = mascotas.find(
            (m) =>
              m.nombre.toLowerCase() === cita.mascota.toLowerCase() ||
              m.id === cita.mascotaId,
          );
          return mascota?.clienteId;
        })
        .filter(Boolean),
    );

    return usuarios
      .filter(
        (usuario) => clienteIds.has(usuario.id) && usuario.rol === "cliente",
      )
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [citas, mascotas, usuarios, user.nombre]);

  // Get pets for selected owner
  const mascotasDelPropietario = useMemo(() => {
    if (!selectedOwner) return [];

    const mascotasPropietario = mascotas.filter(
      (mascota) => mascota.clienteId === selectedOwner.id,
    );

    // Filter pets that have appointments with this veterinarian
    const mascotasConCitas = mascotasPropietario.filter((mascota) =>
      citas.some(
        (cita) =>
          cita.veterinario === user.nombre &&
          (cita.mascota.toLowerCase() === mascota.nombre.toLowerCase() ||
            cita.mascotaId === mascota.id),
      ),
    );

    return mascotasConCitas.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [selectedOwner, mascotas, citas, user.nombre]);

  // Get medical history for selected pet with service type from appointments
  const historialMascota = useMemo(() => {
    if (!selectedPet) return [];

    return historialClinico
      .filter((record) => {
        // Match by pet ID or name and veterinarian
        const matchesPet =
          record.mascotaId === selectedPet.id ||
          (record.mascotaNombre &&
            record.mascotaNombre.toLowerCase() ===
              selectedPet.nombre.toLowerCase());
        const matchesVet = record.veterinario === user.nombre;
        return matchesPet && matchesVet;
      })
      .map((record) => {
        // Try to find the corresponding appointment to get the real service type
        const correspondingCita = citas.find(
          (cita) =>
            cita.id === record.citaId ||
            (cita.veterinario === user.nombre &&
              cita.mascota.toLowerCase() === selectedPet.nombre.toLowerCase() &&
              Math.abs(
                new Date(cita.fecha).getTime() -
                  new Date(record.fecha).getTime(),
              ) <
                24 * 60 * 60 * 1000), // Within 24 hours
        );

        return {
          ...record,
          tipo:
            correspondingCita?.tipoConsulta ||
            record.tipo ||
            record.tipoConsulta ||
            "Consulta",
        };
      })
      .sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      );
  }, [selectedPet, historialClinico, user.nombre, citas]);

  // Filter medical history
  const filteredHistory = useMemo(() => {
    let filtered = historialMascota;

    if (filterHistoryType !== "todos") {
      filtered = filtered.filter((record) => {
        const recordType = record.tipo?.toLowerCase() || "";
        const filterType = filterHistoryType.toLowerCase();

        // Mapear diferentes variantes de nombres de servicios
        if (filterType === "vacunacion") {
          return recordType.includes("vacun");
        }
        if (filterType === "emergencia") {
          return recordType.includes("emergencia");
        }
        if (filterType === "cirugia") {
          return recordType.includes("cirug");
        }
        if (filterType === "grooming") {
          return recordType.includes("grooming");
        }
        if (filterType === "diagnostico") {
          return recordType.includes("diagnostic");
        }
        if (filterType === "consulta") {
          return recordType.includes("consulta") || recordType === "consulta general";
        }
        if (filterType === "control") {
          return recordType.includes("control");
        }

        return recordType === filterType;
      });
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.diagnostico?.toLowerCase().includes(search) ||
          record.tratamiento?.toLowerCase().includes(search) ||
          record.observaciones?.toLowerCase().includes(search) ||
          record.tipo?.toLowerCase().includes(search),
      );
    }

    return filtered;
  }, [historialMascota, filterHistoryType, searchTerm]);

  // Download functions
  const downloadHistorialPDF = () => {
    if (!selectedPet) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 30;

      // Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Historial Clínico Veterinario", margin, yPosition);

      yPosition += 15;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Mascota: ${selectedPet.nombre}`, margin, yPosition);
      doc.text(`Especie: ${selectedPet.especie || "No especificada"}`, margin, yPosition + 10);
      doc.text(`Raza: ${selectedPet.raza || "No especificada"}`, margin, yPosition + 20);
      doc.text(`Sexo: ${selectedPet.sexo || "No especificado"}`, margin, yPosition + 30);
      doc.text(
        `Propietario: ${selectedOwner ? `${selectedOwner.nombre} ${selectedOwner.apellidos || ''}` : "No registrado"}`,
        margin,
        yPosition + 40,
      );
      if (selectedOwner?.telefono) {
        doc.text(`Teléfono: ${selectedOwner.telefono}`, margin, yPosition + 50);
      }
      if (selectedOwner?.email) {
        doc.text(`Email: ${selectedOwner.email}`, margin, yPosition + 60);
      }
      doc.text(`Veterinario: ${user.nombre}`, margin, yPosition + 70);
      doc.text(
        `Generado el: ${new Date().toLocaleDateString("es-ES")}`,
        margin,
        yPosition + 80,
      );

      yPosition += 100;

      if (filteredHistory.length === 0) {
        doc.text("No hay registros médicos disponibles.", margin, yPosition);
      } else {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Registros Médicos", margin, yPosition);
        yPosition += 15;

        filteredHistory.forEach((record, index) => {
          if (yPosition > 220) {
            doc.addPage();
            yPosition = 30;
          }

          // Encabezado del registro
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text(
            `${index + 1}. ${new Date(record.fecha).toLocaleDateString("es-ES")} - ${record.tipo || "Consulta"}`,
            margin,
            yPosition,
          );
          yPosition += 15;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);

          // Información básica
          if (record.motivo) {
            const motivoLines = doc.splitTextToSize(
              `Motivo de Consulta: ${record.motivo}`,
              pageWidth - 2 * margin,
            );
            motivoLines.forEach((line: string) => {
              doc.text(line, margin + 5, yPosition);
              yPosition += 5;
            });
            yPosition += 3;
          }

          // Signos vitales
          let vitalSigns = [];
          if (record.peso) vitalSigns.push(`Peso: ${record.peso} kg`);
          if (record.temperatura) vitalSigns.push(`Temperatura: ${record.temperatura}°C`);
          if (record.presionArterial) vitalSigns.push(`P.A.: ${record.presionArterial}`);
          if (record.frecuenciaCardiaca) vitalSigns.push(`F.C.: ${record.frecuenciaCardiaca} bpm`);

          if (vitalSigns.length > 0) {
            doc.text(`Signos Vitales: ${vitalSigns.join(", ")}`, margin + 5, yPosition);
            yPosition += 8;
          }

          // Diagnóstico
          if (record.diagnostico) {
            const diagnosticoLines = doc.splitTextToSize(
              `Diagnóstico: ${record.diagnostico}`,
              pageWidth - 2 * margin,
            );
            diagnosticoLines.forEach((line: string) => {
              doc.text(line, margin + 5, yPosition);
              yPosition += 5;
            });
            yPosition += 3;
          }

          // Tratamiento
          if (record.tratamiento) {
            const tratamientoLines = doc.splitTextToSize(
              `Tratamiento: ${record.tratamiento}`,
              pageWidth - 2 * margin,
            );
            tratamientoLines.forEach((line: string) => {
              doc.text(line, margin + 5, yPosition);
              yPosition += 5;
            });
            yPosition += 3;
          }

          // Medicamentos
          if (record.medicamentos && record.medicamentos.length > 0) {
            doc.text(`Medicamentos:`, margin + 5, yPosition);
            yPosition += 6;
            record.medicamentos.forEach((med, medIndex) => {
              const medText = `${medIndex + 1}. ${med.nombre} - ${med.dosis} - ${med.frecuencia}${med.duracion ? ` (${med.duracion})` : ''}`;
              const medLines = doc.splitTextToSize(medText, pageWidth - 2 * margin - 10);
              medLines.forEach((line: string) => {
                doc.text(line, margin + 10, yPosition);
                yPosition += 5;
              });
              if (med.indicaciones) {
                const instrLines = doc.splitTextToSize(
                  `   Indicaciones: ${med.indicaciones}`,
                  pageWidth - 2 * margin - 15
                );
                instrLines.forEach((line: string) => {
                  doc.text(line, margin + 15, yPosition);
                  yPosition += 5;
                });
              }
            });
            yPosition += 3;
          }

          // Servicios adicionales
          if (record.servicios && record.servicios.length > 0) {
            doc.text(`Servicios Realizados:`, margin + 5, yPosition);
            yPosition += 6;
            record.servicios.forEach((servicio, servIndex) => {
              const servText = `${servIndex + 1}. ${servicio.nombre}${servicio.precio ? ` - $${servicio.precio}` : ''}`;
              doc.text(servText, margin + 10, yPosition);
              yPosition += 5;
              if (servicio.descripcion) {
                const descLines = doc.splitTextToSize(
                  `   ${servicio.descripcion}`,
                  pageWidth - 2 * margin - 15
                );
                descLines.forEach((line: string) => {
                  doc.text(line, margin + 15, yPosition);
                  yPosition += 5;
                });
              }
            });
            yPosition += 3;
          }

          // Observaciones
          if (record.observaciones) {
            const observacionesLines = doc.splitTextToSize(
              `Observaciones: ${record.observaciones}`,
              pageWidth - 2 * margin,
            );
            observacionesLines.forEach((line: string) => {
              doc.text(line, margin + 5, yPosition);
              yPosition += 5;
            });
            yPosition += 3;
          }

          // Próxima cita
          if (record.proximaVisita || record.proximaCita) {
            const fechaProxima = record.proximaVisita || record.proximaCita;
            doc.text(
              `Próxima Cita: ${new Date(fechaProxima).toLocaleDateString("es-ES")}`,
              margin + 5,
              yPosition
            );
            yPosition += 8;
          }

          yPosition += 15; // Espacio entre registros
        });
      }

      doc.save(
        `historial-${selectedPet.nombre}-${new Date().toISOString().split("T")[0]}.pdf`,
      );
    } catch (error) {
      console.error("Error generando PDF:", error);
    }
  };

  const downloadHistorialExcel = () => {
    if (!selectedPet) return;

    try {
      // Información de la mascota y propietario
      const mascotaInfo = [
        { Campo: "Nombre de la Mascota", Valor: selectedPet.nombre },
        { Campo: "Especie", Valor: selectedPet.especie || "No especificada" },
        { Campo: "Raza", Valor: selectedPet.raza || "No especificada" },
        { Campo: "Sexo", Valor: selectedPet.sexo || "No especificado" },
        { Campo: "Propietario", Valor: selectedOwner ? `${selectedOwner.nombre} ${selectedOwner.apellidos || ''}` : "No registrado" },
        { Campo: "Teléfono", Valor: selectedOwner?.telefono || "No registrado" },
        { Campo: "Email", Valor: selectedOwner?.email || "No registrado" },
        { Campo: "Veterinario", Valor: user.nombre },
        { Campo: "Fecha de Generación", Valor: new Date().toLocaleDateString("es-ES") },
      ];

      const data = filteredHistory.map((record, index) => ({
        "#": index + 1,
        Fecha: new Date(record.fecha).toLocaleDateString("es-ES"),
        Tipo: record.tipo || "Consulta",
        Diagnóstico: record.diagnostico || "",
        Tratamiento: record.tratamiento || "",
        Observaciones: record.observaciones || "",
        Veterinario: record.veterinario,
        Peso: record.peso || "",
        Temperatura: record.temperatura || "",
        "Freq. Cardíaca": record.frecuenciaCardiaca || "",
      }));

      // Crear hoja de información de la mascota
      const wsInfo = XLSX.utils.json_to_sheet(mascotaInfo);
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();

      // Agregar hojas al libro
      XLSX.utils.book_append_sheet(wb, wsInfo, "Información de la Mascota");
      XLSX.utils.book_append_sheet(wb, ws, `Historial ${selectedPet.nombre}`);

      // Auto-size columns para información
      const colWidthsInfo = [
        { wch: 25 }, // Campo
        { wch: 40 }, // Valor
      ];
      wsInfo["!cols"] = colWidthsInfo;

      // Auto-size columns para historial
      const colWidths = [
        { wch: 5 }, // #
        { wch: 12 }, // Fecha
        { wch: 15 }, // Tipo
        { wch: 30 }, // Diagnóstico
        { wch: 30 }, // Tratamiento
        { wch: 25 }, // Observaciones
        { wch: 20 }, // Veterinario
        { wch: 8 }, // Peso
        { wch: 12 }, // Temperatura
        { wch: 12 }, // Freq. Cardíaca
      ];
      ws["!cols"] = colWidths;

      XLSX.writeFile(
        wb,
        `historial-${selectedPet.nombre}-${new Date().toISOString().split("T")[0]}.xlsx`,
      );
    } catch (error) {
      console.error("Error generando Excel:", error);
    }
  };

  const downloadHistorialTXT = () => {
    if (!selectedPet) return;

    try {
      let content = `HISTORIAL CLÍNICO VETERINARIO\n`;
      content += `========================================\n\n`;
      content += `INFORMACIÓN DE LA MASCOTA:\n`;
      content += `-------------------------\n`;
      content += `Nombre: ${selectedPet.nombre}\n`;
      content += `Especie: ${selectedPet.especie || "No especificada"}\n`;
      content += `Raza: ${selectedPet.raza || "No especificada"}\n`;
      content += `Sexo: ${selectedPet.sexo || "No especificado"}\n\n`;
      content += `INFORMACIÓN DEL PROPIETARIO:\n`;
      content += `----------------------------\n`;
      content += `Nombre: ${selectedOwner ? `${selectedOwner.nombre} ${selectedOwner.apellidos || ''}` : "No registrado"}\n`;
      if (selectedOwner?.telefono) content += `Teléfono: ${selectedOwner.telefono}\n`;
      if (selectedOwner?.email) content += `Email: ${selectedOwner.email}\n`;
      content += `\nVeterinario: ${user.nombre}\n`;
      content += `Generado el: ${new Date().toLocaleDateString("es-ES")}\n\n`;

      if (filteredHistory.length === 0) {
        content += "No hay registros médicos disponibles.\n";
      } else {
        content += `Total de registros: ${filteredHistory.length}\n\n`;
        content += `REGISTROS MÉDICOS:\n`;
        content += `==================\n\n`;

        filteredHistory.forEach((record, index) => {
          content += `${index + 1}. ${new Date(record.fecha).toLocaleDateString("es-ES")} - ${record.tipo || "Consulta"}\n`;

          // Signos vitales si están disponibles
          if (record.peso || record.temperatura || record.frecuenciaCardiaca) {
            content += `   SIGNOS VITALES:\n`;
            if (record.peso) content += `   - Peso: ${record.peso} kg\n`;
            if (record.temperatura) content += `   - Temperatura: ${record.temperatura}°C\n`;
            if (record.frecuenciaCardiaca) content += `   - Frecuencia Cardíaca: ${record.frecuenciaCardiaca} bpm\n`;
            content += `\n`;
          }

          if (record.diagnostico) {
            content += `   Diagnóstico: ${record.diagnostico}\n`;
          }
          if (record.tratamiento) {
            content += `   Tratamiento: ${record.tratamiento}\n`;
          }
          if (record.observaciones) {
            content += `   Observaciones: ${record.observaciones}\n`;
          }

          // Medicamentos si están disponibles
          if (record.medicamentos && record.medicamentos.length > 0) {
            content += `   MEDICAMENTOS:\n`;
            record.medicamentos.forEach((med, medIndex) => {
              content += `   ${medIndex + 1}. ${med.nombre} - ${med.dosis} - ${med.frecuencia}\n`;
              if (med.duracion) content += `      Duración: ${med.duracion}\n`;
            });
            content += `\n`;
          }

          content += `\n`;
        });
      }

      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `historial-${selectedPet.nombre}-${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generando TXT:", error);
    }
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
    const normalizedType = tipo?.toLowerCase();
    if (normalizedType?.includes("vacun"))
      return <Syringe className="w-4 h-4" />;
    if (normalizedType?.includes("emergencia"))
      return <AlertCircle className="w-4 h-4" />;
    if (normalizedType?.includes("cirug"))
      return <Activity className="w-4 h-4" />;
    if (normalizedType?.includes("grooming"))
      return <Heart className="w-4 h-4" />;
    if (normalizedType?.includes("control"))
      return <CheckCircle className="w-4 h-4" />;
    if (normalizedType?.includes("diagnostic"))
      return <Eye className="w-4 h-4" />;
    return <Stethoscope className="w-4 h-4" />;
  };

  const getServiceIconSVG = (tipo: string) => {
    const normalizedType = tipo?.toLowerCase();

    // Vacunación (Syringe)
    if (normalizedType?.includes("vacun")) {
      return <Syringe className="w-5 h-5 text-green-600" />;
    }

    // Emergencia (AlertCircle)
    if (normalizedType?.includes("emergencia")) {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }

    // Cirugía (Activity)
    if (normalizedType?.includes("cirug")) {
      return <Activity className="w-5 h-5 text-orange-600" />;
    }

    // Grooming (Heart)
    if (normalizedType?.includes("grooming")) {
      return <Heart className="w-5 h-5 text-pink-600" />;
    }

    // Diagnóstico (Search)
    if (normalizedType?.includes("diagnostic")) {
      return <Search className="w-5 h-5 text-blue-600" />;
    }

    // Consulta general (Stethoscope - default)
    return <Stethoscope className="w-5 h-5 text-vet-primary" />;
  };

  const getBadgeVariant = (tipo: string) => {
    const normalizedType = tipo?.toLowerCase();
    if (normalizedType?.includes("vacun"))
      return "bg-green-100 text-green-800 border-green-200";
    if (normalizedType?.includes("emergencia"))
      return "bg-red-100 text-red-800 border-red-200";
    if (normalizedType?.includes("cirug"))
      return "bg-purple-100 text-purple-800 border-purple-200";
    if (normalizedType?.includes("grooming"))
      return "bg-pink-100 text-pink-800 border-pink-200";
    if (normalizedType?.includes("control"))
      return "bg-blue-100 text-blue-800 border-blue-200";
    if (normalizedType?.includes("diagnostic"))
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
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
                          {selectedOwner.nombre} {selectedOwner.apellidos || ''}
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

              {/* Botón descargar historial en la misma línea del título */}
              {currentView === "history" && selectedPet && historialMascota.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-vet-primary hover:bg-vet-primary-dark">
                      <Download className="w-4 h-4 mr-2" />
                      Descargar Historial
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={downloadHistorialPDF}>
                      <FileText className="w-4 h-4 mr-2" />
                      PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={downloadHistorialExcel}>
                      <Download className="w-4 h-4 mr-2" />
                      Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={downloadHistorialTXT}>
                      <FileText className="w-4 h-4 mr-2" />
                      TXT
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Search and Filters for owners view */}
          {currentView === "owners" && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                  <Input
                    placeholder="Buscar propietarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filters for pets view */}
          {currentView === "pets" && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                    <Input
                      placeholder="Buscar mascotas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={filterSpecies}
                    onValueChange={setFilterSpecies}
                  >
                    <SelectTrigger>
                      <PawPrint className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Especie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas las especies</SelectItem>
                      <SelectItem value="perro">Perro</SelectItem>
                      <SelectItem value="gato">Gato</SelectItem>
                      <SelectItem value="ave">Ave</SelectItem>
                      <SelectItem value="roedor">Roedor</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterSex} onValueChange={setFilterSex}>
                    <SelectTrigger>
                      <User className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Ambos sexos</SelectItem>
                      <SelectItem value="macho">Macho</SelectItem>
                      <SelectItem value="hembra">Hembra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}


          {/* Search and Filters for history view */}
          {currentView === "history" && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                    <Input
                      placeholder="Buscar en historial..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={filterHistoryType}
                    onValueChange={setFilterHistoryType}
                  >
                    <SelectTrigger>
                      <Stethoscope className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Tipo de consulta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los tipos</SelectItem>
                      <SelectItem value="consulta">Consulta General</SelectItem>
                      <SelectItem value="vacunacion">Vacunación</SelectItem>
                      <SelectItem value="emergencia">Emergencia</SelectItem>
                      <SelectItem value="cirugia">Cirugía</SelectItem>
                      <SelectItem value="grooming">Grooming</SelectItem>
                      <SelectItem value="diagnostico">Diagnóstico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content based on current view */}
          {currentView === "owners" && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-vet-primary" />
                    <span>Propietarios ({misClientes.length})</span>
                  </CardTitle>
                  <CardDescription>
                    Selecciona un propietario para ver sus mascotas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {misClientes
                      .filter((cliente) =>
                        searchTerm
                          ? cliente.nombre
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            cliente.email
                              ?.toLowerCase()
                              .includes(searchTerm.toLowerCase())
                          : true,
                      )
                      .map((cliente) => {
                        const mascotasCount = mascotas.filter(
                          (m) => m.clienteId === cliente.id,
                        ).length;

                        return (
                          <Card
                            key={cliente.id}
                            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-vet-primary"
                            onClick={() => handleSelectOwner(cliente)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-vet-primary/10 rounded-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-vet-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-vet-gray-900 truncate">
                                    {cliente.nombre} {cliente.apellidos || ''}
                                  </h4>
                                  <div className="flex items-center space-x-2 mt-1">
                                    {cliente.telefono && (
                                      <div className="flex items-center space-x-1 text-xs text-vet-gray-600">
                                        <Phone className="w-3 h-3" />
                                        <span>{cliente.telefono}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between mt-2">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      <PawPrint className="w-3 h-3 mr-1" />
                                      {mascotasCount} mascota
                                      {mascotasCount !== 1 ? "s" : ""}
                                    </Badge>
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-vet-gray-400" />
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>

                  {misClientes.length === 0 && (
                    <div className="text-center py-12">
                      <User className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-vet-gray-900 mb-2">
                        No hay propietarios
                      </h3>
                      <p className="text-vet-gray-600">
                        No se encontraron propietarios con mascotas bajo tu
                        atención.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {currentView === "pets" && selectedOwner && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-vet-gray-900">
                  {selectedOwner.nombre} {selectedOwner.apellidos || ''}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mascotasDelPropietario
                  .filter((mascota) => {
                    const matchesSearch = searchTerm
                      ? mascota.nombre
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        mascota.raza
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      : true;
                    const matchesSpecies =
                      filterSpecies !== "todos"
                        ? mascota.especie?.toLowerCase() === filterSpecies
                        : true;
                    const matchesSex =
                      filterSex !== "todos"
                        ? mascota.sexo?.toLowerCase() === filterSex
                        : true;
                    return matchesSearch && matchesSpecies && matchesSex;
                  })
                  .map((mascota) => {
                    const registrosCount = historialClinico.filter(
                      (record) =>
                        (record.mascotaId === mascota.id ||
                          (record.mascotaNombre &&
                            record.mascotaNombre.toLowerCase() ===
                              mascota.nombre.toLowerCase())) &&
                        record.veterinario === user.nombre,
                    ).length;

                    const ultimaVisitaRecord = historialClinico
                      .filter(
                        (record) =>
                          (record.mascotaId === mascota.id ||
                            (record.mascotaNombre &&
                              record.mascotaNombre.toLowerCase() ===
                                mascota.nombre.toLowerCase())) &&
                          record.veterinario === user.nombre,
                      )
                      .sort(
                        (a, b) =>
                          new Date(b.fecha).getTime() -
                          new Date(a.fecha).getTime(),
                      )[0];

                    // Mejorar tipo de servicio para ultimaVisita
                    const ultimaVisita = ultimaVisitaRecord
                      ? {
                          ...ultimaVisitaRecord,
                          tipo: (() => {
                            const correspondingCita = citas.find(
                              (cita) =>
                                cita.id === ultimaVisitaRecord.citaId ||
                                (cita.veterinario === user.nombre &&
                                  cita.mascota.toLowerCase() ===
                                    mascota.nombre.toLowerCase() &&
                                  Math.abs(
                                    new Date(cita.fecha).getTime() -
                                      new Date(
                                        ultimaVisitaRecord.fecha,
                                      ).getTime(),
                                  ) <
                                    24 * 60 * 60 * 1000),
                            );
                            return (
                              correspondingCita?.tipoConsulta ||
                              ultimaVisitaRecord.tipo ||
                              ultimaVisitaRecord.tipoConsulta ||
                              "Consulta"
                            );
                          })(),
                        }
                      : null;

                    return (
                      <Card
                        key={mascota.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-vet-primary"
                        onClick={() => handleSelectPet(mascota)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-vet-primary/10 rounded-full flex items-center justify-center">
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
                              <div>
                                <h4 className="font-bold text-lg text-vet-gray-900">
                                  {mascota.nombre}
                                </h4>
                                <p className="text-sm text-vet-gray-600">
                                  {mascota.especie} •{" "}
                                  {mascota.raza || "Raza no especificada"}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-vet-gray-400" />
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-vet-gray-600">
                                Registros médicos:
                              </span>
                              <Badge variant="secondary">
                                {registrosCount} registro
                                {registrosCount !== 1 ? "s" : ""}
                              </Badge>
                            </div>

                            {ultimaVisita && (
                              <div className="flex items-center justify-between">
                                <span className="text-vet-gray-600">
                                  Última visita:
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {new Date(
                                    ultimaVisita.fecha,
                                  ).toLocaleDateString("es-ES")}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>

              {mascotasDelPropietario.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <PawPrint className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-vet-gray-900 mb-2">
                      No hay mascotas
                    </h3>
                    <p className="text-vet-gray-600">
                      Este propietario no tiene mascotas registradas con citas
                      contigo.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {currentView === "history" && selectedPet && (
            <div>

              {/* Pet info card */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-vet-primary/10 rounded-xl flex items-center justify-center">
                      {selectedPet.foto ? (
                        <img
                          src={selectedPet.foto}
                          alt={selectedPet.nombre}
                          className="w-full h-full rounded-xl object-cover"
                        />
                      ) : (
                        <PawPrint className="w-8 h-8 text-vet-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-vet-gray-900">
                          {selectedPet.nombre}
                        </h3>
                        {/* Icono del servicio más reciente */}
                        {historialMascota.length > 0 && (
                          <div className="flex items-center">
                            {getServiceIconSVG(historialMascota[0].tipo || "consulta")}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-vet-gray-600">
                        <div>
                          <strong>Especie:</strong> {selectedPet.especie}
                        </div>
                        <div>
                          <strong>Raza:</strong>{" "}
                          {selectedPet.raza || "No especificada"}
                        </div>
                        <div>
                          <strong>Sexo:</strong>{" "}
                          {selectedPet.sexo || "No especificado"}
                        </div>
                        <div>
                          <strong>Registros:</strong> {historialMascota.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical records */}
              <div className="space-y-4">
                {filteredHistory.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <FileText className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-vet-gray-900 mb-2">
                        No hay registros médicos
                      </h3>
                      <p className="text-vet-gray-600">
                        No se encontraron registros médicos para esta mascota.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredHistory.map((record) => {
                    const Icon = getConsultationIcon(record.tipo || "consulta");

                    return (
                      <Card
                        key={record.id}
                        className="hover:shadow-md transition-all duration-200"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-lg bg-vet-gray-100 flex items-center justify-center">
                                {getServiceIconSVG(record.tipo || "consulta")}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-vet-gray-900">
                                    {record.tipo
                                      ? record.tipo.charAt(0).toUpperCase() +
                                        record.tipo.slice(1)
                                      : "Consulta"}
                                  </h4>
                                </div>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-vet-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <CalendarIcon className="w-3 h-3" />
                                    <span>
                                      {new Date(
                                        record.fecha,
                                      ).toLocaleDateString("es-ES", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                      {new Date(
                                        record.fecha,
                                      ).toLocaleTimeString("es-ES", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {/* Motivo de consulta */}
                            {record.motivo && (
                              <div>
                                <h5 className="font-medium text-vet-gray-900 mb-1 flex items-center">
                                  <FileText className="w-4 h-4 mr-2 text-vet-primary" />
                                  Motivo de Consulta:
                                </h5>
                                <p className="text-vet-gray-700 ml-6">
                                  {record.motivo}
                                </p>
                              </div>
                            )}

                            {/* Signos vitales */}
                            {(record.peso || record.temperatura || record.presionArterial || record.frecuenciaCardiaca) && (
                              <div>
                                <h5 className="font-medium text-vet-gray-900 mb-2 flex items-center">
                                  <Heart className="w-4 h-4 mr-2 text-red-600" />
                                  Signos Vitales:
                                </h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ml-6 text-sm">
                                  {record.peso && (
                                    <div className="flex items-center space-x-1">
                                      <Weight className="w-3 h-3 text-vet-gray-600" />
                                      <span><strong>Peso:</strong> {record.peso} kg</span>
                                    </div>
                                  )}
                                  {record.temperatura && (
                                    <div className="flex items-center space-x-1">
                                      <Thermometer className="w-3 h-3 text-vet-gray-600" />
                                      <span><strong>Temp:</strong> {record.temperatura}°C</span>
                                    </div>
                                  )}
                                  {record.presionArterial && (
                                    <div className="flex items-center space-x-1">
                                      <Activity className="w-3 h-3 text-vet-gray-600" />
                                      <span><strong>P.A.:</strong> {record.presionArterial}</span>
                                    </div>
                                  )}
                                  {record.frecuenciaCardiaca && (
                                    <div className="flex items-center space-x-1">
                                      <Heart className="w-3 h-3 text-vet-gray-600" />
                                      <span><strong>F.C.:</strong> {record.frecuenciaCardiaca} bpm</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Diagnóstico */}
                            {record.diagnostico && (
                              <div>
                                <h5 className="font-medium text-vet-gray-900 mb-1 flex items-center">
                                  <Stethoscope className="w-4 h-4 mr-2 text-vet-primary" />
                                  Diagnóstico:
                                </h5>
                                <p className="text-vet-gray-700 ml-6">
                                  {record.diagnostico}
                                </p>
                              </div>
                            )}

                            {/* Tratamiento */}
                            {record.tratamiento && (
                              <div>
                                <h5 className="font-medium text-vet-gray-900 mb-1 flex items-center">
                                  <Pill className="w-4 h-4 mr-2 text-green-600" />
                                  Tratamiento:
                                </h5>
                                <p className="text-vet-gray-700 ml-6">
                                  {record.tratamiento}
                                </p>
                              </div>
                            )}

                            {/* Medicamentos */}
                            {record.medicamentos && record.medicamentos.length > 0 && (
                              <div>
                                <h5 className="font-medium text-vet-gray-900 mb-2 flex items-center">
                                  <Pill className="w-4 h-4 mr-2 text-blue-600" />
                                  Medicamentos Recetados:
                                </h5>
                                <div className="space-y-2 ml-6">
                                  {record.medicamentos.map((med, index) => (
                                    <div key={index} className="border border-vet-gray-200 rounded-lg p-3">
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                        <div>
                                          <strong>Medicamento:</strong> {med.nombre}
                                        </div>
                                        <div>
                                          <strong>Dosis:</strong> {med.dosis}
                                        </div>
                                        <div>
                                          <strong>Frecuencia:</strong> {med.frecuencia}
                                        </div>
                                        {med.duracion && (
                                          <div>
                                            <strong>Duración:</strong> {med.duracion}
                                          </div>
                                        )}
                                        {med.indicaciones && (
                                          <div className="md:col-span-3">
                                            <strong>Indicaciones:</strong> {med.indicaciones}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Servicios adicionales */}
                            {record.servicios && record.servicios.length > 0 && (
                              <div>
                                <h5 className="font-medium text-vet-gray-900 mb-2 flex items-center">
                                  <Activity className="w-4 h-4 mr-2 text-purple-600" />
                                  Servicios Realizados:
                                </h5>
                                <div className="space-y-2 ml-6">
                                  {record.servicios.map((servicio, index) => (
                                    <div key={index} className="border border-vet-gray-200 rounded-lg p-3">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div>
                                          <strong>Servicio:</strong> {servicio.nombre}
                                        </div>
                                        {servicio.precio && (
                                          <div>
                                            <strong>Precio:</strong> ${servicio.precio}
                                          </div>
                                        )}
                                        {servicio.descripcion && (
                                          <div className="md:col-span-2">
                                            <strong>Descripción:</strong> {servicio.descripcion}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Observaciones */}
                            {record.observaciones && (
                              <div>
                                <h5 className="font-medium text-vet-gray-900 mb-1 flex items-center">
                                  <FileText className="w-4 h-4 mr-2 text-vet-gray-600" />
                                  Observaciones:
                                </h5>
                                <p className="text-vet-gray-700 ml-6">
                                  {record.observaciones}
                                </p>
                              </div>
                            )}

                            {/* Próxima cita */}
                            {(record.proximaVisita || record.proximaCita) && (
                              <div>
                                <h5 className="font-medium text-vet-gray-900 mb-1 flex items-center">
                                  <CalendarIcon className="w-4 h-4 mr-2 text-vet-primary" />
                                  Próxima Cita:
                                </h5>
                                <p className="text-vet-gray-700 ml-6">
                                  {new Date(record.proximaVisita || record.proximaCita).toLocaleDateString("es-ES", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-vet-gray-200">
                              <div className="flex items-center space-x-1 text-xs text-vet-gray-500">
                                <User className="w-3 h-3" />
                                <span>Dr. {record.veterinario}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Record Detail Modal */}
          <Dialog open={showDetailModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
                <DialogTitle className="flex items-center space-x-2">
                  {selectedRecord &&
                    getConsultationIcon(selectedRecord.tipo || "consulta")}
                  <span>Detalle del Registro Médico</span>
                </DialogTitle>
                <DialogDescription>
                  {selectedRecord && (
                    <span>
                      {new Date(selectedRecord.fecha).toLocaleDateString(
                        "es-ES",
                      )}{" "}
                      -{" "}
                      {selectedRecord.tipo ||
                        selectedRecord.tipoConsulta ||
                        "Consulta"}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              {selectedRecord && (
                <div className="space-y-6">
                  {/* Información básica */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        {getConsultationIcon(selectedRecord.tipo || "consulta")}
                        <span>Información del Servicio</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong className="text-vet-gray-900">Fecha:</strong>
                          <p className="text-vet-gray-700">
                            {new Date(selectedRecord.fecha).toLocaleDateString(
                              "es-ES",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <div>
                          <strong className="text-vet-gray-900">Hora:</strong>
                          <p className="text-vet-gray-700">
                            {new Date(selectedRecord.fecha).toLocaleTimeString(
                              "es-ES",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                        <div>
                          <strong className="text-vet-gray-900">
                            Tipo de Servicio:
                          </strong>
                          <div className="mt-1">
                            <Badge
                              className={getBadgeVariant(
                                selectedRecord.tipo || "consulta",
                              )}
                            >
                              {selectedRecord.tipo ||
                                selectedRecord.tipoConsulta ||
                                "Consulta"}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <strong className="text-vet-gray-900">
                            Veterinario:
                          </strong>
                          <p className="text-vet-gray-700 flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {selectedRecord.veterinario}
                          </p>
                        </div>
                        {selectedRecord.motivo && (
                          <div className="col-span-2">
                            <strong className="text-vet-gray-900">
                              Motivo de Consulta:
                            </strong>
                            <p className="text-vet-gray-700 mt-1">
                              {selectedRecord.motivo}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Diagnóstico */}
                  {selectedRecord.diagnostico && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Stethoscope className="w-5 h-5 text-vet-primary" />
                          <span>Diagnóstico</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-vet-gray-700 leading-relaxed">
                          {selectedRecord.diagnostico}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Tratamiento */}
                  {selectedRecord.tratamiento && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Pill className="w-5 h-5 text-green-600" />
                          <span>Tratamiento</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-vet-gray-700 leading-relaxed">
                          {selectedRecord.tratamiento}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Medicamentos */}
                  {selectedRecord.medicamentos &&
                    selectedRecord.medicamentos.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Pill className="w-5 h-5 text-blue-600" />
                            <span>Medicamentos Recetados</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedRecord.medicamentos.map((med, index) => (
                              <div
                                key={index}
                                className="border border-vet-gray-200 rounded-lg p-3"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                  <div>
                                    <strong className="text-vet-gray-900">
                                      Medicamento:
                                    </strong>
                                    <p className="text-vet-gray-700">
                                      {med.nombre}
                                    </p>
                                  </div>
                                  <div>
                                    <strong className="text-vet-gray-900">
                                      Dosis:
                                    </strong>
                                    <p className="text-vet-gray-700">
                                      {med.dosis}
                                    </p>
                                  </div>
                                  <div>
                                    <strong className="text-vet-gray-900">
                                      Frecuencia:
                                    </strong>
                                    <p className="text-vet-gray-700">
                                      {med.frecuencia}
                                    </p>
                                  </div>
                                  {med.duracion && (
                                    <div>
                                      <strong className="text-vet-gray-900">
                                        Duración:
                                      </strong>
                                      <p className="text-vet-gray-700">
                                        {med.duracion}
                                      </p>
                                    </div>
                                  )}
                                  {med.instrucciones && (
                                    <div className="md:col-span-3">
                                      <strong className="text-vet-gray-900">
                                        Instrucciones:
                                      </strong>
                                      <p className="text-vet-gray-700">
                                        {med.instrucciones}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                  {/* Servicios Adicionales */}
                  {selectedRecord.servicios &&
                    selectedRecord.servicios.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Activity className="w-5 h-5 text-purple-600" />
                            <span>Servicios Realizados</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedRecord.servicios.map((servicio, index) => (
                              <div
                                key={index}
                                className="border border-vet-gray-200 rounded-lg p-3"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <strong className="text-vet-gray-900">
                                      Servicio:
                                    </strong>
                                    <p className="text-vet-gray-700">
                                      {servicio.nombre}
                                    </p>
                                  </div>
                                  {servicio.precio && (
                                    <div>
                                      <strong className="text-vet-gray-900">
                                        Precio:
                                      </strong>
                                      <p className="text-vet-gray-700">
                                        ${servicio.precio}
                                      </p>
                                    </div>
                                  )}
                                  {servicio.duracion && (
                                    <div>
                                      <strong className="text-vet-gray-900">
                                        Duración:
                                      </strong>
                                      <p className="text-vet-gray-700">
                                        {servicio.duracion}
                                      </p>
                                    </div>
                                  )}
                                  {servicio.descripcion && (
                                    <div className="md:col-span-2">
                                      <strong className="text-vet-gray-900">
                                        Descripción:
                                      </strong>
                                      <p className="text-vet-gray-700">
                                        {servicio.descripcion}
                                      </p>
                                    </div>
                                  )}
                                  {servicio.notas && (
                                    <div className="md:col-span-2">
                                      <strong className="text-vet-gray-900">
                                        Notas:
                                      </strong>
                                      <p className="text-vet-gray-700">
                                        {servicio.notas}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                  {/* Signos Vitales */}
                  {(selectedRecord.peso ||
                    selectedRecord.temperatura ||
                    selectedRecord.frecuenciaCardiaca) && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Heart className="w-5 h-5 text-red-600" />
                          <span>Signos Vitales</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {selectedRecord.peso && (
                            <div className="flex items-center space-x-2">
                              <Weight className="w-4 h-4 text-vet-gray-600" />
                              <div>
                                <strong className="text-vet-gray-900">
                                  Peso:
                                </strong>
                                <p className="text-vet-gray-700">
                                  {selectedRecord.peso} kg
                                </p>
                              </div>
                            </div>
                          )}
                          {selectedRecord.temperatura && (
                            <div className="flex items-center space-x-2">
                              <Thermometer className="w-4 h-4 text-vet-gray-600" />
                              <div>
                                <strong className="text-vet-gray-900">
                                  Temperatura:
                                </strong>
                                <p className="text-vet-gray-700">
                                  {selectedRecord.temperatura}°C
                                </p>
                              </div>
                            </div>
                          )}
                          {selectedRecord.frecuenciaCardiaca && (
                            <div className="flex items-center space-x-2">
                              <Heart className="w-4 h-4 text-vet-gray-600" />
                              <div>
                                <strong className="text-vet-gray-900">
                                  Frecuencia Cardíaca:
                                </strong>
                                <p className="text-vet-gray-700">
                                  {selectedRecord.frecuenciaCardiaca} bpm
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Observaciones */}
                  {selectedRecord.observaciones && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <FileText className="w-5 h-5 text-vet-gray-600" />
                          <span>Observaciones Adicionales</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-vet-gray-700 leading-relaxed">
                          {selectedRecord.observaciones}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Próxima Cita */}
                  {selectedRecord.proximaCita && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <CalendarIcon className="w-5 h-5 text-vet-primary" />
                          <span>Próxima Cita</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-vet-gray-700">
                          {new Date(
                            selectedRecord.proximaCita,
                          ).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Botón Cerrar */}
                  <div className="flex justify-end pt-6 border-t border-vet-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => setShowDetailModal(false)}
                      className="border-vet-gray-300 hover:bg-vet-gray-50"
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
}
