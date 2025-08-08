/**
 * Enhanced LocalStorage Database Manager
 * MongoDB-like interface for localStorage without backend
 */

export interface DatabaseDocument {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

export interface QueryOptions {
  sort?: { [field: string]: 1 | -1 };
  limit?: number;
  skip?: number;
}

export interface IndexOptions {
  unique?: boolean;
  sparse?: boolean;
}

class LocalDatabase {
  private dbName: string;
  private collections: Map<string, Set<string>> = new Map(); // Collection indexes
  private indexes: Map<string, Map<string, IndexOptions>> = new Map(); // Field indexes per collection

  constructor(dbName: string = 'petla_db') {
    this.dbName = dbName;
    this.initializeDatabase();
  }

  private initializeDatabase() {
    // Initialize database metadata if not exists
    const dbMetadata = localStorage.getItem(`${this.dbName}_metadata`);
    if (!dbMetadata) {
      const metadata = {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        collections: [],
        lastBackup: null
      };
      localStorage.setItem(`${this.dbName}_metadata`, JSON.stringify(metadata));
    }
  }

  private getCollectionKey(collection: string): string {
    return `${this.dbName}_collection_${collection}`;
  }

  private getIndexKey(collection: string, field: string): string {
    return `${this.dbName}_index_${collection}_${field}`;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private ensureCollection(collection: string) {
    if (!this.collections.has(collection)) {
      this.collections.set(collection, new Set());
      this.indexes.set(collection, new Map());
      
      // Update metadata
      const metadata = JSON.parse(localStorage.getItem(`${this.dbName}_metadata`) || '{}');
      if (!metadata.collections.includes(collection)) {
        metadata.collections.push(collection);
        localStorage.setItem(`${this.dbName}_metadata`, JSON.stringify(metadata));
      }
    }
  }

  private updateIndexes(collection: string, document: DatabaseDocument, operation: 'insert' | 'update' | 'delete') {
    const collectionIndexes = this.indexes.get(collection);
    if (!collectionIndexes) return;

    for (const [field, options] of collectionIndexes) {
      const indexKey = this.getIndexKey(collection, field);
      let index = JSON.parse(localStorage.getItem(indexKey) || '{}');

      const fieldValue = document[field];
      if (fieldValue !== undefined) {
        if (operation === 'insert' || operation === 'update') {
          if (options.unique && index[fieldValue] && index[fieldValue] !== document._id) {
            throw new Error(`Duplicate key error: ${field} must be unique`);
          }
          index[fieldValue] = document._id;
        } else if (operation === 'delete') {
          delete index[fieldValue];
        }

        localStorage.setItem(indexKey, JSON.stringify(index));
      }
    }
  }

  // Collection operations
  createCollection(name: string): void {
    this.ensureCollection(name);
  }

  dropCollection(name: string): void {
    const collectionKey = this.getCollectionKey(name);
    const documentsStr = localStorage.getItem(collectionKey);
    
    if (documentsStr) {
      const documents = JSON.parse(documentsStr);
      // Remove all documents
      documents.forEach((doc: DatabaseDocument) => {
        localStorage.removeItem(`${collectionKey}_${doc._id}`);
      });
    }

    // Remove collection and indexes
    localStorage.removeItem(collectionKey);
    this.collections.delete(name);
    
    const collectionIndexes = this.indexes.get(name);
    if (collectionIndexes) {
      for (const field of collectionIndexes.keys()) {
        localStorage.removeItem(this.getIndexKey(name, field));
      }
      this.indexes.delete(name);
    }

    // Update metadata
    const metadata = JSON.parse(localStorage.getItem(`${this.dbName}_metadata`) || '{}');
    metadata.collections = metadata.collections.filter((col: string) => col !== name);
    localStorage.setItem(`${this.dbName}_metadata`, JSON.stringify(metadata));
  }

  listCollections(): string[] {
    const metadata = JSON.parse(localStorage.getItem(`${this.dbName}_metadata`) || '{}');
    return metadata.collections || [];
  }

  // Index operations
  createIndex(collection: string, field: string, options: IndexOptions = {}): void {
    this.ensureCollection(collection);
    
    const collectionIndexes = this.indexes.get(collection)!;
    collectionIndexes.set(field, options);

    // Build index from existing documents
    const documents = this.find(collection, {});
    const index: { [value: string]: string } = {};

    documents.forEach(doc => {
      const fieldValue = doc[field];
      if (fieldValue !== undefined) {
        if (options.unique && index[fieldValue]) {
          throw new Error(`Cannot create unique index: duplicate values found for ${field}`);
        }
        index[fieldValue] = doc._id;
      }
    });

    localStorage.setItem(this.getIndexKey(collection, field), JSON.stringify(index));
  }

  dropIndex(collection: string, field: string): void {
    const collectionIndexes = this.indexes.get(collection);
    if (collectionIndexes) {
      collectionIndexes.delete(field);
      localStorage.removeItem(this.getIndexKey(collection, field));
    }
  }

  // Document operations
  insertOne(collection: string, document: Omit<DatabaseDocument, '_id' | 'createdAt' | 'updatedAt'>): DatabaseDocument {
    this.ensureCollection(collection);

    const now = new Date();
    const newDocument: DatabaseDocument = {
      _id: this.generateId(),
      createdAt: now,
      updatedAt: now,
      ...document
    };

    // Check indexes before inserting
    this.updateIndexes(collection, newDocument, 'insert');

    // Store document
    const collectionKey = this.getCollectionKey(collection);
    const documentKey = `${collectionKey}_${newDocument._id}`;
    localStorage.setItem(documentKey, JSON.stringify(newDocument));

    // Update collection index
    const collectionSet = this.collections.get(collection)!;
    collectionSet.add(newDocument._id);

    // Update collection document list
    const collectionDocuments = this.find(collection, {}).map(doc => doc._id);
    collectionDocuments.push(newDocument._id);
    localStorage.setItem(collectionKey, JSON.stringify(collectionDocuments));

    return newDocument;
  }

  insertMany(collection: string, documents: Omit<DatabaseDocument, '_id' | 'createdAt' | 'updatedAt'>[]): DatabaseDocument[] {
    return documents.map(doc => this.insertOne(collection, doc));
  }

  findOne(collection: string, query: any): DatabaseDocument | null {
    const results = this.find(collection, query, { limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  find(collection: string, query: any = {}, options: QueryOptions = {}): DatabaseDocument[] {
    this.ensureCollection(collection);

    const collectionKey = this.getCollectionKey(collection);
    const documentIds = JSON.parse(localStorage.getItem(collectionKey) || '[]');

    let documents: DatabaseDocument[] = [];

    // Load all documents
    for (const id of documentIds) {
      const documentKey = `${collectionKey}_${id}`;
      const docStr = localStorage.getItem(documentKey);
      if (docStr) {
        try {
          const doc = JSON.parse(docStr);
          // Convert date strings back to Date objects
          doc.createdAt = new Date(doc.createdAt);
          doc.updatedAt = new Date(doc.updatedAt);
          documents.push(doc);
        } catch (error) {
          console.warn(`Failed to parse document ${id}:`, error);
        }
      }
    }

    // Apply query filter
    documents = documents.filter(doc => this.matchesQuery(doc, query));

    // Apply sorting
    if (options.sort) {
      documents.sort((a, b) => {
        for (const [field, direction] of Object.entries(options.sort!)) {
          const aVal = this.getNestedValue(a, field);
          const bVal = this.getNestedValue(b, field);
          
          let comparison = 0;
          if (aVal < bVal) comparison = -1;
          else if (aVal > bVal) comparison = 1;
          
          if (comparison !== 0) {
            return direction === 1 ? comparison : -comparison;
          }
        }
        return 0;
      });
    }

    // Apply pagination
    if (options.skip) {
      documents = documents.slice(options.skip);
    }
    if (options.limit) {
      documents = documents.slice(0, options.limit);
    }

    return documents;
  }

  updateOne(collection: string, query: any, update: any): DatabaseDocument | null {
    const document = this.findOne(collection, query);
    if (!document) return null;

    const updatedDocument = {
      ...document,
      ...update,
      updatedAt: new Date()
    };

    // Update indexes
    this.updateIndexes(collection, updatedDocument, 'update');

    // Store updated document
    const collectionKey = this.getCollectionKey(collection);
    const documentKey = `${collectionKey}_${document._id}`;
    localStorage.setItem(documentKey, JSON.stringify(updatedDocument));

    return updatedDocument;
  }

  updateMany(collection: string, query: any, update: any): DatabaseDocument[] {
    const documents = this.find(collection, query);
    return documents.map(doc => this.updateOne(collection, { _id: doc._id }, update)!);
  }

  deleteOne(collection: string, query: any): boolean {
    const document = this.findOne(collection, query);
    if (!document) return false;

    return this.deleteById(collection, document._id);
  }

  deleteMany(collection: string, query: any): number {
    const documents = this.find(collection, query);
    let deletedCount = 0;

    documents.forEach(doc => {
      if (this.deleteById(collection, doc._id)) {
        deletedCount++;
      }
    });

    return deletedCount;
  }

  deleteById(collection: string, id: string): boolean {
    const collectionKey = this.getCollectionKey(collection);
    const documentKey = `${collectionKey}_${id}`;
    
    const docStr = localStorage.getItem(documentKey);
    if (!docStr) return false;

    const document = JSON.parse(docStr);
    
    // Update indexes
    this.updateIndexes(collection, document, 'delete');

    // Remove document
    localStorage.removeItem(documentKey);

    // Update collection index
    const collectionSet = this.collections.get(collection);
    if (collectionSet) {
      collectionSet.delete(id);
    }

    // Update collection document list
    const documentIds = JSON.parse(localStorage.getItem(collectionKey) || '[]');
    const updatedIds = documentIds.filter((docId: string) => docId !== id);
    localStorage.setItem(collectionKey, JSON.stringify(updatedIds));

    return true;
  }

  // Aggregation operations
  count(collection: string, query: any = {}): number {
    return this.find(collection, query).length;
  }

  distinct(collection: string, field: string, query: any = {}): any[] {
    const documents = this.find(collection, query);
    const values = new Set();
    
    documents.forEach(doc => {
      const value = this.getNestedValue(doc, field);
      if (value !== undefined) {
        values.add(value);
      }
    });

    return Array.from(values);
  }

  // Database operations
  backup(): string {
    const backup = {
      metadata: JSON.parse(localStorage.getItem(`${this.dbName}_metadata`) || '{}'),
      collections: {} as any,
      timestamp: new Date().toISOString()
    };

    this.listCollections().forEach(collection => {
      backup.collections[collection] = {
        documents: this.find(collection, {}),
        indexes: Array.from(this.indexes.get(collection)?.entries() || [])
      };
    });

    return JSON.stringify(backup, null, 2);
  }

  restore(backupData: string): void {
    try {
      const backup = JSON.parse(backupData);
      
      // Clear existing data
      this.listCollections().forEach(collection => {
        this.dropCollection(collection);
      });

      // Restore metadata
      localStorage.setItem(`${this.dbName}_metadata`, JSON.stringify(backup.metadata));

      // Restore collections
      Object.entries(backup.collections).forEach(([collectionName, collectionData]: [string, any]) => {
        this.createCollection(collectionName);

        // Restore indexes
        collectionData.indexes.forEach(([field, options]: [string, IndexOptions]) => {
          this.createIndex(collectionName, field, options);
        });

        // Restore documents
        collectionData.documents.forEach((doc: any) => {
          const { _id, createdAt, updatedAt, ...docData } = doc;
          this.insertOne(collectionName, docData);
        });
      });

      // Update last backup timestamp
      const metadata = JSON.parse(localStorage.getItem(`${this.dbName}_metadata`) || '{}');
      metadata.lastBackup = new Date().toISOString();
      localStorage.setItem(`${this.dbName}_metadata`, JSON.stringify(metadata));

    } catch (error) {
      throw new Error(`Failed to restore backup: ${error}`);
    }
  }

  getStats(): any {
    const metadata = JSON.parse(localStorage.getItem(`${this.dbName}_metadata`) || '{}');
    const collections = this.listCollections();
    
    const stats = {
      database: this.dbName,
      version: metadata.version,
      createdAt: metadata.createdAt,
      lastBackup: metadata.lastBackup,
      collections: collections.length,
      totalDocuments: 0,
      storageSize: 0,
      collectionStats: {} as any
    };

    collections.forEach(collection => {
      const documents = this.find(collection, {});
      const collectionKey = this.getCollectionKey(collection);
      
      // Calculate storage size
      let collectionSize = 0;
      documents.forEach(doc => {
        const docKey = `${collectionKey}_${doc._id}`;
        const docStr = localStorage.getItem(docKey);
        if (docStr) {
          collectionSize += docStr.length;
        }
      });

      stats.collectionStats[collection] = {
        documents: documents.length,
        indexes: this.indexes.get(collection)?.size || 0,
        storageSize: collectionSize
      };

      stats.totalDocuments += documents.length;
      stats.storageSize += collectionSize;
    });

    return stats;
  }

  // Helper methods
  private matchesQuery(document: any, query: any): boolean {
    for (const [key, value] of Object.entries(query)) {
      const docValue = this.getNestedValue(document, key);
      
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        // Handle query operators like $gt, $lt, etc.
        for (const [operator, operatorValue] of Object.entries(value)) {
          switch (operator) {
            case '$gt':
              if (!(docValue > operatorValue)) return false;
              break;
            case '$gte':
              if (!(docValue >= operatorValue)) return false;
              break;
            case '$lt':
              if (!(docValue < operatorValue)) return false;
              break;
            case '$lte':
              if (!(docValue <= operatorValue)) return false;
              break;
            case '$ne':
              if (docValue === operatorValue) return false;
              break;
            case '$in':
              if (!Array.isArray(operatorValue) || !operatorValue.includes(docValue)) return false;
              break;
            case '$nin':
              if (Array.isArray(operatorValue) && operatorValue.includes(docValue)) return false;
              break;
            case '$exists':
              if (operatorValue && docValue === undefined) return false;
              if (!operatorValue && docValue !== undefined) return false;
              break;
            case '$regex':
              if (typeof docValue !== 'string' || !new RegExp(operatorValue).test(docValue)) return false;
              break;
            default:
              if (docValue !== operatorValue) return false;
          }
        }
      } else {
        if (docValue !== value) return false;
      }
    }
    return true;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

// Create global database instance
export const localDB = new LocalDatabase('petla_db');

// Export types
export { LocalDatabase };
export default localDB;