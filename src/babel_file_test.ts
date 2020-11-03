import * as path from 'path';
import * as mock from 'mock-fs';
import {deepStrictEqual, rejects} from 'assert';
import {BabelFile} from './babel_file';
import {PackageJSON} from './package_json';
const cwd = process.cwd();
const here = (filename: string) => path.join(cwd, filename);

describe('BabelFile', () => {
  beforeEach(() =>
    mock({
      [here('package.json')]: JSON.stringify({dependencies: {lodash: '1.0.0', url: '1.0.0'}}),
      [here('example.ts')]: ['import "path"', 'import "lodash"'].join('\n'),
      [here('use-example.ts')]: ['import "./example"', 'import "./alpha"'].join('\n'),
      [here('alpha.ts')]: 'import "./use-example"',
      [here('beta.ts')]: 'import "./alpha"',
      [here('require.ts')]: [
        // prettier-ignore
        'require("path")',
        'const x = "hi"',
        'function doggy () {}',
        'doggy()',
      ].join('\n'),
      [here('missing-dep.ts')]: ['import "missing"'].join('\n'),
      [here('native-from-pkg.ts')]: ['import "url"'].join('\n'),
    })
  );
  afterEach(() => mock.restore());
  it('should work with no props', async () => {
    new BabelFile().pkg;
    new BabelFile().plugins;
    new BabelFile({pkg: new PackageJSON()}).pkg;
    new BabelFile({plugins: []}).plugins;
  });
  it('should get content', async () => {
    const p = new BabelFile({basename: './example.ts'});
    await p.parsedContent;
    await p.parsedContent;
  });
  it('should use require', async () => {
    const p = new BabelFile({basename: './require.ts'});
    deepStrictEqual(await p.imports, ['path']);
  });
  it('should get content', async () => {
    const p = new BabelFile({basename: './example.ts'});
    deepStrictEqual(await p.imports, ['path', 'lodash']);
    deepStrictEqual(await p.packageImports, ['lodash']);
    deepStrictEqual(await p.nativeImports, ['path']);
    deepStrictEqual(await p.recursiveImports, ['path', 'lodash']);
    deepStrictEqual(await p.recursiveImports, ['path', 'lodash']);
    deepStrictEqual(await p.recursiveSiblings, [p]);
    deepStrictEqual(await p.dependencies, {lodash: '1.0.0'});
  });
  it('should get local sibling', async () => {
    const p = new BabelFile({basename: './use-example.ts'});
    deepStrictEqual((await p.recursiveImports).length, 5);
    deepStrictEqual((await p.recursiveSiblings).length, 3);
    deepStrictEqual(await p.dependencies, {lodash: '1.0.0'});
  });
  it('should use cache', async () => {
    const p = new BabelFile({basename: './beta.ts'});
    deepStrictEqual((await p.recursiveImports).length, 5);
    deepStrictEqual((await p.recursiveSiblings).length, 4);
    deepStrictEqual(await p.dependencies, {lodash: '1.0.0'});
    deepStrictEqual(await p.packageRecursiveImports, ['lodash']);
    deepStrictEqual(await p.nativeRecursiveImports, ['path']);
    deepStrictEqual((await p.localRecursiveImports).length, 3);
  });
  it('should throw when missing dep', async () => {
    const p = new BabelFile({basename: './missing-dep.ts'});
    rejects(async () => {
      await p.dependencies;
    });
  });
  it('should get native from pkg', async () => {
    const p = new BabelFile({basename: './native-from-pkg.ts'});
    deepStrictEqual(await p.dependencies, {url: '1.0.0'});
  });
});
