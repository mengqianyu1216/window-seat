import test from 'node:test';
import assert from 'node:assert/strict';
import { pickNextJourney, parseSavedJourneys, toggleSavedJourney, readSavedJourneys, persistSavedJourneys } from '../dist/state.js';

const ids = ['mountain', 'coast', 'dusk'];

test('random exploration never immediately repeats the current journey', () => {
  for (const current of ids) {
    for (const value of [0, 0.2, 0.5, 0.999999]) {
      const next = pickNextJourney(ids, current, () => value);
      assert.ok(ids.includes(next));
      assert.notEqual(next, current);
    }
  }
});

test('random exploration tolerates an empty or singleton collection', () => {
  assert.equal(pickNextJourney([], 'mountain'), null);
  assert.equal(pickNextJourney(['mountain'], 'mountain'), 'mountain');
});

test('stored bookmarks discard malformed, repeated and unknown journey IDs', () => {
  assert.deepEqual(parseSavedJourneys('["coast","coast","missing",null,12,"dusk"]', ids), ['coast', 'dusk']);
  for (const malformed of [null, '', '{', '{}', '"coast"']) assert.deepEqual(parseSavedJourneys(malformed, ids), []);
});

test('saving then unsaving is reversible without modifying the caller collection', () => {
  const original = ['coast'];
  const saved = toggleSavedJourney(original, 'dusk', ids);
  assert.deepEqual(saved, ['coast', 'dusk']);
  assert.deepEqual(original, ['coast']);
  assert.deepEqual(toggleSavedJourney(saved, 'dusk', ids), original);
  assert.deepEqual(toggleSavedJourney(original, 'unknown', ids), original);
});

test('bookmarks survive a browser storage round trip', () => {
  const data = new Map();
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  assert.equal(persistSavedJourneys(storage, ['coast', 'dusk']), true);
  assert.deepEqual(readSavedJourneys(storage, ids), ['coast', 'dusk']);
});

test('unavailable browser storage does not interrupt exploration', () => {
  const storage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('full'); } };
  assert.deepEqual(readSavedJourneys(storage, ids), []);
  assert.equal(persistSavedJourneys(storage, ['coast']), false);
});
