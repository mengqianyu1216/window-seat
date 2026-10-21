const STORAGE_KEY = 'window-seat.saved.v1';

export function pickNextJourney(ids, currentId, random = Math.random) {
  const candidates = ids.filter(id => id !== currentId);
  if (!candidates.length) return ids[0] ?? null;
  const index = Math.min(candidates.length - 1, Math.max(0, Math.floor(random() * candidates.length)));
  return candidates[index];
}

export function parseSavedJourneys(raw, validIds) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? [...new Set(parsed.filter(id => typeof id === 'string' && validIds.includes(id)))] : [];
  } catch {
    return [];
  }
}

export function toggleSavedJourney(saved, id, validIds) {
  if (!validIds.includes(id)) return [...saved];
  return saved.includes(id) ? saved.filter(value => value !== id) : [...saved, id];
}

export function readSavedJourneys(storage, validIds) {
  try { return parseSavedJourneys(storage.getItem(STORAGE_KEY), validIds); }
  catch { return []; }
}

export function persistSavedJourneys(storage, saved) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(saved)); return true; }
  catch { return false; }
}
