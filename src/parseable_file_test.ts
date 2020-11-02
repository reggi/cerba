import * as path from 'path';
import * as mock from 'mock-fs';
import {strictEqual, throws} from 'assert';
import {ParseableFile} from './parsable_file';
const cwd = process.cwd();
const here = (filename: string) => path.join(cwd, filename);

describe('ParseableFile', () => {
  beforeEach(() =>
    mock({
      [here('hello.txt')]: 'hello world',
    })
  );
  it('should get content', async () => {
    const p = new ParseableFile({basename: './hello.txt'});
    strictEqual(await p.parsedContent, 'hello world');
  });
  it('should stringify', async () => {
    const p = new ParseableFile({basename: './hello.txt'});
    strictEqual(p.stringify('hello world'), 'hello world');
  });
  it('should throw when unimplemented stringify', async () => {
    const p = new ParseableFile<boolean>({basename: './hello.txt'});
    throws(() => {
      p.stringify(true);
    });
  });
});
