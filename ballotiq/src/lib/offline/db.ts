/**
 * BallotIQ — IndexedDB utility for persistent client-side storage.
 * Handles caching of translations, guides, and user progress for offline use.
 */

const DB_NAME = 'ballotiq_offline';
const DB_VERSION = 1;

export const STORES = {
  TRANSLATIONS: 'translations',
  GUIDES: 'guides',
  QUIZZES: 'quizzes',
  PROGRESS: 'progress',
};

class OfflineDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORES.TRANSLATIONS)) {
          db.createObjectStore(STORES.TRANSLATIONS);
        }
        if (!db.objectStoreNames.contains(STORES.GUIDES)) {
          db.createObjectStore(STORES.GUIDES);
        }
        if (!db.objectStoreNames.contains(STORES.QUIZZES)) {
          db.createObjectStore(STORES.QUIZZES);
        }
        if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
          db.createObjectStore(STORES.PROGRESS);
        }
      };
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async set<T>(storeName: string, key: string, value: T): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineDB = new OfflineDB();
