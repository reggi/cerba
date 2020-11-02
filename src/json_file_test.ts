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
      [here('veryDeep.json')]: JSON.stringify({example: {deep: {age: 31}}}),
    })
  );
  afterEach(() => mock.restore());
  it('should get parsedContent', async () => {
    const jsonFile = new JSONFile({basename: 'hello.json'});
    const c = await jsonFile.parsedContent;
    deepStrictEqual(c, {name: 'thomas'});
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
    await jsonFile.create({name: 'thomas', age: 31});
    const results = JSON.stringify({name: 'thomas', age: 31}, null, 2);
    strictEqual(fs.readFileSync(here('dolphin.json'), 'utf8'), results);
    strictEqual(await jsonFile.content, results);
  });
  it('should upsert', async () => {
    const jsonFile = new JSONFile({basename: 'dolphin.json'});
    await jsonFile.upsert({name: 'thomas', age: 31});
    const results = JSON.stringify({name: 'thomas', age: 31}, null, 2);
    strictEqual(fs.readFileSync(here('dolphin.json'), 'utf8'), results);
    strictEqual(await jsonFile.content, results);
  });
  it('should throw error when create using readonly', async () => {
    const jsonFile = new JSONFile({basename: 'hello.json', readonly: true});
    rejects(async () => {
      await jsonFile.create({name: 'thomas', age: 31});
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
  it('should getDeep undefined property', async () => {
    const jsonFile = new JSONFile({basename: 'deep.json', readonly: true});
    strictEqual(await jsonFile.getDeep('missing'), undefined);
  });
  it('should set property', async () => {
    const jsonFile = new JSONFile({basename: 'hello.json', readonly: false});
    await jsonFile.set('love', true);
    const content = await jsonFile.parsedContent;
    strictEqual(content.love, true);
  });
  it('should setDeep shallow property', async () => {
    const jsonFile = new JSONFile({basename: 'deep.json', readonly: false});
    await jsonFile.setDeep('deep', 31);
    strictEqual(await jsonFile.getDeep('deep'), 31);
  });
  it('should setDeep undefined parent property', async () => {
    const jsonFile = new JSONFile({basename: 'deep.json', readonly: false});
    await jsonFile.setDeep('soup.chicken', 31);
    strictEqual(await jsonFile.getDeep('soup.chicken'), 31);
  });
  it('should setDeep property', async () => {
    const jsonFile = new JSONFile({basename: 'deep.json', readonly: false});
    await jsonFile.setDeep('deep.age', 31);
    strictEqual(await jsonFile.getDeep('deep.age'), 31);
  });
  it('should unsetDeep property', async () => {
    const jsonFile = new JSONFile({basename: 'veryDeep.json', readonly: false});
    await jsonFile.unsetDeep('example.deep.age');
    strictEqual(await jsonFile.getDeep('example.deep.age'), undefined);
  });
  it('should unsetDeep shallow property', async () => {
    const jsonFile = new JSONFile({basename: 'deep.json', readonly: false});
    await jsonFile.unsetDeep('deep');
    strictEqual(await jsonFile.getDeep('deep'), undefined);
  });
  it('should unsetDeep missing property', async () => {
    const jsonFile = new JSONFile({basename: 'deep.json', readonly: false});
    await jsonFile.unsetDeep('missing');
    strictEqual(await jsonFile.getDeep('missing'), undefined);
  });
  it('should unset property', async () => {
    const jsonFile = new JSONFile({basename: 'deep.json', readonly: false});
    await jsonFile.unset('deep');
    strictEqual(await jsonFile.getDeep('deep'), undefined);
  });
  it('should unset missing property', async () => {
    const jsonFile = new JSONFile({basename: 'deep.json', readonly: false});
    await jsonFile.unset('missing');
    strictEqual(await jsonFile.getDeep('missing'), undefined);
  });
  it('should unsetDeep with empty path', () => {
    const obj = {};
    JSONFile.unsetDeep(obj, '');
  });
  it('should unsetDeep trigger undefined', () => {
    const obj = {a: {b: {c: []}}};
    JSONFile.unsetDeep(obj, 'a.b.c.d');
  });
});
