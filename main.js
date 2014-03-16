/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, browser: true */
/*global $, define, brackets, less */

define(function (require, exports, module) {
	"use strict";

	var AppInit        = brackets.getModule("utils/AppInit"),
		ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
		NodeConnection = brackets.getModule("utils/NodeConnection"),
		CodeInspection     = brackets.getModule("language/CodeInspection");

	// connect to the node server
	function connect(callback) {
		var connection = new NodeConnection();
		var promise = connection.connect(true);
		promise.fail(function (err) {
			callback("Could not connect to node server: " + err);
		});
		promise.done(function () {
			callback(null, connection);
		});
	}

	function loadNodeModule(moduleName, callback) {
		connect(function (err, connection) {
			if (err) {
				callback(err);
				return;
			}

			var path = ExtensionUtils.getModulePath(module, "node/" + moduleName);
			var promise = connection.loadDomains([path], true);
			promise.fail(function (err) {
				callback("Could not load node module " + moduleName + ": " + err);
			});
			promise.done(function () {
				callback(null, connection.domains[moduleName]);
			});
		});
	}

    // compile a less file
    function compileLess(text, fullPath) {

    	var deferred = $.Deferred();

		// connect to the node server
		loadNodeModule("LessCompiler", function (err, compiler) {
			if (err) {
				console.error(err);
				return;
			}
			compiler.compile(fullPath).then(deferred.resolve.bind(deferred), deferred.reject.bind(deferred));
		});

		return deferred.promise();
    }

    // register as code inspector for less files
    CodeInspection.register("less", {
        name: "less-autocompile",
        scanFile: compileLess
    });

});