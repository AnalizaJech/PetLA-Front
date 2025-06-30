import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Lock } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("admin" | "cliente" | "veterinario")[];
  requireAuth?: boolean;
}

export default function ProtectedRoute({
  children,
  allowedRoles = ["admin", "cliente", "veterinario"],
  requireAuth = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppContext();
  const location = useLocation();

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but doesn't have the required role
  if (isAuthenticated && user && !allowedRoles.includes(user.rol)) {
    return (
      <div className="min-h-screen bg-vet-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-red-600" />
              </div>

              <div>
                <h3 className="text-xl font-semibold text-vet-gray-900 mb-2">
                  Acceso Restringido
                </h3>
                <p className="text-vet-gray-600 mb-4">
                  No tienes permisos para acceder a esta página.
                </p>
                <Alert className="border-amber-200 bg-amber-50">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Esta sección requiere permisos de{" "}
                    <span className="font-semibold">
                      {allowedRoles.join(", ")}
                    </span>
                    . Tu rol actual es{" "}
                    <span className="font-semibold capitalize">{user.rol}</span>
                    .
                  </AlertDescription>
                </Alert>
              </div>

              <div className="space-y-3">
                <Link to="/dashboard">
                  <Button className="w-full bg-vet-primary hover:bg-vet-primary-dark">
                    Ir al Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </div>

              {user.rol === "cliente" && (
                <div className="text-sm text-vet-gray-500 pt-4 border-t">
                  <p>¿Necesitas acceso especial?</p>
                  <p>
                    Contacta al administrador en{" "}
                    <a
                      href="mailto:admin@petla.com"
                      className="text-vet-primary hover:text-vet-primary-dark"
                    >
                      admin@petla.com
                    </a>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
}
