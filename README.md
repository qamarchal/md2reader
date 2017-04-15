# md2reader

Visual Studio Code extension to convert markdown to EPUB/MOBI.

## Usage

Open a folder on Visual Studio Code and choose "Convert Markdown to EPUB/MOBI" in the command palette (F1).

## Settings

By default, every file will be converted into .epub or .mobi files (choose the output type in the md2reader.type parameter), and saved into the folder specified in the md2reader.outputDir.

### Only one epub/mobi file

If you want your .md files to be merged into a single .epub or .mobi file, set the setting md2reader.singleOutput to true. The files are merged through an alphanumeric order.

### Only the active document

The md2reader.onlyActiveFile setting allows you to only convert the active file in your editor if you don't want to convert the whole workspace. There is no auto save so please save the file before converting it.

### CSS style

You can specify a css style for your epub/mobi files in the md2reader.cssFile setting. The path to this css file can be absolute or relative to you workspace.

## Requirements

Pandoc:  http://pandoc.org/installing.html

Kindlegen: https://www.amazon.com/gp/feature.html?docId=1000765211 (for MOBI conversion only)
