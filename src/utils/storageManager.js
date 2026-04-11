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

  return { originalTerms: terms, expandedTerms: Array.from(expanded) };
}

function scoreResult(video, originalTerms, expandedTerms) {
  const text = [
    (video.title    || ''),
    (video.reason   || ''),
    (video.keywords || ''),
    (video.color    || ''),
    (video.location || ''),
    (video.tag      || ''),
    (video.url      || ''),
    (video.platform || '')
  ].join(' ').toLowerCase();

  let score = 0;

  // Exact matches (original search terms) = 10 points each
  originalTerms.forEach(term => {
    if (text.includes(term)) score += 10;
  });

  // Multi-word bonus: if 2+ original terms match, boost score
  const matchedOriginal = originalTerms.filter(term => text.includes(term)).length;
  if (matchedOriginal > 1) score += matchedOriginal * 5;

  // Synonym matches (expanded terms not in original) = 3 points each
  expandedTerms.forEach(term => {
    if (!originalTerms.includes(term) && text.includes(term)) {
      score += 3;
    }
  });

  return score;
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

export async function updateVideo(id, updates) {
  const db = await getDB();
  const existing = await db.get(STORE, id);
  if (!existing) throw new Error('Video not found');
  const updated = { ...existing, ...updates, id, updatedAt: Date.now() };
  await db.put(STORE, updated);
  return updated;
}

export async function searchVideos(query) {
  if (!query.trim()) return getAllVideos();
  const all = await getAllVideos();
  const { originalTerms, expandedTerms } = expandSearchQuery(query);

  // Score and filter results
  const scored = all
    .map(v => ({
      ...v,
      _score: scoreResult(v, originalTerms, expandedTerms)
    }))
    .filter(v => v._score > 0)
    .sort((a, b) => b._score - a._score);

  // Remove score before returning
  return scored.map(({ _score, ...v }) => v);
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

// #5 Duplicate detection — strip query params before comparing
function normalizeUrl(raw) {
  try {
    const u = new URL(raw.startsWith('http') ? raw : 'https://' + raw);
    return u.origin + u.pathname;
  } catch {
    return raw.trim().toLowerCase();
  }
}

export async function findVideoByUrl(url) {
  const all = await getAllVideos();
  const normalized = normalizeUrl(url);
  return all.find(v => normalizeUrl(v.url) === normalized) || null;
}

// #6 Auto-tag suggestions — match reason words against tagged saves
export async function getSuggestedTags(reason) {
  if (!reason || reason.trim().length < 3) return [];
  const all = await getAllVideos();
  const tagged = all.filter(v => v.tag);
  if (tagged.length === 0) return [];

  const words = reason.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const tagScores = {};

  tagged.forEach(v => {
    const saved = [v.reason || '', v.keywords || '', v.tag || ''].join(' ').toLowerCase();
    const matches = words.filter(w => saved.includes(w)).length;
    if (matches > 0) {
      tagScores[v.tag] = (tagScores[v.tag] || 0) + matches;
    }
  });

  return Object.entries(tagScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);
}

// #4 Pattern digest — count saves in last 7 days grouped by tag/platform
export async function getWeeklyDigest() {
  const all = await getAllVideos();
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = all.filter(v => v.createdAt >= weekAgo);
  if (recent.length === 0) return null;

  const tagCounts = {};
  const platformCounts = {};

  recent.forEach(v => {
    if (v.tag)      tagCounts[v.tag]          = (tagCounts[v.tag]          || 0) + 1;
    if (v.platform) platformCounts[v.platform] = (platformCounts[v.platform] || 0) + 1;
  });

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag, count]) => ({ tag, count }));

  const topPlatform = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return { total: recent.length, topTags, topPlatform };
}
