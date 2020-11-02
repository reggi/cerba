import {ParseableFile} from './parsable_file';

export type JSONValue = null | number | string | boolean | JSONValue[] | {[k: string]: undefined | JSONValue};

export type JSONObject = {[k: string]: undefined | JSONValue};

export class JSONFile<T extends JSONObject = JSONObject> extends ParseableFile<T> {
  stringify(content?: T): string {
    return JSON.stringify(content, null, 2) || '{}';
  }
  parse(content: string): T {
    return JSON.parse(content);
  }
  get parsedContent(): Promise<T> {
    return (async () => {
      return this.parse(await this.content);
    })();
  }
  /** @see https://stackoverflow.com/a/8817461/340688 */
  static getDeep(obj: JSONObject, key: string): undefined | JSONValue {
    const paths = key.split('.');
    // eslint-disable-next-line
    let current: any = obj;
    let i;
    for (i = 0; i < paths.length; ++i) {
      const m = current[paths[i]];
      if (m !== undefined && m !== null) {
        current = current[paths[i]];
      } else {
        return undefined;
      }
    }
    return current as JSONValue;
  }
  /** @see https://stackoverflow.com/a/18937118/340688 */
  static setDeep(obj: JSONObject, key: string, value: JSONValue): JSONObject {
    const path = key.split('.');
    // eslint-disable-next-line
    path.reduce((a, b, level): any => {
      const len = path.length - 1;
      if (typeof a[b] === 'undefined' && level !== len) {
        a[b] = {};
        return a[b];
      }
      if (level === len) {
        a[b] = value;
        return value;
      }
      return a[b];
    }, obj);
    return obj;
  }
  /** @see https://stackoverflow.com/a/48666737/340688 */
  static unsetDeep(obj: JSONObject, key: string) {
    const path = key.split('.');
    for (let i = 0; i < path.length - 1; i++) {
      const v = obj[path[i]];
      console.log(v);
      if (typeof v === 'object' && v && !Array.isArray(v)) {
        obj = v;
      }
    }
    const value = path.pop();
    if (value) delete obj[value];
  }
  async getDeep(prop: string) {
    const content = await this.parsedContent;
    return JSONFile.getDeep(content, prop);
  }
  async setDeep(prop: string, value: JSONValue) {
    const content = await this.parsedContent;
    JSONFile.setDeep(content, prop, value);
    return await this.update(content);
  }
  async unsetDeep(prop: string) {
    const content = await this.parsedContent;
    JSONFile.unsetDeep(content, prop);
    return await this.update(content);
  }
  async get(prop: keyof T) {
    return (await this.parsedContent)[prop];
  }
  async set(prop: keyof T, value: JSONValue) {
    const content = await this.parsedContent;
    Object.assign(content, {[prop]: value});
    return await this.update(content);
  }
  async unset(prop: keyof T) {
    const content = await this.parsedContent;
    delete content[prop];
    return await this.update(content);
  }
}
