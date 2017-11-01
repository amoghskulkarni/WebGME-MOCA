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
        return {
                name: MOCAPlugin.core.getAttribute(processNode, 'name'),
                processingTime: MOCAPlugin.core.getAttribute(processNode, 'ProcessingTime'),
                processShiftOffTime: MOCAPlugin.core.getAttribute(processNode, 'ProcessOFFTime'),
                processShiftOnTime: MOCAPlugin.core.getAttribute(processNode, 'ProcessONTime')
        }
    };

    /**
     * The method to get the data of a Buffer node
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param bufferNode - The Buffer node
     * @returns {{name: (GmeCommon.OutAttr|string|*), size: (GmeCommon.OutAttr|string|*)}}
     *      - Name and Size of the Buffer node
     */
    ProcessFlowInterpreterLib.prototype.getBufferData = function (MOCAPlugin, bufferNode) {
        return {
                name: MOCAPlugin.core.getAttribute(bufferNode, 'name'),
                size: MOCAPlugin.core.getAttribute(bufferNode, 'Size')
        }
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
                connections: []
            },
            processPromises = [],
            bufferPromises = [],
            connectionPromises = [];

        return MOCAPlugin.core.loadChildren(processFlowNode)
            .then(function(children) {
                for (var i = 0; i < children.length; i++) {
                    var childMetaType = MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]), 'name');

                    if (childMetaType === 'Process')
                        processPromises.push(ProcessFlowInterpreterLib.prototype.getProcessData(MOCAPlugin, children[i]));
                    else if (childMetaType === 'Buffer')
                        bufferPromises.push(ProcessFlowInterpreterLib.prototype.getBufferData(MOCAPlugin, children[i]));
                    else if (childMetaType === 'ProcToBuffFlow' || childMetaType === 'BuffToProcFlow')
                        connectionPromises.push(connInterpreter.getConnectionData(MOCAPlugin, children[i]));
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
                return processFlowData;
            });
    };

    return ProcessFlowInterpreterLib.prototype;
});
