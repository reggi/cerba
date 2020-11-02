import * as stripJsonComments from 'strip-json-comments';
import {JSONFile, JSONObject} from './json_file';

export class JSONC extends JSONFile {
  lineCommentPattern = /^(\s+)?\/\*|\*\/|\/\//;
  parse(content: string): JSONObject {
    return JSON.parse(stripJsonComments(content));
  }
  finalize(content: JSONObject, rawContent: string): string {
    const contentLines = this.stringify(content).split('\n');
    const rawContentLines = rawContent.split('\n');
    rawContentLines.forEach((line, i) => {
      if (line.match(this.lineCommentPattern)) {
        contentLines.splice(i - 1, 0, line);
      }
    });
    return contentLines.join('\n');
  }
}
