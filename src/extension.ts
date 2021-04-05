import * as vscode from 'vscode';
import { JumpController } from './controllers/gotoController';
import { ExtensionProperties } from './model/PropertiesModel';


export function activate(context: vscode.ExtensionContext) {
	let message, workspacePath: String;
	
	if(vscode.workspace.workspaceFolders !== undefined) {
		workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath || '' ; 
		message = `aliasGoTo: folder: ${workspacePath}` ;
	
		vscode.window.showInformationMessage(message);
	} 
	else {
		message = "aliasGoTo: Working folder not found, open a folder an try again" ;
	
		vscode.window.showErrorMessage(message);
	}
	const jumpController = new JumpController();
	const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("aliasGoTo");
	const properties: ExtensionProperties = jumpController.getExtensionProperties(config);
	const alias = properties.alias;
	vscode.commands.registerCommand('aliasGoTo.search', () =>  jumpController.searchFile(alias));
	vscode.commands.registerCommand('aliasGoTo.searchAbsolute', () =>  jumpController.searchAbsoluteFile(alias, workspacePath));
}

export function deactivate() {}