import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";

interface GuestRouteProps {
  children: ReactNode;
}

export default function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated } = useAppContext();

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is not authenticated, render the login/register page
  return <>{children}</>;
}
