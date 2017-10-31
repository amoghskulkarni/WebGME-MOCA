/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 0.14.0 from webgme on Mon Feb 01 2016 12:33:01 GMT-0600 (Central Standard Time).
 */

define([
    'plugin/PluginConfig',
    'plugin/PluginBase',
    'text!./metadata.json',
    'common/util/ejs',
    'common/util/xmljsonconverter',
    'plugin/MOCACodeGenerator/MOCACodeGenerator/Templates/Templates',
    'q',
    'plugin/MOCACodeGenerator/MOCACodeGenerator/Library/CodeGeneratorLib',
    'plugin/MOCACodeGenerator/MOCACodeGenerator/Library/DDCompInterpreterLib',
    'plugin/MOCACodeGenerator/MOCACodeGenerator/Library/MOCAInterpreterLib',
    'plugin/MOCACodeGenerator/MOCACodeGenerator/Library/ProcessFlowInterpreterLib'
], function (
    PluginConfig,
    PluginBase,
    pluginMetadata,
    ejs,
    Converter,
    TEMPLATES,
    Q,
    codeGenLib,
    ddCompInterpreterLib,
    mocaInterpreterLib,
    procFlowInterpreterLib) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);

    /**
     * Initializes a new instance of MOCACodeGenerator.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin MOCACodeGenerator.
     * @constructor
     */
    var MOCACodeGenerator = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.pluginMetadata = pluginMetadata;
    };

    MOCACodeGenerator.metadata = pluginMetadata;

    // Prototypal inheritance from PluginBase.
    MOCACodeGenerator.prototype = Object.create(PluginBase.prototype);
    MOCACodeGenerator.prototype.constructor = MOCACodeGenerator;

    /**
     * Gets the name of the MOCACodeGenerator.
     * @returns {string} The name of the plugin.
     * @public
     */
    MOCACodeGenerator.prototype.getName = function () {
        return 'MOCACodeGenerator';
    };

    /**
     * Gets the semantic version (semver.org) of the MOCACodeGenerator.
     * @returns {string} The version of the plugin.
     * @public
     */
    MOCACodeGenerator.prototype.getVersion = function () {
        return '0.1.0';
    };

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string|Error, plugin.PluginResult)} callback - the result callback
     */
    MOCACodeGenerator.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this,
            nodeObject;
        nodeObject = self.activeNode;

        if (self.core.getParent(nodeObject) === null &&
            self.core.getAttribute(nodeObject, 'name') !== "ROOT") {
            callback(new Error('The plugin has to be executed from ROOT.'), self.result);
            return;
        }

        self.generateDataModel(nodeObject)
            .then(function (dataModel) {
                // Create JSON files for the models only if the plugin is invoked at the ROOT
                if (self.getMetaType(nodeObject) === null) {
                    // DEBUG:
                    // self.logger.info(JSON.stringify(dataModel, null, 4));
                    return self.generateArtifact('ROOT', dataModel);
                }
                else if (self.core.getAttribute(self.getMetaType(nodeObject), 'name') === 'Problem') {
                    return self.generateArtifact('Problem', dataModel);
                }
                else if (self.core.getAttribute(self.getMetaType(nodeObject), 'name') === 'ProcessFlow') {
                    return self.generateArtifact('ProcessFlow', dataModel);
                }
                else if (self.core.getAttribute(self.getMetaType(nodeObject), 'name') === 'DataDrivenComponent') {
                    return self.generateArtifact('DataDrivenComponent', dataModel);
                }
            })
            .then(function () {
                self.result.setSuccess(true);
                callback(null, self.result);
            })
            .catch(function (err) {
                self.logger.error(err);
                self.createMessage(null, err.message, 'error');
                self.result.setSuccess(false);
                callback(null, self.result);
            })
            .done();
    };


    MOCACodeGenerator.prototype.generateDataModel = function (rootNode) {
        var self = this,
            dataModel = {
                comps: [],
                ddComps: [],
                groups: [],
                processFlows: [],
                problems: []
            },
            componentLibraryPromises = [],
            groupLibraryPromises = [],
            processFlowLibraryPromises = [],
            problemLibraryPromises = [];

        var componentPromises = [],
            ddComponentPromises = [],
            groupPromises = [],
            processFlowPromises = [],
            problemPromises = [];

        // If the code generator is invoked from ROOT
        if (self.getMetaType(rootNode) === null) {
            // Load all the children of the ROOT
            return self.core.loadChildren(rootNode)
                .then(function (children) {
                    // Process them all according to their type
                    for (var i = 0; i < children.length; i++) {
                        // If it is ComponentLibrary..
                        if (self.core.getAttribute(self.getMetaType(children[i]) , 'name') === 'ComponentLibrary') {
                            // Load its children (use ComponentLibraryPromises for that) and then get their componentData
                            componentLibraryPromises.push(self.core.loadChildren(children[i])
                                .then(function (comps) {
                                    for (var j = 0; j < comps.length; j++) {
                                        if (self.core.getAttribute(self.getMetaType(comps[j]) , 'name') === 'Component') {
                                            componentPromises.push(self.getComponentData(comps[j]));
                                        }
                                        else if (self.core.getAttribute(self.getMetaType(comps[j]) , 'name') === 'DataDrivenComponent') {
                                            ddComponentPromises.push(self.getDDComponentData(comps[j]));
                                        }
                                    }
                                })
                            );
                        }
                        // If it is GroupLibrary..
                        else if (self.core.getAttribute(self.getMetaType(children[i]), 'name') === 'GroupLibrary') {
                            // Load its children (use GroupLibraryPromises for that) and then get their groupData
                            groupLibraryPromises.push(self.core.loadChildren(children[i])
                                .then(function (groups) {
                                    for (var j = 0; j < groups.length; j++) {
                                        groupPromises.push(self.getGroupData(groups[j]));
                                    }
                                })
                            );
                        }
                        // If it is a ProcessFlowLibrary
                        else if (self.core.getAttribute(self.getMetaType(children[i]), 'name') === 'ProcessFlowLibrary'){
                            // Load its children (use ProcessFlowLibraryPromises for that) and then get their ProcessFlowData
                            processFlowLibraryPromises.push(self.core.loadChildren(children[i])
                                .then(function (processFlows) {
                                    for (var j = 0; j < processFlows.length; j++) {
                                        processFlowPromises.push(self.getProcessFlowData(processFlows[j]));
                                    }
                                })
                            );
                        }
                        // If it is a ProblemLibrary
                        else if (self.core.getAttribute(self.getMetaType(children[i]), 'name') === 'ProblemLibrary') {
                            // Load its children (use ProblemLibraryPromises for that) and then get their ProblemData
                            problemLibraryPromises.push(self.core.loadChildren(children[i])
                                .then(function (problems) {
                                    for (var j = 0; j < problems.length; j++) {
                                        problemPromises.push(self.getProblemData(problems[j]));
                                    }
                                })
                            );
                        }
                    }

                    return Q.all(componentLibraryPromises);
                })
                .then(function () {
                    return Q.all(groupLibraryPromises);
                })
                .then(function () {
                    return Q.all(problemLibraryPromises);
                })
                .then(function () {
                    return Q.all(processFlowLibraryPromises);
                })
                .then(function () {
                    return Q.all(componentPromises);
                })
                .then(function (componentsData) {
                    dataModel.comps = componentsData;
                    return Q.all(ddComponentPromises);
                })
                .then(function (ddComponentsData) {
                    dataModel.ddComps = ddComponentsData;
                    return Q.all(groupPromises);
                })
                .then(function (groupsData) {
                    dataModel.groups = groupsData;
                    return Q.all(processFlowPromises);
                })
                .then(function (processFlowsData) {
                    dataModel.processFlows = processFlowsData;
                    return Q.all(problemPromises);
                })
                .then(function (problemsData) {
                    dataModel.problems = problemsData;
                    return dataModel;
                });
        }

        // If the code generator is invoked from a problem
        else if (self.core.getAttribute(self.getMetaType(rootNode), 'name') === 'Problem') {
            var recursivePromises = [];
            // Load all the children of the problem
            return self.core.loadChildren(rootNode)
                .then(function (children){
                    // Process them all according to their type
                    for (var i = 0; i < children.length; i++) {
                        // If it is a Component..
                        if (self.core.getAttribute(self.getMetaType(children[i]) , 'name') === 'Component') {
                            // Traverse to its base class through the instance tree
                            self.getOriginalBase('Component', componentPromises, children[i]);
                        }
                        // If it is a Group..
                        else if (self.core.getAttribute(self.getMetaType(children[i]) , 'name') === 'Group') {
                            // Call a recursive function which in turn populates the promise lists.
                            // Had to use a recursive function because a group can contain groups and the hierarchy
                            // can be arbitrarily deep.
                            recursivePromises.push(self.recursivelyPopulateGroupContents(this, componentPromises, groupPromises, children[i]));
                        }
                    }
                    return Q.all(recursivePromises);
                })
                .then(function () {
                    return Q.all(componentPromises);
                })
                .then(function (componentsData) {
                    dataModel.comps = componentsData;
                    return Q.all(groupPromises);
                })
                .then(function (groupsData) {
                    dataModel.groups = groupsData;
                    // Get its problemData
                    problemPromises.push(self.getProblemData(rootNode));
                    return Q.all(problemPromises);
                })
                .then(function (problemData) {
                    dataModel.problems = problemData;
                    return dataModel;
                })
        }

        // If the code generator is invoked from a problem
        else if (self.core.getAttribute(self.getMetaType(rootNode), 'name') === 'ProcessFlow') {
            // No need to recursively populate anything here, this is not a recursive structure as of yet
            processFlowPromises.push(self.getProcessFlowData(rootNode));
            return Q.all(processFlowPromises)
                .then(function (processFlowsData) {
                    dataModel.processFlows = processFlowsData;
                    return dataModel;
                });
        }

        // If the code generator is invoked from a DataDrivenComponent
        else if (self.core.getAttribute(self.getMetaType(rootNode), 'name') === 'DataDrivenComponent') {
            // No need to recursively populate anything here, this is not a recursive structure as of yet
            ddComponentPromises.push(self.getDDComponentData(rootNode));
            return Q.all(ddComponentPromises)
                .then(function (ddComponentsData) {
                    dataModel.ddComps = ddComponentsData;
                    return dataModel;
                });
        }
    };

    /**
     * Method to intrepret a ProcessFlow and its constituents
     */
    MOCACodeGenerator.prototype.getProcessFlowData = procFlowInterpreterLib.getProcessFlowData;

    /**
     * Method to interpret a Data-driven component and its constituents
     */
    MOCACodeGenerator.prototype.getDDComponentData = ddCompInterpreterLib.getDDComponentData;

    /**
     * Methods to interpret a MOCA Problem(s) and its constituents
     */
    MOCACodeGenerator.prototype.getComponentData = mocaInterpreterLib.getComponentData;
    MOCACodeGenerator.prototype.getGroupData = mocaInterpreterLib.getGroupData;
    MOCACodeGenerator.prototype.getProblemData = mocaInterpreterLib.getProblemData;
    MOCACodeGenerator.prototype.recursivelyPopulateGroupContents = mocaInterpreterLib.recursivelyPopulateGroupContents;

    /**
     * Method to generate the code from interpreted models
     * (and either save on the server or make available for downloading on the client)
     */
    MOCACodeGenerator.prototype.generateArtifact = codeGenLib.generateArtifact;

    return MOCACodeGenerator;
});
