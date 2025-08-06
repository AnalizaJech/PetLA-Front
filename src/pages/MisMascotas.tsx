import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  PawPrint,
  Plus,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Heart,
  Camera,
  Upload,
  X,
  ImageIcon,
} from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal";
import { DatePicker } from "@/components/ui/date-picker";

export default function MisMascotas() {
  const { user, mascotas, addMascota, updateMascota, deleteMascota } =
    useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMascota, setEditingMascota] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mascotaToDelete, setMascotaToDelete] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedMascotaPhoto, setSelectedMascotaPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewURL, setPhotoPreviewURL] = useState<string | null>(null);
  const [newMascota, setNewMascota] = useState({
    nombre: "",
    especie: "Perro",
    raza: "",
    fechaNacimiento: undefined as Date | undefined,
    peso: "",
    sexo: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const diffTime = Math.abs(hoy.getTime() - fechaNacimiento.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const años = Math.floor(diffDays / 365);
    const meses = Math.floor((diffDays % 365) / 30);

    if (años > 0) {
      return `${años} año${años > 1 ? "s" : ""}`;
    }
    return `${meses} mes${meses > 1 ? "es" : ""}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMascota.fechaNacimiento) {
      return; // Don't submit without date
    }

    if (editingMascota) {
      // Edit existing mascota
      updateMascota(editingMascota.id, {
        ...newMascota,
        fechaNacimiento: newMascota.fechaNacimiento,
      });
    } else {
      // Add new mascota
      addMascota({
        ...newMascota,
        fechaNacimiento: newMascota.fechaNacimiento,
      });
    }

    // Reset form
    setNewMascota({
      nombre: "",
      especie: "Perro",
      raza: "",
      fechaNacimiento: undefined,
      peso: "",
      sexo: "",
    });
    setEditingMascota(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (mascota) => {
    setEditingMascota(mascota);
    // Clean peso value if it contains "kg" for editing
    const cleanPeso = mascota.peso
      ? mascota.peso.replace(/\s*(kg|Kg|KG)\s*$/i, "").trim()
      : "";
    setNewMascota({
      nombre: mascota.nombre,
      especie: mascota.especie,
      raza: mascota.raza,
      fechaNacimiento: new Date(mascota.fechaNacimiento),
      peso: cleanPeso,
      sexo: mascota.sexo,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (mascota) => {
    setMascotaToDelete(mascota);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (mascotaToDelete) {
      deleteMascota(mascotaToDelete.id);
      setMascotaToDelete(null);
    }
  };

  const handlePhotoClick = (mascota) => {
    setSelectedMascotaPhoto(mascota);
    setShowPhotoModal(true);
  };

  const handlePhotoUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setPhotoFile(file);
        // Convert to Base64 for preview and storage
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target?.result as string;
          setPhotoPreviewURL(base64String);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleConfirmPhoto = () => {
    if (photoFile && selectedMascotaPhoto && photoPreviewURL) {
      try {
        // Comprimir imagen antes de guardar para optimizar localStorage
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
          // Redimensionar a un tamaño máximo de 400x400 para optimizar almacenamiento
          const maxSize = 400;
          let { width, height } = img;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Dibujar imagen redimensionada
          ctx?.drawImage(img, 0, 0, width, height);

          // Convertir a base64 con calidad optimizada (0.7 = 70% calidad)
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

          // Guardar la imagen optimizada
          updateMascota(selectedMascotaPhoto.id, {
            foto: compressedBase64,
          });

          handleClosePhotoModal();
        };

        img.src = photoPreviewURL;
      } catch (error) {
        console.error("Error al procesar la imagen:", error);
        // Fallback: guardar imagen original si hay error
        updateMascota(selectedMascotaPhoto.id, {
          foto: photoPreviewURL,
        });
        handleClosePhotoModal();
      }
    }
  };

  const handleRemovePhoto = () => {
    if (selectedMascotaPhoto) {
      updateMascota(selectedMascotaPhoto.id, {
        foto: null,
      });
      handleClosePhotoModal();
    }
  };

  const handleClosePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedMascotaPhoto(null);
    setPhotoFile(null);
    setPhotoPreviewURL(null);
  };

  const handlePesoChange = (value: string) => {
    // Store just the numeric value without "kg"
    setNewMascota({
      ...newMascota,
      peso: value,
    });
  };

  const displayPeso = (peso: string) => {
    // Display with "kg" if there's a value
    return peso && peso.trim() !== "" ? `${peso} kg` : peso;
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <PawPrint className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                Acceso requerido
              </h3>
              <p className="text-vet-gray-600">
                Debes iniciar sesión para ver tus mascotas
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div className="min-h-screen bg-vet-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-vet-primary/10 rounded-xl flex items-center justify-center">
                  <PawPrint className="w-5 h-5 sm:w-6 sm:h-6 text-vet-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-vet-gray-900">
                    Mis Mascotas
                  </h1>
                  <p className="text-sm sm:text-base text-vet-gray-600">
                    Gestiona la información y salud de tus compañeros
                  </p>
                </div>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingMascota(null);
                      setNewMascota({
                        nombre: "",
                        especie: "Perro",
                        raza: "",
                        fechaNacimiento: undefined,
                        peso: "",
                        sexo: "",
                      });
                    }}
                    className="w-full sm:w-auto bg-vet-primary hover:bg-vet-primary-dark"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Mascota
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">
                      {editingMascota ? "Editar Mascota" : "Nueva Mascota"}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                      {editingMascota
                        ? "Actualiza la información de tu mascota"
                        : "Agrega una nueva mascota a tu perfil"}
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                          id="nombre"
                          value={newMascota.nombre}
                          onChange={(e) =>
                            setNewMascota({
                              ...newMascota,
                              nombre: e.target.value,
                            })
                          }
                          placeholder="Nombre de tu mascota"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="especie">Especie</Label>
                        <Select
                          value={newMascota.especie}
                          onValueChange={(value) =>
                            setNewMascota({
                              ...newMascota,
                              especie: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona la especie" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Perro">Perro</SelectItem>
                            <SelectItem value="Gato">Gato</SelectItem>
                            <SelectItem value="Ave">Ave</SelectItem>
                            <SelectItem value="Hamster">Hamster</SelectItem>
                            <SelectItem value="Conejo">Conejo</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="raza">Raza</Label>
                        <Input
                          id="raza"
                          value={newMascota.raza}
                          onChange={(e) =>
                            setNewMascota({
                              ...newMascota,
                              raza: e.target.value,
                            })
                          }
                          placeholder="Raza de tu mascota"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fechaNacimiento">
                          Fecha de nacimiento
                        </Label>
                        <DatePicker
                          date={newMascota.fechaNacimiento}
                          onDateChange={(date) =>
                            setNewMascota({
                              ...newMascota,
                              fechaNacimiento: date,
                            })
                          }
                          placeholder="Selecciona fecha"
                          fromYear={1990}
                          toYear={new Date().getFullYear()}
                          maxDate={new Date()}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="peso">Peso</Label>
                        <div className="relative">
                          <Input
                            id="peso"
                            type="number"
                            step="0.1"
                            min="0"
                            value={newMascota.peso}
                            onChange={(e) => handlePesoChange(e.target.value)}
                            placeholder="5.2"
                            className="pr-12"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-sm text-vet-gray-500">
                              kg
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sexo">Sexo</Label>
                        <Select
                          value={newMascota.sexo}
                          onValueChange={(value) =>
                            setNewMascota({
                              ...newMascota,
                              sexo: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el sexo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Macho">Macho</SelectItem>
                            <SelectItem value="Hembra">Hembra</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="bg-vet-primary hover:bg-vet-primary-dark"
                      >
                        {editingMascota ? "Actualizar" : "Agregar"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Mascotas Grid */}
          {mascotas.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <PawPrint className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                  No tienes mascotas registradas
                </h3>
                <p className="text-vet-gray-600 mb-6">
                  Agrega tu primera mascota para comenzar a gestionar su salud
                </p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-vet-primary hover:bg-vet-primary-dark"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primera Mascota
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mascotas.map((mascota) => (
                <Card
                  key={mascota.id}
                  className="hover:shadow-lg transition-all duration-200"
                >
                  <CardContent className="p-6">
                    <div className="text-center">
                      {/* Photo */}
                      <div
                        className="w-24 h-24 bg-vet-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 relative group cursor-pointer overflow-hidden"
                        onClick={() => handlePhotoClick(mascota)}
                      >
                        {mascota.foto ? (
                          <>
                            <img
                              src={mascota.foto}
                              alt={`Foto de ${mascota.nombre}`}
                              className="w-full h-full object-cover rounded-full"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <>
                            <PawPrint className="w-12 h-12 text-vet-primary" />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Info */}
                      <div className="space-y-2 mb-4">
                        <h3 className="text-xl font-semibold text-vet-gray-900">
                          {mascota.nombre}
                        </h3>
                        <p className="text-vet-gray-600">
                          {mascota.especie} • {mascota.raza}{" "}
                          {mascota.sexo && `• ${mascota.sexo}`}
                        </p>
                        <p className="text-sm text-vet-gray-500">
                          {calcularEdad(mascota.fechaNacimiento)} de edad
                        </p>
                        {mascota.peso && (
                          <p className="text-sm text-vet-gray-500">
                            Peso: {displayPeso(mascota.peso)}
                          </p>
                        )}
                        <Badge
                          className={
                            mascota.estado === "Activo"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {mascota.estado}
                        </Badge>
                      </div>

                      {/* Próxima cita */}
                      {mascota.proximaCita ? (
                        <div className="bg-vet-primary/5 border border-vet-primary/20 rounded-lg p-3 mb-4">
                          <p className="text-sm font-medium text-vet-primary mb-1">
                            Próxima cita
                          </p>
                          <p className="text-sm text-vet-gray-600">
                            {mascota.proximaCita.toLocaleDateString("es-ES")}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-vet-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-vet-gray-500">
                            Sin citas programadas
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            (window.location.href = `/historial?mascota=${encodeURIComponent(mascota.nombre)}`)
                          }
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Historial
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(mascota)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(mascota)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setMascotaToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar mascota"
        description={`¿Estás seguro de que quieres eliminar a ${mascotaToDelete?.nombre}? Esta acción eliminará toda la información de la mascota y no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Photo Management Modal */}
      <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}>
        <DialogContent className="max-w-sm w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center space-x-2 text-base">
              <Camera className="w-4 h-4 text-vet-primary flex-shrink-0" />
              <span className="truncate">
                {selectedMascotaPhoto?.foto ? "Editar" : "Agregar"} Foto de{" "}
                {selectedMascotaPhoto?.nombre}
              </span>
            </DialogTitle>
            <DialogDescription className="text-sm">
              {selectedMascotaPhoto?.foto
                ? "Cambia la foto de tu mascota o elimínala"
                : "Agrega una foto para personalizar el perfil de tu mascota"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-3 py-2">
              {/* Current or preview photo */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-vet-gray-100 flex items-center justify-center flex-shrink-0">
                  {photoPreviewURL ? (
                    <img
                      src={photoPreviewURL}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                  ) : selectedMascotaPhoto?.foto ? (
                    <img
                      src={selectedMascotaPhoto.foto}
                      alt={`Foto actual de ${selectedMascotaPhoto.nombre}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PawPrint className="w-12 h-12 text-vet-gray-400" />
                  )}
                </div>
              </div>

              {/* Photo info */}
              {photoFile && (
                <div className="bg-vet-gray-50 rounded-lg p-2">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-vet-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-vet-gray-900 truncate">
                        {photoFile.name}
                      </p>
                      <p className="text-xs text-vet-gray-500">
                        {(photoFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <div className="flex items-start space-x-2">
                  <Camera className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-blue-700 font-medium">
                      Consejos para una buena foto:
                    </p>
                    <ul className="text-xs text-blue-600 mt-1 space-y-0.5">
                      <li>• Buena iluminación natural</li>
                      <li>• Enfoque del rostro</li>
                      <li>• Fondo simple</li>
                      <li>• Máximo 5MB</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 pt-4">
            <div className="flex flex-col w-full gap-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClosePhotoModal}
                  className="flex-1 text-sm h-9"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>

                {selectedMascotaPhoto?.foto && !photoFile && (
                  <Button
                    variant="outline"
                    onClick={handleRemovePhoto}
                    className="flex-1 text-red-600 hover:text-red-700 text-sm h-9"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                )}
              </div>

              <Button
                onClick={photoFile ? handleConfirmPhoto : handlePhotoUpload}
                className="w-full bg-vet-primary hover:bg-vet-primary-dark text-sm h-9"
              >
                {photoFile ? (
                  <>
                    <Upload className="w-4 h-4 mr-1" />
                    Confirmar
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-1" />
                    {selectedMascotaPhoto?.foto ? "Cambiar" : "Seleccionar"}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
