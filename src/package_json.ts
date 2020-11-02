import {JSONFile, JSONObject} from './json_file';

export interface PackageJSONType extends JSONObject {
  name: string;
  description?: string;
  version?: string;
  main?: string;
  bin?: string;
  repository?: {type?: string; url?: string; directory?: string};
  scripts?: {[key: string]: string};
  devDependencies?: {[key: string]: string};
  dependencies?: {[key: string]: string};
}

const defaults = {basename: 'package.json', defaultContent: '{}'};

export class PackageJSON extends JSONFile<PackageJSONType> {
  constructor(public props?: ConstructorParameters<typeof JSONFile>[0]) {
    super({...props, ...defaults});
    this.props = {...props, ...defaults};
  }
  get name(): Promise<string> {
    return (async () => {
      return (await this.parsedContent).name;
    })();
  }
  get description(): Promise<string | undefined> {
    return (async () => {
      return (await this.parsedContent).description;
    })();
  }
  get version(): Promise<string | undefined> {
    return (async () => {
      return (await this.parsedContent).version;
    })();
  }
  get main(): Promise<string | undefined> {
    return (async () => {
      return (await this.parsedContent).main;
    })();
  }
  get bin(): Promise<string | undefined> {
    return (async () => {
      return (await this.parsedContent).bin;
    })();
  }
  get dependencies(): Promise<{[k: string]: string}> {
    return (async () => {
      return (await this.parsedContent).dependencies || {};
    })();
  }
}
