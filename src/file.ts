import * as fs from 'fs-extra';
import {Path} from './path';
import {WritableFile} from './writable_file';

export class File extends WritableFile {
  constructor(public props?: ConstructorParameters<typeof WritableFile>[0] & {readonly?: boolean; forgive?: boolean}) {
    super(props);
  }
  get readonlyError(): void {
    if (this.props?.readonly) throw new Error('this file is readonly');
    return undefined;
  }
  async writeFromString(content: string) {
    this.readonlyError;
    return super.writeFromString(content);
  }
  async createFromString(content: string) {
    this.readonlyError;
    return super.createFromString(content);
  }
  async upsertFromString(content: string) {
    this.readonlyError;
    return super.upsertFromString(content);
  }
  async copy(dest: ConstructorParameters<typeof Path>[0] | Path) {
    const destPath = dest instanceof Path ? dest : new Path({cwd: this.cwd, ...dest});
    await fs.copy(this.path, destPath.path);
  }
  async move(dest: ConstructorParameters<typeof Path>[0] | Path) {
    const destPath = dest instanceof Path ? dest : new Path({cwd: this.cwd, ...dest});
    await fs.move(this.path, destPath.path);
  }
}
