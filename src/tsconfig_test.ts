import * as mock from 'mock-fs';
import * as path from 'path';
import {strictEqual} from 'assert';
import {TsConfig} from './tsconfig';
const cwd = process.cwd();
const here = (filename: string) => path.join(cwd, filename);

describe('Path', () => {
  beforeEach(() =>
    mock({
      [here('tsconfig.json')]: '{}',
    })
  );
  afterEach(() => mock.restore());
  it('should use outDir', async () => {
    const tsconfig = new TsConfig();
    strictEqual(await tsconfig.outDir, '.');
  });
  it('should use outPath', async () => {
    const tsconfig = new TsConfig();
    strictEqual(await tsconfig.outPath, here(''));
  });
});
