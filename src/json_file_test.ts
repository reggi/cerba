import * as fs from 'fs-extra';
import * as path from 'path';
import * as mock from 'mock-fs';
import {JSONFile} from './json_file';
import {deepStrictEqual, rejects, strictEqual} from 'assert';
const cwd = process.cwd();
const here = (filename: string) => path.join(cwd, filename);

describe('JSONFile', () => {
  beforeEach(() =>
    mock({
      [here('hello.json')]: JSON.stringify({name: 'thomas'}),
      [here('deep.json')]: JSON.stringify({deep: {age: 31}}),
    })
  );
  afterEach(() => mock.restore());
  it('should get parsedContent', async () => {
    const jsonFile = new JSONFile({basename: 'hello.json'});
    deepStrictEqual(await jsonFile.parsedContent, {name: 'thomas'});
  });
  it('should write', async () => {
    const jsonFile = new JSONFile({basename: 'hello.json'});
    await jsonFile.write({name: 'thomas', age: 31});
    const results = JSON.stringify({name: 'thomas', age: 31}, null, 2);
    strictEqual(fs.readFileSync(here('hello.json'), 'utf8'), results);
    strictEqual(await jsonFile.content, results);
  });
  it('should create', async () => {
    const jsonFile = new JSONFile({basename: 'dolphin.json'});
    await jsonFile.write({name: 'thomas', age: 31});
    const results = JSON.stringify({name: 'thomas', age: 31}, null, 2);
    strictEqual(fs.readFileSync(here('dolphin.json'), 'utf8'), results);
    strictEqual(await jsonFile.content, results);
  });
  it('should create', async () => {
    const jsonFile = new JSONFile({basename: 'dolphin.json'});
    await jsonFile.upsert({name: 'thomas', age: 31});
    const results = JSON.stringify({name: 'thomas', age: 31}, null, 2);
    strictEqual(fs.readFileSync(here('dolphin.json'), 'utf8'), results);
    strictEqual(await jsonFile.content, results);
  });
  it('should throw error when create using readonly', async () => {
    const jsonFile = new JSONFile({basename: 'hello.json', readonly: true});
    rejects(async () => {
      await jsonFile.write({name: 'thomas', age: 31});
    });
  });
  it('should get property', async () => {
    const jsonFile = new JSONFile({basename: 'hello.json', readonly: true});
    const name = await jsonFile.get('name');
    strictEqual(name, 'thomas');
  });
  it('should getDeep property', async () => {
    const jsonFile = new JSONFile({basename: 'deep.json', readonly: true});
    strictEqual(await jsonFile.getDeep('deep.age'), 31);
    deepStrictEqual(await jsonFile.getDeep('deep'), {age: 31});
    deepStrictEqual(await jsonFile.get('deep'), {age: 31});
  });
});
