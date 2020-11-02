import * as path from 'path';
import * as mock from 'mock-fs';
import {rejects} from 'assert';
import {File} from './file';
const cwd = process.cwd();
const here = (filename: string) => path.join(cwd, filename);

describe('File', () => {
  beforeEach(() =>
    mock({
      [here('hello.txt')]: 'hello world',
    })
  );
  afterEach(() => mock.restore());
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
});
