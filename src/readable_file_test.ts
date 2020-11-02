import * as path from 'path';
import * as mock from 'mock-fs';
import {strictEqual} from 'assert';
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
  it('should get content', async () => {
    const p = new ReadableFile({basename: './hello.txt'});
    strictEqual(await p.content, 'hello world');
  });
});
