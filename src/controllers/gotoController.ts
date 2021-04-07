import * as vscode from 'vscode';
import * as fs from 'fs';
import { getExtensionProperties, findCurrentWorkDir, checkExistPrefix, compactPath } from '../common/common'
export class JumpController {
  public constructor() {

  }

  public searchAbsoluteFile(_map: Object, workspacePath: any) {
    const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
    const filePath = editor?.document.fileName || '';
    if (!editor) {
      return;
    }
    const document: vscode.TextDocument = editor.document;
    for (let index = 0; index < editor.selections.length; index++) {
      const selection: vscode.Selection = editor.selections[index];
      const targetText: String = (document.lineAt(selection.active.line).text.match(/(?<=['|"])(.*)(?=['|"])/g) || [])[0] || '';
      const arrayTargetText = targetText.split('/');
      const indexFind = Object.keys(_map).findIndex(itm => arrayTargetText[0] === itm);
      if ( !targetText || indexFind === -1) {
        return;
      }
      arrayTargetText[0] = Object.values(_map)[indexFind];
      const pathToGo = checkExistPrefix(compactPath(findCurrentWorkDir(filePath.split("\\").join("/")),  arrayTargetText.join('/') , workspacePath.split("\\").join('/')))
      if(fs.existsSync(pathToGo)){
        vscode.commands.executeCommand("vscode.open", vscode.Uri.file(pathToGo));
      } else {
        this.searchFile(_map)
      }
    }
  }

  public searchFile(_map: Object) {
    const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const document: vscode.TextDocument = editor.document;
    for (let index = 0; index < editor.selections.length; index++) {
      const selection: vscode.Selection = editor.selections[index];
      const targetText: String = (document.lineAt(selection.active.line).text.match(/(?<=['|"])(.*)(?=['|"])/g) || [])[0] || '';
      const arrayTargetText = targetText.split('/');
      const indexFind = Object.keys(_map).findIndex(itm => arrayTargetText[0] === itm);
      arrayTargetText[0] = Object.values(_map)[indexFind];
      const standardText = (arrayTargetText.join('/').match(/[a-z|A-Z](.*)/g) || [])[0] || '';
      vscode.commands.executeCommand('workbench.action.quickOpen', standardText);
    }
  }

}