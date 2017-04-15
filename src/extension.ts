'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as temp from 'temp';
import { Converter } from "./Converter";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.md2reader', () => {
        temp.track();
        let config = vscode.workspace.getConfiguration("md2reader");
        let workingDir = config.get<string>('workingDir');
        if (path.isAbsolute(workingDir)) {
            vscode.window.showErrorMessage("The working directory can only be relative to the workspace");
            return
        }
        let converter = new Converter(config);
        if (config.get<boolean>("onlyActiveFile")) {
            var mode = vscode.window.activeTextEditor.document.languageId;
            if (mode != 'markdown') {
                vscode.window.showErrorMessage('This document is not a markdown file');
                return;
            }
        } else {
            let single = config.get<boolean>('singleOutput');
            let findPattern = '*.md';
            if (config.get<boolean>('recurse')) {
                findPattern = path.join('**', findPattern);
            }
            findPattern = path.join(workingDir, findPattern);
            vscode.workspace.findFiles(findPattern).then(files => {
                var inputs: Array<string> = [];
                files.sort().forEach(function (file, index) {
                    if (single) {
                        inputs.push(file.fsPath);
                    } else {
                        converter.ExecuteFile(file);
                    }
                });
                if (single) {
                    inputs.push("-o");
                    converter.Execute(inputs, config.get('outputFile', "Untitled"));
                }
            });
        }
    });
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}