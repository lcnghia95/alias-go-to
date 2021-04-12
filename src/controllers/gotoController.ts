import * as vscode from 'vscode';
import { goToFileAliasPath, getSymbolAtCursor, getSymbols, findCurrentWorkDir, checkExistPrefix, compactPath, goToSymbols, getVariable } from '../common/common';

export class JumpController {
  public constructor() {

  }

  public async goToSymbolAlias(_map: Object, workspacePath: any) {
    const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const listSymbol: (string | undefined)[] = await getSymbolAtCursor(editor);
    const listSymbolInActiveFile = await getVariable(listSymbol[0])
  }

  public async searchAbsoluteFile(_map: Object, workspacePath: any) {
    await goToFileAliasPath(_map,workspacePath);
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