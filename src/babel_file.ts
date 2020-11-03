import * as path from 'path';
import babelTraverse from '@babel/traverse';
import {File as BabelNodes} from '@babel/types';
import * as babelParser from '@babel/parser';
import {ParseableFile} from './parsable_file';
import {PackageJSON} from './package_json';

const defaults = {readonly: true};
export class BabelFile extends ParseableFile<BabelNodes> {
  constructor(
    public props: ConstructorParameters<typeof ParseableFile>[0] & {
      plugins?: babelParser.ParserPlugin[];
      // modifyDependency?: (dep: string) => string;
      pkg?: PackageJSON;
    } = defaults
  ) {
    super({...props, ...defaults});
    this.props = {...props, ...defaults};
  }
  get pkg() {
    return this.props.pkg ?? new PackageJSON({cwd: this.cwd});
  }
  /** @see https://stackoverflow.com/a/54003496/340688 */
  static getBuiltins() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const result = require('module');
      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      return result.builtinModules;
    } catch (e) {
      /* istanbul ignore next */
      // prettier-ignore
      return [
        'assert',         'buffer',   'child_process',
        'cluster',        'console',  'constants',
        'crypto',         'dgram',    'dns',
        'domain',         'events',   'fs',
        'http',           'https',    'module',
        'net',            'os',       'path',
        'process',        'punycode', 'querystring',
        'readline',       'repl',     'stream',
        'string_decoder', 'sys',      'timers',
        'tls',            'tty',      'url',
        'util',           'vm',       'zlib'
      ];
    }
  }
  static builtins = BabelFile.getBuiltins();
  static isNativeImport(pkg: string) {
    return BabelFile.builtins.includes(pkg);
  }
  static isLocalImport(pkg: string) {
    return Boolean(pkg.match('^/|^./|^../'));
  }
  static isNodePackageImport(pkg: string) {
    return !BabelFile.isNativeImport(pkg) && !BabelFile.isLocalImport(pkg);
  }
  get packageImports() {
    return (async () => {
      return (await this.imports).filter(BabelFile.isNodePackageImport);
    })();
  }
  get localImports() {
    return (async () => {
      return (await this.imports).filter(BabelFile.isLocalImport);
    })();
  }
  get nativeImports() {
    return (async () => {
      return (await this.imports).filter(BabelFile.isNativeImport);
    })();
  }
  get packageRecursiveImports() {
    return (async () => {
      return (await this.recursiveImports).filter(BabelFile.isNodePackageImport);
    })();
  }
  get localRecursiveImports() {
    return (async () => {
      return (await this.recursiveImports).filter(BabelFile.isLocalImport);
    })();
  }
  get nativeRecursiveImports() {
    return (async () => {
      return (await this.recursiveImports).filter(BabelFile.isNativeImport);
    })();
  }
  get plugins() {
    return this.props.plugins || ['typescript', 'classProperties', 'classPrivateProperties'];
  }
  // get modifyDependency() {
  //   return this.props?.modifyDependency;
  // }
  private cacheParsedContent?: BabelNodes;
  parse(content: string): BabelNodes {
    if (this.cacheParsedContent) return this.cacheParsedContent;
    this.cacheParsedContent = babelParser.parse(content, {
      sourceType: 'module',
      plugins: this.plugins,
    });
    return this.cacheParsedContent;
  }
  private cacheImports?: string[];
  get imports(): Promise<string[]> {
    return (async () => {
      if (this.cacheImports) return this.cacheImports;
      let imports: string[] = [];
      const content = await this.parsedContent;
      babelTraverse(content, {
        CallExpression: astPath => {
          /* istanbul ignore next */
          if ('name' in astPath.node?.callee) {
            if (astPath.node?.callee?.name === 'require') {
              const arg = astPath.node.arguments[0];
              /* istanbul ignore next */
              if ('value' in arg && typeof arg.value === 'string') {
                imports.push(arg.value);
                // if (this.modifyDependency) arg.value = this.modifyDependency(arg.value);
              }
            }
          }
        },
        ImportDeclaration: astPath => {
          imports.push(astPath.node.source.value);
          // if (this.modifyDependency) {
          //   astPath.node.source.value = this.modifyDependency(astPath.node.source.value);
          // }
        },
      });
      imports = imports.map(i => {
        if (BabelFile.isLocalImport(i)) {
          return path.join(this.dirname, `${i}${this.extname}`);
        }
        return i;
      });
      this.cacheImports = imports;
      return this.cacheImports;
    })();
  }
  static uniqueString(a: string[]) {
    function onlyUnique(value: string, index: number, self: string[]) {
      return self.indexOf(value) === index;
    }
    const unique = a.filter(onlyUnique); // returns ['a', 1, 2, '1']
    return unique;
  }
  private cacheSiblingFiles: {[key: string]: BabelFile} = {};
  private cacheRecursiveImports: string[] = [];
  private fileCacheCheck(path: string) {
    return typeof this.cacheSiblingFiles[path] !== 'undefined';
  }
  private fileCacheAdd(file: BabelFile) {
    this.cacheSiblingFiles[file.path] = file;
  }
  private async recursiveImportAdd(file: BabelFile) {
    const imports = await file.imports;
    this.cacheRecursiveImports = BabelFile.uniqueString([...this.cacheRecursiveImports, ...imports]);
  }
  get recursiveDependencies(): Promise<[string[], {[key: string]: BabelFile}]> {
    return (async (): Promise<[string[], {[key: string]: BabelFile}]> => {
      if (this.cacheRecursiveImports.length !== 0) {
        return [this.cacheRecursiveImports, this.cacheSiblingFiles];
      }
      const recursive = async (babelFile: BabelFile) => {
        await this.fileCacheAdd(babelFile);
        await this.recursiveImportAdd(babelFile);
        return (await babelFile.localImports).reduce((promise, path) => {
          return promise.then(async () => {
            const isCached = this.fileCacheCheck(path);
            if (isCached) return;
            const file = new BabelFile({path});
            this.fileCacheAdd(file);
            await recursive(file);
          });
        }, Promise.resolve());
      };
      await recursive(this);
      return [this.cacheRecursiveImports, this.cacheSiblingFiles];
    })();
  }
  get recursiveImports() {
    return (async () => {
      const [imports] = await this.recursiveDependencies;
      return imports;
    })();
  }
  get recursiveSiblings() {
    return (async () => {
      const [, siblings] = await this.recursiveDependencies;
      return Object.values(siblings);
    })();
  }
  /** Given a package json file, will pluck all npm dependencies */
  get dependencies(): Promise<{[k: string]: string}> {
    return (async () => {
      const imports = await this.packageRecursiveImports;
      const nativeImports = await this.nativeRecursiveImports;
      const allDependencies = await this.pkg.dependencies;
      const dependencies = {};
      imports.forEach(i => {
        const version = allDependencies[i];
        if (!version) throw new Error(`Dependency "${i}" is not found in package.json.`);
        Object.assign(dependencies, {[i]: version});
      });
      nativeImports.forEach(i => {
        const version = allDependencies[i];
        if (version) Object.assign(dependencies, {[i]: version});
      });
      return dependencies;
    })();
  }
}
