import {
  INDEXED_DB_NAME,
  INDEXED_DB_SCHEMA_VERSION,
  STORE_NAMES,
  type PersistenceAdapter,
  type StoreName,
  type StoredRecord,
} from "./types.js";

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed"));
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
  });
}

export class IndexedDbAdapter implements PersistenceAdapter {
  readonly schemaVersion = INDEXED_DB_SCHEMA_VERSION;
  private databasePromise: Promise<IDBDatabase> | null = null;

  constructor(
    private readonly databaseName = INDEXED_DB_NAME,
    private readonly indexedDb: IDBFactory = globalThis.indexedDB,
  ) {
    if (!indexedDb && typeof window !== "undefined") throw new Error("Trình duyệt không hỗ trợ IndexedDB.");
  }

  private open(): Promise<IDBDatabase> {
    if (this.databasePromise) return this.databasePromise;
    this.databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = this.indexedDb.open(this.databaseName, INDEXED_DB_SCHEMA_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        for (const store of STORE_NAMES) {
          if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath: "id" });
        }
      };
      request.onsuccess = async () => {
        const db = request.result;
        db.onversionchange = () => db.close();

        // Auto-heal if database was already open at a previous version and missing any stores
        const missingStores = STORE_NAMES.filter((store) => !db.objectStoreNames.contains(store));
        if (missingStores.length > 0) {
          db.close();
          const upgradeVersion = Math.max(db.version + 1, INDEXED_DB_SCHEMA_VERSION + 1);
          const upgradeRequest = this.indexedDb.open(this.databaseName, upgradeVersion);
          upgradeRequest.onupgradeneeded = () => {
            const upgradedDb = upgradeRequest.result;
            for (const store of STORE_NAMES) {
              if (!upgradedDb.objectStoreNames.contains(store)) {
                upgradedDb.createObjectStore(store, { keyPath: "id" });
              }
            }
          };
          upgradeRequest.onsuccess = () => {
            const upgradedDb = upgradeRequest.result;
            upgradedDb.onversionchange = () => upgradedDb.close();
            resolve(upgradedDb);
          };
          upgradeRequest.onerror = () => reject(upgradeRequest.error ?? new Error("Không thể nâng cấp IndexedDB."));
          upgradeRequest.onblocked = () => reject(new Error("IndexedDB đang bị khóa bởi tab khác."));
          return;
        }

        resolve(db);
      };
      request.onerror = () => reject(request.error ?? new Error("Không thể mở IndexedDB."));
      request.onblocked = () => reject(new Error("IndexedDB đang bị một tab khác khóa."));
    });
    return this.databasePromise;
  }

  async get<T>(store: StoreName, id: string): Promise<T | undefined> {
    const db = await this.open();
    return requestResult(db.transaction(store, "readonly").objectStore(store).get(id)) as Promise<T | undefined>;
  }

  async getAll<T>(store: StoreName): Promise<T[]> {
    const db = await this.open();
    return requestResult(db.transaction(store, "readonly").objectStore(store).getAll()) as Promise<T[]>;
  }

  async put<T extends StoredRecord>(store: StoreName, value: T): Promise<T> {
    const db = await this.open();
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    await transactionDone(tx);
    return value;
  }

  async delete(store: StoreName, id: string): Promise<void> {
    const db = await this.open();
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(id);
    await transactionDone(tx);
  }

  async clear(store: StoreName): Promise<void> {
    const db = await this.open();
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).clear();
    await transactionDone(tx);
  }

  async clearAll(): Promise<void> {
    const db = await this.open();
    const tx = db.transaction([...STORE_NAMES], "readwrite");
    for (const store of STORE_NAMES) tx.objectStore(store).clear();
    await transactionDone(tx);
  }
}

let defaultAdapter: IndexedDbAdapter | undefined;

export function getIndexedDbAdapter(): IndexedDbAdapter {
  defaultAdapter ??= new IndexedDbAdapter();
  return defaultAdapter;
}
