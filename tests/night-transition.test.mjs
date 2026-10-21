import test from 'node:test';
import assert from 'node:assert/strict';
import { WindowScene } from '../dist/scene.js';

test('a superseded failed night load cannot reset the newer journey mode', async () => {
  let failOldLoad;
  const oldLoad = new Promise((resolve, reject) => { failOldLoad = reject; });
  const scene = {
    isNight: false, renderedNight: false, transitionId: 0, currentJourney: { id: 'mountain' },
    changeJourney() { this.transitionId += 1; return oldLoad; }
  };
  const pending = WindowScene.prototype.toggleNight.call(scene);
  assert.equal(scene.isNight, true);
  // A newer destination now owns the transition, still targeting nighttime.
  scene.transitionId += 1;
  failOldLoad(new Error('old mountain night image failed'));
  assert.equal(await pending, null);
  assert.equal(scene.isNight, true);
});

test('the current failed night load restores the actually displayed day mode', async () => {
  const scene = {
    isNight: false, renderedNight: false, transitionId: 0, currentJourney: { id: 'mountain' },
    changeJourney() { this.transitionId += 1; return Promise.reject(new Error('night unavailable')); }
  };
  await assert.rejects(WindowScene.prototype.toggleNight.call(scene), /night unavailable/);
  assert.equal(scene.isNight, false);
});
