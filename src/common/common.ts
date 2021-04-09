import * as vscode from 'vscode';
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
}

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
}

export const checkExistPrefix = (pathFinal: string) => {
    const checkExistOnPath = CONSTANT.some(el => pathFinal.includes(el))
    if (checkExistOnPath) {
        return pathFinal
    }
    const findItem = CONSTANT.find(element => {
        return fs.existsSync(pathFinal + '' + element);
    });
    return pathFinal + (findItem || '');
}

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
}
