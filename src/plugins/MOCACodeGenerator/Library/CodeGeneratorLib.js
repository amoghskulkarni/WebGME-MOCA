/**
 * Created by Amogh on 10/31/2017.
 */
define([
    'plugin/MOCACodeGenerator/MOCACodeGenerator/Templates/Templates',
    'common/util/ejs',
    'q'
], function (TEMPLATES, ejs, Q) {

    /**
     * The class containing utilities to generate code
     * @constructor
     */
    var CodeGeneratorLib = function () {};

    /**
     * The list containing for all kinds of files that are to be generated.
     * Every element in the list contains name and template(s) for each file type.
     *
     * @type {[null,null,null,null,null,null,null,null,null,null]}
     */
    CodeGeneratorLib.prototype.FILES = [
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
            mocacomponent: 'moca.problemcomps.generated.py.ejs',
            ipynbfile: 'moca.problem.generated.ipynb.ejs'
        },
        {
            name: 'parsing utilities',
            template: 'moca.parseutils.generated.py.ejs'
        },
        {
            name: 'plotting utilities',
            template: 'moca.plotutils.generated.py.ejs'
        },
        {
            name: 'process flows',
            template: 'moca.processflows.generated.py.ejs',
            ipynbfile: 'moca.processflow.generated.ipynb.ejs'
        },
        {
            name: 'process flows MOCA component',
            template: 'moca.procflowcomps.generated.py.ejs'
        },
        {
            name: 'preprocessors',
            template: 'moca.preprocs.generated.py.ejs'
        },
        {
            name: 'data sources',
            template: 'moca.datasources.generated.py.ejs'
        },
        {
            name: 'learning algo',
            template: 'moca.learningalgo.generated.py.ejs'
        },
        {
            name: 'ddcomp',
            template: 'moca.ddcomponents.generated.py.ejs',
            ipynbfile: 'moca.ddcomp.generated.ipynb.ejs'
        }
    ];

    /**
     * The function which returns blob containing artifacts (code) when the MOCACodeGenerator is run on the client
     * @param MOCAPlugin - Reference of the code generator
     * @param filesToAdd - Dictionary to be passed to blob client
     * @param dataModel - In-memory object which represents of the modeling entities
     * @param deferred - Object for notifying that the promise has been resolved
     * @param artifact - The blob client container (with appropriate name) to populate
     * @returns {null} - Resolves the Promise object after generating all the artifacts
     */
    CodeGeneratorLib.prototype.downloadPythonSourceFiles = function (MOCAPlugin, filesToAdd, dataModel, deferred, artifact) {
        var genFileName = "";

        CodeGeneratorLib.prototype.FILES.forEach(function (fileInfo) {
            if (fileInfo.name === 'components') {
                // For every component, one file
                for (var i = 0; i < dataModel.comps.length; i++) {
                    genFileName = 'MOCA_GeneratedCode/lib/moca_components/' + dataModel.comps[i].name + '.py';
                    filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.comps[i]);
                }
            } else if (fileInfo.name === 'groups') {
                // For every group, one file
                for (i = 0; i < dataModel.groups.length; i++) {
                    genFileName = 'MOCA_GeneratedCode/lib/moca_groups/' + dataModel.groups[i].name + '.py';
                    filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.groups[i]);
                }
            } else if (fileInfo.name === 'problems') {
                // If the filename is "problem" - use the template for problems
                // additionally generate .bat file for that as well
                for (i = 0; i < dataModel.problems.length; i++) {
                    genFileName = 'MOCA_GeneratedCode/src/' + dataModel.problems[i].name + '.py';
                    var genIpynbFile = 'MOCA_GeneratedCode/' + dataModel.problems[i].name + '.ipynb';
                    var mocacompFile = 'MOCA_GeneratedCode/src/' + dataModel.problems[i].name + '__MOCAComponent.py';
                    filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.problems[i]);
                    filesToAdd[genIpynbFile] = ejs.render(TEMPLATES[fileInfo.ipynbfile], dataModel.problems[i]);
                    filesToAdd[mocacompFile] = ejs.render(TEMPLATES[fileInfo.mocacomponent], dataModel.problems[i]);
                }
            } else if (fileInfo.name === 'parsing utilities') {
                // If the filename is parsing utilities - use the template for utilities
                // Template for utilities is not required to be populated with
                // Application specific data
                genFileName = 'MOCA_GeneratedCode/utils/MOCAparseutils.py';
                filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], null);
            } else if (fileInfo.name === 'plotting utilities') {
                // If the filename is plotting utilities - use the template for utilities
                // Template for utilities is not required to be populated with
                // Application specific data
                // For each problem, a separate file
                for (i = 0; i < dataModel.problems.length; i++) {
                    genFileName = 'MOCA_GeneratedCode/utils/moca_plotutils/' + dataModel.problems[i].name + '_plotutils.py';
                    filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.problems[i]);
                }
            } else if (fileInfo.name === 'process flows') {
                for (i = 0; i < dataModel.processFlows.length; i++) {
                    var procFlowName = dataModel.processFlows[i].name;

                    genFileName = 'MOCA_GeneratedCode/lib/moca_desmodels/' + procFlowName + '/' + procFlowName + '.py';
                    genIpynbFile = 'MOCA_GeneratedCode/lib/moca_desmodels/' + procFlowName + '/' + procFlowName + '.ipynb';
                    filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.processFlows[i]);
                    filesToAdd[genIpynbFile] = ejs.render(TEMPLATES[fileInfo.ipynbfile], dataModel.processFlows[i]);
                }
            } else if (fileInfo.name === 'process flows MOCA component') {
                for (i = 0; i < dataModel.processFlows.length; i++) {
                    procFlowName = dataModel.processFlows[i].name;

                    genFileName = 'MOCA_GeneratedCode/lib/moca_desmodels/' + procFlowName + '/' + procFlowName + '__MOCAComponent.py';
                    filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.processFlows[i]);
                }
            } else if (fileInfo.name === 'preprocessors') {
                for (i = 0; i < dataModel.ddComps.length; i++) {
                    var ddCompName = dataModel.ddComps[i].name;
                    for (var j = 0; j < dataModel.ddComps[i].dataPreprocs.length; j++) {
                        var preprocName = dataModel.ddComps[i].dataPreprocs[j].name;

                        genFileName = 'MOCA_GeneratedCode/lib/moca_ddmodels/' + ddCompName + '/preprocs/' + preprocName + '.py';
                        filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.ddComps[i].dataPreprocs[j]);
                    }
                }
            } else if (fileInfo.name === 'data sources') {
                for (i = 0; i < dataModel.ddComps.length; i++) {
                    ddCompName = dataModel.ddComps[i].name;
                    for (j = 0; j < dataModel.ddComps[i].dataSources.length; j++) {
                        var dataSourceName = dataModel.ddComps[i].dataSources[j].name;

                        genFileName = 'MOCA_GeneratedCode/lib/moca_ddmodels/' + ddCompName + '/data_sources/' + dataSourceName + '.py';
                        filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.ddComps[i].dataSources[j]);
                    }
                }
            } else if (fileInfo.name === 'learning algo') {
                for (i = 0; i < dataModel.ddComps.length; i++) {
                    ddCompName = dataModel.ddComps[i].name;
                    for (j = 0; j < dataModel.ddComps[i].learningAlgorithms.length; j++) {
                        var learningAlgoName = dataModel.ddComps[i].learningAlgorithms[j].name;

                        genFileName = 'MOCA_GeneratedCode/lib/moca_ddmodels/' + ddCompName + '/learning_algos/' + learningAlgoName + '.py';
                        filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.ddComps[i].learningAlgorithms[j]);
                    }
                }
            } else if (fileInfo.name === 'ddcomp') {
                for (i = 0; i < dataModel.ddComps.length; i++) {
                    ddCompName = dataModel.ddComps[i].name;

                    genFileName = 'MOCA_GeneratedCode/lib/moca_ddmodels/' + ddCompName + '/' + dataModel.ddComps[i].name + '__MOCAComponent.py';
                    genIpynbFile = 'MOCA_GeneratedCode/lib/moca_ddmodels/' + ddCompName + '/' + dataModel.ddComps[i].name + '.ipynb';

                    filesToAdd[genIpynbFile] = ejs.render(TEMPLATES[fileInfo.ipynbfile], dataModel.ddComps[i]);
                    filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.ddComps[i]);
                }
            }
        });

        // Create __init__.py file in the lib, src and util directories each
        var subdirectories = ['lib', 'src', 'utils', 'utils/moca_plotutils',
            'lib/moca_components', 'lib/moca_groups', 'lib/moca_ddmodels', 'lib/moca_desmodels'];
        for (var i = 0; i < dataModel.ddComps.length; i++) {
            subdirectories.push('lib/moca_ddmodels/' + dataModel.ddComps[i].name);
            subdirectories.push('lib/moca_ddmodels/' + dataModel.ddComps[i].name + '/preprocs');
            subdirectories.push('lib/moca_ddmodels/' + dataModel.ddComps[i].name + '/data_sources');
            subdirectories.push('lib/moca_ddmodels/' + dataModel.ddComps[i].name + '/learning_algos');
        }
        for (i = 0; i < dataModel.processFlows.length; i++) {
            subdirectories.push('lib/moca_desmodels/' + dataModel.processFlows[i].name);
        }
        for (i = 0; i < subdirectories.length; i++) {
            var initFileName = 'MOCA_GeneratedCode/' + subdirectories[i] + '/__init__.py';
            filesToAdd[initFileName] = '# A boilerplate file to enable this directory to be imported as a module';
        }

        // Create out directory for storing output files in case of recorders
        // TODO: Create only directory (creating a dummy placeholder file for now)
        for (i = 0; i < dataModel.problems.length; i++) {
            var outBinBaseDir = 'MOCA_GeneratedCode/out/bin/',
                outTextBaseDir = 'MOCA_GeneratedCode/out/text/';
            filesToAdd[outBinBaseDir + dataModel.problems[i].name + '/dummy'] = '';
            filesToAdd[outTextBaseDir + dataModel.problems[i].name + '/dummy'] = '';
        }

        // Create a batch file to launch ipython notebook
        var ipynbLaunchScriptName = 'MOCA_GeneratedCode/launch_iPythonNotebook.bat';
        filesToAdd[ipynbLaunchScriptName] = 'echo off\njupyter notebook --port=9999';

        //TODO: Add the static files too.
        MOCAPlugin.logger.info('Generated python files for MOCA to download on client.');

        artifact.addFiles(filesToAdd, function (err) {
            if (err) {
                deferred.reject(new Error(err));
                return;
            }
            MOCAPlugin.blobClient.saveAllArtifacts(function (err, hashes) {
                if (err) {
                    deferred.reject(new Error(err));
                    return;
                }

                MOCAPlugin.result.addArtifact(hashes[0]);
                deferred.resolve();
            });
        });
    };

    /**
     * The function which saves the code on the server's filesystem when the MOCACodeGenerator is run on the server
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param dataModel - In-memory object which represents of the modeling entities
     */
    CodeGeneratorLib.prototype.savePythonSourceFiles = function (MOCAPlugin, dataModel) {
        var mkdirp = require('mkdirp'),
            path = require('path'),
            fs = require('fs');

        var userid = MOCAPlugin.projectId.split('+')[0],
            baseDir = path.join('..', 'WebGME-MOCA_data', 'notebooks', userid, MOCAPlugin.projectName),
            internalDirs = ['lib', 'lib/moca_components', 'lib/moca_groups', 'lib/moca_ddmodels', 'lib/moca_desmodels',
                'src',
                'utils',  'utils/moca_plotutils',
                'out', 'out/bin', 'out/text'],
            genFileName = "";

        for (var i = 0; i < dataModel.ddComps.length; i++) {
            internalDirs.push('lib/moca_ddmodels/' + dataModel.ddComps[i].name);
            internalDirs.push('lib/moca_ddmodels/' + dataModel.ddComps[i].name + '/preprocs');
            internalDirs.push('lib/moca_ddmodels/' + dataModel.ddComps[i].name + '/data_sources');
            internalDirs.push('lib/moca_ddmodels/' + dataModel.ddComps[i].name + '/learning_algos');
        }

        for (i = 0; i < dataModel.processFlows.length; i++) {
            internalDirs.push('lib/moca_desmodels/' + dataModel.processFlows[i].name);
        }

        for (i = 0; i < dataModel.problems.length; i++) {
            internalDirs.push('out/text/' + dataModel.problems[i].name);
            internalDirs.push('out/bin/' + dataModel.problems[i].name);
        }

        var saveFileToPath = function (fileAbsPath, text) {
            fs.writeFile(fileAbsPath, text, function (err) {
                if (err) {
                    throw err;
                }
                else {
                    MOCAPlugin.logger.info(fileAbsPath + ' saved on the server');
                }
            });
        };

        internalDirs.forEach(function (internalDir) {
            mkdirp.sync(path.join(baseDir, internalDir), function (err) {
                if (err)
                    console.error(err);
                else
                    console.log('Directory created successfully!');
            });

            if (internalDir.indexOf('out') === -1) {
                var initFileName = path.join(baseDir, internalDir, '__init__.py');
                saveFileToPath(initFileName, '# A boilerplate file to enable this directory to be imported as a module');
            }
        });

        this.FILES.forEach(function (fileInfo) {
            if (fileInfo.name === 'components') {
                // For every component, one file
                for (var i = 0; i < dataModel.comps.length; i++) {
                    genFileName = path.join(baseDir, 'lib', 'moca_components', dataModel.comps[i].name + '.py');
                    saveFileToPath(genFileName, ejs.render(TEMPLATES[fileInfo.template], dataModel.comps[i]));
                }
            } else if (fileInfo.name === 'groups') {
                // For every group, one file
                for (i = 0; i < dataModel.groups.length; i++) {
                    genFileName = path.join(baseDir, 'lib', 'moca_groups', dataModel.groups[i].name + '.py');
                    saveFileToPath(genFileName, ejs.render(TEMPLATES[fileInfo.template], dataModel.groups[i]));
                }
            } else if (fileInfo.name === 'problems') {
                // If the filename is "problem" - use the template for problems
                // additionally generate .bat file for that as well
                for (i = 0; i < dataModel.problems.length; i++) {
                    genFileName = path.join(baseDir, 'src', dataModel.problems[i].name + '.py');
                    var genIpynbFile = path.join(baseDir, dataModel.problems[i].name + '.ipynb');
                    var mocacompFile = path.join(baseDir, 'src', dataModel.problems[i].name + '__MOCAComponent.py');
                    saveFileToPath(genFileName, ejs.render(TEMPLATES[fileInfo.template], dataModel.problems[i]));
                    saveFileToPath(genIpynbFile, ejs.render(TEMPLATES[fileInfo.ipynbfile], dataModel.problems[i]));
                    saveFileToPath(mocacompFile, ejs.render(TEMPLATES[fileInfo.mocacomponent], dataModel.problems[i]));
                }
            } else if (fileInfo.name === 'process flows') {
                for (i = 0; i < dataModel.processFlows.length; i++) {
                    genFileName = path.join(baseDir, 'lib', 'moca_desmodels', dataModel.processFlows[i].name, dataModel.processFlows[i].name + '.py');
                    genIpynbFile = path.join(baseDir, 'lib', 'moca_desmodels', dataModel.processFlows[i].name, dataModel.processFlows[i].name + '.ipynb');
                    saveFileToPath(genFileName, ejs.render(TEMPLATES[fileInfo.template], dataModel.processFlows[i]));
                    saveFileToPath(genIpynbFile, ejs.render(TEMPLATES[fileInfo.ipynbfile], dataModel.processFlows[i]));
                }
            }
            else if (fileInfo.name === 'process flows MOCA component') {
                for (i = 0; i < dataModel.processFlows.length; i++) {
                    genFileName = path.join(baseDir, 'lib', 'moca_desmodels', dataModel.processFlows[i].name, dataModel.processFlows[i].name + '__MOCAComponent.py');
                    saveFileToPath(genFileName, ejs.render(TEMPLATES[fileInfo.template], dataModel.processFlows[i]));
                }
            }
            else if (fileInfo.name === 'parsing utilities') {
                // If the filename is parsing utilities - use the template for utilities
                // Template for utilities is not required to be populated with
                // Application specific data
                genFileName = path.join(baseDir, 'utils', 'MOCAparseutils.py');
                saveFileToPath(genFileName, ejs.render(TEMPLATES[fileInfo.template], null));
            } else if (fileInfo.name === 'plotting utilities') {
                // If the filename is plotting utilities - use the template for utilities
                // Template for utilities is not required to be populated with
                // Application specific data
                for (i = 0; i < dataModel.problems.length; i++) {
                    genFileName = path.join(baseDir, 'utils', 'moca_plotutils', dataModel.problems[i].name + '_plotutils.py');
                    saveFileToPath(genFileName, ejs.render(TEMPLATES[fileInfo.template], dataModel.problems[i]));
                }
            } else if (fileInfo.name === 'preprocessors') {
                for (i = 0; i < dataModel.ddComps.length; i++) {
                    var ddCompName = dataModel.ddComps[i].name;
                    for (var j = 0; j < dataModel.ddComps[i].dataPreprocs.length; j++) {
                        var preprocName = dataModel.ddComps[i].dataPreprocs[j].name;

                        genFileName = path.join(baseDir, 'lib', 'moca_ddmodels', ddCompName, 'preprocs', preprocName + '.py');
                        saveFileToPath(genFileName, ejs.render(TEMPLATES[fileInfo.template], dataModel.ddComps[i].dataPreprocs[j]));
                    }
                }
            } else if (fileInfo.name === 'data sources') {
                for (i = 0; i < dataModel.ddComps.length; i++) {
                    ddCompName = dataModel.ddComps[i].name;
                    for (j = 0; j < dataModel.ddComps[i].dataSources.length; j++) {
                        var dataSourceName = dataModel.ddComps[i].dataSources[j].name;

                        genFileName = path.join(baseDir, 'lib', 'moca_ddmodels', ddCompName, 'data_sources', dataSourceName + '.py');
                        saveFileToPath(genFileName, ejs.render(TEMPLATES[fileInfo.template], dataModel.ddComps[i].dataSources[j]));
                    }
                }
            } else if (fileInfo.name === 'learning algo') {
                for (i = 0; i < dataModel.ddComps.length; i++) {
                    ddCompName = dataModel.ddComps[i].name;
                    for (j = 0; j < dataModel.ddComps[i].learningAlgorithms.length; j++) {
                        var learningAlgoName = dataModel.ddComps[i].learningAlgorithms[j].name;

                        genFileName = path.join(baseDir, 'lib', 'moca_ddmodels', ddCompName, 'learning_algos', learningAlgoName + '.py');
                        saveFileToPath(genFileName, ejs.render(TEMPLATES[fileInfo.template], dataModel.ddComps[i].learningAlgorithms[j]));
                    }
                }
            } else if (fileInfo.name === 'ddcomp') {
                for (i = 0; i < dataModel.ddComps.length; i++) {
                    ddCompName = dataModel.ddComps[i].name;

                    genIpynbFile = path.join(baseDir, 'lib', 'moca_ddmodels', ddCompName, ddCompName + '.ipynb');
                    genFileName = path.join(baseDir, 'lib', 'moca_ddmodels', ddCompName, ddCompName + '__MOCAComponent.py');

                    saveFileToPath(genIpynbFile, ejs.render(TEMPLATES[fileInfo.ipynbfile], dataModel.ddComps[i]));
                    saveFileToPath(genFileName, ejs.render(TEMPLATES[fileInfo.template], dataModel.ddComps[i]));
                }
            }
        });

        MOCAPlugin.sendNotification("Generated python files for MOCA on the server.");
        MOCAPlugin.logger.info('Generated python files for MOCA on the server.');
    };

    /**
     * The function which converts the interpreted model into artifacts (code)
     * and either saves it on the server's filesystem or gives the option
     * to download it on the client (depending upon what is selected while invoking it).
     * Also, checks the ontology rules.
     *
     * Notes -
     * This method is run in MOCACodeGenerator's context, so `this` refers to MOCACodeGenerator.
     * The other methods which are called from inside this method are called in CodeGeneratorUtils context,
     * so in them `this` refers to CodeGeneratorLib.
     *
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param {string} pluginInvocation
     *      - The name of the meta-type of the modeling entity from where the plugin is invoked
     * @param dataModel - In-memory object which represents of the modeling entities
     * @returns {Promise} Promise object resolving to the downloadable artifact blob (is resolved in another method)
     */
    CodeGeneratorLib.prototype.generateArtifact = function (pluginInvocation, dataModel) {
        var MOCAPlugin = this,
            filesToAdd = {},
            deferred = new Q.defer(),
            artifact = null;

        if (pluginInvocation === 'ROOT')
            artifact = MOCAPlugin.blobClient.createArtifact('MOCA');
        else if (pluginInvocation === 'Problem')
            artifact = MOCAPlugin.blobClient.createArtifact(dataModel.problems[0].name);
        else if (pluginInvocation === 'ProcessFlow')
            artifact = MOCAPlugin.blobClient.createArtifact(dataModel.processFlows[0].name);
        else if (pluginInvocation === 'DataDrivenComponent')
            artifact = MOCAPlugin.blobClient.createArtifact(dataModel.ddComps[0].name);

        MOCAPlugin.sendNotification('Test');
        // parse dataModel for mismatching ontology link
        // TODO: Do this with the help of validator framework
        if (typeof window !== 'undefined') {
            for (var i = 0; i < dataModel.groups.length; i++) {
                // for every group, check every data connection
                for (var j = 0; j < dataModel.groups[i].connections.length; j++) {
                    if (dataModel.groups[i].connections[j].srcOnto !== dataModel.groups[i].connections[j].dstOnto) {
                        alert('WARNING: In Group ' + dataModel.groups[i].name
                            + ', port ' + dataModel.groups[i].connections[j].src + ' of ' + dataModel.groups[i].connections[j].srcParent
                            + ' is associated to different ontological element than that of '
                            + 'port ' + dataModel.groups[i].connections[j].dst + ' of ' + dataModel.groups[i].connections[j].dstParent);
                    }
                }
            }

            for (var i = 0; i < dataModel.problems.length; i++) {
                // for every group, check every data connection
                for (var j = 0; j < dataModel.problems[i].connections.length; j++) {
                    if (dataModel.problems[i].connections[j].srcOnto !== dataModel.problems[i].connections[j].dstOnto) {
                        alert('WARNING: In Problem ' + dataModel.problems[i].name
                            + ', port ' + dataModel.problems[i].connections[j].src + ' of ' + dataModel.problems[i].connections[j].srcParent
                            + ' is associated to different ontological element than that of '
                            + 'port ' + dataModel.problems[i].connections[j].dst + ' of ' + dataModel.problems[i].connections[j].dstParent);
                    }
                }
            }
        }

        // Check if the plugin is executed in the client (browser) or server context
        // (if the 'window' object is undefined, it's executed on the server-side)
        if (typeof window === 'undefined') {
            // Save the files on the server side
            CodeGeneratorLib.prototype.savePythonSourceFiles(MOCAPlugin, dataModel);
        }
        else {
            if (pluginInvocation === 'ROOT') {
                filesToAdd['MOCA.json'] = JSON.stringify(dataModel, null, 2);
                filesToAdd['MOCA_metadata.json'] = JSON.stringify({
                    projectId: MOCAPlugin.projectId,
                    commitHash: MOCAPlugin.commitHash,
                    branchName: MOCAPlugin.branchName,
                    timeStamp: (new Date()).toISOString(),
                    pluginVersion: MOCAPlugin.getVersion()
                }, null, 2);
            }

            // Save the files using the blobClient and give them as a downloadable handle
            CodeGeneratorLib.prototype.downloadPythonSourceFiles(MOCAPlugin, filesToAdd, dataModel, deferred, artifact);
        }

        return deferred.promise;
    };

    return CodeGeneratorLib.prototype;
});