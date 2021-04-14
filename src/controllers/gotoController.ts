import * as vscode from 'vscode';
import { goToFileAliasPath, getSymbolAtCursor, getSymbols, findCurrentWorkDir, checkExistPrefix, compactPath, goToSymbols, getVariable, goToVaraiable } from '../common/common';

export class JumpController {
  public constructor() {

  }

  private async _goToFileOnBase(_map: Object, workspacePath: any): Promise<any>{
    const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    if(editor.selections.length === 1){
      await this.searchAbsoluteFile(_map, workspacePath)
      return
    }
    await this._goToFileOnBase(_map, workspacePath)
  }

  public async goToSymbolAlias(_map: Object, workspacePath: any) {
    const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const beforePosition = editor.selection.active;
    await vscode.commands.executeCommand('editor.action.goToTypeDefinition')
    const afterPosition = editor.selection.active;
    if(beforePosition !== afterPosition){
      return;
    }
    const listSymbol: (string | any)[] = await getSymbolAtCursor(editor);
    const listSymbolValid = listSymbol.filter(itm => itm)
    if(listSymbolValid.length === 0){
      return 
    }
    if(listSymbolValid.length === 1){
      await goToVaraiable(listSymbolValid[0])
      await this.searchAbsoluteFile(_map, workspacePath)
      return await this._goToFileOnBase(_map, workspacePath)
    }
    if(listSymbolValid.length === 2 && listSymbolValid[0] === listSymbolValid[1] ){
      await goToVaraiable(listSymbolValid[0])
      await this.searchAbsoluteFile(_map, workspacePath)
      return await this._goToFileOnBase(_map, workspacePath)
    }
    await goToVaraiable(listSymbolValid[0])
    await this.searchAbsoluteFile(_map, workspacePath)
    await this._goToFileOnBase(_map, workspacePath)
    return await goToSymbols(listSymbolValid[listSymbolValid.length - 1])
    // return await this.searchAbsoluteFile(_map, workspacePath)
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