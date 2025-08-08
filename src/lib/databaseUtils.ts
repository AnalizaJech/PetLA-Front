import { localDB } from './localDatabase';

/**
 * Database utilities for PetLA application
 * Enhanced MongoDB-like operations for localStorage
 */

export class DatabaseUtils {
  static async exportData(): Promise<string> {
    try {
      return localDB.backup();
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  }

  static async importData(backupData: string): Promise<void> {
    try {
      localDB.restore(backupData);
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data');
    }
  }

  static downloadBackup(filename?: string): void {
    try {
      const backupData = localDB.backup();
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `petla_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading backup:', error);
      throw new Error('Failed to download backup');
    }
  }

  static uploadBackup(): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const backupData = e.target?.result as string;
            resolve(backupData);
          } catch (error) {
            reject(new Error('Failed to read backup file'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      };

      input.click();
    });
  }

  static getStorageInfo(): {
    used: number;
    total: number;
    percentage: number;
    humanReadable: {
      used: string;
      total: string;
    };
  } {
    let used = 0;
    const total = 5 * 1024 * 1024; // 5MB approximate limit

    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length;
      }
    }

    const percentage = (used / total) * 100;

    return {
      used,
      total,
      percentage,
      humanReadable: {
        used: this.formatBytes(used),
        total: this.formatBytes(total)
      }
    };
  }

  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static optimizeStorage(): {
    cleaned: number;
    message: string;
  } {
    let cleaned = 0;
    const keysToClean = [
      'temp_',
      'cache_',
      'preview_',
      'draft_',
      'old_',
      'test_'
    ];

    Object.keys(localStorage).forEach(key => {
      const shouldClean = keysToClean.some(prefix => key.startsWith(prefix));
      if (shouldClean) {
        cleaned += localStorage[key].length;
        localStorage.removeItem(key);
      }
    });

    return {
      cleaned,
      message: cleaned > 0 
        ? `Cleaned ${this.formatBytes(cleaned)} of temporary data`
        : 'No temporary data found to clean'
    };
  }

  static validateDatabase(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const stats = localDB.getStats();
      
      // Check if database exists
      if (!stats.database) {
        errors.push('Database not initialized');
        return { isValid: false, errors, warnings };
      }

      // Check collections
      const collections = localDB.listCollections();
      if (collections.length === 0) {
        warnings.push('No collections found - database is empty');
      }

      // Validate each collection
      collections.forEach(collection => {
        try {
          const documents = localDB.find(collection, {});
          
          // Check for document integrity
          documents.forEach(doc => {
            if (!doc._id) {
              errors.push(`Document missing _id in collection ${collection}`);
            }
            if (!doc.createdAt) {
              warnings.push(`Document missing createdAt in collection ${collection}`);
            }
            if (!doc.updatedAt) {
              warnings.push(`Document missing updatedAt in collection ${collection}`);
            }
          });

        } catch (error) {
          errors.push(`Failed to validate collection ${collection}: ${error}`);
        }
      });

      // Check storage usage
      const storageInfo = this.getStorageInfo();
      if (storageInfo.percentage > 90) {
        warnings.push('Storage usage above 90% - consider cleaning or backing up data');
      } else if (storageInfo.percentage > 75) {
        warnings.push('Storage usage above 75% - monitor space usage');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      errors.push(`Database validation failed: ${error}`);
      return { isValid: false, errors, warnings };
    }
  }

  static async migrateFromOldFormat(): Promise<{
    success: boolean;
    migratedCollections: string[];
    errors: string[];
  }> {
    const migratedCollections: string[] = [];
    const errors: string[] = [];

    try {
      // List of old localStorage keys to migrate
      const oldKeys = [
        'usuarios',
        'mascotas', 
        'citas',
        'preCitas',
        'historialClinico',
        'suscriptoresNewsletter',
        'newsletterEmails',
        'notificaciones'
      ];

      for (const key of oldKeys) {
        try {
          const oldDataStr = localStorage.getItem(key);
          if (oldDataStr) {
            const oldData = JSON.parse(oldDataStr);
            
            if (Array.isArray(oldData) && oldData.length > 0) {
              // Create collection if it doesn't exist
              localDB.createCollection(key);
              
              // Migrate each document
              let migratedCount = 0;
              for (const item of oldData) {
                try {
                  // Remove old id field and let database generate new _id
                  const { id, ...documentData } = item;
                  
                  // Convert date strings to Date objects
                  Object.keys(documentData).forEach(field => {
                    if (field.includes('fecha') || field.includes('Date') || field.includes('At')) {
                      if (typeof documentData[field] === 'string') {
                        try {
                          documentData[field] = new Date(documentData[field]);
                        } catch {
                          // Keep original value if not a valid date
                        }
                      }
                    }
                  });

                  localDB.insertOne(key, documentData);
                  migratedCount++;
                } catch (docError) {
                  errors.push(`Failed to migrate document in ${key}: ${docError}`);
                }
              }

              if (migratedCount > 0) {
                migratedCollections.push(`${key} (${migratedCount} documents)`);
                // Remove old data after successful migration
                localStorage.removeItem(key);
              }
            }
          }
        } catch (collectionError) {
          errors.push(`Failed to migrate collection ${key}: ${collectionError}`);
        }
      }

      return {
        success: errors.length === 0,
        migratedCollections,
        errors
      };

    } catch (error) {
      errors.push(`Migration failed: ${error}`);
      return {
        success: false,
        migratedCollections,
        errors
      };
    }
  }

  static setupDemoData(): void {
    try {
      // Check if demo data already exists
      const existingUsers = localDB.count('usuarios');
      if (existingUsers > 0) {
        console.log('Demo data already exists');
        return;
      }

      // Create demo users
      localDB.createCollection('usuarios');
      localDB.createIndex('usuarios', 'email', { unique: true });

      const demoUsers = [
        {
          nombre: 'Administrador PetLA',
          email: 'admin@petla.com',
          rol: 'admin',
          telefono: '+52 55 1234 5678',
          password: 'admin123'
        },
        {
          nombre: 'Dr. Carlos Ruiz',
          email: 'carlos.ruiz@petla.com',
          rol: 'veterinario',
          telefono: '+52 55 1234 5679',
          password: 'vet123'
        },
        {
          nombre: 'Cliente Demo',
          email: 'cliente@demo.com',
          rol: 'cliente',
          telefono: '+52 55 1234 5680',
          password: 'demo123'
        }
      ];

      demoUsers.forEach(user => {
        localDB.insertOne('usuarios', user);
      });

      // Create other collections
      const collections = [
        'mascotas',
        'citas', 
        'preCitas',
        'historialClinico',
        'suscriptoresNewsletter',
        'newsletterEmails',
        'notificaciones'
      ];

      collections.forEach(collection => {
        localDB.createCollection(collection);
      });

      // Create useful indexes
      localDB.createIndex('mascotas', 'clienteId');
      localDB.createIndex('citas', 'mascota');
      localDB.createIndex('citas', 'estado');
      localDB.createIndex('historialClinico', 'mascotaId');
      localDB.createIndex('suscriptoresNewsletter', 'email', { unique: true });
      localDB.createIndex('notificaciones', 'usuarioId');

      console.log('Demo data setup completed');

    } catch (error) {
      console.error('Failed to setup demo data:', error);
      throw new Error('Failed to setup demo data');
    }
  }
}

export default DatabaseUtils;