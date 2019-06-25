"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
var ts = require("typescript");
var path = require("path");
var level = {
    none: 0,
    error: 1,
    warn: 2,
    trace: 3,
    info: 4
};
var Logger = (function () {
    function Logger() {
    }
    Logger.setLevel = function (level) {
        this.logLevel = level;
    };
    Logger.setName = function (name) {
        this.logName = name;
    };
    Logger.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log.apply(console, [chalk_1.default.gray("[" + this.logName + "]")].concat(args));
    };
    Logger.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.logLevel < level.info) {
            return;
        }
        console.log.apply(console, [chalk_1.default.gray("[" + this.logName + "]" + chalk_1.default.blue(" INFO: "))].concat(args));
    };
    Logger.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.logLevel < level.warn) {
            return;
        }
        console.log.apply(console, ["[" + this.logName + "]" + chalk_1.default.yellow(" WARNING: ")].concat(args));
    };
    Logger.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.logLevel < level.error) {
            return;
        }
        console.log.apply(console, ["[" + this.logName + "]" + chalk_1.default.red(" ERROR: ")].concat(args));
    };
    Logger.trace = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.logLevel < level.error) {
            return;
        }
        console.log.apply(console, ["[" + this.logName + "]" + chalk_1.default.gray(" TRACE: ")].concat(args));
    };
    return Logger;
}());
Logger.logLevel = level.none;
Logger.logName = "logger";
var PackageType;
(function (PackageType) {
    PackageType[PackageType["None"] = 0] = "None";
    PackageType[PackageType["Library"] = 1] = "Library";
    PackageType[PackageType["Component"] = 2] = "Component";
})(PackageType || (PackageType = {}));
var BundlePackage = (function () {
    function BundlePackage(packageType, packageNamespace) {
        this.packageNamespace = undefined;
        this.packageType = packageType;
        this.packageNamespace = packageNamespace;
    }
    BundlePackage.prototype.getPackageType = function () {
        return this.packageType;
    };
    BundlePackage.prototype.getPackageNamespace = function () {
        return this.packageNamespace;
    };
    return BundlePackage;
}());
var Utils;
(function (Utils) {
    function forEach(array, callback) {
        if (array) {
            for (var i = 0, len = array.length; i < len; i++) {
                var result = callback(array[i], i);
                if (result) {
                    return result;
                }
            }
        }
        return undefined;
    }
    Utils.forEach = forEach;
    function contains(array, value) {
        if (array) {
            for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
                var v = array_1[_i];
                if (v === value) {
                    return true;
                }
            }
        }
        return false;
    }
    Utils.contains = contains;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function hasProperty(map, key) {
        return hasOwnProperty.call(map, key);
    }
    Utils.hasProperty = hasProperty;
    function clone(object) {
        var result = {};
        for (var id in object) {
            result[id] = object[id];
        }
        return result;
    }
    Utils.clone = clone;
    function map(array, f) {
        var result;
        if (array) {
            result = [];
            for (var _i = 0, array_2 = array; _i < array_2.length; _i++) {
                var v = array_2[_i];
                result.push(f(v));
            }
        }
        return result;
    }
    Utils.map = map;
    function extend(first, second) {
        var sentinal = 1;
        var result = {};
        for (var id in first) {
            result[id] = first[id];
        }
        for (var id in second) {
            if (!hasProperty(result, id)) {
                result[id] = second[id];
            }
        }
        return result;
    }
    Utils.extend = extend;
    function replaceAt(str, index, character) {
        return str.substr(0, index) + character + str.substr(index + character.length);
    }
    Utils.replaceAt = replaceAt;
})(Utils || (Utils = {}));
var TsCore;
(function (TsCore) {
    function fileExtensionIs(path, extension) {
        var pathLen = path.length;
        var extLen = extension.length;
        return pathLen > extLen && path.substr(pathLen - extLen, extLen) === extension;
    }
    TsCore.fileExtensionIs = fileExtensionIs;
    TsCore.supportedExtensions = [".ts", ".tsx", ".d.ts"];
    TsCore.moduleFileExtensions = TsCore.supportedExtensions;
    function isSupportedSourceFileName(fileName) {
        if (!fileName) {
            return false;
        }
        for (var _i = 0, supportedExtensions_1 = TsCore.supportedExtensions; _i < supportedExtensions_1.length; _i++) {
            var extension = supportedExtensions_1[_i];
            if (fileExtensionIs(fileName, extension)) {
                return true;
            }
        }
        return false;
    }
    TsCore.isSupportedSourceFileName = isSupportedSourceFileName;
    function getSourceFileFromSymbol(symbol) {
        var declarations = symbol.getDeclarations();
        if (declarations && declarations.length > 0) {
            if (declarations[0].kind === ts.SyntaxKind.SourceFile) {
                return declarations[0].getSourceFile();
            }
        }
        return undefined;
    }
    TsCore.getSourceFileFromSymbol = getSourceFileFromSymbol;
    function getExternalModuleName(node) {
        if (node.kind === ts.SyntaxKind.ImportDeclaration) {
            return node.moduleSpecifier;
        }
        if (node.kind === ts.SyntaxKind.ImportEqualsDeclaration) {
            var reference = node.moduleReference;
            if (reference.kind === ts.SyntaxKind.ExternalModuleReference) {
                return reference.expression;
            }
        }
        if (node.kind === ts.SyntaxKind.ExportDeclaration) {
            return node.moduleSpecifier;
        }
        return undefined;
    }
    TsCore.getExternalModuleName = getExternalModuleName;
    function createDiagnostic(message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        // FUTURE: Typescript 1.8.x supports localized diagnostic messages.
        var textUnique123 = message.message;
        if (arguments.length > 1) {
            textUnique123 = formatStringFromArgs(textUnique123, arguments, 1);
        }
        return {
            file: undefined,
            start: undefined,
            length: undefined,
            messageText: textUnique123,
            category: message.category,
            code: message.code
        };
    }
    TsCore.createDiagnostic = createDiagnostic;
    function formatStringFromArgs(text, args, baseIndex) {
        baseIndex = baseIndex || 0;
        return text.replace(/{(\d+)}/g, function (match, index) {
            return args[+index + baseIndex];
        });
    }
    // An alias symbol is created by one of the following declarations:
    // import <symbol> = ...
    // import <symbol> from ...
    // import * as <symbol> from ...
    // import { x as <symbol> } from ...
    // export { x as <symbol> } from ...
    // export = ...
    // export default ...
    function isAliasSymbolDeclaration(node) {
        return node.kind === ts.SyntaxKind.ImportEqualsDeclaration ||
            node.kind === ts.SyntaxKind.ImportClause && !!node.name ||
            node.kind === ts.SyntaxKind.NamespaceImport ||
            node.kind === ts.SyntaxKind.ImportSpecifier ||
            node.kind === ts.SyntaxKind.ExportSpecifier ||
            node.kind === ts.SyntaxKind.ExportAssignment && node.expression.kind === ts.SyntaxKind.Identifier;
    }
    TsCore.isAliasSymbolDeclaration = isAliasSymbolDeclaration;
    function normalizeSlashes(path) {
        return path.replace(/\\/g, "/");
    }
    TsCore.normalizeSlashes = normalizeSlashes;
    function outputExtension(path) {
        return path.replace(/\.ts/, ".js");
    }
    TsCore.outputExtension = outputExtension;
})(TsCore || (TsCore = {}));
var IdGenerator = (function () {
    function IdGenerator() {
    }
    IdGenerator.getNextId = function () {
        return this.nextId++;
    };
    return IdGenerator;
}());
IdGenerator.nextId = 1;
var BundleContainer = (function () {
    function BundleContainer(name, sourceFile, isBundleModule, parent) {
        this.parent = undefined;
        this.children = [];
        this.modules = [];
        this.modulesAdded = {};
        this.name = name;
        this.sourceFile = sourceFile;
        this.isBundleModule = isBundleModule;
        this.parent = parent;
        this.id = IdGenerator.getNextId();
    }
    BundleContainer.prototype.addModule = function (module, fileName) {
        if (!Utils.hasProperty(this.modulesAdded, fileName)) {
            this.modules.push(module);
            // TJT: This should be module.fileName
            this.modulesAdded[fileName] = true;
        }
    };
    BundleContainer.prototype.isBundle = function () {
        return this.isBundleModule;
    };
    BundleContainer.prototype.getModules = function () {
        return this.modules;
    };
    // API: should be called add()
    BundleContainer.prototype.addChild = function (container) {
        this.children.push(container);
    };
    BundleContainer.prototype.getChildren = function () {
        return this.children;
    };
    BundleContainer.prototype.getParent = function () {
        return this.parent;
    };
    // TJT: Why Name and FileName?
    BundleContainer.prototype.getName = function () {
        return this.name;
    };
    BundleContainer.prototype.getFileName = function () {
        return this.sourceFile.fileName;
    };
    BundleContainer.prototype.getId = function () {
        return this.id;
    };
    return BundleContainer;
}());
var ModuleDescriptor = (function () {
    function ModuleDescriptor(node, dependencies, sourceFile, symbol, isBundleModule, container) {
        // Map of container ids that this module has been referenced in
        this.containers = {};
        // TJT: Why isn't this an array of ModuleModuleDescriptors? Array of external dependencies
        this.dependencies = [];
        this.node = node;
        this.dependencies = dependencies;
        this.sourceFile = sourceFile;
        this.symbol = symbol;
        this.isBundleModule = isBundleModule;
        // TJT: Add the container that this module has been found in?
        this.containers[container.getId().toString()] = container;
    }
    ModuleDescriptor.prototype.getNode = function () {
        return this.node;
    };
    ModuleDescriptor.prototype.getDependencies = function () {
        return this.dependencies;
    };
    ModuleDescriptor.prototype.getContainers = function () {
        return this.containers;
    };
    ModuleDescriptor.prototype.getFileName = function () {
        return this.sourceFile.fileName;
    };
    ModuleDescriptor.prototype.getSourceFile = function () {
        return this.sourceFile;
    };
    ModuleDescriptor.prototype.isContainer = function () {
        return this.isBundleModule;
    };
    ModuleDescriptor.prototype.isExternalModule = function () {
        return (this.sourceFile.externalModuleIndicator != undefined);
    };
    return ModuleDescriptor;
}());
var Ast;
(function (Ast) {
    function getModifierFlags(node) {
        var flags = ts.ModifierFlags.None;
        if (node.modifiers) {
            for (var _i = 0, _a = node.modifiers; _i < _a.length; _i++) {
                var modifier = _a[_i];
                flags |= modifierToFlag(modifier.kind);
            }
        }
        return flags;
    }
    Ast.getModifierFlags = getModifierFlags;
    function getJsDocTags(symbol) {
        // Call getDocumentationComment() to generate the JsDocTags for the symbol( the node ).
        // For some reason a ts.getDocumentationTags() is not exposed.
        symbol.getDocumentationComment(undefined);
        if (symbol.declarations) {
            return symbol.declarations[0].jsDocCache;
        }
        return undefined;
    }
    Ast.getJsDocTags = getJsDocTags;
    function modifierToFlag(token) {
        switch (token) {
            case ts.SyntaxKind.StaticKeyword: return ts.ModifierFlags.Static;
            case ts.SyntaxKind.PublicKeyword: return ts.ModifierFlags.Public;
            case ts.SyntaxKind.ProtectedKeyword: return ts.ModifierFlags.Protected;
            case ts.SyntaxKind.PrivateKeyword: return ts.ModifierFlags.Private;
            case ts.SyntaxKind.AbstractKeyword: return ts.ModifierFlags.Abstract;
            case ts.SyntaxKind.ExportKeyword: return ts.ModifierFlags.Export;
            case ts.SyntaxKind.DeclareKeyword: return ts.ModifierFlags.Ambient;
            case ts.SyntaxKind.ConstKeyword: return ts.ModifierFlags.Const;
            case ts.SyntaxKind.DefaultKeyword: return ts.ModifierFlags.Default;
            case ts.SyntaxKind.AsyncKeyword: return ts.ModifierFlags.Async;
            case ts.SyntaxKind.ReadonlyKeyword: return ts.ModifierFlags.Readonly;
        }
        return ts.ModifierFlags.None;
    }
    Ast.modifierToFlag = modifierToFlag;
    function isSourceCodeFile(file) {
        return (file.kind === ts.SyntaxKind.SourceFile && !file.isDeclarationFile);
    }
    Ast.isSourceCodeFile = isSourceCodeFile;
    function isSourceCodeModule(symbol) {
        var declarations = symbol.getDeclarations();
        if (declarations && declarations.length > 0) {
            var declaration = symbol.getDeclarations()[0];
            return ((declaration.kind === ts.SyntaxKind.SourceFile) && !(declaration.isDeclarationFile));
        }
        return false;
    }
    Ast.isSourceCodeModule = isSourceCodeModule;
    function isAmbientModule(symbol) {
        var declarations = symbol.getDeclarations();
        if (declarations && declarations.length > 0) {
            var declaration = symbol.getDeclarations()[0];
            if (declaration.kind === ts.SyntaxKind.ModuleDeclaration) {
                if (declaration.modifiers) {
                    for (var _i = 0, _a = declaration.modifiers; _i < _a.length; _i++) {
                        var modifier = _a[_i];
                        if (modifier.kind === ts.SyntaxKind.DeclareKeyword) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    Ast.isAmbientModule = isAmbientModule;
    function getSourceFileOfNode(node) {
        while (node && node.kind !== ts.SyntaxKind.SourceFile) {
            node = node.parent;
        }
        return node;
    }
    Ast.getSourceFileOfNode = getSourceFileOfNode;
    function getSymbolUID(symbol) {
        if (!symbol) {
            return undefined;
        }
        var id = symbol.id;
        // Try to get the symbol id from the value declaration
        if (id === undefined && symbol.valueDeclaration) {
            id = symbol.valueDeclaration.symbol.id;
        }
        return id ? id.toString() : undefined;
    }
    Ast.getSymbolUID = getSymbolUID;
})(Ast || (Ast = {}));
var StatisticsReporter = (function () {
    function StatisticsReporter() {
    }
    StatisticsReporter.prototype.reportTitle = function (name) {
        Logger.log(name);
    };
    StatisticsReporter.prototype.reportValue = function (name, value) {
        Logger.log(this.padRight(name + ":", 25) + chalk_1.default.magenta(this.padLeft(value.toString(), 10)));
    };
    StatisticsReporter.prototype.reportCount = function (name, count) {
        this.reportValue(name, "" + count);
    };
    StatisticsReporter.prototype.reportTime = function (name, time) {
        this.reportValue(name, (time / 1000).toFixed(2) + "s");
    };
    StatisticsReporter.prototype.reportPercentage = function (name, percentage) {
        this.reportValue(name, percentage.toFixed(2) + "%");
    };
    StatisticsReporter.prototype.padLeft = function (s, length) {
        while (s.length < length) {
            s = " " + s;
        }
        return s;
    };
    StatisticsReporter.prototype.padRight = function (s, length) {
        while (s.length < length) {
            s = s + " ";
        }
        return s;
    };
    return StatisticsReporter;
}());
var BundleParser = (function () {
    function BundleParser() {
    }
    BundleParser.prototype.parseConfigFile = function (json, basePath) {
        var errors = [];
        return {
            bundles: getBundles(),
            errors: errors
        };
        function getBundles() {
            var bundles = [];
            var jsonBundles = json["bundles"];
            if (jsonBundles) {
                Logger.info(jsonBundles);
                for (var id in jsonBundles) {
                    Logger.info("Bundle Id: ", id, jsonBundles[id]);
                    var jsonBundle = jsonBundles[id];
                    var bundleName;
                    var fileNames = [];
                    var config = {};
                    // Name
                    bundleName = path.join(basePath, id);
                    // Files..
                    if (Utils.hasProperty(jsonBundle, "files")) {
                        if (jsonBundle["files"] instanceof Array) {
                            fileNames = Utils.map(jsonBundle["files"], function (s) { return path.join(basePath, s); });
                            Logger.info("bundle files: ", fileNames);
                        }
                        else {
                            errors.push(TsCore.createDiagnostic({ code: 6063, category: ts.DiagnosticCategory.Error, key: "Bundle_0_files_is_not_an_array_6063", message: "Bundle '{0}' files is not an array." }, id));
                        }
                    }
                    else {
                        errors.push(TsCore.createDiagnostic({ code: 6062, category: ts.DiagnosticCategory.Error, key: "Bundle_0_requires_an_array_of_files_6062", message: "Bundle '{0}' requires an array of files." }, id));
                    }
                    // Config..
                    if (Utils.hasProperty(jsonBundle, "config")) {
                        config = jsonBundle.config;
                    }
                    config.package = parsePackageConfig(config);
                    bundles.push({ name: bundleName, fileNames: fileNames, config: config });
                }
            }
            return bundles;
        }
        function parsePackageConfig(config) {
            // TODO: Add diagnostics for input errors..
            var bundlePackageType = PackageType.None;
            var bundlePackageNamespace = undefined;
            var packageTypeMap = {
                "none": PackageType.None,
                "library": PackageType.Library,
                "component": PackageType.Component
            };
            if (Utils.hasProperty(config, "package")) {
                var packageType = config["package"];
                if (typeof (packageType) === "string") {
                    if (Utils.hasProperty(packageTypeMap, packageType.toLowerCase())) {
                        bundlePackageType = packageTypeMap[packageType.toLowerCase()];
                    }
                }
            }
            if (Utils.hasProperty(config, "packageNamespace")) {
                var packageNamespace = config["packageNamespace"];
                if (typeof (packageNamespace) === "string") {
                    bundlePackageNamespace = packageNamespace;
                }
            }
            return new BundlePackage(bundlePackageType, bundlePackageNamespace);
        }
    };
    return BundleParser;
}());
var BundleBuildResult = (function () {
    function BundleBuildResult(errors, bundleSource) {
        this.errors = errors;
        this.bundleSource = bundleSource;
    }
    BundleBuildResult.prototype.getBundleSource = function () {
        return this.bundleSource;
    };
    BundleBuildResult.prototype.getErrors = function () {
        return this.errors;
    };
    BundleBuildResult.prototype.succeeded = function () {
        return (this.errors.length == 0);
    };
    return BundleBuildResult;
}());
var DependencyBuilder = (function () {
    function DependencyBuilder(host, program) {
        this.bundleModuleStack = [];
        this.host = host;
        this.program = program;
        this.options = this.program.getCompilerOptions();
    }
    /**
     * Returns a chained module container. Each container stores an ordered array of dependencies ( import or exports ) found in the given source file.
     * @param sourceFile { SourceFile } The input source file used to .
     */
    DependencyBuilder.prototype.getSourceFileDependencies = function (sourceFile) {
        var canonicalSourceFileName = this.host.getCanonicalFileName(sourceFile.fileName);
        // Set the initial global ( is this top level ) module container for the input source file.
        this.globalBundle = new BundleContainer(canonicalSourceFileName, sourceFile, /* isBundleNamespace */ false /* no parent container */);
        this.bundleModuleStack.push(this.globalBundle);
        // Walk the module dependency tree
        this.walkModuleDependencies(sourceFile);
        return this.globalBundle;
    };
    DependencyBuilder.prototype.walkModuleDependencies = function (moduleSourceFile) {
        var self = this;
        var visitedModulesByContainer = [];
        var visitedModules = {};
        var moduleDescriptors = {};
        /**
         * Recursive function used to generate module descriptors for dependencies.
         */
        function visitDependencies(moduleSource, dependencyNodes) {
            var isNextContainer = self.isNextContainer(moduleSource);
            if (isNextContainer) {
                visitedModulesByContainer.push(visitedModules);
                visitedModules = {};
            }
            // Loop through each dependency node and create a module descriptor for each
            dependencyNodes.forEach(function (dependencyNode) {
                var dependencySymbol = self.getSymbolFromNode(dependencyNode);
                var dependencySourceFile = self.getSourceFileFromSymbol(dependencySymbol);
                var moduleDescriptor;
                // TJT: We should look for aliases: import * as alias from moduleSpecifier. Set up a test for this.
                if (!Utils.hasProperty(moduleDescriptors, dependencySymbol.name)) {
                    Logger.trace("New module descriptor for: ", dependencySymbol.name);
                    var dependencyNodes_1 = [];
                    var isBundleModule = false;
                    if (!dependencySourceFile.isDeclarationFile) {
                        dependencyNodes_1 = self.getModuleDependencyNodes(dependencySourceFile);
                        // Look for our @bundlemodule annotation specifying an "internal" bundle module.
                        isBundleModule = self.hasModuleAnnotation(dependencySourceFile);
                    }
                    // TJT: Not all args needed. Review before release.
                    moduleDescriptor = new ModuleDescriptor(dependencyNode, dependencyNodes_1, dependencySourceFile, dependencySymbol, isBundleModule, self.currentContainer());
                    moduleDescriptors[dependencySymbol.name] = moduleDescriptor;
                }
                else {
                    moduleDescriptor = moduleDescriptors[dependencySymbol.name];
                }
                // We don't need to walk dependencies within declaration files
                if (!dependencySourceFile.isDeclarationFile) {
                    if (!Utils.hasProperty(visitedModules, dependencySymbol.name)) {
                        visitedModules[dependencySymbol.name] = true;
                        visitDependencies(dependencySourceFile, moduleDescriptor.getDependencies());
                    }
                }
                // Update current module container ordered dependencies...                
                if (dependencySourceFile.isDeclarationFile) {
                    // All top-level dependency module descriptors are added to the global scoped, top-level bundle container
                    self.globalBundle.addModule(moduleDescriptor, dependencySymbol.name);
                }
                else {
                    // Add the module to the current bundle module container.
                    self.currentContainer().addModule(moduleDescriptor, dependencySymbol.name);
                }
            });
            if (isNextContainer) {
                self.restoreContainer();
                visitedModules = visitedModulesByContainer.pop();
            }
        }
        // Start off the dependency building process...
        visitDependencies(moduleSourceFile, this.getModuleDependencyNodes(moduleSourceFile));
    };
    DependencyBuilder.prototype.getModuleDependencyNodes = function (sourceFile) {
        // We are only interested in source code files ( not declaration files )
        if (!Ast.isSourceCodeFile(sourceFile)) {
            return [];
        }
        var dependencyNodes = [];
        var self = this;
        // Search the source file module/node for dependencies...
        function getNodeDependencies(searchNode) {
            ts.forEachChild(searchNode, function (node) {
                if (node.kind === ts.SyntaxKind.ImportDeclaration ||
                    node.kind === ts.SyntaxKind.ImportEqualsDeclaration ||
                    node.kind === ts.SyntaxKind.ExportDeclaration) {
                    var moduleNameExpr = TsCore.getExternalModuleName(node);
                    if (moduleNameExpr && moduleNameExpr.kind === ts.SyntaxKind.StringLiteral) {
                        var moduleSymbol = self.program.getTypeChecker().getSymbolAtLocation(moduleNameExpr);
                        if (moduleSymbol) {
                            dependencyNodes.push(node);
                        }
                    }
                }
                else if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
                    // For a namespace ( or module ), traverse the body to locate ES6 module dependencies.
                    // TJT: This section needs to be reviewed. Should namespace/module syntax kinds be scanned or
                    //      Do we only support ES6 import/export syntax, where dependencies must be declared top level?
                    //
                    // NOTES: We will only support ES6 import/export module syntax
                    var moduleDeclaration = node;
                    if ((moduleDeclaration.name.kind === ts.SyntaxKind.StringLiteral) &&
                        (Ast.getModifierFlags(moduleDeclaration) & ts.ModifierFlags.Ambient || sourceFile.isDeclarationFile)) {
                        // An AmbientExternalModuleDeclaration declares an external module.
                        Logger.info("Scanning for dependencies within ambient module declaration: ", moduleDeclaration.name.text);
                        getNodeDependencies(moduleDeclaration.body);
                    }
                }
            });
        }
        ;
        getNodeDependencies(sourceFile);
        return dependencyNodes;
    };
    DependencyBuilder.prototype.hasModuleAnnotation = function (sourceFile) {
        // Look for our bundlemodule annotation.
        var sourceText = sourceFile.getFullText();
        var commentRanges = ts.getLeadingCommentRanges(sourceText, 0);
        return Utils.forEach(commentRanges, function (commentRange) {
            var comment = sourceText.substring(commentRange.pos, commentRange.end);
            return comment.indexOf("@bundlemodule") >= 0;
        });
    };
    DependencyBuilder.prototype.getModuleAnnotationName = function (sourceFile) {
        var bundleModuleNamespaceRegex = /\{(.*?)\}/;
        var sourceText = sourceFile.getFullText();
        var commentRanges = ts.getLeadingCommentRanges(sourceText, 0);
        for (var _i = 0, commentRanges_1 = commentRanges; _i < commentRanges_1.length; _i++) {
            var commentRange = commentRanges_1[_i];
            var comment = sourceText.substring(commentRange.pos, commentRange.end);
            if (comment.indexOf("@bundlemodule") >= 0) {
                var namespaceNameMatch = bundleModuleNamespaceRegex.exec(comment);
                if (namespaceNameMatch) {
                    return namespaceNameMatch[0].replace("{", "").replace("}", "").trim();
                }
            }
        }
        return undefined;
    };
    DependencyBuilder.prototype.currentContainer = function () {
        return this.bundleModuleStack[this.bundleModuleStack.length - 1];
    };
    DependencyBuilder.prototype.restoreContainer = function () {
        return this.bundleModuleStack.pop();
    };
    DependencyBuilder.prototype.isNextContainer = function (sourceFile) {
        if (this.hasModuleAnnotation(sourceFile)) {
            var moduleName = this.getModuleAnnotationName(sourceFile);
            // TODO: How to handle missing module name? 
            // 1) Generate an error?
            // 2) Generate a module name from symbol name?
            if (!moduleName) {
                moduleName = "missing_module_name";
            }
            var nextModule = new BundleContainer(moduleName, sourceFile, true, this.currentContainer());
            // Before changing the current container we must first add the new container to the children of the current container.
            var currentModule = this.currentContainer();
            // Add new container context to the exising current container
            currentModule.addChild(nextModule);
            this.bundleModuleStack.push(nextModule);
            return true;
        }
        return false;
    };
    DependencyBuilder.prototype.isExternalModuleImportEqualsDeclaration = function (node) {
        return node.kind === ts.SyntaxKind.ImportEqualsDeclaration && node.moduleReference.kind === ts.SyntaxKind.ExternalModuleReference;
    };
    DependencyBuilder.prototype.getExternalModuleImportEqualsDeclarationExpression = function (node) {
        return node.moduleReference.expression;
    };
    DependencyBuilder.prototype.getSymbolFromNode = function (node) {
        var moduleNameExpr = TsCore.getExternalModuleName(node);
        if (moduleNameExpr && moduleNameExpr.kind === ts.SyntaxKind.StringLiteral) {
            return this.program.getTypeChecker().getSymbolAtLocation(moduleNameExpr);
        }
        return undefined;
    };
    DependencyBuilder.prototype.getSourceFileFromSymbol = function (importSymbol) {
        var declaration = importSymbol.getDeclarations()[0];
        return declaration.getSourceFile();
    };
    return DependencyBuilder;
}());
var BundleBuilder = (function () {
    function BundleBuilder(host, program, bundlerOptions) {
        this.dependencyTime = 0;
        this.dependencyWalkTime = 0;
        this.emitTime = 0;
        this.buildTime = 0;
        this.bundleCodeText = "";
        this.bundleImportText = "";
        this.bundleImportedFiles = {};
        this.bundleModuleImports = {};
        this.bundleSourceFiles = {};
        this.host = host;
        this.program = program;
        this.options = bundlerOptions;
    }
    BundleBuilder.prototype.build = function (bundle) {
        this.bundle = bundle;
        this.buildTime = new Date().getTime();
        var dependencyBuilder = new DependencyBuilder(this.host, this.program);
        // Construct bundle output file name
        var bundleBaseDir = path.dirname(bundle.name);
        if (bundle.config.outDir) {
            bundleBaseDir = path.join(bundleBaseDir, bundle.config.outDir);
        }
        var bundleFilePath = path.join(bundleBaseDir, path.basename(bundle.name));
        bundleFilePath = TsCore.normalizeSlashes(bundleFilePath);
        this.bundleCodeText = "";
        this.bundleImportText = "";
        this.bundleImportedFiles = {};
        this.bundleModuleImports = {};
        this.bundleSourceFiles = {};
        // Look for tsx source files in bundle name or bundle dependencies.
        // Output tsx for bundle extension if typescript react files found.
        var isBundleTsx = false;
        var allDependencies = [];
        for (var filesKey in bundle.fileNames) {
            var fileName = bundle.fileNames[filesKey];
            Logger.info(">>> Processing bundle entry input file:", fileName);
            var bundleSourceFileName = this.host.getCanonicalFileName(TsCore.normalizeSlashes(fileName));
            Logger.info("BundleSourceFileName:", bundleSourceFileName);
            var bundleSourceFile = this.program.getSourceFile(bundleSourceFileName);
            if (!bundleSourceFile) {
                var diagnostic = TsCore.createDiagnostic({ code: 6060, category: ts.DiagnosticCategory.Error, key: "Bundle_source_file_0_not_found_6060", message: "Bundle source file '{0}' not found." }, bundleSourceFileName);
                return new BundleBuildResult([diagnostic]);
            }
            // Check for TSX
            if (bundleSourceFile.languageVariant == ts.LanguageVariant.JSX) {
                isBundleTsx = true;
            }
            var startTime = new Date().getTime();
            // Get bundle source file module dependencies...
            var bundleModuleContainer = dependencyBuilder.getSourceFileDependencies(bundleSourceFile);
            this.dependencyTime += new Date().getTime() - startTime;
            startTime = new Date().getTime();
            Logger.info("Traversing dependencies for bundle: ", bundleSourceFile.fileName);
            this.processModuleContainer(bundleModuleContainer);
            for (var _i = 0, _a = bundleModuleContainer.getChildren(); _i < _a.length; _i++) {
                var childContainer = _a[_i];
                this.processModuleContainer(childContainer);
            }
            // FIXME: Is this required? Yes
            // Finally, add bundle source file
            //this.addSourceFileModule( bundleSourceFile );
            this.dependencyWalkTime += new Date().getTime() - startTime;
        }
        // The text for our bundle is the concatenation of import source file text
        var bundleText = this.bundleImportText;
        if (bundle.config.package.getPackageType() === PackageType.Library) {
            // Wrap the bundle in an exported namespace with the bundle name
            bundleText += "export namespace " + bundle.config.package.getPackageNamespace() + " {\r\n";
            bundleText += this.bundleCodeText;
            bundleText += " \r\n}";
        }
        else {
            bundleText += this.bundleCodeText;
        }
        var bundleExtension = isBundleTsx ? ".tsx" : ".ts";
        var bundleFile = { path: bundleFilePath + bundleExtension, extension: bundleExtension, text: bundleText };
        this.buildTime = new Date().getTime() - this.buildTime;
        if (this.options.verbose) {
            this.reportStatistics();
        }
        return new BundleBuildResult([], bundleFile);
    };
    BundleBuilder.prototype.processModuleContainer = function (moduleContainer) {
        var isGeneratedNamespace = moduleContainer.isBundle();
        if (isGeneratedNamespace) {
            // Wrap the bundle module container in an exported namespace with the bundle name
            this.bundleCodeText += "export namespace " + moduleContainer.getName() + " {\r\n";
        }
        for (var _i = 0, _a = moduleContainer.getModules(); _i < _a.length; _i++) {
            var moduleDescriptor = _a[_i];
            Logger.info("Processing module: ", moduleDescriptor.getFileName());
            var moduleDependencyNode = moduleDescriptor.getNode();
            var dependencyFile = moduleDescriptor.getSourceFile();
            if (!dependencyFile.isDeclarationFile) {
                var dependencyFileName = this.host.getCanonicalFileName(dependencyFile.fileName);
                var dependencyNodes = moduleDescriptor.getDependencies();
                if (dependencyNodes) {
                    this.checkModuleInheritance(moduleDependencyNode, dependencyNodes);
                }
                if (!Utils.hasProperty(this.bundleImportedFiles, dependencyFileName)) {
                    this.addSourceFileModule(moduleDescriptor);
                }
            }
            else {
                if (moduleDependencyNode.kind === ts.SyntaxKind.ImportEqualsDeclaration) {
                    // For ImportEqualsDeclarations we emit the import declaration
                    // if it hasn't already been added to the bundle.
                    // Get the import and module names
                    var importName = moduleDependencyNode.name.text;
                    var moduleName = this.getImportModuleName(moduleDependencyNode);
                    if (this.addModuleImport(moduleName, importName)) {
                        this.emitModuleImportDeclaration(moduleDependencyNode.getText());
                    }
                }
                else {
                    // ImportDeclaration kind..
                    if (moduleDependencyNode.kind === ts.SyntaxKind.ImportDeclaration) {
                        this.writeImportDeclaration(moduleDependencyNode);
                    }
                }
            }
            //});
        }
        if (isGeneratedNamespace) {
            // Close the bundle module container
            this.bundleCodeText += " \r\n}";
        }
    };
    BundleBuilder.prototype.checkModuleInheritance = function (moduleDependencyNode, dependencyNodes) {
        for (var _i = 0, dependencyNodes_2 = dependencyNodes; _i < dependencyNodes_2.length; _i++) {
            var dependencyNode = dependencyNodes_2[_i];
            var dependencySymbol = this.getSymbolFromNode(dependencyNode);
            var dependencyFile = TsCore.getSourceFileFromSymbol(dependencySymbol);
            if (dependencyFile && !dependencyFile.isDeclarationFile) {
                var dependencyFileName = this.host.getCanonicalFileName(dependencyFile.fileName);
                if (dependencyNode.kind === ts.SyntaxKind.ImportDeclaration) {
                    var dependencyBindings = this.getNamedBindingsFromImport(dependencyNode);
                    if (dependencyBindings && this.isInheritedBinding(moduleDependencyNode, dependencyBindings)) {
                        // Add the dependency file to the bundle now if it is required for inheritance. 
                        if (!Utils.hasProperty(this.bundleImportedFiles, dependencyFileName)) {
                            // FIXME: this.addSourceFileModule( dependencyFile );
                        }
                    }
                }
            }
        }
    };
    BundleBuilder.prototype.isInheritedBinding = function (dependencyNode, namedBindings) {
        var typeChecker = this.program.getTypeChecker();
        var dependencySymbol = this.getSymbolFromNode(dependencyNode);
        if (dependencySymbol) {
            var exports = typeChecker.getExportsOfModule(dependencySymbol);
            if (exports) {
                for (var _i = 0, exports_1 = exports; _i < exports_1.length; _i++) {
                    var exportedSymbol = exports_1[_i];
                    var exportType = typeChecker.getDeclaredTypeOfSymbol(exportedSymbol);
                    if (exportType &&
                        (exportType.flags & ts.TypeFlags.Object) &&
                        (exportType.objectFlags & (ts.ObjectFlags.Class | ts.ObjectFlags.Interface))) {
                        var baseTypes = typeChecker.getBaseTypes(exportType);
                        for (var _a = 0, baseTypes_1 = baseTypes; _a < baseTypes_1.length; _a++) {
                            var baseType = baseTypes_1[_a];
                            var baseTypeName = baseType.symbol.getName();
                            if (namedBindings.indexOf(baseTypeName) >= 0) {
                                Logger.info("Base class inheritance found", baseTypeName);
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    };
    BundleBuilder.prototype.getImportModuleName = function (node) {
        if (node.moduleReference.kind === ts.SyntaxKind.ExternalModuleReference) {
            var moduleReference = node.moduleReference;
            return moduleReference.expression.text;
        }
        else {
            // TJT: This code should never be hit as we currently do not process dependencies of this kind. 
            return node.moduleReference.getText();
        }
    };
    BundleBuilder.prototype.addModuleImport = function (moduleName, importName) {
        if (!Utils.hasProperty(this.bundleModuleImports, moduleName)) {
            this.bundleModuleImports[moduleName] = {};
        }
        var moduleImports = this.bundleModuleImports[moduleName];
        if (!Utils.hasProperty(moduleImports, importName)) {
            moduleImports[importName] = importName;
            return true;
        }
        return false;
    };
    BundleBuilder.prototype.writeImportDeclaration = function (node) {
        var _this = this;
        if (!node.importClause) {
            return;
        }
        var moduleName = node.moduleSpecifier.text;
        var importToWrite = "import ";
        var hasDefaultBinding = false;
        var hasNamedBindings = false;
        if (node.importClause) {
            if (node.importClause.name && this.addModuleImport(moduleName, node.importClause.name.text)) {
                importToWrite += node.importClause.name.text;
                hasDefaultBinding = true;
            }
        }
        if (node.importClause.namedBindings) {
            if (node.importClause.namedBindings.kind === ts.SyntaxKind.NamespaceImport) {
                if (this.addModuleImport(moduleName, node.importClause.namedBindings.name.text)) {
                    if (hasDefaultBinding) {
                        importToWrite += ", ";
                    }
                    importToWrite += "* as ";
                    importToWrite += node.importClause.namedBindings.name.text;
                    hasNamedBindings = true;
                }
            }
            else {
                if (hasDefaultBinding) {
                    importToWrite += ", ";
                }
                importToWrite += "{ ";
                Utils.forEach(node.importClause.namedBindings.elements, function (element) {
                    if (_this.addModuleImport(moduleName, element.name.text)) {
                        if (!hasNamedBindings) {
                            hasNamedBindings = true;
                        }
                        else {
                            importToWrite += ", ";
                        }
                        var alias = element.propertyName;
                        if (alias) {
                            importToWrite += alias.text + " as " + element.name.text;
                        }
                        else {
                            importToWrite += element.name.text;
                        }
                    }
                });
                importToWrite += " }";
            }
        }
        importToWrite += " from ";
        importToWrite += node.moduleSpecifier.getText();
        // TJT not needed => importToWrite += ";";
        if (hasDefaultBinding || hasNamedBindings) {
            this.emitModuleImportDeclaration(importToWrite);
        }
    };
    BundleBuilder.prototype.processImportExports = function (file) {
        var _this = this;
        Logger.info("Processing import statements and export declarations in file: ", file.fileName);
        var editText = file.text;
        ts.forEachChild(file, function (node) {
            if (node.kind === ts.SyntaxKind.ImportDeclaration || node.kind === ts.SyntaxKind.ImportEqualsDeclaration || node.kind === ts.SyntaxKind.ExportDeclaration) {
                //let moduleNameExpression = TsCore.getExternalModuleName( node );
                //if ( moduleNameExpression && moduleNameExpression.kind === ts.SyntaxKind.StringLiteral ) {
                //let moduleSymbol = this.program.getTypeChecker().getSymbolAtLocation( moduleNameExpression );
                //if ( ( moduleSymbol ) && ( Ast.isSourceCodeModule( moduleSymbol ) || Ast.isAmbientModule( moduleSymbol ) ) ) {
                editText = _this.whiteOut(node.pos, node.end, editText);
                //}
                //}
            }
            else {
                if (_this.bundle.config.package.getPackageType() === PackageType.Component) {
                    if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
                        var module_1 = node;
                        if (module_1.name.getText() !== _this.bundle.config.package.getPackageNamespace()) {
                            if (module_1.flags & ts.NodeFlags.ExportContext) {
                                Logger.info("Component bundle. Module name != package namespace. Removing export modifier.");
                                var nodeModifier = module_1.modifiers[0];
                                editText = _this.whiteOut(nodeModifier.pos, nodeModifier.end, editText);
                            }
                        }
                    }
                    else {
                        if (node.flags & ts.NodeFlags.ExportContext) {
                            Logger.info("Removing export modifier for non module declaration.");
                            var exportModifier = node.modifiers[0];
                            editText = _this.whiteOut(exportModifier.pos, exportModifier.end, editText);
                        }
                    }
                }
            }
        });
        return editText;
    };
    BundleBuilder.prototype.whiteOut = function (pos, end, text) {
        var length = end - pos;
        var whiteSpace = "";
        for (var i = 0; i < length; i++) {
            whiteSpace += " ";
        }
        var prefix = text.substring(0, pos);
        var suffix = text.substring(end);
        return prefix + whiteSpace + suffix;
    };
    BundleBuilder.prototype.emitModuleImportDeclaration = function (moduleBlockText) {
        Logger.info("> emitModuleImportDeclaration()");
        this.bundleImportText += moduleBlockText + "\n";
    };
    BundleBuilder.prototype.addSourceFileModule = function (module) {
        var file = module.getSourceFile();
        Logger.trace("> addSourceFileModule() with: ", file.fileName);
        if (Ast.isSourceCodeFile(file)) {
            // Before adding the source text, we must white out non-external import statements and
            // white out export modifiers where applicable
            var editText = this.processImportExports(file);
            this.bundleCodeText += editText + "\n";
            var sourceFileName = this.host.getCanonicalFileName(file.fileName);
            this.bundleImportedFiles[sourceFileName] = sourceFileName;
        }
        //else {
        //    // TJT: Is this needed?
        //    // Add typescript definition files to the build source files context
        //    if ( !Utils.hasProperty( this.bundleSourceFiles, file.fileName ) ) {
        //        Logger.info( "Adding definition file to bundle source context: ", file.fileName );
        //        this.bundleSourceFiles[ file.fileName ] = file.text;
        //    }
        //}
    };
    // TJT: Review duplicate code. Move to TsCore pass program as arg.
    BundleBuilder.prototype.getSymbolFromNode = function (node) {
        var moduleNameExpr = TsCore.getExternalModuleName(node);
        if (moduleNameExpr && moduleNameExpr.kind === ts.SyntaxKind.StringLiteral) {
            return this.program.getTypeChecker().getSymbolAtLocation(moduleNameExpr);
        }
        return undefined;
    };
    BundleBuilder.prototype.getNamedBindingsFromImport = function (node) {
        var bindingNames = [];
        if ((node.kind === ts.SyntaxKind.ImportDeclaration) && node.importClause.namedBindings) {
            var namedBindings = node.importClause.namedBindings;
            switch (namedBindings.kind) {
                case ts.SyntaxKind.NamespaceImport:
                    break;
                case ts.SyntaxKind.NamedImports:
                    for (var _i = 0, _a = namedBindings.elements; _i < _a.length; _i++) {
                        var importBinding = _a[_i];
                        bindingNames.push(importBinding.getText());
                    }
                    break;
            }
        }
        return bindingNames;
    };
    BundleBuilder.prototype.reportStatistics = function () {
        var statisticsReporter = new StatisticsReporter();
        statisticsReporter.reportTime("Deps gen time", this.dependencyTime);
        statisticsReporter.reportTime("Deps walk time", this.dependencyWalkTime);
        statisticsReporter.reportTime("Source gen time", this.buildTime);
    };
    return BundleBuilder;
}());
function bundleBuilderTransform(host, program, context) {
    return transform;
    /**
     * Bundle the provided SourceFile.
     *
     * @param node A SourceFile node.
     */
    function transform(node) {
        return node;
    }
}
var BundlerTransform = (function () {
    function BundlerTransform(options) {
        this.bundlerOptions = options;
    }
    BundlerTransform.prototype.transform = function (host, program, context) {
        this.compilerOptions = context.getCompilerOptions();
        this.program = program;
        this.host = host;
        this.bundler = new BundleBuilder(this.host, this.program, this.bundlerOptions);
        function transformImpl(sourceFile) {
            return sourceFile;
        }
        return transformImpl;
    };
    return BundlerTransform;
}());
function getBundlerTransform(host, program, options) {
    var bundlerTransform = new BundlerTransform(options);
    return function (context) { return bundlerTransform.transform(host, program, context); };
}
//# sourceMappingURL=tsbundler.js.map