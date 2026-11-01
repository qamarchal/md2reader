# md2reader

Visual Studio Code extension to convert markdown to EPUB/MOBI.

## Usage

Open a markdown file or a folder on Visual Studio Code and choose "Convert Current Markdown File to EPUB/MOBI", "Convert Current Directory Markdown to EPUB/MOBI", or "Convert Workspace Markdown to EPUB/MOBI" in the command palette (F1). Modified files are automatically saved before conversion.

## Settings

By default, every file will be converted into .epub files and saved into the folder specified in md2reader.outputDir.

### Conversion types (EPUB / MOBI)

You can choose the output format(s) using the md2reader.type setting ("epub", "mobi", or both ["epub", "mobi"]). To enable MOBI conversion, make sure [Kindlegen](#requirements) is installed and add "mobi" to your VS Code settings ("md2reader.type": ["epub", "mobi"], or "md2reader.type": "mobi" for MOBI only).

### Only one epub/mobi file

If you want your .md files in the workspace to be merged into a single .epub or .mobi file, set the setting md2reader.singleOutput to true. The files are merged through an alphanumeric order.

### CSS style

You can specify a css style for your epub/mobi files in the md2reader.cssFile setting. The path to this css file can be absolute or relative to you workspace.

### Executable files

If pandoc or kindlegen are not in your system PATH, you can specify their full executable paths using "md2reader.pandocFile" and "md2reader.kindlegenFile".

### Additional Pandoc arguments

You can pass additional arguments to pandoc (such as "--toc" or "--epub-cover-image=cover.jpg") using the "md2reader.pandocArgs" setting.

## Requirements

Pandoc:  http://pandoc.org/installing.html

Kindlegen: https://www.amazon.com/gp/feature.html?docId=1000765211 (for MOBI conversion only)
