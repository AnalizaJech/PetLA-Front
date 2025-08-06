import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Download,
  ChevronDown,
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
  } = useAppContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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

  // Download functions
  const downloadHistorialPDF = () => {
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
      doc.text(`Generado el: ${new Date().toLocaleDateString("es-ES")}`, margin, yPosition);
      doc.text(`Veterinario: ${user.nombre}`, margin, yPosition + 10);

      yPosition += 30;

      // Get all medical records for this veterinarian
      const misHistoriales = historialClinico.filter(
        record => record.veterinario === user.nombre
      );

      if (misHistoriales.length === 0) {
        doc.text("No hay registros médicos disponibles.", margin, yPosition);
      } else {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Registros Médicos", margin, yPosition);
        yPosition += 15;

        misHistoriales.forEach((record, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 30;
          }

          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`${index + 1}. ${record.mascotaNombre || "Sin nombre"}`, margin, yPosition);
          yPosition += 8;

          doc.setFont("helvetica", "normal");
          doc.text(`Fecha: ${new Date(record.fecha).toLocaleDateString("es-ES")}`, margin + 5, yPosition);
          yPosition += 6;
          doc.text(`Tipo: ${record.tipo}`, margin + 5, yPosition);
          yPosition += 6;
          
          if (record.diagnostico) {
            const diagnosticoLines = doc.splitTextToSize(`Diagnóstico: ${record.diagnostico}`, pageWidth - 2 * margin - 5);
            diagnosticoLines.forEach((line: string) => {
              doc.text(line, margin + 5, yPosition);
              yPosition += 6;
            });
          }

          if (record.tratamiento) {
            const tratamientoLines = doc.splitTextToSize(`Tratamiento: ${record.tratamiento}`, pageWidth - 2 * margin - 5);
            tratamientoLines.forEach((line: string) => {
              doc.text(line, margin + 5, yPosition);
              yPosition += 6;
            });
          }

          yPosition += 10;
        });
      }

      doc.save(`historial-clinico-${user.nombre}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
    }
  };

  const downloadHistorialExcel = () => {
    try {
      const misHistoriales = historialClinico.filter(
        record => record.veterinario === user.nombre
      );

      const data = misHistoriales.map((record, index) => ({
        "#": index + 1,
        "Mascota": record.mascotaNombre || "Sin nombre",
        "Fecha": new Date(record.fecha).toLocaleDateString("es-ES"),
        "Tipo": record.tipo,
        "Diagnóstico": record.diagnostico || "",
        "Tratamiento": record.tratamiento || "",
        "Observaciones": record.observaciones || "",
        "Veterinario": record.veterinario,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Historial Clínico");

      // Auto-size columns
      const colWidths = [
        { wch: 5 },   // #
        { wch: 20 },  // Mascota
        { wch: 12 },  // Fecha
        { wch: 15 },  // Tipo
        { wch: 30 },  // Diagnóstico
        { wch: 30 },  // Tratamiento
        { wch: 25 },  // Observaciones
        { wch: 20 },  // Veterinario
      ];
      ws["!cols"] = colWidths;

      XLSX.writeFile(wb, `historial-clinico-${user.nombre}-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Error generando Excel:", error);
    }
  };

  const downloadHistorialTXT = () => {
    try {
      const misHistoriales = historialClinico.filter(
        record => record.veterinario === user.nombre
      );

      let content = `HISTORIAL CLÍNICO VETERINARIO\n`;
      content += `========================================\n\n`;
      content += `Generado el: ${new Date().toLocaleDateString("es-ES")}\n`;
      content += `Veterinario: ${user.nombre}\n\n`;

      if (misHistoriales.length === 0) {
        content += "No hay registros médicos disponibles.\n";
      } else {
        content += `Total de registros: ${misHistoriales.length}\n\n`;
        content += `REGISTROS MÉDICOS:\n`;
        content += `==================\n\n`;

        misHistoriales.forEach((record, index) => {
          content += `${index + 1}. ${record.mascotaNombre || "Sin nombre"}\n`;
          content += `   Fecha: ${new Date(record.fecha).toLocaleDateString("es-ES")}\n`;
          content += `   Tipo: ${record.tipo}\n`;
          if (record.diagnostico) {
            content += `   Diagnóstico: ${record.diagnostico}\n`;
          }
          if (record.tratamiento) {
            content += `   Tratamiento: ${record.tratamiento}\n`;
          }
          if (record.observaciones) {
            content += `   Observaciones: ${record.observaciones}\n`;
          }
          content += `\n`;
        });
      }

      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `historial-clinico-${user.nombre}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generando TXT:", error);
    }
  };

  // Get count of medical records for this veterinarian
  const misHistoriales = historialClinico.filter(
    record => record.veterinario === user.nombre
  );

  return (
    <Layout user={user}>
      <div className="min-h-screen bg-vet-gray-50 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-vet-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-vet-primary" />
              </div>
              <h1 className="text-3xl font-bold text-vet-gray-900 mb-2">
                Historial Clínico
              </h1>
              <p className="text-vet-gray-600 mb-6">
                Descarga tu historial médico completo
              </p>
              
              {/* Statistics */}
              <div className="inline-flex items-center space-x-2 bg-vet-primary/10 px-4 py-2 rounded-lg mb-8">
                <FileText className="w-5 h-5 text-vet-primary" />
                <span className="text-vet-primary font-medium">
                  {misHistoriales.length} registro{misHistoriales.length !== 1 ? 's' : ''} médico{misHistoriales.length !== 1 ? 's' : ''} disponible{misHistoriales.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Download Section */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Descargar Historial</CardTitle>
                <CardDescription>
                  Selecciona el formato de descarga para tu historial clínico
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {misHistoriales.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="w-full bg-vet-primary hover:bg-vet-primary-dark h-12 text-base">
                        <Download className="w-5 h-5 mr-3" />
                        Descargar Historial
                        <ChevronDown className="w-4 h-4 ml-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuItem onClick={downloadHistorialPDF} className="p-3">
                        <FileText className="w-4 h-4 mr-3" />
                        <div>
                          <div className="font-medium">Descargar como PDF</div>
                          <div className="text-xs text-vet-gray-500">Formato de documento</div>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={downloadHistorialExcel} className="p-3">
                        <Download className="w-4 h-4 mr-3" />
                        <div>
                          <div className="font-medium">Descargar como Excel</div>
                          <div className="text-xs text-vet-gray-500">Hoja de cálculo</div>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={downloadHistorialTXT} className="p-3">
                        <FileText className="w-4 h-4 mr-3" />
                        <div>
                          <div className="font-medium">Descargar como TXT</div>
                          <div className="text-xs text-vet-gray-500">Archivo de texto</div>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
                    <p className="text-vet-gray-600 mb-4">
                      No hay registros médicos disponibles para descargar
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/mis-pacientes')}
                      className="text-vet-primary border-vet-primary hover:bg-vet-primary hover:text-white"
                    >
                      Ir a Mis Pacientes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
