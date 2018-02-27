/**
 * Created by Amogh on 10/31/2017.
 */

define([
    'q',
    'plugin/MOCACodeGenerator/MOCACodeGenerator/Library/ConnectionInterpreterLib'
], function (Q, connInterpreter) {

    /**
     * The class containing utilities to generate code
     * @constructor
     */
    var MOCAInterpreterLib = function () {};

    /**
     * A recursive method which finds out the original base of the given node, in case there is of arbitrarily deep hierarchy
     * of the Groups. This results from the object representation in WebGME and not from the object representation in
     * the modeling language.
     *
     * @param compOrGroup {string} - String providing the information about if the method is called for a Component or
     *      a Group
     * @param promiseList - The list of Promise objects that is populated and carried forward through the calls
     * @param node - The Component or Group node
     * @retuns {Promise} - The list of Promise objects that are for the original Components/Groups base entities
     *      (defined in the ComponentLibrary/GroupLibrary etc.)
     */
    MOCAInterpreterLib.prototype.getOriginalBase = function(compOrGroup, promiseList, node) {
        var MOCAPlugin = this,
            baseToPush = null;
        if (compOrGroup === 'Component') {
            baseToPush = MOCAPlugin.core.getBase(node);
            while (MOCAPlugin.core.getAttribute(MOCAPlugin.core.getParent(baseToPush), 'name') !== 'ComponentLibrary'
            || MOCAPlugin.core.getAttribute(MOCAPlugin.core.getBase(baseToPush), 'name') !== 'Component')
                baseToPush = MOCAPlugin.core.getBase(baseToPush);
            promiseList.push(MOCAPlugin.getComponentData(baseToPush));
        }
        else if (compOrGroup === 'Group') {
            baseToPush = MOCAPlugin.core.getBase(node);
            while (MOCAPlugin.core.getAttribute(MOCAPlugin.core.getParent(baseToPush), 'name') !== 'GroupLibrary'
            || MOCAPlugin.core.getAttribute(MOCAPlugin.core.getBase(baseToPush), 'name') !== 'Group')
                baseToPush = MOCAPlugin.core.getBase(baseToPush);
            promiseList.push(MOCAPlugin.getGroupData(baseToPush));
        }
        else if (compOrGroup === 'DataDrivenComponent') {
            baseToPush = MOCAPlugin.core.getBase(node);
            while (MOCAPlugin.core.getAttribute(MOCAPlugin.core.getParent(baseToPush), 'name') !== 'ComponentLibrary'
            || MOCAPlugin.core.getAttribute(MOCAPlugin.core.getBase(baseToPush), 'name') !== 'DataDrivenComponent')
                baseToPush = MOCAPlugin.core.getBase(baseToPush);
            promiseList.push(MOCAPlugin.getDDComponentData(baseToPush));
        }
        else if (compOrGroup === 'ProcessFlow') {
            baseToPush = MOCAPlugin.core.getBase(node);
            while (MOCAPlugin.core.getAttribute(MOCAPlugin.core.getParent(baseToPush), 'name') !== 'ProcessFlowLibrary'
            || MOCAPlugin.core.getAttribute(MOCAPlugin.core.getBase(baseToPush), 'name') !== 'ProcessFlow')
                baseToPush = MOCAPlugin.core.getBase(baseToPush);
            promiseList.push(MOCAPlugin.getProcessFlowData(baseToPush));
        }
    };

    /**
     * A recursive method which goes through a Group and finds out what Group(s) and/or Component(s) are instantiated
     * in it. It has to be recursive, because a Group can contain a Group - in which case the same function is called.
     *
     * @param componentPromises - The list containing Promise objects for the Components. It is carried forward in
     *      recursive calls.
     * @param groupPromises - The list containing Promise objects for the Groups. It is carried forward in the recursive
     *      calls.
     * @param groupNode - The Group node
     * @returns {Promise} - The list of Promise objects that are for the Groups contained by the Group node
     */
    MOCAInterpreterLib.prototype.recursivelyPopulateGroupContents = function(componentPromises, groupPromises, groupNode) {
        var MOCAPlugin = this,
            recursivePromises = [];

        // Traverse to its base class through the instance tree
        MOCAPlugin.getOriginalBase('Group', groupPromises, groupNode);

        return MOCAPlugin.core.loadChildren(groupNode)
            .then(function (children) {
                for (var i = 0; i < children.length; i++) {
                    // If it is a Component..
                    if (MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]) , 'name') === 'Component'
                        || MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]) , 'name') === 'DataDrivenComponent') {
                        // Traverse to its base class through the instance tree
                        MOCAPlugin.getOriginalBase('Component', componentPromises, children[i]);
                    }
                    // If it is a ProcessFlow..
                    else if (MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]), 'name') === 'ProcessFlow') {
                        MOCAPlugin.getOriginalBase('ProcessFlow', componentPromises, children[i]);
                    }
                    // If it is a Group (be careful here!)..
                    else if (MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]) , 'name') === 'Group') {
                        recursivePromises.push(MOCAPlugin.recursivelyPopulateGroupContents(componentPromises, groupPromises, children[i]));
                    }
                }
                return recursivePromises;
            });
    };

    /**
     * The method to get the data from a Component (defined in a ComponentLibrary)
     * @param componentNode - The Component node
     * @returns {Promise} - Promise object resolving to the data of the Component node
     */
    MOCAInterpreterLib.prototype.getComponentData = function(componentNode) {
        var MOCAPlugin = this,
            componentData = {
                name: MOCAPlugin.core.getAttribute(componentNode, 'name'),
                type: MOCAPlugin.core.getAttribute(componentNode, 'Type'),
                force_fd: MOCAPlugin.core.getAttribute(componentNode, 'ForceFD'),
                outputFunction: MOCAPlugin.core.getAttribute(componentNode, 'OutputFunction'),
                jacobian: MOCAPlugin.core.getAttribute(componentNode, 'Jacobian'),
                parameters: [],
                unknowns: []
            },
            parameterPromises = [],
            unknownPromises = [];

        return MOCAPlugin.core.loadChildren(componentNode)
            .then(function(children) {
                for (var i = 0; i < children.length; i++) {
                    if (MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]), 'name') === 'Parameter')
                        parameterPromises.push(MOCAInterpreterLib.prototype.getParameterData(MOCAPlugin, children[i]));
                    else if (MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]), 'name') === 'Unknown')
                        unknownPromises.push(MOCAInterpreterLib.prototype.getUnknownData(MOCAPlugin, children[i]));
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

    // /**
    //  * The method to get the data from a DataDrivenComponent (defined in a ComponentLibrary)
    //  * @param ddComponentNode - The DataDrivenComponent node
    //  * @returns {Promise} - Promise object resolving to the data of the DataDrivenComponent node
    //  */
    // MOCAInterpreterLib.prototype.getDDComponentData = function(ddComponentNode) {
    //     var MOCAPlugin = this,
    //         ddComponentData = {
    //             name: MOCAPlugin.core.getAttribute(ddComponentNode, 'name'),
    //             parameters: [],
    //             unknowns: []
    //         },
    //         parameterPromises = [],
    //         unknownPromises = [];
    //
    //     return MOCAPlugin.core.loadChildren(ddComponentNode)
    //         .then(function(children) {
    //             for (var i = 0; i < children.length; i++) {
    //                 if (MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]), 'name') === 'Parameter')
    //                     parameterPromises.push(MOCAInterpreterLib.prototype.getParameterData(MOCAPlugin, children[i]));
    //                 else if (MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]), 'name') === 'Unknown')
    //                     unknownPromises.push(MOCAInterpreterLib.prototype.getUnknownData(MOCAPlugin, children[i]));
    //             }
    //
    //             return Q.all(parameterPromises);
    //         })
    //         .then(function (parametersData) {
    //             ddComponentData.parameters = parametersData;
    //             return Q.all(unknownPromises);
    //         })
    //         .then(function (unknownsData) {
    //             ddComponentData.unknowns = unknownsData;
    //             return ddComponentData;
    //         });
    // };

    /**
     * The method to get the data of a Group (defined in a GroupLibrary)
     * @param groupNode - The Group node
     * @returns {Promise} - Promise object resolving to the data of the Group node
     */
    MOCAInterpreterLib.prototype.getGroupData = function(groupNode) {
        var MOCAPlugin = this,
            groupData = {
                name: MOCAPlugin.core.getAttribute(groupNode, 'name'),
                algebraicLoop: MOCAPlugin.core.getAttribute(groupNode, 'AlgebraicLoop'),
                compInstances: [],
                groupInstances: [],
                connections: []
            },
            compInstancePromises = [],
            groupInstancePromises = [],
            connectionPromises = [];

        return MOCAPlugin.core.loadChildren(groupNode)
            .then(function(children) {
                for (var i = 0; i < children.length; i++) {
                    if (MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]), 'name') === 'Component')
                        compInstancePromises.push(MOCAInterpreterLib.prototype.getCompInstanceData(MOCAPlugin, children[i]));
                    else if (MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]), 'name') === 'Group')
                        groupInstancePromises.push(MOCAInterpreterLib.prototype.getGroupInstanceData(MOCAPlugin, children[i]));
                    else if (MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]), 'name') === 'DataConn')
                        connectionPromises.push(connInterpreter.getConnectionData(MOCAPlugin, children[i]));
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

    /**
     * The method to get the data from an instance node of a Component node
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param compInstanceNode - The instance node of a Component node
     * @returns {Promise} - Promise object resolving to the data of the instance node of a Component
     */
    MOCAInterpreterLib.prototype.getCompInstanceData = function (MOCAPlugin, compInstanceNode) {
        var compInstancesData = {
                name: MOCAPlugin.core.getAttribute(compInstanceNode, 'name'),
                base: MOCAPlugin.core.getAttribute(MOCAPlugin.core.getBase(compInstanceNode), 'name'),
                promotes: []
            };

        return MOCAPlugin.core.loadChildren(compInstanceNode)
            .then(function(children) {
                var promotePromises = [];
                for (var i = 0; i < children.length; i++) {
                    promotePromises.push(MOCAPlugin.core.loadCollection(children[i], 'dst')
                        .then(function(connections) {
                            var pointerPromises = [];
                            for (var j = 0; j < connections.length; j++) {
                                if (MOCAPlugin.core.getAttribute(connections[j], 'name') === 'PrToPortAssoc') {
                                    pointerPromises.push(MOCAPlugin.core.loadPointer(connections[j], 'dst'));
                                }
                            }
                            return Q.all(pointerPromises);
                        })
                        .then(function(dstNodes) {
                            for (var j = 0; j < dstNodes.length; j++) {
                                compInstancesData.promotes.push(MOCAPlugin.core.getAttribute(dstNodes[j], 'name'));
                            }
                        })
                    );
                }
            })
            .then(function() {
                return compInstancesData;
            });
    };

    /**
     * The method to get the data from an instance node of a DataDrivenComponent node
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param ddCompInstanceNode - The instance node of a DataDrivenComponent node
     * @returns {Promise} - Promise object resolving to the data of the instance node of a DataDrivenComponent
     */
    MOCAInterpreterLib.prototype.getDDCompInstanceData = function (MOCAPlugin, ddCompInstanceNode) {
        var ddCompInstancesData = {
            name: MOCAPlugin.core.getAttribute(ddCompInstanceNode, 'name'),
            base: MOCAPlugin.core.getAttribute(MOCAPlugin.core.getBase(ddCompInstanceNode), 'name'),
            promotes: []
        };

        return MOCAPlugin.core.loadChildren(ddCompInstanceNode)
            .then(function(children) {
                var promotePromises = [];
                for (var i = 0; i < children.length; i++) {
                    promotePromises.push(MOCAPlugin.core.loadCollection(children[i], 'dst')
                        .then(function(connections) {
                            var pointerPromises = [];
                            for (var j = 0; j < connections.length; j++) {
                                if (MOCAPlugin.core.getAttribute(connections[j], 'name') === 'PrToPortAssoc') {
                                    pointerPromises.push(MOCAPlugin.core.loadPointer(connections[j], 'dst'));
                                }
                            }
                            return Q.all(pointerPromises);
                        })
                        .then(function(dstNodes) {
                            for (var j = 0; j < dstNodes.length; j++) {
                                ddCompInstancesData.promotes.push(MOCAPlugin.core.getAttribute(dstNodes[j], 'name'));
                            }
                        })
                    );
                }
            })
            .then(function() {
                return ddCompInstancesData;
            });
    };

    MOCAInterpreterLib.prototype.getProcFlowInstanceData = function (MOCAPlugin, procFlowInstanceNode) {
        var procFlowInstancesData = {
            name: MOCAPlugin.core.getAttribute(procFlowInstanceNode, 'name'),
            base: MOCAPlugin.core.getAttribute(MOCAPlugin.core.getBase(procFlowInstanceNode), 'name'),
            promotes: []
        };

        return MOCAPlugin.core.loadChildren(procFlowInstanceNode)
            .then(function(children) {
                var promotePromises = [];
                for (var i = 0; i < children.length; i++) {
                    promotePromises.push(MOCAPlugin.core.loadCollection(children[i], 'dst')
                        .then(function(connections) {
                            var pointerPromises = [];
                            for (var j = 0; j < connections.length; j++) {
                                if (MOCAPlugin.core.getAttribute(connections[j], 'name') === 'PrToPortAssoc') {
                                    pointerPromises.push(MOCAPlugin.core.loadPointer(connections[j], 'dst'));
                                }
                            }
                            return Q.all(pointerPromises);
                        })
                        .then(function(dstNodes) {
                            for (var j = 0; j < dstNodes.length; j++) {
                                ddCompInstancesData.promotes.push(MOCAPlugin.core.getAttribute(dstNodes[j], 'name'));
                            }
                        })
                    );
                }
            })
            .then(function() {
                return procFlowInstancesData;
            });
    };

    /**
     * The method to get the data from an instance node of a Group node
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param groupInstanceNode - The instance node of a Group
     * @returns {Promise} - Promise object resolving to the data of the instance node of a Group
     */
    MOCAInterpreterLib.prototype.getGroupInstanceData = function (MOCAPlugin, groupInstanceNode) {
        var groupInstancesData = {
                name: MOCAPlugin.core.getAttribute(groupInstanceNode, 'name'),
                base: MOCAPlugin.core.getAttribute(MOCAPlugin.core.getBase(groupInstanceNode), 'name'),
                promotes: []
            };

        return MOCAPlugin.core.loadChildren(groupInstanceNode)
            .then(function(children) {
                var promotePromises = [];
                for (var i = 0; i < children.length; i++) {
                    promotePromises.push(MOCAPlugin.core.loadCollection(children[i], 'dst')
                        .then(function(connections) {
                            var pointerPromises = [];
                            for (var j = 0; j < connections.length; j++) {
                                if (MOCAPlugin.core.getAttribute(connections[j], 'name') === 'PrToPortAssoc') {
                                    pointerPromises.push(MOCAPlugin.core.loadPointer(connections[j], 'dst'));
                                }
                            }
                            return Q.all(pointerPromises);
                        })
                        .then(function(dstNodes) {
                            for (var j = 0; j < dstNodes.length; j++) {
                                groupInstancesData.promotes.push(MOCAPlugin.core.getAttribute(dstNodes[j], 'name'));
                            }
                        })
                    );
                }
            })
            .then(function () {
                return groupInstancesData;
            });
    };

    MOCAInterpreterLib.prototype.getProblemInstanceData = function (MOCAPlugin, problemInstanceNode) {
        var problemInstancesData = {
            name: MOCAPlugin.core.getAttribute(problemInstanceNode, 'name'),
            base: MOCAPlugin.core.getAttribute(MOCAPlugin.core.getBase(problemInstanceNode), 'name'),
            promotes: []
        };

        return MOCAPlugin.core.loadChildren(problemInstanceNode)
            .then(function(children) {
                var promotePromises = [];
                for (var i = 0; i < children.length; i++) {
                    promotePromises.push(MOCAPlugin.core.loadCollection(children[i], 'dst')
                        .then(function(connections) {
                            var pointerPromises = [];
                            for (var j = 0; j < connections.length; j++) {
                                if (MOCAPlugin.core.getAttribute(connections[j], 'name') === 'PrToPortAssoc') {
                                    pointerPromises.push(MOCAPlugin.core.loadPointer(connections[j], 'dst'));
                                }
                            }
                            return Q.all(pointerPromises);
                        })
                        .then(function(dstNodes) {
                            for (var j = 0; j < dstNodes.length; j++) {
                                problemInstancesData.promotes.push(MOCAPlugin.core.getAttribute(dstNodes[j], 'name'));
                            }
                        })
                    );
                }
            })
            .then(function () {
                return problemInstancesData;
            });
    };

    /**
     * The method to get the data from a DesignVariable node
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param desvarToInConnNode - The connection node from the DesignVariable node to the input port connected to it.
     *      The connection node is used so that even if there is a 'hanging' DesignVariable node, the method wouldn't
     *      fail. Besides, a DesignVariable can be connected to more than one input ports.
     * @returns {Promise} - Promise object resolving to the data of the DesignVariable node
     */
    MOCAInterpreterLib.prototype.getDesignVariableData = function (MOCAPlugin, desvarToInConnNode) {
        var designvariableData = {
                name: null,
                upper: null,
                lower: null,
                value: null,
                setByDriver: null,
                connection: []
            },
            connectionPromises = [];

        return MOCAPlugin.core.loadPointer(desvarToInConnNode, 'src')
            .then(function(designvariableNode) {
                designvariableData.name = MOCAPlugin.core.getAttribute(designvariableNode, 'name');
                designvariableData.upper = MOCAPlugin.core.getAttribute(designvariableNode, 'Upper');
                designvariableData.lower = MOCAPlugin.core.getAttribute(designvariableNode, 'Lower');
                designvariableData.value = MOCAPlugin.core.getAttribute(designvariableNode, 'Value');
                designvariableData.setByDriver = MOCAPlugin.core.getAttribute(designvariableNode, 'SetByDriver');
                connectionPromises.push(connInterpreter.getConnectionData(MOCAPlugin, desvarToInConnNode));

                return Q.all(connectionPromises);
            })
            .then(function(connectionData) {
                designvariableData.connection = connectionData;
                return designvariableData;
            });
    };


    /**
     * The method to get the data from an Objective node
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param outToObjConnNode - The connection node from the output port to the Objective node. The connection node is
     *      used so that even if there is a 'hanging' Objective node, the method wouldn't fail.
     * @returns {Promise} - Promise object resolving to the data of the Objective node
     */
    MOCAInterpreterLib.prototype.getObjectiveData = function (MOCAPlugin, outToObjConnNode) {
        var objectiveData = {
                name: null,
                connection: []
            },
            connectionPromises = [];

        return MOCAPlugin.core.loadPointer(outToObjConnNode, 'dst')
            .then(function(objectiveNode) {
                objectiveData.name = MOCAPlugin.core.getAttribute(objectiveNode, 'name');
                connectionPromises.push(connInterpreter.getConnectionData(MOCAPlugin, outToObjConnNode));

                return Q.all(connectionPromises);
            })
            .then(function(connectionData) {
                objectiveData.connection = connectionData;
                return objectiveData;
            });
    };

    /**
     * The method to get the data from a Record node
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param portToRecConnNode - The connection node from the Port node to Record node. The connection node is used
     *      so that even if there is a 'hanging' Record node, the method wouldn't fail.
     * @returns {Promise} - Promise object resolving to the data of the Record node
     */
    MOCAInterpreterLib.prototype.getRecordData = function (MOCAPlugin, portToRecConnNode) {
        var recordData = {
                name: null,
                type: null,
                connection: []
            },
            connectionPromises = [];

        return MOCAPlugin.core.loadPointer(portToRecConnNode, 'dst')
            .then(function(recordNode) {
                recordData.name = MOCAPlugin.core.getAttribute(recordNode, 'name');
                connectionPromises.push(connInterpreter.getConnectionData(MOCAPlugin, portToRecConnNode));

                return Q.all(connectionPromises);
            })
            .then(function(connectionData) {
                recordData.connection = connectionData;
                return MOCAPlugin.core.loadPointer(portToRecConnNode, 'src');
            })
            .then(function(srcNode) {
                var srcType = MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(srcNode) , 'name');
                if (srcType === 'Unknown' || srcType === 'OutPromote') {
                    recordData.type = 'Unknown';
                } else if (srcType === 'Parameter' || srcType === 'InPromote') {
                    recordData.type = 'Param';
                }
                return recordData;
            });
    };

    /**
     * The method to get the data from a Constraint node
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param portToConstraintConnNode - The connection node from the Port node to Constraint node. The connection node
     *      is used so that even if there is a 'hanging' Constraint node, the method wouldn't fail.
     * @returns {Promise} - Promise object resolving to the data of the Constraint node
     */
    MOCAInterpreterLib.prototype.getConstraintData = function (MOCAPlugin, portToConstraintConnNode) {
        var constraintData = {
                name: null,
                enableUpper: null,
                enableLower: null,
                upper: null,
                lower: null,
                connection: []
            },
            connectionPromises = [];

        // First load the destination node i.e. Constraint node
        return MOCAPlugin.core.loadPointer(portToConstraintConnNode, 'dst')
            .then(function(constraintNode) {
                constraintData.name = MOCAPlugin.core.getAttribute(constraintNode, 'name');
                constraintData.enableUpper = MOCAPlugin.core.getAttribute(constraintNode, 'EnableUpper');
                constraintData.upper = MOCAPlugin.core.getAttribute(constraintNode, 'Upper').toString();
                constraintData.enableLower = MOCAPlugin.core.getAttribute(constraintNode, 'EnableLower');
                constraintData.lower = MOCAPlugin.core.getAttribute(constraintNode, 'Lower').toString();

                // Get the connection data as well (for src and srcParent)
                connectionPromises.push(connInterpreter.getConnectionData(MOCAPlugin, portToConstraintConnNode));

                return Q.all(connectionPromises);
            })
            .then(function(connectionData) {
                constraintData.connection = connectionData;
                return constraintData;
            });
    };

    /**
     * The method to get the data from a Parameter node (port)
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param parameterNode - The Parameter node
     * @returns {Promise} - Promise object resolving to the data of the Parameter node
     */
    MOCAInterpreterLib.prototype.getParameterData = function(MOCAPlugin, parameterNode) {
        var deferred = new Q.defer(),
            parameterData = {
                name: MOCAPlugin.core.getAttribute(parameterNode, 'name'),
                value: null
            };

        var valueString = MOCAPlugin.core.getAttribute(parameterNode, 'Value').toString();
        if (valueString.indexOf('.') === -1)
            valueString += ".0";

        parameterData.value = valueString;
        deferred.resolve(parameterData);

        return deferred.promise;
    };

    /**
     * The method to get the data from an Unknown node (port)
     * P.S. The type of the modeling entity itself is "Unknown", the node type is not unknown here.
     *
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param unknownNode - The Unknown node
     * @returns {Promise} - Promise object resolving to the data of the Unknown node
     */
    MOCAInterpreterLib.prototype.getUnknownData = function(MOCAPlugin, unknownNode) {
        var deferred = new Q.defer(),
            unknownData = {
                name: MOCAPlugin.core.getAttribute(unknownNode, 'name'),
                value: null
            };

        var valueString = MOCAPlugin.core.getAttribute(unknownNode, 'Value').toString();
        if (valueString.indexOf('.') === -1)
            valueString += ".0";

        unknownData.value = valueString;
        deferred.resolve(unknownData);

        return deferred.promise;
    };

    /**
     * The method to get the data from a Problem node. This method will be called from the MOCACodeGenerator
     * plugin class. This will internally collect all the data from the Problem's children using the
     * methods of this class (written above). This method will be called from the context of MOCACodeGenerator,
     * thus `this` refers to MOCACodeGenerator plugin in it, and core and other utils are accessed through `this` handle.
     *
     * @param problemNode - The Problem node
     * @returns {Promise} - Promise object resolving to the data of the Problem node and its children
     */
    MOCAInterpreterLib.prototype.getProblemData = function (problemNode) {
        var MOCAPlugin = this,
            problemData = {
                name: MOCAPlugin.core.getAttribute(problemNode, 'name'),
                driver: MOCAPlugin.core.getAttribute(problemNode, 'Driver'),
                doeSamples: MOCAPlugin.core.getAttribute(problemNode, 'Samples'),
                algebraicLoop: MOCAPlugin.core.getAttribute(problemNode, 'AlgebraicLoop'),
                constraints: [],
                compInstances: [],
                ddCompInstances: [],
                processFlowInstances: [],
                groupInstances: [],
                problemInstances: [],
                connections: [],
                desvars: [],
                objectives: [],
                records: [],
                promotes: []
            },
            constraintPromises = [],
            compInstancePromises = [],
            problemPromises = [],
            ddCompInstancePromises = [],
            procFlowInstancePromises = [],
            groupInstancePromises = [],
            connectionPromises = [],
            desvarPromises = [],
            objectivePromises = [],
            recordPromises = [],
            promotePromises = [];

        return MOCAPlugin.core.loadChildren(problemNode)
            .then(function(children) {
                for (var i = 0; i < children.length; i++) {
                    var childMetaType = MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]), 'name');

                    if (childMetaType === 'Component')
                        compInstancePromises.push(MOCAInterpreterLib.prototype.getCompInstanceData(MOCAPlugin, children[i]));
                    else if (childMetaType === 'Group')
                        groupInstancePromises.push(MOCAInterpreterLib.prototype.getGroupInstanceData(MOCAPlugin, children[i]));
                    else if (childMetaType === 'DesVarToInConn')
                        desvarPromises.push(MOCAInterpreterLib.prototype.getDesignVariableData(MOCAPlugin, children[i]));
                    else if (childMetaType === 'OutToObjConn')
                        objectivePromises.push(MOCAInterpreterLib.prototype.getObjectiveData(MOCAPlugin, children[i]));
                    else if (childMetaType === 'PortToRecConn')
                        recordPromises.push(MOCAInterpreterLib.prototype.getRecordData(MOCAPlugin, children[i]));
                    else if (childMetaType === 'PortToConstraintConn')
                        constraintPromises.push(MOCAInterpreterLib.prototype.getConstraintData(MOCAPlugin, children[i]));
                    else if (childMetaType === 'DataConn')
                        connectionPromises.push(connInterpreter.getConnectionData(MOCAPlugin, children[i]));
                    else if (childMetaType === 'DataDrivenComponent')
                        ddCompInstancePromises.push(MOCAInterpreterLib.prototype.getDDCompInstanceData(MOCAPlugin, children[i]));
                    else if (childMetaType === 'ProcessFlow')
                        procFlowInstancePromises.push(MOCAInterpreterLib.prototype.getProcFlowInstanceData(MOCAPlugin, children[i]));
                    else if (childMetaType === 'Problem')
                        problemPromises.push(MOCAInterpreterLib.prototype.getProblemInstanceData(MOCAPlugin, children[i]));
                    else if (childMetaType === 'PrToPortAssoc')
                        promotePromises.push(connInterpreter.getConnectionData(MOCAPlugin, children[i]));
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
                return Q.all(ddCompInstancePromises);
            })
            .then(function (ddCompInstancesData) {
                problemData.ddCompInstances = ddCompInstancesData;
                return Q.all(procFlowInstancePromises);
            })
            .then(function (procFlowInstancesData) {
                problemData.processFlowInstances = procFlowInstancesData;
                return Q.all(problemPromises);
            })
            .then(function (problemInstanceData) {
                problemData.problems = problemInstanceData;
                return Q.all(promotePromises);
            })
            .then(function (promoteData) {
                problemData.promotes = promoteData;
                return problemData;
            });
    };

    return MOCAInterpreterLib.prototype;
});
