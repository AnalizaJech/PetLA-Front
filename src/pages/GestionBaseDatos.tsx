import Layout from "@/components/Layout";
import DatabaseManager from "@/components/DatabaseManager";
import { useAppContext } from "@/contexts/AppContext";

export default function GestionBaseDatos() {
  const { user } = useAppContext();

  return (
    <Layout user={user}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <DatabaseManager />
      </div>
    </Layout>
  );
}