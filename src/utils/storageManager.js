import { openDB } from 'idb';

const DB_NAME    = 'savedreels';
const DB_VERSION = 1;
const STORE      = 'videos';

const SYNONYMS = {
  clothes: ['dresses', 'shirts', 'pants', 'skirts', 'tops', 'outfits', 'outfit', 'fashion', 'apparel', 'wear'],
  dresses: ['clothes', 'outfits', 'outfit', 'apparel', 'dress'],
  shoes: ['sneakers', 'heels', 'boots', 'footwear', 'kicks', 'sandals', 'flats'],
  summer: ['warm', 'season', 'vacation'],
  winter: ['cold', 'season', 'snow'],
  spring: ['warm', 'season'],
  fall: ['autumn', 'season'],
  makeup: ['beauty', 'cosmetics', 'skincare'],
  beauty: ['makeup', 'cosmetics', 'skincare', 'glam'],
  food: ['recipe', 'cooking', 'eat', 'dish', 'meal'],
  dance: ['movement', 'choreography', 'moves'],
  music: ['song', 'artist', 'audio', 'beat'],
  fitness: ['workout', 'exercise', 'gym', 'training'],
  workout: ['fitness', 'exercise', 'gym', 'training'],
};

let dbPromise = null;

function expandSearchQuery(query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const expanded = new Set(terms);

  terms.forEach(term => {
    if (SYNONYMS[term]) {
      SYNONYMS[term].forEach(syn => expanded.add(syn));
    }
  });

  return Array.from(expanded);
}

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
  const expandedTerms = expandSearchQuery(query);

  return all.filter(v => {
    const text = [
      (v.title    || ''),
      (v.reason   || ''),
      (v.tag      || ''),
      (v.url      || ''),
      (v.platform || '')
    ].join(' ').toLowerCase();

    return expandedTerms.some(term => text.includes(term));
  });
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
