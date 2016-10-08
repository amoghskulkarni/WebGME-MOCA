'use strict';

var config = require('./config.webgme'),
    validateConfig = require('webgme/config/validator');

// Add/overwrite any additional settings here
config.server.port = 80;
config.mongo.uri = 'mongodb://127.0.0.1:27017/WebGME-MOCA-2';

// Plugins
config.plugin.allowServerExecution = true;
config.plugin.allowBrowserExecution = true;

// Seeds
config.seedProjects.enable = true;
config.seedProjects.basePaths = ["./src/seeds"];

config.visualization.svgDirs = ['./Icons/png'];

validateConfig(config);
module.exports = config;
