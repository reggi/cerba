import * as path from 'path';
import {JSONFile, JSONObject} from './json_file';
import * as babelParser from '@babel/parser';

export interface CerbaConfigType extends JSONObject {
  initialVersion?: string;
  babelPlugins?: string[];
  packagesDir?: string;
  packages?: {
    name: string;
    description?: string;
    main?: string;
    bin?: string;
  }[];
}

export type CerbaConfigPkg = NonNullable<CerbaConfigType['packages']>[number];

const defaults = {basename: 'cerba.json', defaultContent: '{}', readonly: true};

export class CerbaConfig extends JSONFile<CerbaConfigType> {
  constructor(public props?: ConstructorParameters<typeof JSONFile>[0]) {
    super({...props, ...defaults});
    this.props = {...props, ...defaults};
  }
  get initialVersion(): Promise<string> {
    return (async () => {
      const content = await this.parsedContent;
      return content.initialVersion || '1.0.0';
    })();
  }
  get packagesDir(): Promise<string> {
    return (async () => {
      const content = await this.parsedContent;
      return path.join(this.cwd, content.packagesDir || 'packages');
    })();
  }
  get babelPlugins(): Promise<babelParser.ParserPlugin[]> {
    return (async () => {
      const content = await this.parsedContent;
      return (content.babelPlugins || []) as babelParser.ParserPlugin[];
    })();
  }
  get packages(): Promise<CerbaConfigPkg[]> {
    return (async () => {
      const content = await this.parsedContent;
      return content.packages || [];
    })();
  }
}
