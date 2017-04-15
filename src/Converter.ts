import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as childprocess from 'child_process';
import * as mkdirp from 'mkdirp';
import * as temp from 'temp';

export class Converter {
    private outputDir: string;
    private epub = false;
    private mobi = false;
    private css: string;

    constructor(config) {
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
            throw new Error("No conversion type");
        }
        this.epub = types.indexOf("epub") > -1;
        this.mobi = types.indexOf("mobi") > -1;
        try {
            childprocess.execSync("pandoc -h");
        } catch (e) {
            vscode.window.showErrorMessage("Pandoc is not installed");
            return;
        }
        if (this.mobi) {
            try {
                childprocess.execSync("kindlegen");
            } catch (e) {
                vscode.window.showErrorMessage("Kindlegen is not installed");
                this.mobi = false;
            }
        }
        this.css = config.get('cssFile') as string;
        if (this.css) {
            this.css = Converter.ResolvePath(this.css);
        } else {
            this.css = path.join(__dirname, "..", "..", "ressources", "default.css");
        }
        this.outputDir = Converter.ResolvePath(config.get('outputDir'), true);
    }

    public ExecuteFile(file) {
        let basename = path.basename(file.path);
        let name = basename.substring(0, basename.lastIndexOf('.'));
        let input = [
            file.fsPath,
            "-o"
        ];
        this.Execute(input, name);
    }

    public Execute(input, name) {
        let tempDir = temp.mkdirSync('md2reader');
        if (this.epub) {
            let args = input.concat([
                path.join(this.outputDir, name + ".epub"),
                "--epub-stylesheet=" + this.css
            ]);
            childprocess.execFile("pandoc", args, function(err, stdout, stderr) {
                console.log(stdout);
            });
        }
        if (this.mobi) {
            let html = path.join(tempDir, name + ".html");
            let args = input.concat([
                html,
                "-t",
                "HTML",
                "-s",
                "--ascii",
                "-c",
                this.css
            ]);
            let moveTo = this.outputDir;
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
                    fs.rename(path.join(tempDir, mobiFile), path.join(moveTo, mobiFile))
                });
            });
        }
    }

    private static ResolvePath(uri, dir = false) {
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
}