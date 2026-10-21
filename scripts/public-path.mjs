import path from 'node:path';

export function resolvePublicPath(publicRoot, pathname) {
  const root = path.resolve(publicRoot);
  const filename = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  return filename.startsWith(root + path.sep) ? filename : null;
}
