define([
    'plugin/MOCACodeGenerator/MOCACodeGenerator/Templates/Templates',
    'common/util/ejs'
], function (TEMPLATES, ejs) {
    var FileIOUtils = function () {
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
            },
            {
                name: 'process flows',
                template: 'moca.processflows.generated.py.ejs',
                ipynbfile: 'moca.processflow.generated.ipynb.ejs'
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
                ipynbfile: 'moca.ddcomp.generated.ipynb.ejs'
            }
        ];
    };

    FileIOUtils.prototype.constructor = FileIOUtils;

    FileIOUtils.prototype.downloadPythonSourceFiles = function (MOCACodeGen, filesToAdd, dataModel, deferred, artifact) {
        var genFileName = "";

        this.FILES.forEach(function (fileInfo) {
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
                    filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.problems[i]);
                    filesToAdd[genIpynbFile] = ejs.render(TEMPLATES[fileInfo.ipynbfile], dataModel.problems[i]);
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
                    genFileName = 'MOCA_GeneratedCode/src/' + dataModel.processFlows[i].name + '.py';
                    genIpynbFile = 'MOCA_GeneratedCode/' + dataModel.processFlows[i].name + '.ipynb';
                    filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.processFlows[i]);
                    filesToAdd[genIpynbFile] = ejs.render(TEMPLATES[fileInfo.ipynbfile], dataModel.processFlows[i]);
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
                    // genFileName = 'MOCA_GeneratedCode/src/' + dataModel.processFlows[i].name + '.py';
                    genIpynbFile = 'MOCA_GeneratedCode/' + dataModel.ddComps[i].name + '.ipynb';
                    // filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.processFlows[i]);
                    filesToAdd[genIpynbFile] = ejs.render(TEMPLATES[fileInfo.ipynbfile], dataModel.ddComps[i]);
                }
            }
        });

        // Create __init__.py file in the lib, src and util directories each
        var subdirectories = ['lib', 'lib/moca_components', 'lib/moca_groups', 'src', 'utils', 'utils/moca_plotutils', 'lib/moca_ddmodels'];
        for (var i = 0; i < dataModel.ddComps.length; i++) {
            subdirectories.push('lib/moca_ddmodels/' + dataModel.ddComps[i].name);
            subdirectories.push('lib/moca_ddmodels/' + dataModel.ddComps[i].name + '/preprocs');
            subdirectories.push('lib/moca_ddmodels/' + dataModel.ddComps[i].name + '/data_sources');
            subdirectories.push('lib/moca_ddmodels/' + dataModel.ddComps[i].name + '/learning_algos');
        }
        for (i = 0; i < subdirectories.length; i++) {
            var initFileName = 'MOCA_GeneratedCode/' + subdirectories[i] + '/__init__.py';
            filesToAdd[initFileName] = '# A boilerplate file to enable this directory to be imported as a module';
        }

        // Create out directory for storing output files in case of recorders
        // TODO: Create only directory (creating a dummy placeholder file for now)
        var outDirName = 'MOCA_GeneratedCode/out/dummy.txt';
        filesToAdd[outDirName] = '';

        // Create a batch file to launch ipython notebook
        var ipynbLaunchScriptName = 'MOCA_GeneratedCode/launch_iPythonNotebook.bat';
        filesToAdd[ipynbLaunchScriptName] = 'echo off\njupyter notebook --port=9999';

        //TODO Add the static files too.
        MOCACodeGen.logger.info('Generated python files for MOCA to download on client.');

        artifact.addFiles(filesToAdd, function (err) {
            if (err) {
                deferred.reject(new Error(err));
                return;
            }
            MOCACodeGen.blobClient.saveAllArtifacts(function (err, hashes) {
                if (err) {
                    deferred.reject(new Error(err));
                    return;
                }

                MOCACodeGen.result.addArtifact(hashes[0]);
                deferred.resolve();
            });
        });
    };

    FileIOUtils.prototype.savePythonSourceFiles = function (MOCACodeGen, filesToAdd, dataModel, deferred, artifact) {
        var mkdirp = require('mkdirp'),
            path = require('path'),
            fs = require('fs');

        var userid = this.projectId.split('+')[0],
            baseDir = path.join('..', 'WebGME-MOCA_data', 'notebooks', userid, this.projectName),
            internalDirs = ['lib', 'lib/moca_components', 'lib/moca_groups', 'lib/moca_ddmodels',
                'src',
                'utils',  'utils/moca_plotutils',
                'out'],
            genFileName = "";

        for (var i = 0; i < dataModel.ddComps.length; i++) {
            internalDirs.push('lib/moca_ddmodels/' + dataModel.ddComps[i].name);
            internalDirs.push('lib/moca_ddmodels/' + dataModel.ddComps[i].name + '/preprocs');
            internalDirs.push('lib/moca_ddmodels/' + dataModel.ddComps[i].name + '/data_sources');
            internalDirs.push('lib/moca_ddmodels/' + dataModel.ddComps[i].name + '/learning_algos');
        }

        var saveFileToPath = function (fileAbsPath, text) {
            fs.writeFile(fileAbsPath, text, function (err) {
                if (err) {
                    throw err;
                }
                else {
                    MOCACodeGen.logger.info(fileAbsPath + ' saved on the server');
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

            if (internalDir !== 'out') {
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
                    saveFileToPath(genFileName, ejs.render(TEMPLATES[fileInfo.template], dataModel.problems[i]));
                    saveFileToPath(genIpynbFile, ejs.render(TEMPLATES[fileInfo.ipynbfile], dataModel.problems[i]));
                }
            } else if (fileInfo.name === 'process flows') {
                for (i = 0; i < dataModel.processFlows.length; i++) {
                    genFileName = path.join(baseDir, 'src', dataModel.processFlows[i].name + '.py');
                    genIpynbFile = path.join(baseDir, dataModel.processFlows[i].name + '.ipynb');
                    saveFileToPath(genFileName, ejs.render(TEMPLATES[fileInfo.template], dataModel.processFlows[i]));
                    saveFileToPath(genIpynbFile, ejs.render(TEMPLATES[fileInfo.ipynbfile], dataModel.processFlows[i]));
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
                    // genFileName = path.join(baseDir, 'src', dataModel.processFlows[i].name + '.py');
                    genIpynbFile = path.join(baseDir, dataModel.ddComps[i].name + '.ipynb');
                    // saveFileToPath(genFileName, ejs.render(TEMPLATES[fileInfo.template], dataModel.processFlows[i]));
                    saveFileToPath(genIpynbFile, ejs.render(TEMPLATES[fileInfo.ipynbfile], dataModel.ddComps[i]));
                }
            }
        });

        MOCACodeGen.sendNotification("Generated python files for MOCA on the server.");

        MOCACodeGen.logger.info('Generated python files for MOCA on the server.');
    };

    return FileIOUtils.prototype;
});