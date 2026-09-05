const DB_NAME = 'csv-sample';
const STORE_NAME = 'templates';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb() {
    if (!dbPromise) {
        dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('name', 'name', { unique: false });
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    return dbPromise;
}

export async function listTemplates() {
    const db = await openDb();
    return new Promise<any[]>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => {
            const templates = request.result.sort((a, b) =>
                (a.createdAt || '').localeCompare(b.createdAt || '')
            );
            resolve(templates);
        };
        request.onerror = () => reject(request.error);
    });
}

export async function addTemplate(name, config) {
    const db = await openDb();
    return new Promise<IDBValidKey>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add({
            name,
            config,
            createdAt: new Date().toISOString(),
        });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function deleteTemplate(id) {
    const db = await openDb();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function updateTemplate(id, config) {
    const db = await openDb();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
            const record = getRequest.result;
            if (!record) {
                resolve();
                return;
            }
            record.config = config;
            record.updatedAt = new Date().toISOString();
            const putRequest = store.put(record);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
        };
        getRequest.onerror = () => reject(getRequest.error);
    });
}
