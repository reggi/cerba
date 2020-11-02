import * as fs from 'fs-extra';
import * as nodePath from 'path';

export enum PathType {
  file = 'file',
  directory = 'directory',
  unknown = 'unknown',
  missing = 'missing',
}

export class Path {
  constructor(
    public props?: {
      basename?: string;
      cwd?: string;
      path?: string;
    }
  ) {}
  cacheBasename?: string;
  cachePath?: string;
  cacheCwd?: string;
  cacheDirname?: string;
  cacheExtname?: string;
  cacheType?: PathType;
  cacheCoreBasename?: string;
  get path() {
    if (this.cachePath) return this.cachePath;
    this.cachePath = (() => {
      if (this.props?.path) return this.props.path;
      if (this.props?.basename) {
        return nodePath.join(this.cwd, this.props.basename);
      }
      return this.cwd;
    })();
    return this.cachePath;
  }
  get cwd(): string {
    if (this.cacheCwd) return this.cacheCwd;
    this.cacheCwd = this.props?.cwd ?? process.cwd();
    return this.cacheCwd;
  }
  get basename(): string {
    if (this.cacheBasename) return this.cacheBasename;
    this.cacheBasename = nodePath.basename(this.path);
    return this.cacheBasename;
  }
  get coreBasename(): string {
    if (this.cacheCoreBasename) return this.cacheCoreBasename;
    this.cacheCoreBasename = nodePath.basename(this.path, this.extname);
    return this.cacheCoreBasename;
  }
  get relativePath() {
    return this.path.replace(new RegExp('^' + this.cwd), '.');
  }
  get dirname(): string {
    if (this.cacheDirname) return this.cacheDirname;
    this.cacheDirname = nodePath.dirname(this.path);
    return this.cacheDirname;
  }
  get extname(): string {
    if (this.cacheExtname) return this.cacheExtname;
    this.cacheExtname = nodePath.extname(this.path);
    return this.cacheExtname;
  }
  get type(): Promise<PathType> {
    return (async () => {
      if (this.cacheType) return this.cacheType;
      const type = await (async () => {
        if (this.cacheType) return this.cacheType;
        try {
          const stat = await fs.stat(this.path);
          if (stat.isDirectory()) return PathType.directory;
          if (stat.isFile()) return PathType.file;
          return PathType.unknown;
        } catch (e) {
          return PathType.missing;
        }
      })();
      this.cacheType = type;
      return type;
    })();
  }
  get exists(): Promise<boolean> {
    return (async () => {
      return (await this.type) !== PathType.missing;
    })();
  }
  replaceExt(ext: string) {
    const currentExt = this.extname;
    this.cachePath = this.path.replace(new RegExp(currentExt + '$'), ext);
    return this;
  }
}
