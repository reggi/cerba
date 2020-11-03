import * as mock from 'mock-fs';
import * as path from 'path';
import * as fs from 'fs-extra';
import {Cerba} from './cerba';
import {deepStrictEqual, rejects, strictEqual} from 'assert';
import {CerbaPackage} from './cerba_package';
const cwd = process.cwd();
const here = (filename: string) => path.join(cwd, filename);

const exampleContent = ['import "path"', 'import "lodash"'].join('\n');
describe('Cerba', () => {
  beforeEach(() =>
    mock({
      [here('package.json')]: JSON.stringify({dependencies: {lodash: '1.0.0', url: '1.0.0'}}),
      [here('src/example.ts')]: exampleContent,
      [here('has-config/cerba.json')]: JSON.stringify({
        packages: [
          {
            name: 'cerba',
            description: 'Example description',
            main: './src/example.ts',
          },
        ],
      }),
      [here('has-config/package.json')]: JSON.stringify({dependencies: {lodash: '1.0.0', url: '1.0.0'}}),
      [here('has-config/src/example.ts')]: exampleContent,
    })
  );
  afterEach(() => mock.restore());
  it('should build main package', async () => {
    const cerba = new Cerba({main: './src/example.ts'});
    await cerba.build();
    const file = fs.readFileSync(here('./packages/example/src/example.ts'), 'utf8');
    const pack = JSON.parse(fs.readFileSync(here('./packages/example/package.json'), 'utf8'));
    strictEqual(exampleContent, file);
    deepStrictEqual(pack, {
      name: 'example',
      main: './src/example.js',
      dependencies: {lodash: '1.0.0'},
      version: '1.0.0',
    });
  });
  it('should pull from packages', async () => {
    const cerba = new Cerba({main: './src/example.ts'});
    const pack = await cerba.findPackage('example');
    strictEqual(pack instanceof CerbaPackage, true);
  });
  it('should throw error when cannot pull from packages', async () => {
    const cerba = new Cerba({main: './src/example.ts'});
    rejects(async () => {
      await cerba.findPackage('doug');
    });
  });
  it('should throw error when cannot pull from packages', async () => {
    const cerba = new Cerba({cwd: './has-config'});
    const pkg = await cerba.findPackage('cerba');
    strictEqual(pkg.name, 'cerba');
  });
  it('should get all packages', async () => {
    const cerba = new Cerba({cwd: './has-config'});
    strictEqual((await cerba.packages).length, 1);
    strictEqual((await cerba.packages).length, 1);
  });
  it('should build package', async () => {
    const cerba = new Cerba({cwd: './has-config'});
    await cerba.buildPackage('cerba');
    deepStrictEqual(fs.readdirSync(here('')), ['has-config', 'package.json', 'src']);
    deepStrictEqual(fs.readdirSync(here('has-config')), ['cerba.json', 'package.json', 'packages', 'src']);
    deepStrictEqual(fs.readdirSync(here('has-config/src')), ['example.ts']);
    deepStrictEqual(fs.readdirSync(here('has-config/packages')), ['cerba']);
    deepStrictEqual(fs.readdirSync(here('has-config/packages/cerba')), ['package.json', 'src']);
    deepStrictEqual(fs.readdirSync(here('has-config/packages/cerba/src')), ['example.ts']);
    const file = fs.readFileSync(here('./has-config/packages/cerba/src/example.ts'), 'utf8');
    strictEqual(file, exampleContent);
    const pack = JSON.parse(fs.readFileSync(here('./has-config/packages/cerba/package.json'), 'utf8'));
    deepStrictEqual(pack, {
      name: 'cerba',
      description: 'Example description',
      main: './src/example.js',
      dependencies: {lodash: '1.0.0'},
      version: '1.0.0',
    });
  });
  it('should create with no props', async () => {
    new Cerba();
  });
  it('should not build if no name', async () => {
    const cerba = new Cerba();
    rejects(async () => {
      await cerba.buildPackage();
    });
  });
  it('should build package via prop', async () => {
    const cerba = new Cerba({cwd: './has-config', name: 'cerba'});
    await cerba.buildPackage();
    deepStrictEqual(fs.readdirSync(here('')), ['has-config', 'package.json', 'src']);
    deepStrictEqual(fs.readdirSync(here('has-config')), ['cerba.json', 'package.json', 'packages', 'src']);
    deepStrictEqual(fs.readdirSync(here('has-config/src')), ['example.ts']);
    deepStrictEqual(fs.readdirSync(here('has-config/packages')), ['cerba']);
    deepStrictEqual(fs.readdirSync(here('has-config/packages/cerba')), ['package.json', 'src']);
    deepStrictEqual(fs.readdirSync(here('has-config/packages/cerba/src')), ['example.ts']);
    const file = fs.readFileSync(here('./has-config/packages/cerba/src/example.ts'), 'utf8');
    strictEqual(file, exampleContent);
    const pack = JSON.parse(fs.readFileSync(here('./has-config/packages/cerba/package.json'), 'utf8'));
    deepStrictEqual(pack, {
      name: 'cerba',
      description: 'Example description',
      main: './src/example.js',
      dependencies: {lodash: '1.0.0'},
      version: '1.0.0',
    });
  });
  it('should build name through all', async () => {
    const cerba = new Cerba({cwd: './has-config', name: 'cerba'});
    await cerba.build();
    deepStrictEqual(fs.readdirSync(here('')), ['has-config', 'package.json', 'src']);
    deepStrictEqual(fs.readdirSync(here('has-config')), ['cerba.json', 'package.json', 'packages', 'src']);
    deepStrictEqual(fs.readdirSync(here('has-config/src')), ['example.ts']);
    deepStrictEqual(fs.readdirSync(here('has-config/packages')), ['cerba']);
    deepStrictEqual(fs.readdirSync(here('has-config/packages/cerba')), ['package.json', 'src']);
    deepStrictEqual(fs.readdirSync(here('has-config/packages/cerba/src')), ['example.ts']);
    const file = fs.readFileSync(here('./has-config/packages/cerba/src/example.ts'), 'utf8');
    strictEqual(file, exampleContent);
    const pack = JSON.parse(fs.readFileSync(here('./has-config/packages/cerba/package.json'), 'utf8'));
    deepStrictEqual(pack, {
      name: 'cerba',
      description: 'Example description',
      main: './src/example.js',
      dependencies: {lodash: '1.0.0'},
      version: '1.0.0',
    });
  });
});
