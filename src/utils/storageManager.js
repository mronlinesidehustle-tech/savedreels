import { openDB } from 'idb';

const DB_NAME    = 'savedreels';
const DB_VERSION = 1;
const STORE      = 'videos';

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
        store.createIndex('platform', 'platform');
        store.createIndex('tag',      'tag');
      },
    });
  }
  return dbPromise;
}

export async function saveVideo(video) {
  const db = await getDB();
  const record = { ...video, id: video.id || crypto.randomUUID(), createdAt: Date.now() };
  await db.put(STORE, record);
  return record;
}

export async function getAllVideos() {
  const db = await getDB();
  const all = await db.getAllFromIndex(STORE, 'createdAt');
  return all.reverse();
}

export async function getVideoById(id) {
  const db = await getDB();
  return db.get(STORE, id);
}

export async function deleteVideo(id) {
  const db = await getDB();
  await db.delete(STORE, id);
}

export async function searchVideos(query) {
  if (!query.trim()) return getAllVideos();
  const all  = await getAllVideos();
  const q    = query.toLowerCase();
  return all.filter(v =>
    (v.title   || '').toLowerCase().includes(q) ||
    (v.reason  || '').toLowerCase().includes(q) ||
    (v.tag     || '').toLowerCase().includes(q) ||
    (v.url     || '').toLowerCase().includes(q) ||
    (v.platform|| '').toLowerCase().includes(q)
  );
}

export async function getAllTags() {
  const all  = await getAllVideos();
  const tags = [...new Set(all.map(v => v.tag).filter(Boolean))];
  return tags.sort();
}

export async function getVideoCount() {
  const db = await getDB();
  return db.count(STORE);
}
