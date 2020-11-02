import * as path from 'path';
import {BabelFile} from './babel_file';
import {CerbaConfig, CerbaConfigPkg} from './cerba_config';
import {PackageJSON, PackageJSONType} from './package_json';
import {Path} from './path';

export class CerbaPackage extends BabelFile {
  constructor(
    public props: ConstructorParameters<typeof BabelFile>[0] & Partial<CerbaConfigPkg> & {config: CerbaConfig}
  ) {
    super({basename: props.main, ...props});
    this.props = {basename: props.main, ...props};
  }
  getName(): {name?: string; scope?: string} {
    const split = this.props?.name?.split('/');
    if (!split) return {};
    if (split && split.length === 1) return {name: split[0]};
    return {name: split[1], scope: split[2]};
  }
  get name() {
    if (this.scope) return `${this.scope}/${this.id}`;
    return `${this.id}`;
  }
  get id() {
    const {name} = this.getName();
    return name || this.coreBasename;
  }
  get scope() {
    const {scope} = this.getName();
    return scope || this.config.scope;
  }
  get config() {
    return this.props.config;
  }
  get destDir() {
    return (async () => {
      const packagesDir = await this.config.packagesDir;
      return path.join(packagesDir, this.id);
    })();
  }

  get version() {
    return (async () => {
      const p = await this.package;
      const version = await p.version;
      if (version) return version;
      return await this.config.initialVersion;
    })();
  }

  /** moves files to the packagesDir */
  async moveFiles() {
    const files = await this.recursiveSiblings;
    const packagesDir = await this.destDir;
    return Promise.all(
      files.map(async file => {
        const dest = path.join(packagesDir, file.relativePath);
        await file.copy({path: dest});
      })
    );
  }
  async mapJavascriptFiles(basename: string) {
    return new Path({
      cwd: await this.destDir,
      basename,
    }).replaceExt('.js').relativePath;
  }
  /** returns the package json for this file */
  get packageContent() {
    return (async () => {
      const dependencies = await this.dependencies;
      const version = await this.version;
      const results: PackageJSONType = {
        name: this.name,
      };
      const {description, main, bin} = this.props;
      if (version) results.version = version;
      if (description) results.description = description;
      if (main) results.main = await this.mapJavascriptFiles(main);
      if (bin) results.bin = await this.mapJavascriptFiles(bin);
      if (dependencies) results.dependencies = dependencies;
      return results;
    })();
  }
  cachePackage?: PackageJSON;
  get package() {
    return (async () => {
      if (this.cachePackage) return this.cachePackage;
      const cwd = await this.destDir;
      this.cachePackage = new PackageJSON({cwd});
      return this.cachePackage;
    })();
  }
  async buildPackage() {
    const pack = await this.package;
    return pack.write(await this.packageContent);
  }
  async build() {
    await this.buildPackage();
    await this.moveFiles();
  }
}
