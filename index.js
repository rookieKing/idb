
const methods = [
  'add',
  'clear',
  'count',
  'delete',
  'get',
  'getAll',
  'getAllKeys',
  'getKey',
  'openCursor',
  'openKeyCursor',
  'put',
];

class IndexedDB {
  constructor(name, onupgradeneeded, version = 1) {
    this.db = new Promise((resolve, reject) => {
      const openDBRequest = indexedDB.open(name, version);
      openDBRequest.onerror = function (e) {
        reject(e);
      };
      openDBRequest.onsuccess = function (e) {
        resolve(e.target.result);
      };
      openDBRequest.onupgradeneeded = function (e) {
        const db = e.target.result;
        // createObjectStore & deleteObjectStore
        // can be called only within a versionchange(onupgradeneeded) transaction.
        onupgradeneeded(db.createObjectStore.bind(db), db.deleteObjectStore.bind(db), e);
      };
      openDBRequest.blocked = function (e) {
        reject(e);
      }
    });
  }

  async transaction(objectStoreNames, mode = 'readwrite', options) {
    const db = await this.db;
    const transaction = new Transaction(db, objectStoreNames, mode, options);
    return transaction;
  }

  async close() {
    const db = await this.db;
    db.close();
  }
}

methods.forEach(method => {
  IndexedDB.prototype[method] = async function (objectStoreName, ...args) {
    const transaction = await this.transaction(objectStoreName);
    const result = transaction.objectStore[method](...args);
    transaction.done();
    return result;
  };
});

class Transaction {
  constructor(db, objectStoreNames, mode = 'readwrite', options) {
    if (!Array.isArray(objectStoreNames)) {
      objectStoreNames = [objectStoreNames];
    }
    const transaction = db.transaction(objectStoreNames, mode, options);
    const result = new Promise((resolve, reject) => {
      transaction.oncomplete = function (e) {
        resolve(e);
      };
      transaction.onerror = function (e) {
        reject(e);
      };
      transaction.onabort = function (e) {
        reject(e);
      };
    });
    const objectStores = objectStoreNames.map(objectStoreName => {
      return new ObjectStore(transaction, objectStoreName);
    });
    this.objectStores = objectStores;
    this.transaction = transaction;
    this.result = result;
    this.db = db;
  }
  get objectStore() {
    if (this.objectStores.length !== 1) return;
    return this.objectStores[0];
  }
  abort() {
    this.transaction.abort();
  }
  done() {
    return this.result;
  }
}

class ObjectStore {
  constructor(transaction, objectStoreName) {
    const objectStore = transaction.objectStore(objectStoreName);
    this.objectStore = objectStore;
    this.transaction = transaction;
  }
}

methods.forEach(method => {
  ObjectStore.prototype[method] = function (...args) {
    return new Promise((resolve, reject) => {
      const objectStoreRequest = this.objectStore[method](...args);
      objectStoreRequest.onsuccess = function (e) {
        resolve(e.target.result);
      };
      objectStoreRequest.onerror = function (e) {
        reject(e);
      };
    });
  };
});

export {
  IndexedDB,
  Transaction,
  ObjectStore,
};
