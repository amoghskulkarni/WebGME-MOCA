'use strict';

var config = require('./config.webgme'),
    validateConfig = require('webgme/config/validator'),
    path = require('path');

// Add/overwrite any additional settings here
config.server.port = 80;

// Plugins
config.plugin.allowServerExecution = true;
config.plugin.allowBrowserExecution = true;

// Seeds
config.seedProjects.enable = true;
config.seedProjects.defaultProject = 'MOCA';
config.seedProjects.basePaths.push("./src/seeds");

config.visualization.svgDirs = ['./Icons/png'];

// User authentication
// config.authentication.enable = true;
// config.authentication.jwt.privateKey = path.join(__dirname, '..', '..', 'WebGME-MOCA-2_RSAKeys', 'private_key');
// config.authentication.jwt.publicKey = path.join(__dirname, '..', '..', 'WebGME-MOCA-2_RSAKeys', 'public_key');

config.authentication.allowGuests = true;
config.authentication.guestAccount = 'guest';
config.authentication.allowUserRegistration = true;

// config.authentication.logInUrl = '/profile/login';
// config.authentication.logOutUrl = '/profile/login';

validateConfig(config);
module.exports = config;
