import * as path from 'path';
import * as mock from 'mock-fs';
import {rejects, strictEqual} from 'assert';
import {File} from './file';
import * as fs from 'fs-extra';
import {Path} from './path';
const cwd = process.cwd();
const here = (filename: string) => path.join(cwd, filename);

describe('File', () => {
  beforeEach(() =>
    mock({
      [here('hello.txt')]: 'hello world',
    })
  );
  afterEach(() => mock.restore());
  it('should write', async () => {
    const p = new File({basename: './hello.txt'});
    await p.writeFromString('meow meow');
  });
  it('should throw error if no path is passed in', async () => {
    const p = new File();
    rejects(async () => {
      await p.writeFromString('meow meow');
    });
  });
  it('should throw error during write using readonly', async () => {
    const p = new File({basename: './hello.txt', readonly: true});
    rejects(async () => {
      await p.writeFromString('meow meow');
    });
  });
  it('should throw error during create using readonly', async () => {
    const p = new File({basename: './hello.txt', readonly: true});
    rejects(async () => {
      await p.createFromString('meow meow');
    });
  });
  it('should throw error during upsert using readonly', async () => {
    const p = new File({basename: './hello.txt', readonly: true});
    rejects(async () => {
      await p.upsertFromString('meow meow');
    });
  });
  it('should copy file', async () => {
    const p = new File({basename: './hello.txt', readonly: true});
    await p.copy({basename: 'love.txt'});
    strictEqual(fs.readFileSync(here('love.txt'), 'utf8'), 'hello world');
  });
  it('should copy file from path', async () => {
    const p = new File({basename: './hello.txt', readonly: true});
    await p.copy(new Path({basename: 'love.txt'}));
    strictEqual(fs.readFileSync(here('love.txt'), 'utf8'), 'hello world');
  });
  it('should move file', async () => {
    const p = new File({basename: './hello.txt', readonly: true});
    await p.move({basename: 'love.txt'});
    strictEqual(fs.readFileSync(here('love.txt'), 'utf8'), 'hello world');
    strictEqual(fs.existsSync(here('hello.txt')), false);
  });
  it('should move file from path', async () => {
    const p = new File({basename: './hello.txt', readonly: true});
    await p.move(new Path({basename: 'love.txt'}));
    strictEqual(fs.readFileSync(here('love.txt'), 'utf8'), 'hello world');
    strictEqual(fs.existsSync(here('hello.txt')), false);
  });
});
