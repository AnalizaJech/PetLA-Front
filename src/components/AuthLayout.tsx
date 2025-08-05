import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Dog } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-vet-gray-50 to-vet-gray-100 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-40 h-40 bg-vet-primary/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-vet-secondary/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-500/5 rounded-full blur-2xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center space-x-3 mb-4 hover:opacity-80 transition-opacity duration-200"
          >
            <div className="flex items-center justify-center w-14 h-14 bg-vet-primary rounded-xl shadow-lg">
              <Dog className="w-8 h-8 text-white" />
            </div>
            <span className="text-4xl font-bold text-vet-gray-900">
              Pet<span className="text-vet-primary">LA</span>
            </span>
          </Link>
          <p className="text-lg text-vet-gray-600">
            Plataforma veterinaria líder en Latinoamérica
          </p>
        </div>

        {/* Main content */}
        {children}
      </div>
    </div>
  );
}
