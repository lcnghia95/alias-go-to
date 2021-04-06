import * as vscode from 'vscode';
import { ExtensionProperties } from '../model/PropertiesModel';
import * as path from 'path';
import * as fs from 'fs';
const CONSTANT: Array<string> = ['.js', '.ts', '.Vue'];
export class JumpController {
  public constructor() {

  }

  public getExtensionProperties(workspaceConfig: vscode.WorkspaceConfiguration): ExtensionProperties {
    const alias = workspaceConfig.alias || {};
    const extensionProperties: ExtensionProperties = {
      alias
    };
    return extensionProperties;
  }

  private findCurrentWorkDir(pathString: String): String {
    if (!pathString) {
      return '';
    }
    let splitPath = pathString.split('/');
    splitPath.length -= 1;
    if (fs.existsSync(path.join(splitPath.join('/'), 'package.json'))) {
      return splitPath.join('/');
    } else {
      return this.findCurrentWorkDir(splitPath.join('/'));
    }
  }
  private checkExistPrefix(pathFinal: string) {
    const findItem = CONSTANT.find(element => {
      return fs.existsSync(path.dirname(pathFinal + '' + element));
    });
    return pathFinal + (findItem || '.js');
  }

  private compactPath(currentDir: String, realPath: String, workspacePath: String) {
    const workpaceLength = workspacePath.split('/').length;
    const count = realPath.split('/').filter(item => item === '..').length;
    if (count > 0) {
      const newArr = currentDir.split('/');
      for (let index = 0; index < count; index++) {
        if (newArr.length === workpaceLength) {
          break;
        } else {
          newArr.length -= 1;
        }
      }
      const pathFinal = newArr.join('/') + '/' + realPath.split('/').slice(count).join('/');
      return pathFinal;
    } else {
      return currentDir + '/' + realPath;
    }
  }


  public searchAbsoluteFile(_map: Object, workspacePath: any) {
    const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
    const filePath = editor?.document.fileName || '';
    console.log("filePath", filePath);
    const currentDir = this.findCurrentWorkDir(filePath.split("\\").join("/"));
    if (!editor) {
      return;
    }
    const document: vscode.TextDocument = editor.document;
    for (let index = 0; index < editor.selections.length; index++) {
      const selection: vscode.Selection = editor.selections[index];
      const lineOfSelectedVar: number = selection.active.line;
      const textInLine = document.lineAt(lineOfSelectedVar).text;
      const targetText: String = (textInLine.match(/(?<=['|"])(.*)(?=['|"])/g) || [])[0] || '';

      const arrayTargetText = targetText.split('/');
      const arrayMap = Object.keys(_map);

      const indexFind = arrayMap.findIndex(itm => arrayTargetText[0] === itm);
      if (!textInLine || !targetText || indexFind === -1) {
        return;
      }
      arrayTargetText[0] = Object.values(_map)[indexFind];
      const realPath = arrayTargetText.join('/');
      vscode.commands.executeCommand("vscode.open", vscode.Uri.file(this.checkExistPrefix(this.compactPath(currentDir, realPath, workspacePath.split("\\").join('/')))));

      // vscode.commands.executeCommand('workbench.action.quickOpen', this.checkExistPrefix(this.compactPath(currentDir, realPath, workspacePath.split("\\").join('/'))));
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
      const lineOfSelectedVar: number = selection.active.line;
      const textInLine = document.lineAt(lineOfSelectedVar).text;
      const targetText: String = (textInLine.match(/(?<=['|"])(.*)(?=['|"])/g) || [])[0] || '';
      const arrayTargetText = targetText.split('/');
      const arrayMap = Object.keys(_map);
      const indexFind = arrayMap.findIndex(itm => arrayTargetText[0] === itm);
      arrayTargetText[0] = Object.values(_map)[indexFind];
      const standardText = (arrayTargetText.join('/').match(/[a-z|A-Z](.*)/g) || [])[0] || '';
      vscode.commands.executeCommand('workbench.action.quickOpen', standardText);
    }
  }

}