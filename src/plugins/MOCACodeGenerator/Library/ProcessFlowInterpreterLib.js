/**
 * Created by Amogh on 10/31/2017.
 */

define([
    'q',
    'plugin/MOCACodeGenerator/MOCACodeGenerator/Library/ConnectionInterpreterLib'
], function (Q, connInterpreter) {

    /**
     * The class giving handles to interpreter methods for DataDrivenComponent and related entities
     * @constructor
     */
    var ProcessFlowInterpreterLib = function () {};

    /**
     * The method to get the data of a Process node
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param processNode - The Process node
     * @returns {{name: (GmeCommon.OutAttr|string|*), processingTime: (GmeCommon.OutAttr|string|*), processShiftOffTime: (GmeCommon.OutAttr|string|*), processShiftOnTime: (GmeCommon.OutAttr|string|*)}}
     *      - Name, Cycle time of the process in minutes, Shift of the process (how much time it should be on and it
     *      should be off in minutes)
     */
    ProcessFlowInterpreterLib.prototype.getProcessData = function (MOCAPlugin, processNode) {
        var processData = {
            name: MOCAPlugin.core.getAttribute(processNode, 'name'),
            processingTime: {
                desParam: false,
                name: 'processing_time',
                value: MOCAPlugin.core.getAttribute(processNode, 'ProcessingTime')
            },
            processShiftOffTime: {
                desParam: false,
                name: 'process_shift_off_time',
                value: MOCAPlugin.core.getAttribute(processNode, 'ProcessOFFTime')
            },
            processShiftOnTime: {
                desParam: false,
                name: 'process_shift_on_time',
                value: MOCAPlugin.core.getAttribute(processNode, 'ProcessONTime')
            },
            maintenances: []
        };
        var maintenancePromises = [];

        return MOCAPlugin.core.loadChildren(processNode)
            .then(function (children) {
                for (var i = 0; i < children.length; i++) {
                    var childMetaType = MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]), 'name');

                    if (childMetaType === 'ProcessONTime') {
                        processData.processShiftOnTime.desParam = true;
                        processData.processShiftOnTime.value = MOCAPlugin.core.getAttribute(children[i], 'value');
                    } else if (childMetaType === 'ProcessOFFTime') {
                        processData.processShiftOffTime.desParam = true;
                        processData.processShiftOffTime.value = MOCAPlugin.core.getAttribute(children[i], 'value');
                    } else if (childMetaType === 'ProcessingTime') {
                        processData.processingTime.desParam = true;
                        processData.processingTime.value = MOCAPlugin.core.getAttribute(children[i], 'value');
                    } else if (childMetaType === 'UnexpectedMaintenance') {
                        maintenancePromises.push(ProcessFlowInterpreterLib.prototype.getUnexpectedMaintData(MOCAPlugin, children[i]));
                    } else if (childMetaType === 'UsageBasedMaintenance') {
                        maintenancePromises.push(ProcessFlowInterpreterLib.prototype.getUsageBasedMaintData(MOCAPlugin, children[i]));
                    }
                }
                return Q.all(maintenancePromises);
            })
            .then(function (maintenanceData) {
                processData.maintenances = maintenanceData;
                return processData;
            })
    };

    /**
     * The method to get the data of an UnexpectedMaintenance node
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param unexpectedMaintNode - The UnexpectedMaintenance node
     * @return {Promise<T>} - The promise to be resolved for the UnexpectedMaintenance data
     */
    ProcessFlowInterpreterLib.prototype.getUnexpectedMaintData = function (MOCAPlugin, unexpectedMaintNode) {
        var unexpectedMaintData = {
            name: MOCAPlugin.core.getAttribute(unexpectedMaintNode, 'name'),
            durationMean: {
                desParam: false,
                value: MOCAPlugin.core.getAttribute(unexpectedMaintNode, 'DurationMean')
            },
            mtbf: {
                desParam: false,
                value: MOCAPlugin.core.getAttribute(unexpectedMaintNode, 'MTBF')
            }
        };

        return MOCAPlugin.core.loadChildren(unexpectedMaintNode)
            .then(function (children) {
                for (var i = 0; i < children.length; i++) {
                    var childMetaType = MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]), 'name');
                    if (childMetaType === 'DurationMean') {
                        unexpectedMaintData.durationMean.desParam = true;
                        unexpectedMaintData.durationMean.value = MOCAPlugin.core.getAttribute(children[i], 'value');
                    } else if (childMetaType === 'MTBF') {
                        unexpectedMaintData.mtbf.desParam = true;
                        unexpectedMaintData.mtbf.value = MOCAPlugin.core.getAttribute(children[i], 'value');
                    }
                }
                return unexpectedMaintData;
            });
    };

    /**
     * The method to get the data of a UsageBasedMaintenance node
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param usageBasedMaintNode - The UsageBasedMaintenance node
     * @return {Promise<T>} - The promise to be resolved for the UsageBasedMaintenance data
     */
    ProcessFlowInterpreterLib.prototype.getUsageBasedMaintData = function (MOCAPlugin, usageBasedMaintNode) {
        var usageBasedMaintData = {
            name: MOCAPlugin.core.getAttribute(usageBasedMaintNode, 'name'),
            durationMean: {
                desParam: false,
                value: MOCAPlugin.core.getAttribute(usageBasedMaintNode, 'DurationMean')
            },
            cycles: {
                desParam: false,
                value: MOCAPlugin.core.getAttribute(usageBasedMaintNode, 'Cycles')
            }
        };

        return MOCAPlugin.core.loadChildren(usageBasedMaintNode)
            .then(function (children) {
                for (var i = 0; i < children.length; i++) {
                    var childMetaType = MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]), 'name');
                    if (childMetaType === 'DurationMean') {
                        usageBasedMaintData.durationMean.desParam = true;
                        usageBasedMaintData.durationMean.value = MOCAPlugin.core.getAttribute(children[i], 'value');
                    } else if (childMetaType === 'Cycles') {
                        usageBasedMaintData.cycles.desParam = true;
                        usageBasedMaintData.cycles.value = MOCAPlugin.core.getAttribute(children[i], 'value');
                    }
                }
                return usageBasedMaintData;
            });
    };

    /**
     * The method to get the data of a Buffer node
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param bufferNode - The Buffer node
     * @returns {{name: (GmeCommon.OutAttr|string|*), size: (GmeCommon.OutAttr|string|*)}}
     *      - Name and Size of the Buffer node
     */
    ProcessFlowInterpreterLib.prototype.getBufferData = function (MOCAPlugin, bufferNode) {
        var bufferData = {
            name: MOCAPlugin.core.getAttribute(bufferNode, 'name'),
            size: {
                desParam: false,
                name: MOCAPlugin.core.getAttribute(bufferNode, 'Size')
            }
        };

        return MOCAPlugin.core.loadChildren(bufferNode)
            .then(function (children) {
                for (var i = 0; i < children.length; i++) {
                    var childMetaType = MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]), 'name');

                    if (childMetaType === 'Size') {
                        bufferData.size.desParam = true;
                        bufferData.size.value = MOCAPlugin.core.getAttribute(children[i], 'value');
                    }
                }
                return bufferData;
            })
    };

    /**
     * The method to get the data of the interface to MOCA elements (Parameters and Unknowns). The usual method to get
     * the data of a connection cannot be used because the information to be retrieved is non-uniform and depends upon
     * the type of dst and dstParent.
     * @param MOCAPlugin
     * @param connectionNode
     */
    ProcessFlowInterpreterLib.prototype.getInterfaceData = function (MOCAPlugin, connectionNode) {
        var deferred = Q.defer(),
            connectionData = {
                src: null,
                srcMeta: null,
                srcOnto: "",
                dst: null,
                dstMeta: null,
                dstParent: null,
                dstParentMeta: null,
                dstGrandParent: null,
                dstGrandParentMeta: null,
                dstOnto: ""
            };

        MOCAPlugin.core.loadPointer(connectionNode, 'src', function (err, srcNode) {
            if (err) {
                deferred.reject(new Error(err))
            } else {
                var srcMeta = MOCAPlugin.getMetaType(srcNode);

                connectionData.src = MOCAPlugin.core.getAttribute(srcNode, 'name');

                var srcMetaName = MOCAPlugin.core.getAttribute(srcMeta, 'name');
                if (srcMetaName === 'Parameter') {
                    connectionData.srcMeta = 'in';
                } else if (srcMetaName === 'Unknown') {
                    connectionData.srcMeta = 'out';
                }

                MOCAPlugin.core.loadPointer(connectionNode, 'dst', function (err, dstNode) {
                    if (err) {
                        deferred.reject(new Error(err));
                    } else {
                        var dstParent = MOCAPlugin.core.getParent(dstNode),
                            dstMeta = MOCAPlugin.getMetaType(dstNode),
                            dstParentMeta = MOCAPlugin.getMetaType(dstParent),
                            dstGrandParent = MOCAPlugin.core.getParent(dstParent),
                            dstGrandParentMeta = MOCAPlugin.getMetaType(dstGrandParent);

                        connectionData.dst = MOCAPlugin.core.getAttribute(dstNode, 'name');
                        connectionData.dstMeta = MOCAPlugin.core.getAttribute(dstMeta, 'name');
                        connectionData.dstParent = MOCAPlugin.core.getAttribute(dstParent, 'name');
                        connectionData.dstParentMeta = MOCAPlugin.core.getAttribute(dstParentMeta, 'name');
                        if ((connectionData.dstParentMeta === 'UnexpectedMaintenance')
                            || (connectionData.dstParentMeta === 'UsageBasedMaintenance')
                            || (connectionData.dstParentMeta === 'TimeBasedMaintenance')) {
                            connectionData.dstGrandParent = MOCAPlugin.core.getAttribute(dstGrandParent, 'name');
                            connectionData.dstGrandParentMeta = MOCAPlugin.core.getAttribute(dstGrandParentMeta, 'name');
                        }

                        deferred.resolve(connectionData);
                    }
                });
            }
        });

        return deferred.promise;
    };

    /**
     * The method to get the data from a ProcessFlow node. This method will be called from the MOCACodeGenerator
     * plugin class. This will internally collect all the data from the Problem's children using the
     * methods of this class (written above). This method will be called from the context of MOCACodeGenerator,
     * thus `this` refers to MOCACodeGenerator plugin in it, and core and other utils are accessed through `this` handle.
     *
     * @param processFlowNode - The ProcessFlow node
     * @returns {Promise} - Promise object resolving to the data of the ProcessFlow node and its children
     */
    ProcessFlowInterpreterLib.prototype.getProcessFlowData = function (processFlowNode) {
        var MOCAPlugin = this,
            processFlowData = {
                name: MOCAPlugin.core.getAttribute(processFlowNode, 'name'),
                simend: MOCAPlugin.core.getAttribute(processFlowNode, 'SimulationEndTime'),
                processes: [],
                buffers: [],
                connections: [],
                desInterfaces: []
            },
            processPromises = [],
            bufferPromises = [],
            connectionPromises = [],
            desInterfacePromises = [];

        return MOCAPlugin.core.loadChildren(processFlowNode)
            .then(function(children) {
                for (var i = 0; i < children.length; i++) {
                    var childMetaType = MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]), 'name');

                    if (childMetaType === 'Process') {
                        processPromises.push(ProcessFlowInterpreterLib.prototype.getProcessData(MOCAPlugin, children[i]));
                    } else if (childMetaType === 'Buffer') {
                        bufferPromises.push(ProcessFlowInterpreterLib.prototype.getBufferData(MOCAPlugin, children[i]));
                    } else if (childMetaType === 'ProcToBuffFlow' || childMetaType === 'BuffToProcFlow') {
                        connectionPromises.push(connInterpreter.getConnectionData(MOCAPlugin, children[i]));
                    } else if (childMetaType === 'ParamToDESInAssoc' || childMetaType === 'UnknownToDESOutAssoc') {
                        desInterfacePromises.push(ProcessFlowInterpreterLib.prototype.getInterfaceData(MOCAPlugin, children[i]));
                    }
                }

                return Q.all(processPromises);
            })
            .then(function (processesData) {
                processFlowData.processes = processesData;
                return Q.all(bufferPromises);
            })
            .then(function (buffersData) {
                processFlowData.buffers = buffersData;
                return Q.all(connectionPromises);
            })
            .then(function (connectionsData) {
                processFlowData.connections = connectionsData;
                return Q.all(desInterfacePromises);
            })
            .then(function (desInterfacesData) {
                processFlowData.desInterfaces = desInterfacesData;
                return processFlowData;
            })
    };

    return ProcessFlowInterpreterLib.prototype;
});
