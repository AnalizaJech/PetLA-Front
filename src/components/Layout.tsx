import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Heart,
  Calendar,
  Users,
  Settings,
  LogOut,
  User,
  Bell,
  Menu,
  Home,
  FileText,
  Clock,
  Stethoscope,
  PawPrint,
  Phone,
  Mail,
  MapPin,
  Shield,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/types";
import NewFooter from "@/components/NewFooter";
import LogoutModal from "@/components/LogoutModal";
import { useNotificationToast } from "@/hooks/useNotificationToast";

interface LayoutProps {
  children: ReactNode;
  user?: {
    id: string;
    nombre: string;
    email: string;
    rol: UserRole;
  };
  showNavigation?: boolean;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navigationItems: NavItem[] = [
  {
    label: "Inicio",
    path: "/dashboard",
    icon: Home,
    roles: ["admin", "veterinario", "cliente"],
  },
  {
    label: "Agenda Médica",
    path: "/calendario",
    icon: Calendar,
    roles: ["veterinario"],
  },
  {
    label: "Mis Mascotas",
    path: "/mascotas",
    icon: PawPrint,
    roles: ["cliente"],
  },
  {
    label: "Mis Citas",
    path: "/mis-citas",
    icon: Clock,
    roles: ["cliente"],
  },
  {
    label: "Mis Pacientes",
    path: "/mis-pacientes",
    icon: Stethoscope,
    roles: ["veterinario"],
  },
  {
    label: "Historial Clínico",
    path: "/historial",
    icon: FileText,
    roles: ["cliente"],
  },
  {
    label: "Historial Clínico",
    path: "/historial-clinico-veterinario",
    icon: FileText,
    roles: ["veterinario"],
  },
  {
    label: "Pre-Citas",
    path: "/pre-citas",
    icon: Clock,
    roles: ["admin"],
  },
  {
    label: "Gestión de Citas",
    path: "/gestion-citas",
    icon: Calendar,
    roles: ["admin"],
  },
  {
    label: "Usuarios",
    path: "/usuarios",
    icon: Users,
    roles: ["admin"],
  },
  {
    label: "Veterinarios",
    path: "/veterinarios",
    icon: Stethoscope,
    roles: ["admin"],
  },
  {
    label: "Newsletter",
    path: "/gestion-newsletter",
    icon: Mail,
    roles: ["admin"],
  },
];

export default function Layout({
  children,
  user: userProp,
  showNavigation = true,
}: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user: contextUser,
    logout,
    isAuthenticated,
    getNotificacionesByUser
  } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Hook para mostrar notificaciones toast automáticamente
  useNotificationToast();

  // Calcular notificaciones no leídas
  const unreadNotificationsCount = user
    ? getNotificacionesByUser(user.id).filter(notif => !notif.leida).length
    : 0;

  // Use prop user if provided, otherwise use context user
  const user = userProp || contextUser;

  // Explicitly check authentication state
  const isUserAuthenticated = isAuthenticated && !!user;

  const handleLogout = () => {
    // Close mobile menu first if open, then show logout modal
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
      // Wait for mobile menu to close before showing modal
      setTimeout(() => {
        setShowLogoutConfirm(true);
      }, 200);
    } else {
      setShowLogoutConfirm(true);
    }
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Force re-render when authentication state changes
  useEffect(() => {
    // This effect ensures the component re-renders when authentication state changes
  }, [isAuthenticated, user, isUserAuthenticated]);

  const filteredNavItems = user
    ? navigationItems.filter((item) => item.roles.includes(user.rol))
    : [];

  return (
    <div className="min-h-screen bg-vet-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-vet-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button
              onClick={() => {
                if (location.pathname === "/") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  navigate("/");
                }
              }}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-vet-primary rounded-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-vet-gray-900">
                Pet<span className="text-vet-primary">LA</span>
              </span>
            </button>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-6">
              {isUserAuthenticated ? (
                // Authenticated user navigation - Dashboard tabs in navbar
                <>
                  <Link
                    to="/dashboard"
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location.pathname === "/dashboard"
                        ? "bg-vet-primary text-white"
                        : "text-vet-gray-600 hover:text-vet-primary hover:bg-vet-gray-100",
                    )}
                  >
                    <Home className="w-4 h-4" />
                    <span>
                      {user.rol === "admin" ? "Panel Principal" : "Resumen"}
                    </span>
                  </Link>

