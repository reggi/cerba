import * as path from 'path';
import * as mock from 'mock-fs';
import {rejects, strictEqual} from 'assert';
import {ReadableFile} from './readable_file';
const cwd = process.cwd();
const here = (filename: string) => path.join(cwd, filename);

describe('ReadableFile', () => {
  beforeEach(() =>
    mock({
      [here('hello.txt')]: 'hello world',
    })
  );
  afterEach(() => mock.restore());
  it('should throw', async () => {
    const p = new ReadableFile();
    rejects(async () => {
      await p.content;
    });
  });
  it('should get content', async () => {
    const p = new ReadableFile({basename: './hello.txt'});
    strictEqual(await p.content, 'hello world');
  });
  it('should get default content', async () => {
    const p = new ReadableFile({basename: './any.txt', defaultContent: 'meow'});
    strictEqual(await p.content, 'meow');
  });
  it('should get throw when not found', async () => {
    const p = new ReadableFile({basename: './any.txt'});
    rejects(async () => {
      await p.content;
    });
  });
});
