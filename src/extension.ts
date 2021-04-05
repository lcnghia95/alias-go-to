import * as vscode from 'vscode';
import { JumpController } from './controllers/gotoController';
import { ExtensionProperties } from './model/PropertiesModel';


export function activate(context: vscode.ExtensionContext) {
	const jumpController = new JumpController();
	const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("aliasGoTo");
	const properties: ExtensionProperties = jumpController.getExtensionProperties(config);
	const alias = properties.alias;
	vscode.commands.registerCommand('aliasGoTo.search', () =>  jumpController.searchFile(alias));
	vscode.commands.registerCommand('aliasGoTo.searchAbsolute', () =>  jumpController.searchAbsoluteFile(alias));
}

export function deactivate() {}