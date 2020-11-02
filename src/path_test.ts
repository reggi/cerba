import * as mock from 'mock-fs';
import * as path from 'path';
import {Path, PathType} from './path';
import {strictEqual} from 'assert';
const cwd = process.cwd();
const here = (filename: string) => path.join(cwd, filename);

describe('Path', () => {
  beforeEach(() =>
    mock({
      [here('hello.txt')]: 'hello world',
      [here('directive')]: {},
      [here('regular-file')]: 'file contents',
      [here('a-symlink')]: mock.symlink({
        path: here('regular-file'),
      }),
    })
  );
  afterEach(() => mock.restore());
  it('should use basename', () => {
    const p = new Path({basename: './tsconfig.json'});
    strictEqual(p instanceof Path, true);
    strictEqual(p.basename, 'tsconfig.json');
    strictEqual(p.extname, '.json');
    strictEqual(p.dirname, process.cwd());
  });
  it('should use path', () => {
    const p = new Path({path: '/tmp/tsconfig.json'});
    strictEqual(p instanceof Path, true);
    strictEqual(p.basename, 'tsconfig.json');
    strictEqual(p.extname, '.json');
    strictEqual(p.dirname, '/tmp');
  });
  it('should use cwd', () => {
    const p = new Path({cwd: '/tmp', basename: './tsconfig.json'});
    strictEqual(p instanceof Path, true);
    strictEqual(p.basename, 'tsconfig.json');
    strictEqual(p.extname, '.json');
    strictEqual(p.dirname, '/tmp');
  });
  it('should use replaceExt', () => {
    const p = new Path({cwd: '/tmp', basename: './tsconfig.json'});
    p.replaceExt('.meow');
    strictEqual(p.basename, 'tsconfig.meow');
    strictEqual(p.path, '/tmp/tsconfig.meow');
  });
  it('should extname', () => {
    const p = new Path({cwd: '/tmp', basename: './tsconfig.json'});
    strictEqual(p.extname, '.json');
    strictEqual(p.extname, '.json');
  });
  it('should dirname', () => {
    const p = new Path({cwd: '/tmp', basename: './tsconfig.json'});
    strictEqual(p.dirname, '/tmp');
    strictEqual(p.dirname, '/tmp');
  });
  it('should relativePath', () => {
    const p = new Path({cwd: '/tmp', basename: './love/tsconfig.json'});
    strictEqual(p.relativePath, './love/tsconfig.json');
    strictEqual(p.relativePath, './love/tsconfig.json');
    strictEqual(p.basename, 'tsconfig.json');
    strictEqual(p.basename, 'tsconfig.json');
  });
  it('should coreBasename', () => {
    const p = new Path({cwd: '/tmp', basename: './love/tsconfig.json'});
    strictEqual(p.coreBasename, 'tsconfig');
    strictEqual(p.coreBasename, 'tsconfig');
  });
  it('should get type file', async () => {
    const p = new Path({basename: './hello.txt'});
    strictEqual(await p.type, PathType.file);
  });
  it('should get use type from cache', async () => {
    const p = new Path({basename: './hello.txt'});
    strictEqual(await p.type, PathType.file);
    strictEqual(await p.type, PathType.file);
  });
  it('should get type directory', async () => {
    const p = new Path({basename: 'directive'});
    strictEqual(await p.type, PathType.directory);
  });
  it('should get type missing', async () => {
    const p = new Path({basename: 'missing.svg'});
    strictEqual(await p.type, PathType.missing);
  });
});
