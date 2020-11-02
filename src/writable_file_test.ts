import * as path from 'path';
import * as mock from 'mock-fs';
import {strictEqual, rejects} from 'assert';
import {WritableFile} from './writable_file';
import * as fs from 'fs-extra';
const cwd = process.cwd();
const here = (filename: string) => path.join(cwd, filename);

describe('WritableFile', () => {
  beforeEach(() =>
    mock({
      [here('hello.txt')]: 'hello world',
    })
  );
  it('should get content', async () => {
    const p = new WritableFile({basename: './hello.txt'});
    strictEqual(await p.content, 'hello world');
  });
  it('should write', async () => {
    const p = new WritableFile({basename: './hello.txt'});
    await p.writeFromString('meow meow');
    strictEqual(fs.readFileSync(here('hello.txt'), 'utf8'), 'meow meow');
    strictEqual(await p.content, 'meow meow');
  });

  it('should throw error during create if exists', async () => {
    const p = new WritableFile({basename: './hello.txt'});
    rejects(async () => {
      await p.createFromString('meow meow');
    });
  });
  it('should create', async () => {
    const p = new WritableFile({basename: './kitty.txt'});
    await p.createFromString('meow meow');
    strictEqual(fs.readFileSync(here('kitty.txt'), 'utf8'), 'meow meow');
    strictEqual(await p.content, 'meow meow');
  });
  it('should upsert', async () => {
    const p = new WritableFile({basename: './kitty.txt'});
    await p.upsertFromString('meow meow');
    strictEqual(fs.readFileSync(here('kitty.txt'), 'utf8'), 'meow meow');
    strictEqual(await p.content, 'meow meow');
  });
  it('should throw error during upsert if exists', async () => {
    const p = new WritableFile({basename: './hello.txt'});
    await p.upsertFromString('meow meow');
    strictEqual(fs.readFileSync(here('hello.txt'), 'utf8'), 'hello world');
    strictEqual(await p.content, 'hello world');
  });
});
