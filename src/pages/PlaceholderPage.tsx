import { ReactNode } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/lib/types";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: ReactNode;
  userRole?: UserRole;
}

// Mock user data - in a real app this would come from authentication context
const mockUser = {
  id: "1",
  nombre: "María González",
  email: "maria@example.com",
  rol: "cliente" as UserRole,
};

export default function PlaceholderPage({
  title,
  description,
  icon,
  userRole = "cliente",
}: PlaceholderPageProps) {
  const user = { ...mockUser, rol: userRole };

  return (
    <Layout user={user}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center">
          <CardHeader className="pb-6">
            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-vet-primary/10 mb-6">
              {icon}
            </div>
            <CardTitle className="text-3xl font-bold text-vet-gray-900">
              {title}
            </CardTitle>
            <CardDescription className="text-lg text-vet-gray-600 mt-4">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-vet-gray-50 rounded-lg p-8 mb-6">
              <h3 className="text-lg font-semibold text-vet-gray-900 mb-4">
                Esta página está en desarrollo
              </h3>
              <p className="text-vet-gray-600 mb-6">
                Estamos trabajando en implementar esta funcionalidad. Pronto
                estará disponible con todas las características que necesitas.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-vet-gray-600">
                <div className="bg-white rounded-lg p-4">
                  <div className="w-8 h-8 bg-vet-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-vet-primary font-semibold">1</span>
                  </div>
                  <p>Diseño moderno e intuitivo</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="w-8 h-8 bg-vet-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-vet-primary font-semibold">2</span>
                  </div>
                  <p>Funcionalidades completas</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="w-8 h-8 bg-vet-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-vet-primary font-semibold">3</span>
                  </div>
                  <p>Experiencia optimizada</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={() => window.history.back()}>
                ← Volver
              </Button>
              <Button
                className="bg-vet-primary hover:bg-vet-primary-dark"
                onClick={() => (window.location.href = "/dashboard")}
              >
                Ir al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
