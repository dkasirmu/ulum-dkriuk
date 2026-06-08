// js/db.js

export let db;

// MEMBUKA DATA BASE
export function bukaDB() {
    return new Promise(function(resolve, reject) {
        const request = indexedDB.open("KasirDB", 2);

        request.onupgradeneeded = function(e) {
            const db = e.target.result;

            if (!db.objectStoreNames.contains("produk")) {
                db.createObjectStore("produk", { keyPath: "nama" });
            }
            if (!db.objectStoreNames.contains("transaksi")) {
                db.createObjectStore("transaksi", { keyPath: "id", autoIncrement: true });
            }
            if (!db.objectStoreNames.contains("laci")) {
                db.createObjectStore("laci", { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains("pengaturan")) {
                db.createObjectStore("pengaturan", { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains("sesiKasir")) {
                db.createObjectStore("sesiKasir", { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = function(e) {
            resolve(e.target.result);
        };

        request.onerror = function(e) {
            reject(e.target.error);
        };
    });
}

// AMBIL SEMUA DATA DARI DATABASE
export function getAllData(storeName) {
    return new Promise(function(resolve, reject) {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = function(e) {
            resolve(e.target.result);
        };

        request.onerror = function(e) {
            reject(e.target.error);
        };
    });
}