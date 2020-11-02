import * as fs from 'fs-extra';
import * as path from 'path';
import * as mock from 'mock-fs';
import {JSONC} from './jsonc';
import {deepStrictEqual, strictEqual} from 'assert';
const cwd = process.cwd();
const here = (filename: string) => path.join(cwd, filename);

const content = `
// example
{
  "name": "thomas"
}
`;

describe('JSONC', () => {
  beforeEach(() =>
    mock({
      [here('hello.json')]: content,
    })
  );
  afterEach(() => mock.restore());
  it('should get parsedContent', async () => {
    const jsonFile = new JSONC({basename: 'hello.json'});
    deepStrictEqual(await jsonFile.parsedContent, {name: 'thomas'});
  });
  it('should set property and retain comment', async () => {
    const jsonFile = new JSONC({basename: 'hello.json'});
    await jsonFile.set('love', true);
    const result = {name: 'thomas', love: true};
    const commentResult = `// example\n${JSON.stringify(result, null, 2)}`;
    strictEqual(fs.readFileSync(here('hello.json'), 'utf8'), commentResult);
    deepStrictEqual(await jsonFile.parsedContent, result);
  });
});
