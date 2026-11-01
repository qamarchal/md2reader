import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as childprocess from 'child_process';
import * as mkdirp from 'mkdirp';
import * as temp from 'temp';

export class Converter {
    private outputDir: string = "";
    private epub = false;
    private mobi = false;
    private css: string = "";
    private pandoc: string = "pandoc";
    private kindlegen: string = "kindlegen";

    constructor(config: vscode.WorkspaceConfiguration) {
        let type = config.get<string | Array<string>>('type');
        let types : Array<string> = [];
        if (typeof type == 'string') {
            types = [type];
        } else if (type) {
            for (var index in type) {
                types.push(type[index]);
            }
        }
        if (types.length == 0) {
            throw new Error("No conversion type");
        }
        this.epub = types.indexOf("epub") > -1;
        this.mobi = types.indexOf("mobi") > -1;
        this.pandoc = config.get('pandocFile') || "pandoc";
        this.kindlegen = config.get('kindlegenFile') || "kindlegen";
        if (childprocess.spawnSync(this.pandoc, ["-v"]).error) {
            vscode.window.showErrorMessage("Pandoc is not installed");
            this.epub = false;
            this.mobi = false;
            return;
        }
        if (this.mobi) {
            if (childprocess.spawnSync(this.kindlegen).error) {
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
        this.outputDir = Converter.ResolvePath(config.get<string>('outputDir') || ".", true);
    }

    public ExecuteFile(file: vscode.Uri) {
        let basename = path.basename(file.path);
        let name = basename.substring(0, basename.lastIndexOf('.'));
        let input = [
            file.fsPath,
            "-o"
        ];
        this.Execute(input, name);
    }

    public Execute(input: Array<string>, name: string) {
        let tempDir = temp.mkdirSync('md2reader');
        if (this.epub) {
            let args = input.concat([
                path.join(this.outputDir, name + ".epub"),
                "--css=" + this.css
            ]);
            childprocess.execFile(this.pandoc, args, function(err, stdout, stderr) {
                if (err) {
                    vscode.window.showErrorMessage(stderr || err.message);
                }
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
            let kindlegen = this.kindlegen;
            childprocess.execFile(this.pandoc, args, function(err, stdout, stderr) {
                if (err) {
                    vscode.window.showErrorMessage(stderr || err.message);
                    return;
                }
                console.log(stdout);
                let mobiFile = name + ".mobi";
                args = [
                    html,
                    "-o",
                    mobiFile
                ];
                childprocess.execFile(kindlegen, args, function(err, stdout, stderr) {
                    if (err && !fs.existsSync(path.join(tempDir, mobiFile))) {
                        vscode.window.showErrorMessage(stderr || stdout || err.message);
                        return;
                    }
                    console.log(stdout);
                    fs.rename(path.join(tempDir, mobiFile), path.join(moveTo, mobiFile), () => {});
                });
            });
        }
    }

    private static ResolvePath(uri: string, dir = false): string {
        let basePath = vscode.workspace.rootPath || "";
        if (!basePath && vscode.window.activeTextEditor) {
            basePath = path.dirname(vscode.window.activeTextEditor.document.uri.fsPath);
        }
        try {
            if (!path.isAbsolute(uri)) {
                uri = path.resolve(basePath, uri);
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
            return basePath;
        }
    }
}