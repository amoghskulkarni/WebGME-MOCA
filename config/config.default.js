'use strict';

var config = require('./config.webgme'),
    validateConfig = require('webgme/config/validator');

// Add/overwrite any additional settings here
config.server.port = 8888;

// Plugins
config.plugin.allowServerExecution = true;
config.plugin.allowBrowserExecution = true;

// Seeds
config.seedProjects.enable = true;
config.seedProjects.defaultProject = 'MOCA';
config.seedProjects.basePaths.push("./src/seeds");

config.visualization.svgDirs = ['./Icons/png'];

validateConfig(config);
module.exports = config;
