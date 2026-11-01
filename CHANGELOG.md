# Change Log
All notable changes to the "md2reader" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.9.0]
- Change default conversion type to epub only
- Replace onlyActiveFile setting with separate commands to convert the current file, directory, or workspace
- Add context menu actions to convert markdown files
- Add pandocFile and kindlegenFile settings to configure executable paths
- Add pandocArgs setting to pass additional arguments to pandoc
- Automatically save modified files before conversion
- Show notification when conversion completes or fails
- Fix compatibility with recent Pandoc versions (--css option)
- Fix path resolution when no workspace is open and on Windows

## [0.8.0]
- Initial release