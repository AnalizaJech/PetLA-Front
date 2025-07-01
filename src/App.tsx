import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";
import Privacidad from "./pages/Privacidad";
import Terminos from "./pages/Terminos";
import Cookies from "./pages/Cookies";
import NewsletterInfo from "./pages/NewsletterInfo";
import ForgotPassword from "./pages/ForgotPassword";
import Configuracion from "./pages/Configuracion";
import Notificaciones from "./pages/Notificaciones";
import MisMascotas from "./pages/MisMascotas";
import MisCitas from "./pages/MisCitas";
import NuevaCita from "./pages/NuevaCita";
import HistorialClinico from "./pages/HistorialClinico";
import Usuarios from "./pages/Usuarios";
import PreCitas from "./pages/PreCitas";
import GestionCitas from "./pages/GestionCitas";
import GestionCitasPago from "./pages/GestionCitasPago";
import GestionNewsletter from "./pages/GestionNewsletter";
import Veterinarios from "./pages/Veterinarios";
import Calendario from "./pages/Calendario";
import MisPacientes from "./pages/MisPacientes";
import HistorialClinicoVeterinario from "./pages/HistorialClinicoVeterinario";
import AuthLayout from "./components/AuthLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import {
  Calendar,
  PawPrint,
  Clock,
  FileText,
  Users,
  Stethoscope,
  Settings,
} from "lucide-react";

const App = () => (
  <AppProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />

          {/* Authentication routes (without header/footer) */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <AuthLayout>
                  <Login />
                </AuthLayout>
              </GuestRoute>
            }
          />
          <Route
            path="/registro"
            element={
              <GuestRoute>
                <AuthLayout>
                  <Login />
                </AuthLayout>
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <AuthLayout>
                  <ForgotPassword />
                </AuthLayout>
              </GuestRoute>
            }
          />

          {/* Legal pages */}
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/newsletter-info" element={<NewsletterInfo />} />

          <Route
            path="/servicios"
            element={
              <PlaceholderPage
                title="Nuestros Servicios"
                description="Servicios veterinarios completos para el cuidado de tus mascotas"
                icon={<Stethoscope className="w-8 h-8 text-vet-primary" />}
              />
            }
          />
          <Route
            path="/nosotros"
            element={
              <PlaceholderPage
                title="Sobre Nosotros"
                description="Conoce nuestro equipo y nuestra misión de cuidar a tus mascotas"
                icon={<Users className="w-8 h-8 text-vet-primary" />}
              />
            }
          />

          {/* Authenticated routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Client routes */}
          <Route
            path="/mascotas"
            element={
              <ProtectedRoute allowedRoles={["cliente"]}>
                <MisMascotas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mis-mascotas"
            element={
              <ProtectedRoute allowedRoles={["cliente"]}>
                <MisMascotas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mis-citas"
            element={
              <ProtectedRoute allowedRoles={["cliente"]}>
                <MisCitas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nueva-cita"
            element={
              <ProtectedRoute allowedRoles={["cliente"]}>
                <NuevaCita />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historial"
            element={
              <ProtectedRoute allowedRoles={["cliente"]}>
                <HistorialClinico />
              </ProtectedRoute>
            }
          />

          {/* Veterinarian routes */}
          <Route
            path="/calendario"
            element={
              <ProtectedRoute allowedRoles={["veterinario"]}>
                <Calendario />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mis-pacientes"
            element={
              <ProtectedRoute allowedRoles={["veterinario"]}>
                <MisPacientes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historial-clinico-veterinario"
            element={
              <ProtectedRoute allowedRoles={["veterinario"]}>
                <HistorialClinicoVeterinario />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/pre-citas"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PreCitas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gestion-citas"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <GestionCitas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validacion-pagos"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <GestionCitasPago />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Usuarios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/veterinarios"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Veterinarios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gestion-newsletter"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <GestionNewsletter />
              </ProtectedRoute>
            }
          />

          {/* Additional routes */}
          <Route
            path="/configuracion"
            element={
              <ProtectedRoute>
                <Configuracion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notificaciones"
            element={
              <ProtectedRoute>
                <Notificaciones />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AppProvider>
);

export default App;
