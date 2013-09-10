/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, browser: true */
/*global $, define, brackets, less */

define(function (require, exports, module) {
	"use strict";

    var CodeInspection     = brackets.getModule("language/CodeInspection"),
    	NativeFileSystem   = brackets.getModule("file/NativeFileSystem").NativeFileSystem,
        FileUtils          = brackets.getModule("file/FileUtils");

    // write css output
    function writeCSS(text, lessPath) {
    	var extIndex, cssPath, fileEntry;
    	extIndex = fullPath.lastIndexOf(".");
    	cssPath =  (extIndex > 0 ? lessPath.substr(0, extIndex - 1) : cssPath) + ".css";
    	fileEntry = new NativeFileSystem.FileEntry(cssPath);
    	return FileUtils.writeText(fileEntry, text);
    }

    // compile a less file
    function compileLess(text, fullPath) {
		var parser = new less.Parser({
			filename: fullPath.path.basename(lessFile),
			paths: [fullPath.dirname(lessFile)]
		});
		var result = null;
		parser.parse(text, function (err, tree) {
			if (err) {
				result = { errors: err };
			} else {
				writeCSS(tree.toCSS(), fullPath).fail(function (err) {
    				console.info("Could not write css output to " + fullPath, err);
    			});		
			}
		});
		return result;
    }

    // Register for LESS files
    CodeInspection.register("less", {
        name: "less-autocompile",
        scanFile: compileLess
    });

});