import test from 'node:test';
import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { journeys, getSceneAsset } from '../dist/journeys.js';

test('night scenes use distinct illuminated artwork rather than the daytime source', () => {
  for (const journey of journeys) {
    assert.equal(getSceneAsset(journey, false), journey.scene);
    assert.equal(getSceneAsset(journey, true), journey.nightScene);
    assert.notEqual(getSceneAsset(journey, true), getSceneAsset(journey, false));
  }
});

test('all daytime and nighttime artwork files are present and nonempty', async () => {
  for (const journey of journeys) {
    for (const night of [false, true]) {
      const file = await stat(new URL(`../dist/${getSceneAsset(journey, night)}`, import.meta.url));
      assert.ok(file.size > 10_000);
    }
  }
});
