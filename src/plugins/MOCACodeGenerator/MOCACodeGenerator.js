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
    'q'
], function (
    PluginConfig,
    PluginBase,
    pluginMetadata,
    ejs,
    Converter,
    TEMPLATES,
    Q) {
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

        this.FILES = [
            {
                name: 'components',
                template: 'moca.components.generated.py.ejs'
            },
            {
                name: 'groups',
                template: 'moca.groups.generated.py.ejs'
            },
            {
                name: 'problems',
                template: 'moca.problems.generated.py.ejs',
                ipynbfile: 'moca.problem.generated.ipynb.ejs'
            },
            {
                name: 'parsing utilities',
                template: 'moca.parseutils.generated.py.ejs'
            },
            {
                name: 'plotting utilities',
                template: 'moca.plotutils.generated.py.ejs'
            }
        ];
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

        if (typeof window === 'undefined') {
            // Test for whether the plugin is executed on server or client
            // (if you're inside this block, the plugin is executed on server)

            // Test "require", for testing server side execution
            var fs = require('fs');
        }

        if (self.core.getParent(nodeObject) === null &&
            self.core.getAttribute(nodeObject, 'name') !== "ROOT") {
            callback(new Error('The plugin has to be executed from ROOT.'), self.result);
            return;
        }

        self.generateDataModel(nodeObject)
            .then(function (dataModel) {
                // Create JSON files for the models only if the plugin is invoked at the ROOT
                if (self.getMetaType(nodeObject) === null) {
                    self.logger.info(JSON.stringify(dataModel, null, 4));
                    return self.generateArtifact('ROOT', dataModel);
                }
                else
                    return self.generateArtifact('Problem', dataModel);
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
                groups: [],
                problems: []
            },
            componentLibraryPromises = [],
            groupLibraryPromises = [],
            componentPromises = [],
            groupPromises = [],
            problemPromises = [];

        // If the code generator is invoked from ROOT
        if (self.getMetaType(rootNode) === null) {
            // Load all the children of the ROOT
            return self.core.loadChildren(rootNode)
                .then(function (children) {
                    // Process them all according to their type
                    for (var i = 0; i < children.length; i++) {
                        // If it is ComponentLibrary..
                        if (self.core.getAttribute(self.getMetaType(children[i]) , 'name') == 'ComponentLibrary') {
                            // Load it's children (use ComponentLibraryPromises for that) and then get their componentData
                            componentLibraryPromises.push(self.core.loadChildren(children[i])
                                .then(function (comps) {
                                    for (var j = 0; j < comps.length; j++) {
                                        componentPromises.push(self.getComponentData(comps[j]));
                                    }
                                })
                            );
                        }
                        // If it is GroupLibrary..
                        else if (self.core.getAttribute(self.getMetaType(children[i]), 'name') == 'GroupLibrary') {
                            // Load it's children (use GroupLibraryPromises for that) and then get their groupData
                            groupLibraryPromises.push(self.core.loadChildren(children[i])
                                .then(function (groups) {
                                    for (var j = 0; j < groups.length; j++) {
                                        groupPromises.push(self.getGroupData(groups[j]));
                                    }
                                })
                            );
                        }
                        // If it is a Problem..
                        else if (self.core.getAttribute(self.getMetaType(children[i]), 'name') == 'Problem') {
                            // Get its problemData
                            problemPromises.push(self.getProblemData(children[i]));
                        }
                    }

                    return Q.all(componentLibraryPromises);
                })
                .then(function () {
                    return Q.all(groupLibraryPromises);
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
                    return Q.all(problemPromises);
                })
                .then(function (problemsData) {
                    dataModel.problems = problemsData;
                    return dataModel;
                });
        }
        // If the code generator is invoked from a problem
        else if (self.core.getAttribute(self.getMetaType(rootNode), 'name') == 'Problem') {
            var recursivePromises = [];
            // Load all the children of the problem
            return self.core.loadChildren(rootNode)
                .then(function (children){
                    // Process them all according to their type
                    for (var i = 0; i < children.length; i++) {
                        // If it is a Component..
                        if (self.core.getAttribute(self.getMetaType(children[i]) , 'name') == 'Component') {
                            // Traverse to its base class through the instance tree
                            self.getOriginalBase('Component', componentPromises, children[i]);
                        }
                        // If it is a Group..
                        else if (self.core.getAttribute(self.getMetaType(children[i]) , 'name') == 'Group') {
                            // Call a recursive function which in turn populates the promise lists.
                            // Had to use a recursive function because a group can contain groups and the hierarchy
                            // can be arbitrarily deep.
                            recursivePromises.push(self.recursivelyPopulateGroupContents(componentPromises, groupPromises, children[i]));
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
    };


    // This is a recursive function which goes through a group and populates the lists groupPromises and componentPromises
    MOCACodeGenerator.prototype.recursivelyPopulateGroupContents = function(componentPromises, groupPromises, groupNode) {
        var self = this,
            recursivePromises = [];

        // Traverse to its base class through the instance tree
        self.getOriginalBase('Group', groupPromises, groupNode);

        return self.core.loadChildren(groupNode)
            .then(function (children) {
                for (var i = 0; i < children.length; i++) {
                    // If it is a Component..
                    if (self.core.getAttribute(self.getMetaType(children[i]) , 'name') == 'Component') {
                        // Traverse to its base class through the instance tree
                        self.getOriginalBase('Component', componentPromises, children[i]);
                    }
                    // If it is a Group (be careful here!)..
                    else if (self.core.getAttribute(self.getMetaType(children[i]) , 'name') == 'Group') {
                        recursivePromises.push(self.recursivelyPopulateGroupContents(componentPromises, groupPromises, children[i]));
                    }
                }
                return recursivePromises;
            });
    };


    MOCACodeGenerator.prototype.getOriginalBase = function(compOrGroup, promiseList, node) {
        var self = this,
            baseToPush = null;
        if (compOrGroup == 'Component') {
            baseToPush = self.core.getBase(node);
            while (self.core.getAttribute(self.core.getParent(baseToPush), 'name') != 'ComponentLibrary'
            || self.core.getAttribute(self.core.getBase(baseToPush), 'name') != 'Component')
                baseToPush = self.core.getBase(baseToPush);
            promiseList.push(self.getComponentData(baseToPush));
        }
        else if (compOrGroup == 'Group') {
            baseToPush = self.core.getBase(node);
            while (self.core.getAttribute(self.core.getParent(baseToPush), 'name') != 'GroupLibrary'
            || self.core.getAttribute(self.core.getBase(baseToPush), 'name') != 'Group')
                baseToPush = self.core.getBase(baseToPush);
            promiseList.push(self.getGroupData(baseToPush));
        }
    };


    MOCACodeGenerator.prototype.getComponentData = function(componentNode) {
        var self = this,
            componentData = {
                name: self.core.getAttribute(componentNode, 'name'),
                type: self.core.getAttribute(componentNode, 'Type'),
                force_fd: self.core.getAttribute(componentNode, 'ForceFD'),
                outputFunction: self.core.getAttribute(componentNode, 'OutputFunction'),
                jacobian: self.core.getAttribute(componentNode, 'Jacobian'),
                parameters: [],
                unknowns: []
            },
            parameterPromises = [],
            unknownPromises = [];

        return self.core.loadChildren(componentNode)
            .then(function(children) {
                for (var i = 0; i < children.length; i++) {
                    if (self.core.getAttribute(self.getMetaType(children[i]), 'name') == 'Parameter')
                        parameterPromises.push(self.getParameterData(children[i]));
                    else if (self.core.getAttribute(self.getMetaType(children[i]), 'name') == 'Unknown')
                        unknownPromises.push(self.getUnknownData(children[i]));
                }

                return Q.all(parameterPromises);
            })
            .then(function (parametersData) {
                componentData.parameters = parametersData;
                return Q.all(unknownPromises);
            })
            .then(function (unknownsData) {
                componentData.unknowns = unknownsData;
                return componentData;
            });
    };


    MOCACodeGenerator.prototype.getParameterData = function(parameterNode) {
        var self = this,
            deferred = new Q.defer(),
            parameterData = {
                name: self.core.getAttribute(parameterNode, 'name'),
                value: null
            };

        var valueString = self.core.getAttribute(parameterNode, 'Value').toString();
        if (valueString.indexOf('.') === -1)
            valueString += ".0";

        parameterData.value = valueString;

        deferred.resolve(parameterData);

        return deferred.promise;
    };


    MOCACodeGenerator.prototype.getUnknownData = function(unknownNode) {
        var self = this,
            deferred = new Q.defer(),
            unknownData = {
                name: self.core.getAttribute(unknownNode, 'name'),
                value: null,
                type: self.core.getAttribute(unknownNode, 'Type')
            };

        var valueString = self.core.getAttribute(unknownNode, 'Value').toString();
        if (valueString.indexOf('.') === -1)
            valueString += ".0";

        unknownData.value = valueString;

        deferred.resolve(unknownData);

        return deferred.promise;
    };


    MOCACodeGenerator.prototype.getGroupData = function(groupNode) {
        var self = this,
            groupData = {
                name: self.core.getAttribute(groupNode, 'name'),
                algebraicLoop: self.core.getAttribute(groupNode, 'AlgebraicLoop'),
                compInstances: [],
                groupInstances: [],
                connections: []
            },
            compInstancePromises = [],
            groupInstancePromises = [],
            connectionPromises = [];

        return self.core.loadChildren(groupNode)
            .then(function(children) {
                for (var i = 0; i < children.length; i++) {
                    if (self.core.getAttribute(self.getMetaType(children[i]), 'name') == 'Component')
                        compInstancePromises.push(self.getCompInstanceData(children[i]));
                    else if (self.core.getAttribute(self.getMetaType(children[i]), 'name') == 'Group')
                        groupInstancePromises.push(self.getGroupInstanceData(children[i]));
                    else if (self.core.getAttribute(self.getMetaType(children[i]), 'name') == 'DataConn')
                        connectionPromises.push(self.getConnectionData(children[i]));
                }

                return Q.all(compInstancePromises);
            })
            .then(function (compInstancesData) {
                groupData.compInstances = compInstancesData;
                return Q.all(groupInstancePromises);
            })
            .then(function (groupInstancesData) {
                groupData.groupInstances = groupInstancesData;
                return Q.all(connectionPromises);
            })
            .then(function (connectionsData) {
                groupData.connections = connectionsData;
                return groupData;
            });
    };


    MOCACodeGenerator.prototype.getCompInstanceData = function (compInstanceNode) {
        var self = this,
            compInstancesData = {
                name: self.core.getAttribute(compInstanceNode, 'name'),
                base: self.core.getAttribute(self.core.getBase(compInstanceNode), 'name'),
                promotes: []
            };

        return self.core.loadChildren(compInstanceNode)
            .then(function(children) {
                var promotePromises = [];
                for (var i = 0; i < children.length; i++) {
                    promotePromises.push(self.core.loadCollection(children[i], 'dst')
                        .then(function(connections) {
                            var pointerPromises = [];
                            for (var j = 0; j < connections.length; j++) {
                                if (self.core.getAttribute(connections[j], 'name') === 'PrToPortAssoc') {
                                    pointerPromises.push(self.core.loadPointer(connections[j], 'dst'));
                                }
                            }
                            return Q.all(pointerPromises);
                        })
                        .then(function(dstNodes) {
                            for (var j = 0; j < dstNodes.length; j++) {
                                compInstancesData.promotes.push(self.core.getAttribute(dstNodes[j], 'name'));
                            }
                        })
                    );
                }
            })
            .then(function() {
                return compInstancesData;
            });
    };


    MOCACodeGenerator.prototype.getGroupInstanceData = function (groupInstanceNode) {
        var self = this,
            groupInstancesData = {
                name: self.core.getAttribute(groupInstanceNode, 'name'),
                base: self.core.getAttribute(self.core.getBase(groupInstanceNode), 'name'),
                promotes: []
            };

        return self.core.loadChildren(groupInstanceNode)
            .then(function(children) {
                var promotePromises = [];
                for (var i = 0; i < children.length; i++) {
                    promotePromises.push(self.core.loadCollection(children[i], 'dst')
                        .then(function(connections) {
                            var pointerPromises = [];
                            for (var j = 0; j < connections.length; j++) {
                                if (self.core.getAttribute(connections[j], 'name') === 'PrToPortAssoc') {
                                    pointerPromises.push(self.core.loadPointer(connections[j], 'dst'));
                                }
                            }
                            return Q.all(pointerPromises);
                        })
                        .then(function(dstNodes) {
                            for (var j = 0; j < dstNodes.length; j++) {
                                groupInstancesData.promotes.push(self.core.getAttribute(dstNodes[j], 'name'));
                            }
                        })
                    );
                }
            })
            .then(function () {
                return groupInstancesData;
            });
    };


    MOCACodeGenerator.prototype.getConnectionData = function (connectionNode) {
        var self = this,
            deferred = Q.defer(),
            connectionData = {
                src: null,
                srcParent: null,
                srcOnto: "",
                dst: null,
                dstParent: null,
                dstOnto: ""
            };

        self.core.loadPointer(connectionNode, 'src', function (err, srcNode) {
            if (err) {
                deferred.reject(new Error(err))
            } else {
                connectionData.src = self.core.getAttribute(srcNode, 'name');
                connectionData.srcParent = self.core.getAttribute(self.core.getParent(srcNode), 'name');
                if (self.core.getAttribute(self.getMetaType(connectionNode), 'name') == 'DataConn') {
                    var srcMetaType = self.core.getAttribute(self.getMetaType(srcNode), 'name');
                    if (srcMetaType === 'Unknown' || srcMetaType === 'Parameter') {
                        connectionData.srcOnto = self.core.getAttribute(srcNode, 'OntologyElementID');
                    }
                }
                self.core.loadPointer(connectionNode, 'dst', function (err, dstNode) {
                    if (err) {
                        deferred.reject(new Error(err));
                    } else {
                        connectionData.dst = self.core.getAttribute(dstNode, 'name');
                        connectionData.dstParent = self.core.getAttribute(self.core.getParent(dstNode), 'name');
                        if (self.core.getAttribute(self.getMetaType(connectionNode), 'name') == 'DataConn') {
                            var dstMetaType = self.core.getAttribute(self.getMetaType(dstNode), 'name');
                            if (dstMetaType === 'Unknown' || dstMetaType === 'Parameter') {
                                connectionData.dstOnto = self.core.getAttribute(dstNode, 'OntologyElementID');
                            }
                        }
                        deferred.resolve(connectionData);
                    }
                });
            }
        });

        return deferred.promise;
    };


    MOCACodeGenerator.prototype.getProblemData = function (problemNode) {
        var self = this,
            problemData = {
                name: self.core.getAttribute(problemNode, 'name'),
                driver: self.core.getAttribute(problemNode, 'Driver'),
                doeSamples: self.core.getAttribute(problemNode, 'Samples'),
                recorder: self.core.getAttribute(problemNode, 'Recorder'),
                algebraicLoop: self.core.getAttribute(problemNode, 'AlgebraicLoop'),
                constraints: [],
                compInstances: [],
                groupInstances: [],
                connections: [],
                desvars: [],
                objectives: [],
                records: []
            },
            constraintPromises = [],
            compInstancePromises = [],
            groupInstancePromises = [],
            connectionPromises = [],
            desvarPromises = [],
            objectivePromises = [],
            recordPromises = [];

        return self.core.loadChildren(problemNode)
            .then(function(children) {
                for (var i = 0; i < children.length; i++) {
                    if (self.core.getAttribute(self.getMetaType(children[i]), 'name') == 'Component')
                        compInstancePromises.push(self.getCompInstanceData(children[i]));
                    else if (self.core.getAttribute(self.getMetaType(children[i]), 'name') == 'Group')
                        groupInstancePromises.push(self.getGroupInstanceData(children[i]));
                    else if (self.core.getAttribute(self.getMetaType(children[i]), 'name') == 'DataConn')
                        connectionPromises.push(self.getConnectionData(children[i]));
                    else if (self.core.getAttribute(self.getMetaType(children[i]), 'name') == 'DesVarToInConn')
                        desvarPromises.push(self.getDesignVariableData(children[i]));
                    else if (self.core.getAttribute(self.getMetaType(children[i]), 'name') == 'OutToObjConn')
                        objectivePromises.push(self.getObjectiveData(children[i]));
                    else if (self.core.getAttribute(self.getMetaType(children[i]), 'name') == 'PortToRecConn')
                        recordPromises.push(self.getRecordData(children[i]));
                    else if (self.core.getAttribute(self.getMetaType(children[i]), 'name') == 'PortToConstraintConn')
                        constraintPromises.push(self.getConstraintData(children[i]));
                }

                return Q.all(compInstancePromises);
            })
            .then(function (compInstancesData) {
                problemData.compInstances = compInstancesData;
                return Q.all(groupInstancePromises);
            })
            .then(function (groupInstancesData) {
                problemData.groupInstances = groupInstancesData;
                return Q.all(connectionPromises);
            })
            .then(function (connectionsData) {
                problemData.connections = connectionsData;
                return Q.all(desvarPromises);
            })
            .then(function (desvarsData) {
                problemData.desvars = desvarsData;
                return Q.all(objectivePromises);
            })
            .then(function (objectivesData) {
                problemData.objectives = objectivesData;
                return Q.all(recordPromises);
            })
            .then(function (recordsData) {
                problemData.records = recordsData;
                return Q.all(constraintPromises);
            })
            .then(function (constraintsData) {
                problemData.constraints = constraintsData;
                return problemData;
            });
    };


    MOCACodeGenerator.prototype.getDesignVariableData = function (desvarToInConnNode) {
        var self = this,
            designvariableData = {
                name: null,
                upper: null,
                lower: null,
                value: null,
                setByDriver: null,
                connection: [
                    // dst
                    // dstParent
                ]
            },
            connectionPromises = [];

        return self.core.loadPointer(desvarToInConnNode, 'src')
            .then(function(designvariableNode) {
                designvariableData.name = self.core.getAttribute(designvariableNode, 'name');
                designvariableData.upper = self.core.getAttribute(designvariableNode, 'Upper');
                designvariableData.lower = self.core.getAttribute(designvariableNode, 'Lower');
                designvariableData.value = self.core.getAttribute(designvariableNode, 'Value');
                designvariableData.setByDriver = self.core.getAttribute(designvariableNode, 'SetByDriver');
                connectionPromises.push(self.getConnectionData(desvarToInConnNode));

                return Q.all(connectionPromises);
            })
            .then(function(connectionData) {
                designvariableData.connection = connectionData;
                return designvariableData;
            });
    };


    MOCACodeGenerator.prototype.getObjectiveData = function (outToObjConnNode) {
        var self = this,
            objectiveData = {
                name: null,
                connection: [
                    // src
                    // srcParent
                ]
            },
            connectionPromises = [];

        return self.core.loadPointer(outToObjConnNode, 'dst')
            .then(function(objectiveNode) {
                objectiveData.name = self.core.getAttribute(objectiveNode, 'name');
                connectionPromises.push(self.getConnectionData(outToObjConnNode));

                return Q.all(connectionPromises);
            })
            .then(function(connectionData) {
                objectiveData.connection = connectionData;
                return objectiveData;
            });
    };


    MOCACodeGenerator.prototype.getRecordData = function (portToRecConnNode) {
        var self = this,
            recordData = {
                name: null,
                type: null,
                connection: [
                    // src
                    // srcParent
                ]
            },
            connectionPromises = [];

        return self.core.loadPointer(portToRecConnNode, 'dst')
            .then(function(recordNode) {
                recordData.name = self.core.getAttribute(recordNode, 'name');
                connectionPromises.push(self.getConnectionData(portToRecConnNode));

                return Q.all(connectionPromises);
            })
            .then(function(connectionData) {
                recordData.connection = connectionData;
                return self.core.loadPointer(portToRecConnNode, 'src');
            })
            .then(function(srcNode) {
                var srcType = self.core.getAttribute(self.getMetaType(srcNode) , 'name');
                if (srcType === 'Unknown' || srcType === 'OutPromote') {
                    recordData.type = 'Unknown';
                } else if (srcType === 'Parameter' || srcType === 'InPromote') {
                    recordData.type = 'Param';
                }
                return recordData;
            });
    };


    MOCACodeGenerator.prototype.getConstraintData = function (portToConstraintConnNode) {
        var self = this,
            constraintData = {
                name: null,
                enableUpper: null,
                enableLower: null,
                upper: null,
                lower: null,
                connection: [
                    // src
                    // srcParent
                ]
            },
            connectionPromises = [];

        return self.core.loadPointer(portToConstraintConnNode, 'dst')
            .then(function(constraintNode) {
                constraintData.name = self.core.getAttribute(constraintNode, 'name');
                constraintData.enableUpper = self.core.getAttribute(constraintNode, 'EnableUpper');
                constraintData.upper = self.core.getAttribute(constraintNode, 'Upper').toString();
                constraintData.enableLower = self.core.getAttribute(constraintNode, 'EnableLower');
                constraintData.lower = self.core.getAttribute(constraintNode, 'Lower').toString();
                connectionPromises.push(self.getConnectionData(portToConstraintConnNode));

                return Q.all(connectionPromises);
            })
            .then(function(connectionData) {
                constraintData.connection = connectionData;
                return constraintData;
            });
    };


    MOCACodeGenerator.prototype.generateArtifact = function (pluginInvocation, dataModel) {
        var self = this,
            filesToAdd = {},
            deferred = new Q.defer();
        var artifact = null;
        if (pluginInvocation == 'ROOT')
            artifact = self.blobClient.createArtifact('MOCA');
        else
            artifact = self.blobClient.createArtifact(dataModel.problems[0].name);

        if (pluginInvocation == 'ROOT') {
            filesToAdd['MOCA.json'] = JSON.stringify(dataModel, null, 2);
            filesToAdd['MOCA_metadata.json'] = JSON.stringify({
                projectId: self.projectId,
                commitHash: self.commitHash,
                branchName: self.branchName,
                timeStamp: (new Date()).toISOString(),
                pluginVersion: self.getVersion()
            }, null, 2);
        }

        // parse dataModel for mismatching ontology link
        // TODO: Do this with the help of validator framework
        /*for (var i = 0; i < dataModel.groups.length; i++) {
            // for every group, check every data connection
            for (var j = 0; j < dataModel.groups[i].connections.length; j++) {
                if (dataModel.groups[i].connections[j].srcOnto !== dataModel.groups[i].connections[j].dstOnto) {
                    alert('WARNING: In Group ' + dataModel.groups[i].name
                        + ', port ' + dataModel.groups[i].connections[j].src + ' of ' + dataModel.groups[i].connections[j].srcParent
                        + ' is associated to different ontological element than that of '
                        + 'port ' + dataModel.groups[i].connections[j].dst + ' of ' + dataModel.groups[i].connections[j].dstParent);
                }
            }
        }*/

        /*for (var i = 0; i < dataModel.problems.length; i++) {
            // for every group, check every data connection
            for (var j = 0; j < dataModel.problems[i].connections.length; j++) {
                if (dataModel.problems[i].connections[j].srcOnto !== dataModel.problems[i].connections[j].dstOnto) {
                    alert('WARNING: In Problem ' + dataModel.problems[i].name
                        + ', port ' + dataModel.problems[i].connections[j].src + ' of ' + dataModel.problems[i].connections[j].srcParent
                        + ' is associated to different ontological element than that of '
                        + 'port ' + dataModel.problems[i].connections[j].dst + ' of ' + dataModel.problems[i].connections[j].dstParent);
                }
            }
        }*/

        self.addPythonSourceFiles(filesToAdd, dataModel);

        artifact.addFiles(filesToAdd, function (err) {
            if (err) {
                deferred.reject(new Error(err));
                return;
            }
            self.blobClient.saveAllArtifacts(function (err, hashes) {
                if (err) {
                    deferred.reject(new Error(err));
                    return;
                }

                self.result.addArtifact(hashes[0]);
                deferred.resolve();
            });
        });

        return deferred.promise;
    };


    MOCACodeGenerator.prototype.addPythonSourceFiles = function (filesToAdd, dataModel) {
        var self = this;

        self.FILES.forEach(function (fileInfo) {
            if (fileInfo.name === 'components' || fileInfo.name === 'groups') {
                var genFileName = 'MOCA_GeneratedCode/lib/' + fileInfo.name + '.py';
                self.logger.debug(genFileName);
                filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel);
            } else if (fileInfo.name === 'problems') {
                // If the filename is "problem" - use the template for problems
                // additionally generate .bat file for that as well
                for (var i = 0; i < dataModel.problems.length; i++) {
                    var genFileName = 'MOCA_GeneratedCode/src/' + dataModel.problems[i].name + '.py',
                        genIpynbFile = 'MOCA_GeneratedCode/' + dataModel.problems[i].name + '.ipynb' ;
                    self.logger.debug(genFileName);
                    filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.problems[i]);
                    filesToAdd[genIpynbFile] = ejs.render(TEMPLATES[fileInfo.ipynbfile], dataModel.problems[i]);
                }
            } else if (fileInfo.name === 'parsing utilities') {
                // If the filename is parsing utilities - use the template for utilities
                // Template for utilities is not required to be populated with
                // Application specific data
                var genFileName = 'MOCA_GeneratedCode/util/MOCAparseutils.py'
                filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], null);
            } else if (fileInfo.name === 'plotting utilities') {
                // If the filename is plotting utilities - use the template for utilities
                // Template for utilities is not required to be populated with
                // Application specific data
                var genFileName = 'MOCA_GeneratedCode/util/MOCAplotutils.py'
                filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel);
            }
        });

        // Create __init__.py file in the lib, src and util directories each
        var subdirectories = ['lib', 'src', 'util'];
        for (var i = 0; i < subdirectories.length; i++) {
            var initFileName = 'MOCA_GeneratedCode/' + subdirectories[i] + '/__init__.py',
                initFileContent = '# A boilerplate file to enable this directory to be imported as a module';
            filesToAdd[initFileName] = initFileContent;
        }

        // Create out directory for storing output files in case of recorders
        // TODO: Create only directory (creating a dummy placeholder file for now)
        var outDirName = 'MOCA_GeneratedCode/out/dummy.txt';
        filesToAdd[outDirName] = '';

        // Create a batch file to launch ipython notebook
        var ipynbLaunchScriptName = 'MOCA_GeneratedCode/launch_iPythonNotebook.bat';
        filesToAdd[ipynbLaunchScriptName] = 'echo off\nipython notebook --port=9999'

        //TODO Add the static files too.
        self.logger.info('Generated python files for MOCA');
    };

    return MOCACodeGenerator;
});
