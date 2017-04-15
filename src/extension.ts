'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as childprocess from 'child_process';
import * as mkdirp from 'mkdirp';
import * as temp from 'temp';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.md2reader', () => {
        temp.track();
        let config = vscode.workspace.getConfiguration("md2reader");
        let findPattern = '*.' + config.get('sourceType');
        if (config.get('recurse') as boolean) {
            findPattern = '**/' + findPattern
        }
        let files = vscode.workspace.findFiles(findPattern);
        let outputDir = resolve(config.get('outputDir'), true);
        let types = getTypes(config);
        let toEpub = types.indexOf("epub") > -1;
        let toMobi = types.indexOf("mobi") > -1;
        checkDependencies(toMobi);
        let css = config.get('cssFile') as string;
        if (css) {
            css = resolve(css);
        } else {
            css = path.join(__dirname, "..", "..", "ressources/default.css");
        }
        files.then((uris) => {
            uris.sort().forEach(function (uri, index) {
                let basename = path.basename(uri.path);
                let name = basename.substring(0, basename.lastIndexOf('.'));
                let pargs = [
                    uri.fsPath,
                    "-o"
                ];
                temp.mkdir('md2reader', function(err, tempDir) {
                    if (toEpub) {
                        let args = pargs.concat([
                            path.join(outputDir, name + ".epub"),
                            "--epub-stylesheet=" + css
                        ]);
                        childprocess.execFile("pandoc", args, function(err, stdout, stderr) {
                            console.log(stdout);
                        });
                    }
                    if (toMobi) {
                        let html = path.join(tempDir, name + ".html");
                        let args = pargs.concat([
                            html,
                            "-t",
                            "HTML",
                            "-s",
                            "--ascii",
                            "-c",
                            css
                        ]);
                        childprocess.execFile("pandoc", args, function(err, stdout, stderr) {
                            console.log(stdout);
                            let mobiFile = name + ".mobi";
                            args = [
                                html,
                                "-o",
                                mobiFile
                            ];
                            childprocess.execFile("kindlegen", args, function(err, stdout, stderr) {
                                console.log(stdout);
                                fs.rename(path.join(tempDir, mobiFile), path.join(outputDir, mobiFile))
                            });
                        });
                    }
                });
        })});
        //vscode.window.showInformationMessage("Files converted in " + outputDir);
    });
    context.subscriptions.push(disposable);
}

function resolve(uri, dir = false) {
    try {
        if (!path.isAbsolute(uri)) {
            uri = path.resolve(vscode.workspace.rootPath, uri);
        }
        if (!dir) {
            return uri;
        }
        if (!fs.existsSync(uri) || !fs.statSync(uri).isDirectory()) {
            mkdirp.sync(uri);
        }
        return uri;
    } catch (e) {
        vscode.window.showInformationMessage('Path not found: ' + uri);
        return vscode.workspace.rootPath;
    }
}

function checkDependencies(kindle) {
    try {
        childprocess.execSync("pandoc -h");
    } catch (e) {
        vscode.window.showErrorMessage("Pandoc is not installed");
        return;
    }
    if (!kindle)
        return;
    try {
        childprocess.execSync("kindlegen");
    } catch (e) {
        vscode.window.showErrorMessage("Kindlegen is not installed");
        return;
    }
}

function getTypes(config) {
    let type = config.get('type');
    let types : Array<string> = [];
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
    return types;
}

// this method is called when your extension is deactivated
export function deactivate() {
}