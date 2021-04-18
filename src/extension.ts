import * as vscode from 'vscode';
import { JumpController } from './controllers/gotoController';
import { ExtensionProperties } from './model/PropertiesModel';
import { getExtensionProperties } from './common/common';

export function activate(context: vscode.ExtensionContext) {
	let message, workspacePath: String;
	
	if(vscode.workspace.workspaceFolders !== undefined) {
		workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath || '' ; 
	}
	const jumpController = new JumpController();
	const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("aliasGoTo");
	const properties: ExtensionProperties = getExtensionProperties(config);
	const alias = properties.alias;
	vscode.commands.registerCommand('aliasGoTo.search', () =>  jumpController.searchFile(alias));
	vscode.commands.registerCommand('aliasGoTo.goToSymbol', () =>  jumpController.goToSymbolAlias(alias, workspacePath));
	vscode.commands.registerCommand('aliasGoTo.searchAbsolute', () =>  jumpController.searchAbsoluteFile(alias, workspacePath));
}

export function deactivate() {}