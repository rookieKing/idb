# idb
IndexedDB

## multiple objectStore transaction
```js
import { IndexedDB, Transaction, ObjectStore } from '@rookiecode/idb'
```

```js
const tx = await new IndexedDB('db1', function (createObjectStore) {
  createObjectStore('tbl1', { keyPath: 'id' });
  createObjectStore('tbl2', { keyPath: 'id' });
}).transaction(['tbl1', 'tbl2']);
const [tbl1, tbl2] = tx.objectStores;
await Promise.all([
  tbl1.add({ id: 1, value: 11, }),
  tbl2.add({ id: 11, value: 111, }),
  tx.done(),
]);
```

## single objectStore transaction
```js
const db = await new IndexedDB('db1', function (createObjectStore) {
  createObjectStore('tbl1', { keyPath: 'id' });
  createObjectStore('tbl2', { keyPath: 'id' });
}).db;

const tx = new Transaction(db, ['tbl1']);
// const tx = await db.transaction(['tbl1']);
await tx.objectStore.add({ id: 2, value: 22, });
await tx.done();

const tx2 = new Transaction(db, ['tbl2']);
// const tx = await db.transaction(['tbl1']);
await tx2.objectStore.add({ id: 22, value: 222, });
await tx2.done();
```

## shortcuts
```js
const idb = await new IndexedDB('db1', function (createObjectStore) {
  createObjectStore('tbl1', { keyPath: 'id' });
  createObjectStore('tbl2', { keyPath: 'id' });
});

const result = await idb.get('tbl1', 1);
const result2 = await idb.get('tbl2', 2);
```
