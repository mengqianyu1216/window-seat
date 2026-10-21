import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { resolvePublicPath } from '../scripts/public-path.mjs';

const root = path.join(process.cwd(), 'dist') + path.sep;
test('a trailing separator in the public directory does not forbid the homepage', () => {
  assert.equal(resolvePublicPath(root, '/'), path.join(process.cwd(), 'dist', 'index.html'));
});
test('nested images are served from the public directory', () => {
  assert.equal(resolvePublicPath(root, '/assets/landscapes/mountain.webp'), path.join(process.cwd(), 'dist', 'assets', 'landscapes', 'mountain.webp'));
});
test('traversal to design documents is forbidden', () => {
  assert.equal(resolvePublicPath(root, '/../docs/implementation-plan.md'), null);
  assert.equal(resolvePublicPath(root, '/../../package.json'), null);
});
