import { useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Bell, FileText, User } from "lucide-react";

export function useNotificationToast() {
  const { user, getNotificacionesByUser } = useAppContext();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const notificaciones = getNotificacionesByUser(user.id);

    // Mostrar toast para notificaciones nuevas (creadas en los últimos 5 segundos)
    const recentNotifications = notificaciones.filter((notif) => {
      const timeDiff =
        new Date().getTime() - new Date(notif.fechaCreacion).getTime();
      return timeDiff < 5000 && !notif.leida; // 5 segundos
    });

    recentNotifications.forEach((notif) => {
      let icon = <Bell className="w-4 h-4" />;
      let variant: "default" | "destructive" = "default";

      switch (notif.tipo) {
        case "cita_aceptada":
          icon = <CheckCircle className="w-4 h-4 text-green-600" />;
          break;
        case "bienvenida_cliente":
          icon = <User className="w-4 h-4 text-blue-600" />;
          break;
        case "consulta_registrada":
          icon = <FileText className="w-4 h-4 text-blue-600" />;
          break;
      }

      toast({
        title: notif.titulo,
        description: notif.mensaje,
        duration: 5000,
      });
    });
  }, [user, getNotificacionesByUser, toast]);
}
