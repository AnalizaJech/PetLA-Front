import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Database,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BarChart3,
  HardDrive,
  FileText,
  Settings
} from "lucide-react";
import { localDB } from "@/lib/localDatabase";
import DatabaseUtils from "@/lib/databaseUtils";
import { toast } from "sonner";

export default function DatabaseManager() {
  const [stats, setStats] = useState<any>(null);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDatabaseInfo();
  }, []);

  const loadDatabaseInfo = () => {
    setStats(localDB.getStats());
    setStorageInfo(DatabaseUtils.getStorageInfo());
    setValidation(DatabaseUtils.validateDatabase());
  };

  const handleExportData = () => {
    try {
      DatabaseUtils.downloadBackup();
      toast.success('Backup descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar backup: ' + error);
    }
  };

  const handleImportData = async () => {
    try {
      setIsLoading(true);
      const backupData = await DatabaseUtils.uploadBackup();
      await DatabaseUtils.importData(backupData);
      loadDatabaseInfo();
      toast.success('Datos importados exitosamente');
    } catch (error) {
      toast.error('Error al importar datos: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeStorage = () => {
    try {
      const result = DatabaseUtils.optimizeStorage();
      loadDatabaseInfo();
      toast.success(result.message);
    } catch (error) {
      toast.error('Error al optimizar almacenamiento: ' + error);
    }
  };

  const handleMigrateData = async () => {
    try {
      setIsLoading(true);
      const result = await DatabaseUtils.migrateFromOldFormat();
      
      if (result.success) {
        toast.success(`Migración completada: ${result.migratedCollections.length} colecciones migradas`);
      } else {
        toast.error(`Migración con errores: ${result.errors.length} errores encontrados`);
      }
      
      loadDatabaseInfo();
    } catch (error) {
      toast.error('Error en migración: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupDemo = () => {
    try {
      DatabaseUtils.setupDemoData();
      loadDatabaseInfo();
      toast.success('Datos de demostración configurados');
    } catch (error) {
      toast.error('Error al configurar datos demo: ' + error);
    }
  };

  if (!stats) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Base de Datos</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra y monitorea la base de datos local de PetLA
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadDatabaseInfo} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="storage">Almacenamiento</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          <TabsTrigger value="tools">Herramientas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Database Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Estado de la Base de Datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.collections}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Colecciones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.totalDocuments}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Documentos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {DatabaseUtils.formatBytes(stats.storageSize)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Tamaño</div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Colecciones</h4>
                <div className="space-y-2">
                  {Object.entries(stats.collectionStats).map(([collection, data]: [string, any]) => (
                    <div key={collection} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium">{collection}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{data.documents} docs</span>
                        <span>{data.indexes} índices</span>
                        <span>{DatabaseUtils.formatBytes(data.storageSize)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {validation?.isValid ? (
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2 text-red-500" />
                )}
                Estado de Validación
              </CardTitle>
            </CardHeader>
            <CardContent>
              {validation?.errors.length > 0 && (
                <Alert className="mb-4">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Errores encontrados:</strong>
                    <ul className="mt-2 list-disc list-inside">
                      {validation.errors.map((error: string, index: number) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validation?.warnings.length > 0 && (
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Advertencias:</strong>
                    <ul className="mt-2 list-disc list-inside">
                      {validation.warnings.map((warning: string, index: number) => (
                        <li key={index} className="text-sm">{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validation?.isValid && validation?.warnings.length === 0 && (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>Base de datos validada correctamente</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HardDrive className="w-5 h-5 mr-2" />
                Uso de Almacenamiento
              </CardTitle>
              <CardDescription>
                Monitor del espacio utilizado en localStorage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Espacio utilizado</span>
                    <span>{storageInfo?.humanReadable.used} / {storageInfo?.humanReadable.total}</span>
                  </div>
                  <Progress value={storageInfo?.percentage || 0} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">
                    {storageInfo?.percentage.toFixed(1)}% utilizado
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Optimización de almacenamiento</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Elimina archivos temporales y datos innecesarios
                    </p>
                  </div>
                  <Button onClick={handleOptimizeStorage} variant="outline">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Optimizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Exportar Datos
                </CardTitle>
                <CardDescription>
                  Descarga un backup completo de la base de datos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Incluye todas las colecciones, documentos e índices en formato JSON
                  </p>
                  <Button onClick={handleExportData} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Backup
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Importar Datos
                </CardTitle>
                <CardDescription>
                  Restaura la base de datos desde un archivo de backup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Advertencia:</strong> Esta acción reemplazará todos los datos existentes.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={handleImportData} 
                    variant="destructive" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isLoading ? 'Importando...' : 'Importar Backup'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {stats.lastBackup && (
            <Card>
              <CardHeader>
                <CardTitle>Último Backup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(stats.lastBackup).toLocaleString('es-ES')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Migración de Datos
                </CardTitle>
                <CardDescription>
                  Migra datos del formato anterior al nuevo sistema de base de datos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Convierte datos de localStorage legacy al nuevo formato MongoDB-like
                  </p>
                  <Button 
                    onClick={handleMigrateData} 
                    variant="outline" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {isLoading ? 'Migrando...' : 'Migrar Datos'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Datos de Demostración
                </CardTitle>
                <CardDescription>
                  Configura datos de ejemplo para testing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Crea usuarios, mascotas y citas de ejemplo para pruebas
                  </p>
                  <Button onClick={handleSetupDemo} variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}