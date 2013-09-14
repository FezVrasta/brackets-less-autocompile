/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, browser: true */
/*global $, define, brackets, less */

define(function (require, exports, module) {
	"use strict";

    var CodeInspection     = brackets.getModule("language/CodeInspection"),
    	NativeFileSystem   = brackets.getModule("file/NativeFileSystem").NativeFileSystem,
        FileUtils          = brackets.getModule("file/FileUtils");

    // convert errors
    function convertErrors(input) {
        var i, error, errors = [];
        for (i in input) {
            error = input[i];
            errors.push({
                pos: { line: error.line - 1, ch: error.column - 1 },
                message: error.message,
                type: CodeInspection.Type.ERROR
            });

        }
        return { errors: errors };
    }

    // write css output
    function writeCSS(text, fullPath) {
    	var extIndex, cssPath, fileEntry;
    	extIndex = fullPath.lastIndexOf(".");
    	cssPath =  (extIndex > 0 ? fullPath.substr(0, extIndex) : cssPath) + ".css";
    	fileEntry = new NativeFileSystem.FileEntry(cssPath);
    	return FileUtils.writeText(fileEntry, text);
    }

    // compile a less file
    function compileLess(text, fullPath) {
		var parser = new less.Parser({
			filename: FileUtils.getBaseName(fullPath),
			paths: [FileUtils.getDirectoryPath(fullPath)]
		});
		var result = null;
		parser.parse(text, function (err, tree) {
			if (err) {
				result = convertErrors([err]);
			} else {
				writeCSS(tree.toCSS(), fullPath).fail(function (err) {
    				console.info("Could not write css output to " + fullPath, err);
    			});		
			}
		});
		return result;
    }

    // register as code inspector for less files
    CodeInspection.register("less", {
        name: "less-autocompile",
        scanFile: compileLess
    });

});