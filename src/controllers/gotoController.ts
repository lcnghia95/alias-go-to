import * as vscode from 'vscode';
import * as fs from 'fs';
import { getExtensionProperties, findCurrentWorkDir, checkExistPrefix, compactPath } from '../common/common'
export class JumpController {
  public constructor() {

  }

  private async getSymbols(document: vscode.TextDocument): Promise<vscode.DocumentSymbol[]> {
    const result = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider',
        document.uri
    );

    return result?.filter(item => {
      return item.kind === vscode.SymbolKind.Method 
      || item.kind === vscode.SymbolKind.Function 
      || item.kind === vscode.SymbolKind.Constructor
    }) || []
  }

  public async searchAbsoluteFile(_map: Object, workspacePath: any) {

    await vscode.commands.executeCommand('editor.action.goToDeclaration')
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
        await vscode.commands.executeCommand("vscode.open", vscode.Uri.file(pathToGo));
        const symbolEntries = await this.getSymbols(document)
        await vscode.commands.executeCommand("workbench.action.quickOpen").then(async () => {
          await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
        })
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