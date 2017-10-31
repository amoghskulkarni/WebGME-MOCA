/**
 * Created by Amogh on 10/31/2017.
 */

define([
    'q',
    'plugin/MOCACodeGenerator/MOCACodeGenerator/Library/ConnectionInterpreterLib',
    'plugin/MOCACodeGenerator/MOCACodeGenerator/Library/MOCAInterpreterLib'
], function (Q, connInterpreter, mocaInterpreter) {
    /**
     * The class containing utilities to generate code
     * @constructor
     */
    var DDCompInterpreterLib = function () {};

    var helperGetDatabase = function (MOCACodeGen, referenceNode) {
        return MOCACodeGen.core.loadPointer(referenceNode, 'ref')
            .then(function (databaseNode) {
                return DDCompInterpreterLib.prototype.getDatabaseData(MOCACodeGen, databaseNode);
            });
    };

    DDCompInterpreterLib.prototype.getDataSourceData = function (MOCACodeGen, dataSourceNode) {
        var dataSourceData = {
                name: MOCACodeGen.core.getAttribute(dataSourceNode, 'name'),
                forEachTag: MOCACodeGen.core.getAttribute(dataSourceNode, 'ForEach'),
                operationOnMeasurement: MOCACodeGen.core.getAttribute(dataSourceNode, 'Operation'),
                tags: MOCACodeGen.core.getAttribute(dataSourceNode, 'Tags'),
                tEnd: MOCACodeGen.core.getAttribute(dataSourceNode, 'TimestampEnd'),
                tStart: MOCACodeGen.core.getAttribute(dataSourceNode, 'TimestampStart'),
                type: MOCACodeGen.core.getAttribute(dataSourceNode, 'Type'),
                value: MOCACodeGen.core.getAttribute(dataSourceNode, 'Value'),
                variableNameInDB: MOCACodeGen.core.getAttribute(dataSourceNode, 'VariableName'),
                databaseRef: [],
                children: []
            },
            databaseRefPromises = [];

        return MOCACodeGen.core.loadChildren(dataSourceNode)
            .then(function (children) {
                for (var i = 0; i < children.length; i++) {
                    var childMetaType = MOCACodeGen.core.getAttribute(MOCACodeGen.getMetaType(children[i]), 'name');
                    if (childMetaType === 'DatabaseRef') {
                        databaseRefPromises.push(helperGetDatabase(MOCACodeGen, children[i]));
                    } else if (childMetaType !== 'Documentation') {
                        dataSourceData.children.push({
                            name: MOCACodeGen.core.getAttribute(children[i], 'name'),
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

    DDCompInterpreterLib.prototype.getDataPreprocessorData = function (MOCACodeGen, dataPreprocNode) {
        var dataPreprocData = {
                name: MOCACodeGen.core.getAttribute(dataPreprocNode, 'name'),
                outputFunction: MOCACodeGen.core.getAttribute(dataPreprocNode, 'OutputFunction'),
                inputPorts: [],
                outputPorts: []
            };

        return MOCACodeGen.core.loadChildren(dataPreprocNode)
            .then(function (children) {
                for (var i = 0; i < children.length; i++) {
                    var childMetaType = MOCACodeGen.core.getAttribute(MOCACodeGen.getMetaType(children[i]), 'name');

                    if (childMetaType === 'Input') {
                        dataPreprocData.inputPorts.push(DDCompInterpreterLib.prototype.getInputPortData(MOCACodeGen, children[i]))
                    } else if (childMetaType === 'Output') {
                        dataPreprocData.outputPorts.push(DDCompInterpreterLib.prototype.getOutputPortData(MOCACodeGen, children[i]))
                    }
                }

                return dataPreprocData;
            })
    };

    DDCompInterpreterLib.prototype.getLearningAlgoData = function (MOCACodeGen, learningAlgoNode) {
        var learningAlgoData = {
                name: MOCACodeGen.core.getAttribute(learningAlgoNode, 'name'),
                algorithm: MOCACodeGen.core.getAttribute(learningAlgoNode, 'Algorithm'),
                outputFunction: MOCACodeGen.core.getAttribute(learningAlgoNode, 'OutputFunction'),
                featurePorts: [],
                labelPorts: []
            };

        return MOCACodeGen.core.loadChildren(learningAlgoNode)
            .then(function (children) {
                for (var i = 0; i < children.length; i++) {
                    var childMetaType = MOCACodeGen.core.getAttribute(MOCACodeGen.getMetaType(children[i]), 'name');

                    if (childMetaType === 'Feature') {
                        learningAlgoData.featurePorts.push(DDCompInterpreterLib.prototype.getInputPortData(MOCACodeGen, children[i]))
                    } else if (childMetaType === 'Label') {
                        learningAlgoData.labelPorts.push(DDCompInterpreterLib.prototype.getOutputPortData(MOCACodeGen, children[i]))
                    }
                }

                return learningAlgoData;
            })
    };

    DDCompInterpreterLib.prototype.getDatabaseData = function (MOCACodeGen, databaseNode) {
        return {
            name: MOCACodeGen.core.getAttribute(databaseNode, 'name'),
            mtcAgentURL: MOCACodeGen.core.getAttribute(databaseNode, 'MTConnectAgentURL'),
            dbName: MOCACodeGen.core.getAttribute(databaseNode, 'DBName'),
            dbHost: MOCACodeGen.core.getAttribute(databaseNode, 'Host'),
            dbPortNo: MOCACodeGen.core.getAttribute(databaseNode, 'Port')
        };
    };

    DDCompInterpreterLib.prototype.getInputPortData = function (MOCACodeGen, inputPortNode) {
        return {
            name: MOCACodeGen.core.getAttribute(inputPortNode, 'name')
        };
    };

    DDCompInterpreterLib.prototype.getOutputPortData = function (MOCACodeGen, outputPortNode) {
        return {
            name: MOCACodeGen.core.getAttribute(outputPortNode, 'name')
        };
    };

    DDCompInterpreterLib.prototype.getDDComponentData = function (ddComponentNode) {
        var MOCACodeGen = this,
            ddComponentData = {
                name: MOCACodeGen.core.getAttribute(ddComponentNode, 'name'),
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

        return MOCACodeGen.core.loadChildren(ddComponentNode)
            .then(function (children) {
                for (var i = 0; i < children.length; i++) {
                    var childMetaType = MOCACodeGen.core.getAttribute(MOCACodeGen.getMetaType(children[i]), 'name');

                    if (childMetaType === 'DataSource')
                        dataSourcePromises.push(DDCompInterpreterLib.prototype.getDataSourceData(MOCACodeGen, children[i]));
                    else if (childMetaType === 'DataPreprocessor')
                        dataPreprocPromises.push(DDCompInterpreterLib.prototype.getDataPreprocessorData(MOCACodeGen, children[i]));
                    else if (childMetaType === 'LearningAlgorithm')
                        learningAlgoPromises.push(DDCompInterpreterLib.prototype.getLearningAlgoData(MOCACodeGen, children[i]));
                    else if (childMetaType === 'Parameter')
                        paramPromises.push(mocaInterpreter.getParameterData(MOCACodeGen, children[i]));
                    else if (childMetaType === 'Unknown')
                        unknownPromises.push(mocaInterpreter.getUnknownData(MOCACodeGen, children[i]));
                    else if (childMetaType === 'DataConn'
                        || childMetaType === 'OutToLableAssoc'
                        || childMetaType === 'OutToFeatureAssoc'
                        || childMetaType === 'ParamToFeatureAssoc'
                        || childMetaType === 'UnknownToLabelAssoc')
                        connectionPromises.push(connInterpreter.getConnectionData(MOCACodeGen, children[i]));
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