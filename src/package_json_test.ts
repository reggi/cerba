import * as mock from 'mock-fs';
import * as path from 'path';
import {deepStrictEqual, strictEqual} from 'assert';
import {PackageJSON} from './package_json';
const cwd = process.cwd();
const here = (filename: string) => path.join(cwd, filename);

describe('PackageJSON', () => {
  beforeEach(() =>
    mock({
      [here('package.json')]: '{}',
    })
  );
  afterEach(() => mock.restore());
  it('should use name', async () => {
    const pack = new PackageJSON();
    strictEqual(await pack.name, undefined);
  });
  it('should use description', async () => {
    const pack = new PackageJSON();
    strictEqual(await pack.description, undefined);
  });
  it('should use version', async () => {
    const pack = new PackageJSON();
    strictEqual(await pack.version, undefined);
  });
  it('should use main', async () => {
    const pack = new PackageJSON();
    strictEqual(await pack.main, undefined);
  });
  it('should use bin', async () => {
    const pack = new PackageJSON();
    strictEqual(await pack.bin, undefined);
  });
  it('should use dependencies', async () => {
    const pack = new PackageJSON();
    deepStrictEqual(await pack.dependencies, {});
  });
});
