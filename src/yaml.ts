import * as yaml from 'yaml';
import {JSONC} from './jsonc';
import {JSONObject} from './json_file';

export class YAML extends JSONC {
  lineCommentPattern = /^(\s+)?#/;
  parse(content: string): JSONObject {
    return yaml.parse(content);
  }
  stringify(content: JSONObject): string {
    return yaml.stringify(content);
  }
}
