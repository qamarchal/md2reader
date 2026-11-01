'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as temp from 'temp';
import { Converter } from "./Converter";

function findMarkdownFiles(dir: string, recurse: boolean): Array<vscode.Uri> {
    let results: Array<vscode.Uri> = [];
    let list = fs.readdirSync(dir);
    list.forEach(file => {
        let fullPath = path.join(dir, file);
        let stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (recurse) {
                results = results.concat(findMarkdownFiles(fullPath, recurse));
            }
        } else if (path.extname(file).toLowerCase() === '.md') {
            results.push(vscode.Uri.file(fullPath));
        }
    });
    return results;
}

function convertFiles(files: Array<vscode.Uri>, config: vscode.WorkspaceConfiguration, cwd?: string) {
    if (files.length === 0) {
        vscode.window.showErrorMessage('No markdown file found');
        return;
    }
    let converter = new Converter(config);
    let single = config.get<boolean>('singleOutput');
    var inputs: Array<string> = [];
    files.sort((a, b) => a.fsPath.localeCompare(b.fsPath)).forEach(function (file) {
        if (single) {
            inputs.push(file.fsPath);
        } else {
            converter.ExecuteFile(file);
        }
    });
    if (single && inputs.length > 0) {
        inputs.push("-o");
        converter.Execute(inputs, config.get('outputFile', "Untitled"), cwd);
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let convertFile = vscode.commands.registerCommand('md2reader.convertFile', () => {
        temp.track();
        if (!vscode.window.activeTextEditor) {
            vscode.window.showErrorMessage('No active document to convert');
            return;
        }
        if (vscode.window.activeTextEditor.document.languageId != 'markdown') {
            vscode.window.showErrorMessage('This document is not a markdown file');
            return;
        }
        let targetUri = vscode.window.activeTextEditor.document.uri;
        vscode.workspace.saveAll(false).then(() => {
            let config = vscode.workspace.getConfiguration("md2reader");
            let converter = new Converter(config);
            converter.ExecuteFile(targetUri);
        });
    });

    let convertDirectory = vscode.commands.registerCommand('md2reader.convertDirectory', () => {
        temp.track();
        if (!vscode.window.activeTextEditor) {
            vscode.window.showErrorMessage('No active document to determine current directory');
            return;
        }
        let activeDir = path.dirname(vscode.window.activeTextEditor.document.uri.fsPath);
        vscode.workspace.saveAll(false).then(() => {
            let config = vscode.workspace.getConfiguration("md2reader");
            let files = findMarkdownFiles(activeDir, config.get<boolean>('recurse') || false);
            convertFiles(files, config, activeDir);
        });
    });

    let convertWorkspace = vscode.commands.registerCommand('md2reader.convertWorkspace', () => {
        temp.track();
        if (!vscode.workspace.rootPath) {
            vscode.window.showErrorMessage('No workspace opened');
            return;
        }
        let config = vscode.workspace.getConfiguration("md2reader");
        let workingDir = config.get<string>('workingDir') || ".";
        if (path.isAbsolute(workingDir)) {
            vscode.window.showErrorMessage("The working directory can only be relative to the workspace");
            return;
        }
        let findPattern = '*.md';
        if (config.get<boolean>('recurse')) {
            findPattern = path.posix.join('**', findPattern);
        }
        findPattern = path.posix.join(workingDir.replace(/\\/g, '/'), findPattern);
        vscode.workspace.saveAll(false).then(() => {
            vscode.workspace.findFiles(findPattern).then(files => {
                convertFiles(files, config, vscode.workspace.rootPath);
            });
        });
    });

    context.subscriptions.push(convertFile, convertDirectory, convertWorkspace);
}

// this method is called when your extension is deactivated
export function deactivate() {
}