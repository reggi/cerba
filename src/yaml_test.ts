import * as yaml from 'yaml';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as mock from 'mock-fs';
import {YAML} from './yaml';
import {deepStrictEqual, strictEqual} from 'assert';
const cwd = process.cwd();
const here = (filename: string) => path.join(cwd, filename);

const content = `
# example
name: thomas
`;

describe('YAML', () => {
  beforeEach(() =>
    mock({
      [here('hello.yml')]: content,
    })
  );
  afterEach(() => mock.restore());
  it('should get parsedContent', async () => {
    const jsonFile = new YAML({basename: 'hello.yml'});
    deepStrictEqual(await jsonFile.parsedContent, {name: 'thomas'});
  });
  it('should set property and retain comment', async () => {
    const jsonFile = new YAML({basename: 'hello.yml'});
    await jsonFile.set('love', true);
    const result = {name: 'thomas', love: true};
    const commentResult = `# example\n${yaml.stringify(result)}`;
    strictEqual(fs.readFileSync(here('hello.yml'), 'utf8'), commentResult);
    deepStrictEqual(await jsonFile.parsedContent, result);
  });
});
