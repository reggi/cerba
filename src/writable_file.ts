import * as fs from 'fs-extra';
import {ReadableFile} from './readable_file';

export class WritableFile extends ReadableFile {
  props?: ConstructorParameters<typeof ReadableFile>[0];
  async writeFromString(content?: string) {
    content = content ?? '';
    await fs.mkdirp(this.dirname);
    await fs.writeFile(this.path, content);
    this.cacheContent = content;
    return this.content;
  }
  async createFromString(content?: string) {
    content = content ?? '';
    if (await this.exists) throw new Error('cannot create file, already exists');
    return this.writeFromString(content);
  }
  async upsertFromString(content?: string) {
    content = content ?? '';
    if (!(await this.exists)) {
      await this.createFromString(content);
    }
    return this.content;
  }
}
