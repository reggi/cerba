import {CerbaConfig} from './cerba_config';
import {CerbaPackage} from './cerba_package';
import {JSONFile} from './json_file';
import {PackageJSON} from './package_json';
import {TsConfig} from './tsconfig';

export class Cerba {
  constructor(public props?: {cwd?: string; main?: string}) {}
  get cwd() {
    return this.props?.cwd || process.cwd();
  }
  get config() {
    return new CerbaConfig({cwd: this.cwd});
  }
  get tsConfig() {
    return new TsConfig({cwd: this.cwd, readonly: true});
  }
  get packageJSON() {
    return new PackageJSON({cwd: this.cwd, readonly: true});
  }
  get versionTable() {
    return new JSONFile({cwd: this.cwd, basename: 'versions.json'});
  }
  private cachePackages?: CerbaPackage[];
  get packages(): Promise<CerbaPackage[]> {
    return (async () => {
      if (this.cachePackages) return this.cachePackages;
      const op = await (async () => {
        const config = this.config;
        const main = this.props?.main;
        const cwd = this.cwd;
        const pkg = this.packageJSON;
        if (main) return [new CerbaPackage({config, cwd, pkg, main})];
        const parsedContent = await this.config.parsedContent;
        const packages = parsedContent.packages || [];
        return packages.map(pack => {
          return new CerbaPackage({config, cwd, pkg, ...pack});
        });
      })();
      this.cachePackages = op;
      return op;
    })();
  }
  async findPackage(name: string) {
    const pkgs = await this.packages;
    if (!pkgs) throw new Error(`Unable to find package "${name}" within cerba config.`);
    const results = pkgs.find(pkg => pkg.name === name);
    if (results) return results;
    throw new Error(`Unable to find package "${name}" within cerba config.`);
  }
  async build() {
    const packages = await this.packages;
    return Promise.all(
      packages.map(p => {
        return p.build();
      })
    );
  }
  async buildPackage(name: string) {
    const file = await this.findPackage(name);
    return file.build();
  }
}

(async () => {
  const pkg = new Cerba({main: './src/cerba.ts'});
  await pkg.build();
})().catch(console.log);
