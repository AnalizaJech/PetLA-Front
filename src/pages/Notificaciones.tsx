import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  BellOff,
  Calendar,
  FileText,
  User,
  Settings,
  Clock,
  AlertCircle,
  CheckCircle,
  PawPrint,
} from "lucide-react";

export default function Notificaciones() {
  const { user, citas, preCitas, mascotas } = useAppContext();
  const [selectedFilter, setSelectedFilter] = useState("todas");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Generate real notifications from current data
  useEffect(() => {
    if (!user) return;

    const realNotifications = [];

    // For clients: upcoming appointments
    if (user.rol === "cliente") {
      const upcomingCitas = citas.filter((cita) => {
        const mascota = mascotas.find((m) => m.nombre === cita.mascota);
        return (
          mascota?.clienteId === user.id &&
          new Date(cita.fecha) > new Date() &&
          cita.estado === "aceptada"
        );
      });

      upcomingCitas.forEach((cita) => {
        const daysUntil = Math.ceil(
          (new Date(cita.fecha).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        );
        realNotifications.push({
          id: `cita-${cita.id}`,
          type: "cita",
          title: "Próxima cita",
          message: `${cita.mascota} - ${cita.veterinario}`,
          time:
            daysUntil === 0
              ? "Hoy"
              : `En ${daysUntil} día${daysUntil > 1 ? "s" : ""}`,
          read: false,
          priority: daysUntil <= 1 ? "urgent" : "normal",
          icon: Calendar,
          color: "vet-primary",
        });
      });
    }

    // For admins and vets: pending pre-appointments
    if (user.rol === "admin" || user.rol === "veterinario") {
      const pendingPreCitas = preCitas.filter(
        (preCita) => preCita.estado === "pendiente",
      );

      pendingPreCitas.forEach((preCita) => {
        const hoursAgo = Math.floor(
          (new Date().getTime() - new Date(preCita.fechaCreacion).getTime()) /
            (1000 * 60 * 60),
        );
        realNotifications.push({
          id: `precita-${preCita.id}`,
          type: "pre-cita",
          title: "Nueva solicitud de cita",
          message: `${preCita.nombreMascota} - ${preCita.motivoConsulta}`,
          time:
            hoursAgo === 0
              ? "Hace menos de 1 hora"
              : `Hace ${hoursAgo} hora${hoursAgo > 1 ? "s" : ""}`,
          read: false,
          priority: "high",
          icon: Clock,
          color: "vet-primary",
        });
      });

      // Upcoming appointments for today
      const todaysCitas = citas.filter((cita) => {
        const citaDate = new Date(cita.fecha);
        const today = new Date();
        return (
          citaDate.toDateString() === today.toDateString() &&
          cita.estado === "aceptada"
        );
      });

      todaysCitas.forEach((cita) => {
        realNotifications.push({
          id: `today-${cita.id}`,
          type: "recordatorio",
          title: "Cita programada para hoy",
          message: `${cita.mascota} - ${cita.motivo}`,
          time: new Date(cita.fecha).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          read: false,
          priority: "urgent",
          icon: AlertCircle,
          color: "yellow-500",
        });
      });
    }

    setNotifications(realNotifications);
  }, [user, citas, preCitas, mascotas]);

  const filteredNotifications = notifications.filter((notification) => {
    if (selectedFilter === "todas") return true;
    if (selectedFilter === "no_leidas") return !notification.read;
    return notification.type === selectedFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
  };

  const getIconComponent = (IconComponent, color) => (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center bg-${color}/10`}
    >
      <IconComponent className={`w-5 h-5 text-${color}`} />
    </div>
  );

  const getPriorityBadge = (priority) => {
    const variants = {
      urgent: "destructive",
      high: "default",
      normal: "secondary",
      low: "outline",
    };
    return (
      <Badge variant={variants[priority]} className="text-xs">
        {priority === "urgent" && "Urgente"}
        {priority === "high" && "Alta"}
        {priority === "normal" && "Normal"}
        {priority === "low" && "Baja"}
      </Badge>
    );
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <Bell className="w-12 h-12 text-vet-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                Acceso requerido
              </h3>
              <p className="text-vet-gray-600">
                Debes iniciar sesión para ver tus notificaciones
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-vet-primary/10 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-vet-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-vet-gray-900">
                  Notificaciones
                </h1>
                <p className="text-vet-gray-600">
                  Mantente al día con tus citas y actualizaciones
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-sm">
                {unreadCount} no leídas
              </Badge>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-vet-primary border-vet-primary hover:bg-vet-primary hover:text-white"
                >
                  Marcar todas como leídas
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 mb-6">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="no_leidas">No leídas</TabsTrigger>
              <TabsTrigger value="cita">Citas</TabsTrigger>
              {(user.rol === "admin" || user.rol === "veterinario") && (
                <>
                  <TabsTrigger value="pre-cita">Pre-citas</TabsTrigger>
                  <TabsTrigger value="recordatorio">Recordatorios</TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value={selectedFilter} className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BellOff className="w-16 h-16 text-vet-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-vet-gray-900 mb-2">
                      Sin notificaciones
                    </h3>
                    <p className="text-vet-gray-600">
                      {selectedFilter === "todas"
                        ? "No tienes notificaciones en este momento"
                        : `No tienes notificaciones de tipo "${selectedFilter}"`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications
                    .sort((a, b) => {
                      // Sort by read status (unread first) then by priority
                      if (a.read !== b.read) return a.read ? 1 : -1;
                      const priorityOrder = {
                        urgent: 0,
                        high: 1,
                        normal: 2,
                        low: 3,
                      };
                      return (
                        priorityOrder[a.priority] - priorityOrder[b.priority]
                      );
                    })
                    .map((notification) => (
                      <Card
                        key={notification.id}
                        className={`transition-all duration-200 cursor-pointer ${
                          !notification.read
                            ? "border-vet-primary/20 bg-vet-primary/5"
                            : "hover:bg-vet-gray-50"
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            {getIconComponent(
                              notification.icon,
                              notification.color,
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4
                                  className={`text-sm font-medium ${
                                    !notification.read
                                      ? "text-vet-gray-900"
                                      : "text-vet-gray-700"
                                  }`}
                                >
                                  {notification.title}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  {getPriorityBadge(notification.priority)}
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-vet-primary rounded-full"></div>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-vet-gray-600 mb-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-vet-gray-500">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
