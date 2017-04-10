'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as childprocess from 'child_process';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.md2reader', () => {
        
        let config = vscode.workspace.getConfiguration("md2reader");
        let findPattern = '*.' + config.get('inputType');
        if (config.get('recurse') as boolean) {
            findPattern = '**/' + findPattern
        }
        let files = vscode.workspace.findFiles(findPattern);
        let outputDir = getOutputDir(config.get('outputDir'));
        let type = config.get('type');
        let types = [];
        if (typeof type == 'string') {
            types = [type];
        } else {
            for (var index in type) {
                types.push(type[index]);
            }
        }
        if (types.length == 0) {
            vscode.window.showErrorMessage("No conversion type");
            return;
        }
        let fromHTMLTypes = [];
        let toEpub = false;
        types.forEach(function (type, index) {
            if (type === "epub") {
                toEpub = true;
            } else {
                fromHTMLTypes.push(type[index]);
            }
        });
        files.then((uris) => {
            uris.sort().forEach(function (uri, index) {
                let basename = path.basename(uri.path);
                let name = basename.substring(0, basename.lastIndexOf('.'));
                let pandoc = "pandoc " + uri.fsPath + " -o ";
                if (toEpub) {
                    let cmd = pandoc + path.join(outputDir, name + ".epub");
                    childprocess.exec(cmd, function(err, stdout, stderr) {
                        console.log("Executing command: " + cmd);
                        if (err)
                            console.log(err);
                    });
                }
                if (fromHTMLTypes.length > 0) {
                    let htmlFile = path.join(outputDir, name + ".html");
                    let b = path.join(outputDir, name + "_b");
                    let a = path.join(outputDir, name + "_a");
                    fs.writeFileSync(b, "<div style=\"text-align: justify; text-justify: inter-word; font-size:small\">", "utf-8");
                    fs.writeFileSync(a, "</div>", "utf-8");
                    let cmd = pandoc + htmlFile + " -t HTML -s --ascii -B " + b + " -A " + a;
                    childprocess.exec(cmd, function(err, stdout, stderr) {
                        console.log("Executing command: " + cmd);
                        if (err)
                            console.log(err);
                        cmd = "kindlegen " + htmlFile;
                        childprocess.exec(cmd, function(err, stdout, stderr) {
                            console.log("Executing command: " + cmd);
                            if (err)
                                console.log(err);
                            fs.unlink(htmlFile);
                            fs.unlink(a);
                            fs.unlink(b);
                        });
                    });
                }
        })});
        vscode.window.showInformationMessage("Done");
    });
    context.subscriptions.push(disposable);
}

function getOutputDir(outputDir) {
    let warn = 'Output directory does not exist : ' + outputDir;
    try {
        if (path.isAbsolute(outputDir) && fs.existsSync(outputDir) && fs.statSync(outputDir).isDirectory()) {
            return outputDir;
        }
        let outputPath = path.join(vscode.workspace.rootPath, outputDir)
        if (fs.existsSync(outputPath) && fs.statSync(outputPath).isDirectory()) {
            return outputPath;
        }
        vscode.window.showInformationMessage(warn);
        if (!outputDir.includes('/') && !outputDir.includes('\\')) {
            fs.mkdir(outputPath);
            return outputPath;
        }
    } catch (e) {
        vscode.window.showInformationMessage(warn);
    }
    return vscode.workspace.rootPath;
}

// this method is called when your extension is deactivated
export function deactivate() {
}