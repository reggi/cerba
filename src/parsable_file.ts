import {File} from './file';

export class ParseableFile<T = string> extends File {
  get parsedContent(): Promise<T> {
    return (async () => {
      return this.parse(await this.content);
    })();
  }
  stringify(content?: T): string {
    return JSON.stringify(content, null, 2) || '{}';
  }
  parse(content: string): T {
    return JSON.parse(content);
  }
  // eslint-disable-next-line
  finalize(content: T, rawContent: string): string {
    return this.stringify(content);
  }
  async write(content?: T): Promise<T> {
    this.readonlyError;
    return this.parse(await super.writeFromString(this.stringify(content)));
  }
  async create(content?: T): Promise<T> {
    this.readonlyError;
    return this.parse(await super.createFromString(this.stringify(content)));
  }
  async upsert(content?: T): Promise<T> {
    this.readonlyError;
    return this.parse(await super.upsertFromString(this.stringify(content)));
  }
  async update(content: T): Promise<T> {
    return this.parse(await this.writeFromString(this.finalize(content, await this.content)));
  }
}
