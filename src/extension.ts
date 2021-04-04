import * as vscode from 'vscode';
import { JumpController } from './controllers/jumController';
import { ExtensionProperties } from './model/PropertiesModel';


export function activate(context: vscode.ExtensionContext) {
	const jumpController = new JumpController();
	const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("aliasGoTo");
	const properties: ExtensionProperties = jumpController.getExtensionProperties(config);
	const alias = properties.alias;
	let disposable = vscode.commands.registerCommand('aliasGoTo.jump', () =>  jumpController.jump(alias));
	context.subscriptions.push(disposable);
}

export function deactivate() {}