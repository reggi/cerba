import * as path from 'path';
import {CerbaConfig} from './cerba_config';
import {CerbaPackage} from './cerba_package';
import {PackageJSON} from './package_json';

export class Cerba {
  constructor(public props: {cwd?: string; main?: string; name?: string; scope?: string} = {}) {}
  get cwd() {
    if (this.props.cwd) return path.resolve(this.props.cwd);
    return process.cwd();
  }
  get config() {
    return new CerbaConfig({cwd: this.cwd, scope: this.props.scope});
  }
  get packageJSON() {
    return new PackageJSON({cwd: this.cwd, readonly: true});
  }
  private cachePackages?: CerbaPackage[];
  get packages(): Promise<CerbaPackage[]> {
    return (async () => {
      if (this.cachePackages) return this.cachePackages;
      const op = await (async () => {
        const config = this.config;
        const main = this.props.main;
        const cwd = this.cwd;
        const pkg = this.packageJSON;
        const plugins = await this.config.babelPlugins;
        if (main) return [new CerbaPackage({config, plugins, cwd, pkg, main})];
        const packages = await this.config.packages;
        return packages.map(pack => {
          return new CerbaPackage({config, plugins, cwd, pkg, ...pack});
        });
      })();
      this.cachePackages = op;
      return op;
    })();
  }
  async findPackage(name: string) {
    const pkgs = await this.packages;
    const results = pkgs.find(pkg => pkg.name === name);
    if (results) return results;
    throw new Error(`Unable to find package "${name}" within cerba config.`);
  }
  async build() {
    if (this.props.name) {
      return this.buildPackage(this.props.name);
    }
    const packages = await this.packages;
    return Promise.all(
      packages.map(p => {
        return p.build();
      })
    );
  }
  async buildPackage(name?: string) {
    const n = this.props.name ?? name;
    if (!n) throw new Error('Unable to build package, no package name provided');
    const file = await this.findPackage(n);
    return file.build();
  }
}
