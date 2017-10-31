define([
    'plugin/MOCACodeGenerator/MOCACodeGenerator/Templates/Templates'
], function (TEMPLATES) {
    var FileIOUtils = function () {
        this.templates = TEMPLATES;
    };

    FileIOUtils.prototype.constructor = FileIOUtils;
    FileIOUtils.prototype.downloadPythonSourceFiles = function (self, filesToAdd, dataModel, deferred, artifact) {
        var genFileName = "";

        self.FILES.forEach(function (fileInfo) {
            if (fileInfo.name === 'components') {
                // For every component, one file
                for (var i = 0; i < dataModel.comps.length; i++) {
                    genFileName = 'MOCA_GeneratedCode/lib/moca_components/' + dataModel.comps[i].name + '.py';
                    filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.comps[i]);
                }
            } else if (fileInfo.name === 'groups') {
                // For every group, one file
                for (var i = 0; i < dataModel.groups.length; i++) {
                    genFileName = 'MOCA_GeneratedCode/lib/moca_groups/' + dataModel.groups[i].name + '.py';
                    filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.groups[i]);
                }
            } else if (fileInfo.name === 'problems') {
                // If the filename is "problem" - use the template for problems
                // additionally generate .bat file for that as well
                for (var i = 0; i < dataModel.problems.length; i++) {
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
                for (var i = 0; i < dataModel.problems.length; i++) {
                    genFileName = 'MOCA_GeneratedCode/utils/moca_plotutils/' + dataModel.problems[i].name + '_plotutils.py';
                    filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.problems[i]);
                }
            } else if (fileInfo.name === 'process flows') {
                for (var i = 0; i < dataModel.processFlows.length; i++) {
                    genFileName = 'MOCA_GeneratedCode/src/' + dataModel.processFlows[i].name + '.py';
                    var genIpynbFile = 'MOCA_GeneratedCode/' + dataModel.processFlows[i].name + '.ipynb';
                    filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.processFlows[i]);
                    filesToAdd[genIpynbFile] = ejs.render(TEMPLATES[fileInfo.ipynbfile], dataModel.processFlows[i]);
                }
            } else if (fileInfo.name === 'preprocessors') {
                for (var i = 0; i < dataModel.ddComps.length; i++) {
                    var ddCompName = dataModel.ddComps[i].name;
                    for (var j = 0; j < dataModel.ddComps[i].dataPreprocs.length; j++) {
                        var preprocName = dataModel.ddComps[i].dataPreprocs[j].name;

                        genFileName = 'MOCA_GeneratedCode/lib/moca_ddmodels/' + ddCompName + '/preprocs/' + preprocName + '.py';
                        filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.ddComps[i].dataPreprocs[j]);
                    }
                }
            } else if (fileInfo.name === 'data sources') {
                for (var i = 0; i < dataModel.ddComps.length; i++) {
                    var ddCompName = dataModel.ddComps[i].name;
                    for (var j = 0; j < dataModel.ddComps[i].dataSources.length; j++) {
                        var dataSourceName = dataModel.ddComps[i].dataSources[j].name;

                        genFileName = 'MOCA_GeneratedCode/lib/moca_ddmodels/' + ddCompName + '/data_sources/' + dataSourceName + '.py';
                        filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.ddComps[i].dataSources[j]);
                    }
                }
            } else if (fileInfo.name === 'learning algo') {
                for (var i = 0; i < dataModel.ddComps.length; i++) {
                    var ddCompName = dataModel.ddComps[i].name;
                    for (var j = 0; j < dataModel.ddComps[i].learningAlgorithms.length; j++) {
                        var dataSourceName = dataModel.ddComps[i].learningAlgorithms[j].name;

                        genFileName = 'MOCA_GeneratedCode/lib/moca_ddmodels/' + ddCompName + '/learning_algos/' + dataSourceName + '.py';
                        filesToAdd[genFileName] = ejs.render(TEMPLATES[fileInfo.template], dataModel.ddComps[i].learningAlgorithms[j]);
                    }
                }
            } else if (fileInfo.name === 'ddcomp') {
                for (var i = 0; i < dataModel.ddComps.length; i++) {
                    // genFileName = 'MOCA_GeneratedCode/src/' + dataModel.processFlows[i].name + '.py';
                    var genIpynbFile = 'MOCA_GeneratedCode/' + dataModel.ddComps[i].name + '.ipynb';
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
        for (var i = 0; i < subdirectories.length; i++) {
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
        self.logger.info('Generated python files for MOCA to download on client.');

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
    };

    return FileIOUtils;
});