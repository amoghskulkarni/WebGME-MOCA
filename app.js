// jshint node: true
'use strict';

var gmeConfig = require('./config'),
    webgme = require('webgme'),
    n3 = require('n3'),
    myServer;

webgme.addToRequireJsPaths(gmeConfig);
webgme.addToRequireJsPaths(n3);

myServer = new webgme.standaloneServer(gmeConfig);
myServer.start(function () {
    //console.log('server up');
});
