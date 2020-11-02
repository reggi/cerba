import {Path} from './path';
import {strictEqual} from 'assert';

context('Path', () => {
  it('should use filename', () => {
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
});
