import * as path from 'path';
import {JSONFile, JSONObject} from './json_file';

interface TsConfigType extends JSONObject {
  compilerOptions?: {
    outDir?: string;
  };
}

const defaults = {basename: 'tsconfig.json', defaultContent: '{}', readonly: true};

export class TsConfig extends JSONFile<TsConfigType> {
  constructor(public props?: ConstructorParameters<typeof JSONFile>[0]) {
    super({...props, ...defaults});
    this.props = {...props, ...defaults};
  }
  get outDir(): Promise<string> {
    return (async () => {
      const content = await this.parsedContent;
      return content.compilerOptions?.outDir ?? '.';
    })();
  }
  get outPath() {
    return (async () => {
      return path.join(this.cwd, await this.outDir);
    })();
  }
}
