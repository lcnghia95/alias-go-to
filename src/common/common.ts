import * as vscode from 'vscode';
import { TextEditor, Selection } from "vscode";
import { ExtensionProperties } from '../model/PropertiesModel';
import * as path from 'path';
import * as fs from 'fs';
const CONSTANT: Array<string> = ['.js', '.ts', '.vue', '.css', '.less'];

export const getExtensionProperties = (workspaceConfig: vscode.WorkspaceConfiguration): ExtensionProperties => {
  const alias = workspaceConfig.alias || {};
  const extensionProperties: ExtensionProperties = {
    alias
  };
  return extensionProperties;
};

export const findCurrentWorkDir = (pathString: String): String => {
  if (!pathString) {
    return '';
  }
  let splitPath = pathString.split('/');
  splitPath.length -= 1;
  if (fs.existsSync(path.join(splitPath.join('/'), 'package.json'))) {
    return splitPath.join('/');
  } else {
    return findCurrentWorkDir(splitPath.join('/'));
  }
};

export const checkExistPrefix = (pathFinal: string) => {
  const checkExistOnPath = CONSTANT.some(el => pathFinal.includes(el));
  if (checkExistOnPath) {
    return pathFinal;
  }
  const findItem = CONSTANT.find(element => {
    return fs.existsSync(pathFinal + '' + element);
  });
  return pathFinal + (findItem || '');
};

export const getWordAtPosition = () => {
  const range = vscode.window.activeTextEditor?.document.getWordRangeAtPosition(
    vscode.window.activeTextEditor?.selection.active,
    /\S+/
  );
  if (range) {
    const word = vscode.window.activeTextEditor?.document.getText(range); // get the word at the range
    return word;
  }
  return '';
};

export const getSymbolPrevious = (symbol: any, wordAtPosition: string) => {
  if (!symbol) {
    return;
  }
  const correctSymbol = symbol.replaceAll(/[^a-zA-Z0-9._]/g, ' ')
  const indexSymbolAtPosition = correctSymbol.indexOf(wordAtPosition);
  let findInex = indexSymbolAtPosition - 1;
  while (findInex > 0) {
    if (correctSymbol[findInex] === ' ') {
      break;
    }
    findInex--;
  }
  if (indexSymbolAtPosition - findInex < 3) {
    return wordAtPosition;
  }
  return correctSymbol.slice(findInex, indexSymbolAtPosition - 1).replaceAll(' ', '');
};

// Refer from https://github.com/alefragnani/vscode-ext-selection/blob/master/src/index.ts
// Thank so much !
export const getSymbolAtCursor = async (editor: TextEditor): Promise<(string | undefined)[] >=> {
  const textInLine = getWordAtPosition();
  if (!editor.selection.isEmpty) {
    return [];
  }
  const cursorWordRange = editor.document.getWordRangeAtPosition(editor.selection.active);

  if (!cursorWordRange) {
    return [];
  }

  const newSe = new Selection(cursorWordRange.start.line, cursorWordRange.start.character, cursorWordRange.end.line, cursorWordRange.end.character);
  editor.selection = newSe;
  const wordAtPosition = editor.document.getText(newSe);
  const correctSymbol = textInLine?.split(' ').find(item => item.includes(wordAtPosition));
  const listSymbol = getSymbolPrevious(correctSymbol, wordAtPosition)
  return [...listSymbol.split('.'), wordAtPosition] || [];
};

export const getVariable = async (symbol: string | undefined ): Promise<vscode.DocumentSymbol[]> => {
  const document: vscode.TextDocument | any = vscode.window.activeTextEditor?.document;
  const result = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
    'vscode.executeDocumentSymbolProvider',
    document.uri
  );
  return result?.filter(item => {
    return (item.kind === vscode.SymbolKind.Variable) && item.name === symbol;
  }) || [];
};

export const getSymbols = async (symbol: string | undefined ): Promise<vscode.DocumentSymbol[]> => {
  const document: vscode.TextDocument | any = vscode.window.activeTextEditor?.document;
  const result = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
    'vscode.executeDocumentSymbolProvider',
    document.uri
  );
  return result?.filter(item => {
    return (item.kind === vscode.SymbolKind.Method
      || item.kind === vscode.SymbolKind.Function
      || item.kind === vscode.SymbolKind.Constructor) && item.name === symbol;
  }) || [];
};

export const goToSymbols = async (symbol: string) => {
  const symbolEntries = await getSymbols(symbol);

  // await vscode.commands.executeCommand("workbench.action.quickOpen").then(async () => {
  //   await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
  // });
  if (symbolEntries[0] && symbolEntries[0].range) {
    const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    let range = editor.document.lineAt(symbolEntries[0].range.start.line).range;
    editor.selection = new vscode.Selection(range.start, range.start);
    editor.revealRange(range);
  }
};

export const goToVaraiable = async (symbol: string) => {
  const symbolEntries = await getVariable(symbol);

  // await vscode.commands.executeCommand("workbench.action.quickOpen").then(async () => {
  //   await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
  // });
  if (symbolEntries[0] && symbolEntries[0].range) {
    const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    let range = editor.document.lineAt(symbolEntries[0].range.start.line).range;
    editor.selection = new vscode.Selection(range.start, range.start);
    editor.revealRange(range);
  }
};



export const goToFileAliasPath = async (_map: Object, workspacePath: string) => {
  const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const filePath = editor?.document.fileName || '';
  const document: vscode.TextDocument = editor.document;
  for (let index = 0; index < editor.selections.length; index++) {
    const selection: vscode.Selection = editor.selections[index];
    const targetText: String = (document.lineAt(selection.active.line).text.match(/(?<=['|"])(.*)(?=['|"])/g) || [])[0] || '';
    const arrayTargetText = targetText.split('/');
    const indexFind = Object.keys(_map).findIndex(itm => arrayTargetText[0] === itm);
    if (!targetText || indexFind === -1) {
      return;
    }
    arrayTargetText[0] = Object.values(_map)[indexFind];
    const pathToGo = checkExistPrefix(compactPath(findCurrentWorkDir(filePath.split("\\").join("/")), arrayTargetText.join('/'), workspacePath.split("\\").join('/')));
    if (fs.existsSync(pathToGo)) {
      await vscode.commands.executeCommand("vscode.open", vscode.Uri.file(pathToGo));
    }
  }
};

export const compactPath = (currentDir: String, realPath: String, workspacePath: String) => {
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
};
