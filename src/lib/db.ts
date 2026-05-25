const DB_NAME = 'peep-studio-media-db';
const STORE_NAME = 'media-files';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMediaDB(id: string, file: File): Promise<void> {
  const db = await getDB();
  
  let dataToStore: any = file;
  try {
     // Read file to ArrayBuffer to bypass iOS Safari IDB Blob storage bugs
     const getBuffer = (): Promise<ArrayBuffer> => {
        if (typeof file.arrayBuffer === 'function') return file.arrayBuffer();
        return new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(r.result as ArrayBuffer);
            r.onerror = () => rej(r.error);
            r.readAsArrayBuffer(file);
        });
     };
     const buffer = await getBuffer();
     dataToStore = {
         isWrappedBlob: true,
         buffer,
         type: file.type,
         name: file.name
     };
  } catch(e) {
     console.warn("Could not wrap file for IDB, attempting direct save...");
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(dataToStore, id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getMediaDB(id: string): Promise<File | Blob | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => {
        const result = request.result;
        if (!result) {
            resolve(null);
            return;
        }
        
        // Reconstruct Blob if it's the wrapped ArrayBuffer format
        if (result.isWrappedBlob && result.buffer) {
            try {
                const blob = new Blob([result.buffer], { type: result.type || 'application/octet-stream' });
                // Inherit name if it was a file
                if (result.name) {
                    (blob as any).name = result.name;
                }
                resolve(blob);
                return;
            } catch(e) {
                console.error("Failed to unwrap DB blob wrapper", e);
                resolve(null);
                return;
            }
        }
        
        resolve(result);
    };
    request.onerror = () => reject(transaction.error);
  });
}

export async function deleteMediaDB(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
