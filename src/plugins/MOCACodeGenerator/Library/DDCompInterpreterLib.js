/**
 * Created by Amogh on 10/31/2017.
 */

define([
    'q',
    'plugin/MOCACodeGenerator/MOCACodeGenerator/Library/ConnectionInterpreterLib',
    'plugin/MOCACodeGenerator/MOCACodeGenerator/Library/MOCAInterpreterLib'
], function (Q, connInterpreter, mocaInterpreter) {
    /**
     * The class giving handles of interpreter methods for DDComp entities
     * @constructor
     */
    var DDCompInterpreterLib = function () {};

    /**
     * A helper method for loading a Database node from its reference node
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param referenceNode - The reference of the Database node
     * @returns {Promise} - Promise object resolving to the Database node from its reference
     */
    var helperGetDatabase = function (MOCAPlugin, referenceNode) {
        return MOCAPlugin.core.loadPointer(referenceNode, 'ref')
            .then(function (databaseNode) {
                return DDCompInterpreterLib.prototype.getDatabaseData(MOCAPlugin, databaseNode);
            });
    };

    /**
     * The method to get the data from a DataSource node
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param dataSourceNode - The DataSource node
     * @returns {Promise} - Promise object resolving to the data of the DataSource node
     */
    DDCompInterpreterLib.prototype.getDataSourceData = function (MOCAPlugin, dataSourceNode) {
        var dataSourceData = {
                name: MOCAPlugin.core.getAttribute(dataSourceNode, 'name'),
                forEachTag: MOCAPlugin.core.getAttribute(dataSourceNode, 'ForEach'),
                operationOnMeasurement: MOCAPlugin.core.getAttribute(dataSourceNode, 'Operation'),
                tags: MOCAPlugin.core.getAttribute(dataSourceNode, 'Tags'),
                tEnd: MOCAPlugin.core.getAttribute(dataSourceNode, 'TimestampEnd'),
                tStart: MOCAPlugin.core.getAttribute(dataSourceNode, 'TimestampStart'),
                type: MOCAPlugin.core.getAttribute(dataSourceNode, 'Type'),
                value: MOCAPlugin.core.getAttribute(dataSourceNode, 'Value'),
                variableNameInDB: MOCAPlugin.core.getAttribute(dataSourceNode, 'VariableName'),
                databaseRef: [],
                children: []
            },
            databaseRefPromises = [];

        return MOCAPlugin.core.loadChildren(dataSourceNode)
            .then(function (children) {
                for (var i = 0; i < children.length; i++) {
                    var childMetaType = MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]), 'name');
                    if (childMetaType === 'DatabaseRef') {
                        databaseRefPromises.push(helperGetDatabase(MOCAPlugin, children[i]));
                    } else if (childMetaType !== 'Documentation') {
                        dataSourceData.children.push({
                            name: MOCAPlugin.core.getAttribute(children[i], 'name'),
                            meta: childMetaType
                        });
                    }
                }

                return Q.all(databaseRefPromises);
            })
            .then(function (databaseRefData) {
                dataSourceData.databaseRef = databaseRefData;
                return dataSourceData;
            })
    };

    /**
     * The method to get the data from a DataPreprocessor node
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param dataPreprocNode - The DataPreprocessor node
     * @returns {Promise} - Promise object resolving to the data of the DataPreprocessing node
     */
    DDCompInterpreterLib.prototype.getDataPreprocessorData = function (MOCAPlugin, dataPreprocNode) {
        var dataPreprocData = {
                name: MOCAPlugin.core.getAttribute(dataPreprocNode, 'name'),
                outputFunction: MOCAPlugin.core.getAttribute(dataPreprocNode, 'OutputFunction'),
                inputPorts: [],
                outputPorts: []
            };

        return MOCAPlugin.core.loadChildren(dataPreprocNode)
            .then(function (children) {
                for (var i = 0; i < children.length; i++) {
                    var childMetaType = MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]), 'name');

                    if (childMetaType === 'Input') {
                        dataPreprocData.inputPorts.push(DDCompInterpreterLib.prototype.getInputPortData(MOCAPlugin, children[i]))
                    } else if (childMetaType === 'Output') {
                        dataPreprocData.outputPorts.push(DDCompInterpreterLib.prototype.getOutputPortData(MOCAPlugin, children[i]))
                    }
                }

                return dataPreprocData;
            })
    };

    /**
     * The method to get the data from a LearningAlgorithm node
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param learningAlgoNode - The LearningAlgorithm node
     * @returns {Promise} - Promise object resolving to the data of the LearningAlgorithm node
     */
    DDCompInterpreterLib.prototype.getLearningAlgoData = function (MOCAPlugin, learningAlgoNode) {
        var learningAlgoData = {
                name: MOCAPlugin.core.getAttribute(learningAlgoNode, 'name'),
                algorithm: MOCAPlugin.core.getAttribute(learningAlgoNode, 'Algorithm'),
                outputFunction: MOCAPlugin.core.getAttribute(learningAlgoNode, 'OutputFunction'),
                featurePorts: [],
                labelPorts: []
            };

        return MOCAPlugin.core.loadChildren(learningAlgoNode)
            .then(function (children) {
                for (var i = 0; i < children.length; i++) {
                    var childMetaType = MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]), 'name');

                    if (childMetaType === 'Feature') {
                        learningAlgoData.featurePorts.push(DDCompInterpreterLib.prototype.getInputPortData(MOCAPlugin, children[i]))
                    } else if (childMetaType === 'Label') {
                        learningAlgoData.labelPorts.push(DDCompInterpreterLib.prototype.getOutputPortData(MOCAPlugin, children[i]))
                    }
                }

                return learningAlgoData;
            })
    };

    /**
     * The method to get the data from a Database node
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param databaseNode - The Database node
     * @returns {{name: (GmeCommon.OutAttr|*|string), mtcAgentURL: (GmeCommon.OutAttr|*|string), dbName: (GmeCommon.OutAttr|*|string), dbHost: (GmeCommon.OutAttr|*|string), dbPortNo: (GmeCommon.OutAttr|*|string)}}
     *      - Name, URL connecting to MTConnect agent, Name of the database on the server, IP of the hosting server, Port number of the hosting server
     */
    DDCompInterpreterLib.prototype.getDatabaseData = function (MOCAPlugin, databaseNode) {
        return {
            name: MOCAPlugin.core.getAttribute(databaseNode, 'name'),
            mtcAgentURL: MOCAPlugin.core.getAttribute(databaseNode, 'MTConnectAgentURL'),
            dbName: MOCAPlugin.core.getAttribute(databaseNode, 'DBName'),
            dbHost: MOCAPlugin.core.getAttribute(databaseNode, 'Host'),
            dbPortNo: MOCAPlugin.core.getAttribute(databaseNode, 'Port')
        };
    };

    /**
     * The method to get the data from an Input node (port)
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param inputPortNode - The Input node (port)
     * @returns {{name: (GmeCommon.OutAttr|*|string)}} - Object with the name of the Input node
     */
    DDCompInterpreterLib.prototype.getInputPortData = function (MOCAPlugin, inputPortNode) {
        return {
            name: MOCAPlugin.core.getAttribute(inputPortNode, 'name')
        };
    };

    /**
     * The method to get the data from an Output node (port)
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param outputPortNode - The Output node (port)
     * @returns {{name: (GmeCommon.OutAttr|*|string)}} - Object with the name of the Output node
     */
    DDCompInterpreterLib.prototype.getOutputPortData = function (MOCAPlugin, outputPortNode) {
        return {
            name: MOCAPlugin.core.getAttribute(outputPortNode, 'name')
        };
    };

    /**
     * The method to get the data from a DDComponent. This method will be called from the MOCACodeGenerator
     * plugin class. This will internally collect all the data from the DDComoponent's children using the
     * methods of this class (written above). This will be called from the context of MOCACodeGenerator, thus
     * `this` refers to MOCACodeGenerator plugin, and core and other utils are accessed through this handle.
     *
     * @param ddComponentNode - The DDComponent node
     * @returns {Promise} - Promise object resolving to the data of the DDComponent node and its children
     */
    DDCompInterpreterLib.prototype.getDDComponentData = function (ddComponentNode) {
        var MOCAPlugin = this,
            ddComponentData = {
                name: MOCAPlugin.core.getAttribute(ddComponentNode, 'name'),
                dataSources: [],
                dataPreprocs: [],
                learningAlgorithms: [],
                params: [],
                unknowns: [],
                connections: []
            },
            dataSourcePromises = [],
            dataPreprocPromises = [],
            learningAlgoPromises = [],
            paramPromises = [],
            unknownPromises = [],
            connectionPromises = [];

        return MOCAPlugin.core.loadChildren(ddComponentNode)
            .then(function (children) {
                for (var i = 0; i < children.length; i++) {
                    var childMetaType = MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(children[i]), 'name');

                    if (childMetaType === 'DataSource')
                        dataSourcePromises.push(DDCompInterpreterLib.prototype.getDataSourceData(MOCAPlugin, children[i]));
                    else if (childMetaType === 'DataPreprocessor')
                        dataPreprocPromises.push(DDCompInterpreterLib.prototype.getDataPreprocessorData(MOCAPlugin, children[i]));
                    else if (childMetaType === 'LearningAlgorithm')
                        learningAlgoPromises.push(DDCompInterpreterLib.prototype.getLearningAlgoData(MOCAPlugin, children[i]));
                    else if (childMetaType === 'Parameter')
                        paramPromises.push(mocaInterpreter.getParameterData(MOCAPlugin, children[i]));
                    else if (childMetaType === 'Unknown')
                        unknownPromises.push(mocaInterpreter.getUnknownData(MOCAPlugin, children[i]));
                    else if (childMetaType === 'DataConn'
                        || childMetaType === 'OutToLableAssoc'
                        || childMetaType === 'OutToFeatureAssoc'
                        || childMetaType === 'ParamToFeatureAssoc'
                        || childMetaType === 'UnknownToLabelAssoc')
                        connectionPromises.push(connInterpreter.getConnectionData(MOCAPlugin, children[i]));
                }

                return Q.all(dataSourcePromises);
            })
            .then(function (dataSourcesData) {
                ddComponentData.dataSources = dataSourcesData;
                return Q.all(dataPreprocPromises);
            })
            .then(function (dataPreprocsData) {
                ddComponentData.dataPreprocs = dataPreprocsData;
                return Q.all(learningAlgoPromises);
            })
            .then(function (learningAlgosData) {
                ddComponentData.learningAlgorithms = learningAlgosData;
                return Q.all(paramPromises);
            })
            .then(function (paramsData) {
                ddComponentData.params = paramsData;
                return Q.all(unknownPromises);
            })
            .then(function (unknownsData) {
                ddComponentData.unknowns = unknownsData;
                return Q.all(connectionPromises);
            })
            .then(function (connectionsData) {
                ddComponentData.connections = connectionsData;
                return ddComponentData;
            })
    };

    return DDCompInterpreterLib.prototype;
});