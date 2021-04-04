import * as vscode from 'vscode';
import { ExtensionProperties } from '../model/PropertiesModel';


export class JumpController {
    public constructor() {

    }

    public getExtensionProperties( workspaceConfig: vscode.WorkspaceConfiguration): ExtensionProperties 
    {
        const alias = workspaceConfig.alias || {};
        const extensionProperties: ExtensionProperties = {
        alias
        };
        return extensionProperties;
    }

    public jump(_map: Object ){
        
        const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
        if (!editor) {
          return;
        }
        const document: vscode.TextDocument = editor.document;
        for (let index = 0; index < editor.selections.length; index++) {
          const selection: vscode.Selection = editor.selections[index];
          const lineOfSelectedVar: number = selection.active.line;
          const textInLine =  document.lineAt(lineOfSelectedVar).text;
          const targetText: String = (textInLine.match(/(?<=['|"])(.*)(?=['|"])/g) || [])[0] || ''; 
          const arrayTargetText = targetText.split('/');
          const arrayMap = Object.keys(_map);
          const indexFind = arrayMap.findIndex(itm =>arrayTargetText[0] === itm);
          arrayTargetText[0] = Object.values(_map)[indexFind];
          const standardText = (arrayTargetText.join('/').match(/[a-z|A-Z](.*)/g) || [])[0] || '';
          vscode.commands.executeCommand('workbench.action.quickOpen', standardText);
        }
    }
    
} 