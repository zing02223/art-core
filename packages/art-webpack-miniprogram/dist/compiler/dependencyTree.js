"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dependency_cruiser_1 = require("dependency-cruiser");
const paths_1 = __importDefault(require("../config/paths"));
const path_1 = require("path");
const chalk_1 = __importDefault(require("chalk"));
exports.dependencyTree = (entry) => {
    if (!entry.length) {
        return [];
    }
    const cruiseResult = dependency_cruiser_1.cruise(entry, {
        outputType: 'json'
    });
    const dependencies = JSON.parse(cruiseResult.modules).modules;
    const validDependencies = dependencies.filter((dependency) => {
        return dependency.coreModule !== true;
    }).map((notCoreDependency) => {
        return path_1.join(paths_1.default.appCwd, notCoreDependency.source);
    });
    console.log(chalk_1.default.green('validDependencies: '), validDependencies);
    return validDependencies;
};