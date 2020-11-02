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
  get name() {
    return this.props?.name || this.coreBasename;
  }
  get id() {
    return this.props?.name?.split('/')[0] || this.coreBasename;
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
      const results: PackageJSONType = {
        name: this.name,
        description: this.props?.description,
        dependencies: await this.dependencies,
      };
      const {main, bin} = this.props;
      if (main) results.main = await this.mapJavascriptFiles(main);
      if (bin) results.bin = await this.mapJavascriptFiles(bin);
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
