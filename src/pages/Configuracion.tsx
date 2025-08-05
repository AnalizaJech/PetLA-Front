import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Mail,
  Phone,
  Save,
  CheckCircle,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  Stethoscope,
  DollarSign,
  Camera,
  Upload,
  X,
  ImageIcon,
  MapPin,
  Calendar,
} from "lucide-react";

export default function Configuracion() {
  const { user, setUser, updateUsuario } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Services state
  const [services, setServices] = useState([
    {
      id: "consulta_general",
      nombre: "Consulta General",
      precio: 80,
      icono: "Stethoscope",
      descripcion: "Examen médico rutinario y evaluación de salud general",
      activo: true,
    },
    {
      id: "vacunacion",
      nombre: "Vacunación",
      precio: 65,
      icono: "Syringe",
      descripcion: "Aplicación de vacunas preventivas y refuerzos",
      activo: true,
    },
    {
      id: "emergencia",
      nombre: "Emergencia",
      precio: 150,
      icono: "AlertCircle",
      descripcion: "Atención médica urgente las 24 horas",
      activo: true,
    },
    {
      id: "grooming",
      nombre: "Grooming",
      precio: 45,
      icono: "Heart",
      descripcion: "Baño, corte de pelo, limpieza de oídos y uñas",
      activo: true,
    },
    {
      id: "cirugia",
      nombre: "Cirugía",
      precio: 250,
      icono: "Activity",
      descripcion: "Procedimientos quirúrgicos especializados",
      activo: true,
    },
    {
      id: "diagnostico",
      nombre: "Diagnóstico",
      precio: 120,
      icono: "Search",
      descripcion: "Exámenes y análisis para determinar diagnósticos",
      activo: true,
    },
  ]);

  // Load settings from localStorage
  const loadSettings = (key: string, defaultValue: any) => {
    try {
      const stored = localStorage.getItem(`petla_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Save settings to localStorage
  const saveSettings = (key: string, value: any) => {
    try {
      localStorage.setItem(`petla_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  // Profile form state
  const [profileData, setProfileData] = useState({
    nombre: user?.nombre || "",
    apellidos: user?.apellidos || "",
    username: user?.username || "",
    email: user?.email || "",
    telefono: user?.telefono || "",
    direccion: user?.direccion || "",
    fechaNacimiento: user?.fechaNacimiento ? user.fechaNacimiento.toISOString().split('T')[0] : "",
    genero: user?.genero || "",
    bio: loadSettings("user_bio", ""),
    foto: user?.foto || null,
  });

  // Photo management state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewURL, setPhotoPreviewURL] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Notifications settings
  const [notificationSettings, setNotificationSettings] = useState(
    loadSettings("notifications", {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      marketingEmails: false,
      appointmentReminders: true,
      vaccineReminders: true,
      newAppointments: true,
      statusUpdates: true,
      systemAlerts: user?.rol === "admin",
    }),
  );

  // Security settings
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: loadSettings("security_2fa", false),
    loginAlerts: loadSettings("security_login_alerts", true),
    sessionTimeout: loadSettings("security_session_timeout", "30"),
  });

  // Theme settings
  const [themeSettings, setThemeSettings] = useState(
    loadSettings("theme", {
      theme: "light",
      language: "es",
      timezone: "America/Lima",
      dateFormat: "DD/MM/YYYY",
      currency: "PEN",
    }),
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sync profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        nombre: user.nombre || "",
        apellidos: user.apellidos || "",
        username: user.username || "",
        email: user.email || "",
        telefono: user.telefono || "",
        direccion: user.direccion || "",
        fechaNacimiento: user.fechaNacimiento ? user.fechaNacimiento.toISOString().split('T')[0] : "",
        genero: user.genero || "",
        foto: user.foto || null,
      }));
    }
  }, [user]);

  // Clear messages after delay
  useEffect(() => {
    if (savedMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSavedMessage("");
        setErrorMessage("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [savedMessage, errorMessage]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setSavedMessage("");
    setErrorMessage("");

    // Validation
    if (!profileData.nombre.trim()) {
      setErrorMessage("El nombre es obligatorio");
      setIsLoading(false);
      return;
    }

    if (!profileData.email.trim() || !/\S+@\S+\.\S+/.test(profileData.email)) {
      setErrorMessage("Por favor ingresa un email válido");
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (user) {
        // Update user in both contexts (usuarios array and current user)
        const updatedUserData = {
          nombre: profileData.nombre.trim(),
          apellidos: profileData.apellidos.trim(),
          username: profileData.username.trim(),
          email: profileData.email.trim(),
          telefono: profileData.telefono.trim(),
          direccion: profileData.direccion.trim(),
          fechaNacimiento: profileData.fechaNacimiento ? new Date(profileData.fechaNacimiento) : undefined,
          genero: profileData.genero,
          foto: profileData.foto,
        };

        // Update in usuarios array
        updateUsuario(user.id, updatedUserData);

        // Update current user
        const updatedUser = {
          ...user,
          ...updatedUserData,
        };
        setUser(updatedUser);

        // Save additional data to localStorage
        saveSettings("user_direccion", profileData.direccion);
        saveSettings("user_bio", profileData.bio);
      }

      setSavedMessage("Perfil actualizado correctamente");
    } catch (error) {
      setErrorMessage("Error al actualizar el perfil. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    setSavedMessage("");
    setErrorMessage("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save to localStorage
      saveSettings("notifications", notificationSettings);

      setSavedMessage("Configuración de notificaciones guardada correctamente");
    } catch (error) {
      setErrorMessage("Error al guardar las notificaciones");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    setIsLoading(true);
    setSavedMessage("");
    setErrorMessage("");

    // Validation for password change
    if (
      securityData.newPassword ||
      securityData.confirmPassword ||
      securityData.currentPassword
    ) {
      if (!securityData.currentPassword) {
        setErrorMessage("Debes ingresar tu contraseña actual");
        setIsLoading(false);
        return;
      }

      if (securityData.newPassword.length < 8) {
        setErrorMessage("La nueva contraseña debe tener al menos 8 caracteres");
        setIsLoading(false);
        return;
      }

      if (securityData.newPassword !== securityData.confirmPassword) {
        setErrorMessage("Las contraseñas nuevas no coinciden");
        setIsLoading(false);
        return;
      }
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save security settings to localStorage
      saveSettings("security_2fa", securityData.twoFactorEnabled);
      saveSettings("security_login_alerts", securityData.loginAlerts);
      saveSettings("security_session_timeout", securityData.sessionTimeout);

      // Update password if provided
      if (securityData.newPassword && user) {
        updateUsuario(user.id, { password: securityData.newPassword });
      }

      setSavedMessage("Configuración de seguridad actualizada correctamente");

      // Clear password fields
      setSecurityData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      setErrorMessage("Error al actualizar la seguridad");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTheme = async () => {
    setIsLoading(true);
    setSavedMessage("");
    setErrorMessage("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save to localStorage
      saveSettings("theme", themeSettings);

      // Apply theme changes immediately
      document.documentElement.setAttribute("data-theme", themeSettings.theme);
      document.documentElement.setAttribute("lang", themeSettings.language);

      setSavedMessage("Configuración de apariencia guardada correctamente");
    } catch (error) {
      setErrorMessage("Error al guardar las preferencias");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save notification changes
  useEffect(() => {
    const timer = setTimeout(() => {
      saveSettings("notifications", notificationSettings);
    }, 500);
    return () => clearTimeout(timer);
  }, [notificationSettings]);

  // Auto-save security changes
  useEffect(() => {
    const timer = setTimeout(() => {
      saveSettings("security_2fa", securityData.twoFactorEnabled);
      saveSettings("security_login_alerts", securityData.loginAlerts);
      saveSettings("security_session_timeout", securityData.sessionTimeout);
    }, 500);
    return () => clearTimeout(timer);
  }, [
    securityData.twoFactorEnabled,
    securityData.loginAlerts,
    securityData.sessionTimeout,
  ]);

  // Auto-save theme changes
  useEffect(() => {
    const timer = setTimeout(() => {
      saveSettings("theme", themeSettings);
      document.documentElement.setAttribute("data-theme", themeSettings.theme);
      document.documentElement.setAttribute("lang", themeSettings.language);
    }, 500);
    return () => clearTimeout(timer);
  }, [themeSettings]);

  // Handle service updates
  const handleServiceUpdate = (
    serviceId: string,
    field: string,
    value: any,
  ) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === serviceId ? { ...service, [field]: value } : service,
      ),
    );
  };

  const handleSaveServices = async () => {
    setIsLoading(true);
    setSavedMessage("");
    setErrorMessage("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save to localStorage
      saveSettings("veterinary_services", services);

      setSavedMessage("Configuración de servicios actualizada correctamente");
    } catch (error) {
      setErrorMessage("Error al actualizar los servicios");
    } finally {
      setIsLoading(false);
    }
  };

  // Photo management functions
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
    if (photoFile && photoPreviewURL) {
      try {
        // Compress image before saving to optimize localStorage
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
          // Resize to a maximum size of 400x400 for optimized storage
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

          // Draw resized image
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to base64 with optimized quality (0.7 = 70% quality)
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

          // Update profile data with optimized image
          setProfileData(prev => ({
            ...prev,
            foto: compressedBase64
          }));

          handleClosePhotoModal();
        };

        img.src = photoPreviewURL;
      } catch (error) {
        console.error("Error processing image:", error);
        // Fallback: save original image if there's an error
        setProfileData(prev => ({
          ...prev,
          foto: photoPreviewURL
        }));
        handleClosePhotoModal();
      }
    }
  };

  const handleRemovePhoto = () => {
    setProfileData(prev => ({
      ...prev,
      foto: null
    }));
    handleClosePhotoModal();
  };

  const handleClosePhotoModal = () => {
    setShowPhotoModal(false);
    setPhotoFile(null);
    setPhotoPreviewURL(null);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-vet-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-vet-primary rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-vet-gray-900">
                  Configuración
                </h1>
                <p className="text-sm sm:text-base text-vet-gray-600">
                  Personaliza tu experiencia y ajusta tu perfil
                </p>
              </div>
            </div>

            {savedMessage && (
              <Alert className="bg-green-50 border-green-200 mb-4">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {savedMessage}
                </AlertDescription>
              </Alert>
            )}

            {errorMessage && (
              <Alert className="bg-red-50 border-red-200 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
              <TabsTrigger
                value="profile"
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm p-2 sm:p-3"
              >
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Perfil</span>
                <span className="sm:hidden">Perfil</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm p-2 sm:p-3"
              >
                <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Notificaciones</span>
                <span className="sm:hidden">Notif.</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm p-2 sm:p-3"
              >
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Seguridad</span>
                <span className="sm:hidden">Segur.</span>
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm p-2 sm:p-3"
              >
                <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Apariencia</span>
                <span className="sm:hidden">Tema</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-vet-primary" />
                    <span>Información Personal</span>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Actualiza tu información de perfil y contacto
                    {user?.rol && (
                      <span className="block sm:inline ml-0 sm:ml-2 mt-1 sm:mt-0 px-2 py-1 bg-vet-primary/10 text-vet-primary rounded-full text-xs font-medium capitalize">
                        {user.rol}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                  {/* Photo Section */}
                  <div className="flex flex-col items-center space-y-4 mb-6">
                    <div className="relative">
                      <div
                        className="w-24 h-24 bg-vet-primary/10 rounded-full flex items-center justify-center cursor-pointer overflow-hidden group hover:bg-vet-primary/20 transition-colors"
                        onClick={() => setShowPhotoModal(true)}
                      >
                        {profileData.foto ? (
                          <>
                            <img
                              src={profileData.foto}
                              alt={`Foto de ${profileData.nombre}`}
                              className="w-full h-full object-cover rounded-full"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <>
                            <User className="w-12 h-12 text-vet-primary" />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-vet-gray-900">Foto de perfil</h4>
                      <p className="text-xs text-vet-gray-600">Haz clic para cambiar tu foto</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombres</Label>
                      <Input
                        id="nombre"
                        value={profileData.nombre}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            nombre: e.target.value,
                          })
                        }
                        placeholder="Tus nombres"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apellidos">Apellidos</Label>
                      <Input
                        id="apellidos"
                        value={profileData.apellidos}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            apellidos: e.target.value,
                          })
                        }
                        placeholder="Tus apellidos"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Nombre de usuario</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                        <Input
                          id="username"
                          className="pl-10"
                          value={profileData.username}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              username: e.target.value,
                            })
                          }
                          placeholder="usuario123"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-10"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              email: e.target.value,
                            })
                          }
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                        <Input
                          id="telefono"
                          type="tel"
                          className="pl-10"
                          value={profileData.telefono}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              telefono: e.target.value,
                            })
                          }
                          placeholder="+52 55 1234 5678"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="direccion">Dirección (opcional)</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                        <Input
                          id="direccion"
                          className="pl-10"
                          value={profileData.direccion}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              direccion: e.target.value,
                            })
                          }
                          placeholder="Tu dirección completa"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fechaNacimiento">Fecha de nacimiento (opcional)</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-vet-gray-400" />
                        <Input
                          id="fechaNacimiento"
                          type="date"
                          className="pl-10"
                          value={profileData.fechaNacimiento}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              fechaNacimiento: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="genero">Género (opcional)</Label>
                      <Select
                        value={profileData.genero}
                        onValueChange={(value) =>
                          setProfileData({
                            ...profileData,
                            genero: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar género" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="femenino">Femenino</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                          <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">
                      {user?.rol === "cliente"
                        ? "Información sobre tus mascotas"
                        : user?.rol === "veterinario"
                          ? "Especialidades y experiencia"
                          : user?.rol === "admin"
                            ? "Información administrativa"
                            : "Información adicional"}
                    </Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          bio: e.target.value,
                        })
                      }
                      placeholder={
                        user?.rol === "cliente"
                          ? "Cuéntanos sobre tus mascotas, sus necesidades especiales, etc..."
                          : user?.rol === "veterinario"
                            ? "Describe tus especialidades, años de experiencia, certificaciones..."
                            : user?.rol === "admin"
                              ? "Información sobre tu rol administrativo..."
                              : "Información adicional..."
                      }
                      rows={4}
                    />
                  </div>

                  {/* Role-specific information */}
                  {user && (
                    <div className="bg-vet-gray-50 rounded-lg p-4 space-y-3">
                      <h4 className="font-medium text-vet-gray-900 flex items-center space-x-2">
                        <Database className="w-4 h-4 text-vet-primary" />
                        <span>Información de tu cuenta</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-vet-gray-600">
                            Tipo de cuenta:
                          </span>
                          <span className="ml-2 font-medium capitalize text-vet-primary">
                            {user.rol}
                          </span>
                        </div>
                        <div>
                          <span className="text-vet-gray-600">
                            Fecha de registro:
                          </span>
                          <span className="ml-2 font-medium">
                            {user.fechaRegistro?.toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-vet-gray-600">
                            ID de usuario:
                          </span>
                          <span className="ml-2 font-mono text-xs bg-white px-2 py-1 rounded">
                            {user.id}
                          </span>
                        </div>
                        {user.telefono && (
                          <div>
                            <span className="text-vet-gray-600">
                              Teléfono registrado:
                            </span>
                            <span className="ml-2 font-medium text-green-600">
                              ✓ Verificado
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Role-specific features */}
                      {user.rol === "cliente" && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm text-blue-800">
                            <strong>Características de cliente:</strong> Puedes
                            gestionar tus mascotas, agendar citas y consultar el
                            historial médico.
                          </p>
                        </div>
                      )}
                      {user.rol === "veterinario" && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm text-green-800">
                            <strong>Características de veterinario:</strong>{" "}
                            Acceso a gestión de citas, historiales clínicos y
                            consultas de pacientes.
                          </p>
                        </div>
                      )}
                      {user.rol === "admin" && (
                        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded">
                          <p className="text-sm text-purple-800">
                            <strong>Características de administrador:</strong>{" "}
                            Control total del sistema, gestión de usuarios,
                            veterinarios y configuraciones globales.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:justify-end">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="w-full sm:w-auto bg-vet-primary hover:bg-vet-primary-dark"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 w-4 h-4" />
                          Guardar cambios
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent
              value="notifications"
              className="space-y-4 sm:space-y-6"
            >
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-vet-primary" />
                    <span>Preferencias de Notificaciones</span>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Configura cómo y cuándo quieres recibir notificaciones según
                    tu rol
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-vet-gray-900">
                      Métodos de notificación
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-start justify-between p-3 sm:p-4 border border-vet-gray-200 rounded-lg">
                        <div className="flex-1 pr-3">
                          <h4 className="font-medium text-vet-gray-900 text-sm sm:text-base">
                            Notificaciones por email
                          </h4>
                          <p className="text-xs sm:text-sm text-vet-gray-600 mt-1">
                            Recibe notificaciones importantes en tu email
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: checked,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-start justify-between p-3 sm:p-4 border border-vet-gray-200 rounded-lg">
                        <div className="flex-1 pr-3">
                          <h4 className="font-medium text-vet-gray-900 text-sm sm:text-base">
                            Notificaciones SMS
                          </h4>
                          <p className="text-xs sm:text-sm text-vet-gray-600 mt-1">
                            Recibe mensajes de texto para recordatorios urgentes
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.smsNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              smsNotifications: checked,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Role-specific notifications */}
                    {user?.rol === "cliente" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-vet-gray-900">
                          Notificaciones para clientes
                        </h3>

                        <div className="flex items-center justify-between p-4 border border-vet-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-vet-gray-900">
                              Recordatorios de citas
                            </h4>
                            <p className="text-sm text-vet-gray-600">
                              Te recordaremos tus próximas citas veterinarias
                            </p>
                          </div>
                          <Switch
                            checked={notificationSettings.appointmentReminders}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                appointmentReminders: checked,
                              })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-vet-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-vet-gray-900">
                              Recordatorios de vacunas
                            </h4>
                            <p className="text-sm text-vet-gray-600">
                              Te avisaremos cuando tus mascotas necesiten
                              vacunas
                            </p>
                          </div>
                          <Switch
                            checked={notificationSettings.vaccineReminders}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                vaccineReminders: checked,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}

                    {user?.rol === "veterinario" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-vet-gray-900">
                          Notificaciones para veterinarios
                        </h3>

                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>Notificaciones profesionales:</strong>{" "}
                            Recibirás alertas sobre nuevas citas asignadas,
                            cambios en el horario y actualizaciones de
                            pacientes.
                          </p>
                        </div>
                      </div>
                    )}

                    {user?.rol === "admin" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-vet-gray-900">
                          Notificaciones administrativas
                        </h3>

                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="text-sm text-purple-800">
                            <strong>Alertas del sistema:</strong> Recibirás
                            notificaciones sobre actividad del sistema, nuevos
                            registros, reportes y alertas de seguridad.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-end">
                    <Button
                      onClick={handleSaveNotifications}
                      disabled={isLoading}
                      className="w-full sm:w-auto bg-vet-primary hover:bg-vet-primary-dark"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 w-4 h-4" />
                          Guardar configuración
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-vet-primary" />
                    <span>Seguridad de la Cuenta</span>
                  </CardTitle>
                  <CardDescription>
                    Mantén tu cuenta segura actualizando tu contraseña
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Contraseña actual</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={securityData.currentPassword}
                          onChange={(e) =>
                            setSecurityData({
                              ...securityData,
                              currentPassword: e.target.value,
                            })
                          }
                          placeholder="Ingresa tu contraseña actual"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-vet-gray-400 hover:text-vet-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nueva contraseña</Label>
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={securityData.newPassword}
                        onChange={(e) =>
                          setSecurityData({
                            ...securityData,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="Mínimo 8 caracteres"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirmar nueva contraseña
                      </Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={securityData.confirmPassword}
                        onChange={(e) =>
                          setSecurityData({
                            ...securityData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Repite la nueva contraseña"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-vet-gray-900">
                      Configuración adicional de seguridad
                    </h3>


                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">
                        Tiempo de sesión (minutos)
                      </Label>
                      <Select
                        value={securityData.sessionTimeout}
                        onValueChange={(value) =>
                          setSecurityData({
                            ...securityData,
                            sessionTimeout: value,
                          })
                        }
                      >
                        <SelectTrigger className="border-vet-gray-300 focus:border-vet-primary focus:ring-vet-primary">
                          <SelectValue placeholder="Seleccionar tiempo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutos</SelectItem>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="60">1 hora</SelectItem>
                          <SelectItem value="120">2 horas</SelectItem>
                          <SelectItem value="480">8 horas</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-vet-gray-500">
                        Tu sesión se cerrará automáticamente después de este
                        tiempo de inactividad
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">
                            Recomendaciones de seguridad:
                          </p>
                          <ul className="mt-1 space-y-1 text-xs">
                            <li>
                              • Usa una contraseña fuerte con al menos 8
                              caracteres
                            </li>
                            <li>• No compartas tu contraseña con nadie</li>
                            <li>• Cierra sesión en dispositivos compartidos</li>
                            <li>• Actualiza tu contraseña regularmente</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveSecurity}
                      disabled={isLoading}
                      className="bg-vet-primary hover:bg-vet-primary-dark"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 w-4 h-4" />
                          Actualizar seguridad
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="w-5 h-5 text-vet-primary" />
                    <span>Preferencias de Apariencia</span>
                  </CardTitle>
                  <CardDescription>
                    Personaliza la apariencia y el idioma de la aplicación
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Tema de la aplicación</Label>
                      <Select
                        value={themeSettings.theme}
                        onValueChange={(value) =>
                          setThemeSettings({
                            ...themeSettings,
                            theme: value,
                          })
                        }
                      >
                        <SelectTrigger className="border-vet-gray-300 focus:border-vet-primary focus:ring-vet-primary">
                          <SelectValue placeholder="Seleccionar tema" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">🌞 Claro</SelectItem>
                          <SelectItem value="dark">🌙 Oscuro</SelectItem>
                          <SelectItem value="system">⚙️ Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Idioma de la interfaz</Label>
                      <Select
                        value={themeSettings.language}
                        onValueChange={(value) =>
                          setThemeSettings({
                            ...themeSettings,
                            language: value,
                          })
                        }
                      >
                        <SelectTrigger className="border-vet-gray-300 focus:border-vet-primary focus:ring-vet-primary">
                          <SelectValue placeholder="Seleccionar idioma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">🇪🇸 Español</SelectItem>
                          <SelectItem value="en">🇺🇸 English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Zona horaria</Label>
                      <Select
                        value={themeSettings.timezone}
                        onValueChange={(value) =>
                          setThemeSettings({
                            ...themeSettings,
                            timezone: value,
                          })
                        }
                      >
                        <SelectTrigger className="border-vet-gray-300 focus:border-vet-primary focus:ring-vet-primary">
                          <SelectValue placeholder="Seleccionar zona horaria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Lima">
                            🇵🇪 Lima (GMT-5)
                          </SelectItem>
                          <SelectItem value="America/Mexico_City">
                            🇲🇽 Ciudad de México (GMT-6)
                          </SelectItem>
                          <SelectItem value="America/Bogota">
                            🇨🇴 Bogotá (GMT-5)
                          </SelectItem>
                          <SelectItem value="America/Buenos_Aires">
                            🇦🇷 Buenos Aires (GMT-3)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Formato de fecha</Label>
                      <Select
                        value={themeSettings.dateFormat}
                        onValueChange={(value) =>
                          setThemeSettings({
                            ...themeSettings,
                            dateFormat: value,
                          })
                        }
                      >
                        <SelectTrigger className="border-vet-gray-300 focus:border-vet-primary focus:ring-vet-primary">
                          <SelectValue placeholder="Seleccionar formato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">
                            DD/MM/YYYY (31/12/2024)
                          </SelectItem>
                          <SelectItem value="MM/DD/YYYY">
                            MM/DD/YYYY (12/31/2024)
                          </SelectItem>
                          <SelectItem value="YYYY-MM-DD">
                            YYYY-MM-DD (2024-12-31)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Moneda</Label>
                      <Select
                        value={themeSettings.currency}
                        onValueChange={(value) =>
                          setThemeSettings({
                            ...themeSettings,
                            currency: value,
                          })
                        }
                      >
                        <SelectTrigger className="border-vet-gray-300 focus:border-vet-primary focus:ring-vet-primary">
                          <SelectValue placeholder="Seleccionar moneda" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PEN">
                            🇵🇪 Soles Peruanos (S/.)
                          </SelectItem>
                          <SelectItem value="USD">🇺🇸 Dólares (USD)</SelectItem>
                          <SelectItem value="MXN">
                            🇲🇽 Pesos Mexicanos (MXN)
                          </SelectItem>
                          <SelectItem value="COP">
                            🇨🇴 Pesos Colombianos (COP)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveTheme}
                      disabled={isLoading}
                      className="bg-vet-primary hover:bg-vet-primary-dark"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 w-4 h-4" />
                          Guardar preferencias
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Photo Management Modal */}
          <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}>
            <DialogContent className="max-w-sm w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="flex items-center space-x-2 text-base">
                  <Camera className="w-4 h-4 text-vet-primary flex-shrink-0" />
                  <span className="truncate">
                    {profileData.foto ? "Cambiar" : "Agregar"} Foto de Perfil
                  </span>
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {profileData.foto
                    ? "Cambia tu foto de perfil o elimínala"
                    : "Agrega una foto para personalizar tu perfil"}
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
                      ) : profileData.foto ? (
                        <img
                          src={profileData.foto}
                          alt={`Foto actual de ${profileData.nombre}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-vet-gray-400" />
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

                    {profileData.foto && !photoFile && (
                      <Button
                        variant="outline"
                        onClick={handleRemovePhoto}
                        className="flex-1 text-red-600 hover:text-red-700 text-sm h-9"
                      >
                        <X className="w-4 h-4 mr-1" />
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
                        {profileData.foto ? "Cambiar" : "Seleccionar"}
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
}