                  {user.rol === "admin" ? (
                    // Admin navigation
                    <>
                      <Link
                        to="/pre-citas"
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          location.pathname === "/pre-citas"
                            ? "bg-vet-primary text-white"
                            : "text-vet-gray-600 hover:text-vet-primary hover:bg-vet-gray-100",
                        )}
                      >
                        <Clock className="w-4 h-4" />
                        <span>Pre-Citas</span>
                      </Link>
                      <Link
                        to="/gestion-citas"
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          location.pathname === "/gestion-citas"
                            ? "bg-vet-primary text-white"
                            : "text-vet-gray-600 hover:text-vet-primary hover:bg-vet-gray-100",
                        )}
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Gestión Citas</span>
                      </Link>
                      <Link
                        to="/usuarios"
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          location.pathname === "/usuarios"
                            ? "bg-vet-primary text-white"
                            : "text-vet-gray-600 hover:text-vet-primary hover:bg-vet-gray-100",
                        )}
                      >
                        <Users className="w-4 h-4" />
                        <span>Usuarios</span>
                      </Link>
                      <Link
                        to="/veterinarios"
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          location.pathname === "/veterinarios"
                            ? "bg-vet-primary text-white"
                            : "text-vet-gray-600 hover:text-vet-primary hover:bg-vet-gray-100",
                        )}
                      >
                        <Stethoscope className="w-4 h-4" />
                        <span>Veterinarios</span>
                      </Link>
                    </>
                  ) : user.rol === "veterinario" ? (
                    // Veterinarian navigation
                    <>
                      <Link
                        to="/mis-pacientes"
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          location.pathname === "/mis-pacientes"
                            ? "bg-vet-primary text-white"
                            : "text-vet-gray-600 hover:text-vet-primary hover:bg-vet-gray-100",
                        )}
                      >
                        <Stethoscope className="w-4 h-4" />
                        <span>Mis Pacientes</span>
                      </Link>
                      <Link
                        to="/calendario"
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          location.pathname === "/calendario"
                            ? "bg-vet-primary text-white"
                            : "text-vet-gray-600 hover:text-vet-primary hover:bg-vet-gray-100",
                        )}
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Agenda Médica</span>
                      </Link>
                      <Link
                        to="/historial-clinico-veterinario"
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          location.pathname === "/historial-clinico-veterinario"
                            ? "bg-vet-primary text-white"
                            : "text-vet-gray-600 hover:text-vet-primary hover:bg-vet-gray-100",
                        )}
                      >
                        <FileText className="w-4 h-4" />
                        <span>Historial Clínico</span>
                      </Link>
                    </>
                  ) : (
                    // Client navigation
                    <>
                      <Link
                        to="/mascotas"
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          location.pathname === "/mascotas"
                            ? "bg-vet-primary text-white"
                            : "text-vet-gray-600 hover:text-vet-primary hover:bg-vet-gray-100",
                        )}
                      >
                        <PawPrint className="w-4 h-4" />
                        <span>Mis Mascotas</span>
                      </Link>
                      <Link
                        to="/mis-citas"
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          location.pathname === "/mis-citas"
                            ? "bg-vet-primary text-white"
                            : "text-vet-gray-600 hover:text-vet-primary hover:bg-vet-gray-100",
                        )}
                      >
                        <Clock className="w-4 h-4" />
                        <span>Mis Citas</span>
                      </Link>
                      <Link
                        to="/historial"
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          location.pathname === "/historial"
                            ? "bg-vet-primary text-white"
                            : "text-vet-gray-600 hover:text-vet-primary hover:bg-vet-gray-100",
                        )}
                      >
                        <FileText className="w-4 h-4" />
                        <span>Historial Clínico</span>
                      </Link>
                    </>
                  )}
                </>
              ) : (
                // Public navigation - landing page sections in order
                <>
                  <a
                    href="#estadisticas"
                    className="px-3 py-2 text-sm font-medium text-vet-gray-600 hover:text-vet-primary transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      if (location.pathname !== "/") {
                        navigate("/");
                        setTimeout(() => {
                          document
                            .getElementById("estadisticas")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                      } else {
                        document
                          .getElementById("estadisticas")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    Estadísticas
                  </a>
                  <a
                    href="#servicios"
                    className="px-3 py-2 text-sm font-medium text-vet-gray-600 hover:text-vet-primary transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      if (location.pathname !== "/") {
                        navigate("/");
                        setTimeout(() => {
                          document
                            .getElementById("servicios")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                      } else {
                        document
                          .getElementById("servicios")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    Servicios
                  </a>
                  <a
                    href="#newsletter"
                    className="px-3 py-2 text-sm font-medium text-vet-gray-600 hover:text-vet-primary transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      if (location.pathname !== "/") {
                        navigate("/");
                        setTimeout(() => {
                          document
                            .getElementById("newsletter")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                      } else {
                        document
                          .getElementById("newsletter")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    Newsletter
                  </a>
                  <a
                    href="#emergencias"
                    className="px-3 py-2 text-sm font-medium text-vet-gray-600 hover:text-vet-primary transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      if (location.pathname !== "/") {
                        navigate("/");
                        setTimeout(() => {
                          document
                            .getElementById("emergencias")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                      } else {
                        document
                          .getElementById("emergencias")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    Emergencias
                  </a>
                </>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {isUserAuthenticated ? (
                <>
                  {/* Notifications */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative">
                        <Bell className="w-4 h-4" />
                        {unreadNotificationsCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-vet-secondary w-2 h-2 rounded-full animate-pulse"></span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 sm:w-96">
                      <div className="p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-vet-gray-900">
                            Notificaciones
                          </h3>
                        </div>
                        <div className="space-y-2 sm:space-y-3 max-h-80 overflow-y-auto">
                          <div className="text-center py-8">
                            <Bell className="w-12 h-12 text-vet-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-vet-gray-500">
                              Sin notificaciones nuevas
                            </p>
                            <p className="text-xs text-vet-gray-400 mt-1">
                              Te notificaremos cuando tengas actualizaciones
                            </p>
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                        <div className="pt-2 sm:pt-3">
                          <Link to="/notificaciones">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-vet-primary hover:text-vet-primary-dark text-xs sm:text-sm"
                            >
                              Ver todas las notificaciones
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* User menu - solo desktop */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="hidden md:flex items-center space-x-2"
                      >
                        <div className="w-8 h-8 bg-vet-primary rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-vet-gray-700">
                          {user.nombre}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5 text-sm text-vet-gray-500">
                        {user.email}
                      </div>
                      <div className="px-2 py-1.5 text-xs text-vet-gray-400 capitalize">
                        {user.rol}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link
                          to="/configuracion"
                          className="flex items-center w-full"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Configuración
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Cerrar Sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Mobile menu button */}
                  <Sheet
                    open={isMobileMenuOpen}
                    onOpenChange={setIsMobileMenuOpen}
                  >
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" className="md:hidden">
                        <Menu className="w-4 h-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80 sm:w-96">
                      <SheetHeader>
                        <SheetTitle className="flex items-center space-x-2 text-left">
                          <div className="flex items-center justify-center w-8 h-8 bg-vet-primary rounded-lg">
                            <Heart className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xl font-bold text-vet-gray-900">
                            Pet<span className="text-vet-primary">LA</span>
                          </span>
                        </SheetTitle>
                      </SheetHeader>

                      <div className="mt-6">
                        {/* User info in mobile menu */}
                        <div className="flex items-center space-x-3 p-4 bg-vet-gray-50 rounded-lg mb-6">
                          <div className="w-10 h-10 bg-vet-primary rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-vet-gray-900">
                              {user.nombre}
                            </p>
                            <p className="text-sm text-vet-gray-600 capitalize">
                              {user.rol}
                            </p>
                          </div>
                        </div>

                        {/* Mobile navigation items */}
                        <nav className="space-y-2">
                          {filteredNavItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                  "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                  location.pathname === item.path
                                    ? "bg-vet-primary text-white"
                                    : "text-vet-gray-600 hover:text-vet-primary hover:bg-vet-gray-100",
                                )}
                              >
                                <IconComponent className="w-5 h-5" />
                                <span>{item.label}</span>
                              </Link>
                            );
                          })}
                        </nav>

                        {/* Mobile menu actions */}
                        <div className="mt-6 pt-6 border-t border-vet-gray-200 space-y-2">
                          <Link
                            to="/configuracion"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-vet-gray-600 hover:text-vet-primary hover:bg-vet-gray-100 transition-colors"
                          >
                            <Settings className="w-5 h-5" />
                            <span>Configuración</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                          >
                            <LogOut className="w-5 h-5" />
                            <span>Cerrar Sesión</span>
                          </button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/registro">
                    <Button
                      size="sm"
                      className="bg-vet-primary hover:bg-vet-primary-dark"
                    >
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <NewFooter />

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutConfirm}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
      />
    </div>
  );
}
