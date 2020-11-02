import * as fs from 'fs-extra';
import {Path} from './path';

export class ReadableFile extends Path {
  constructor(public props?: ConstructorParameters<typeof Path>[0] & {defaultContent?: string}) {
    super(props);
  }
  cacheContent?: string;
  get content() {
    return (async () => {
      if (this.cacheContent) return this.cacheContent;
      try {
        this.cacheContent = await fs.readFile(this.path, 'utf8');
        return this.cacheContent;
      } catch (e) {
        if (this.props?.defaultContent) {
          this.cacheContent = this.props.defaultContent;
          return this.cacheContent;
        }
        throw e;
      }
    })();
  }
}
