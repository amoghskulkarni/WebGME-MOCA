/* Generated file based on ejs templates */
define([], function() {
    return {
    "moca.components.generated.py.ejs": "#!/usr/bin/python\r\nfrom openmdao.api import Component\r\nimport sys\r\n\r\n<%\r\n// Generate the code for all the components\r\nfor (var i = 0; i < comps.length; i++) {\r\n-%>\r\nclass <%= comps[i].name %>(Component):\r\n    def __init__(self):\r\n        super(<%= comps[i].name %>, self).__init__()\r\n<%\r\n    // Generate \"add_param\" statements\r\n    for (var j = 0; j < comps[i].parameters.length; j++) {\r\n        valueString = comps[i].parameters[j].value;\r\n        if (valueString.indexOf('.') === -1)\r\n            valueString += '.0';\r\n-%>\r\n        self.add_param('<%= comps[i].parameters[j].name %>', val=<%= comps[i].parameters[j].value %>)\r\n<%\r\n    }\r\n-%>\r\n<%\r\n    // Generate \"add_output\" and \"add_state\" statements\r\n    for (var j = 0; j < comps[i].unknowns.length; j++) {\r\n        var unknown_type;\r\n        if (comps[i].unknowns[j].type == 'Output') {\r\n            unknown_type = 'output';\r\n        } else {\r\n            unknown_type = 'state';\r\n        }\r\n        valueString = comps[i].unknowns[j].value;\r\n        if (valueString.indexOf('.') === -1)\r\n            valueString += '.0';\r\n-%>\r\n        self.add_<%= unknown_type %>('<%= comps[i].unknowns[j].name %>', val=<%= comps[i].unknowns[j].value %>)\r\n<%\r\n    }\r\n-%>\r\n<%\r\n    // Generate statement configuring force_fd\r\n    if (comps[i].force_fd === true) {\r\n-%>\r\n        self.fd_options['force_fd'] = True\r\n<%\r\n    }\r\n-%>\r\n\r\n    def solve_nonlinear(self, params, unknowns, resids):\r\n        # Assigning shorthand(s) to the parameter(s)\r\n<%\r\n    // Generate statements for dummy implementation of the method\r\n    for (var j = 0; j < comps[i].parameters.length; j++) {\r\n-%>\r\n        <%= comps[i].parameters[j].name %> = params['<%= comps[i].parameters[j].name %>']\r\n<%\r\n    }\r\n-%>\r\n\r\n<%\r\n    // Generate statements to give explicit equation between output(s) and input(s)\r\n    if (comps[i].outputFunction === '') {\r\n        // Print the dummy code snippet if the user hasn't given one\r\n        var dummyStatement = '';\r\n        for (var j = 0; j < comps[i].parameters.length; j++) {\r\n            dummyStatement += comps[i].parameters[j].name;\r\n            if (j != comps[i].parameters.length - 1)\r\n                dummyStatement += ' + ';\r\n        }\r\n        for (var j = 0; j < comps[i].unknowns.length; j++) {\r\n-%>\r\n        # Dummy function for the unknown <%= comps[i].unknowns[j].name %>\r\n        <%= comps[i].unknowns[j].name %> = <%= dummyStatement %>\r\n<%\r\n        }\r\n    } else {\r\n-%>\r\n        # This code snippet is defined by user using the embedded code editor in MOCA\r\n<%\r\n        // Print the user defined code snippet\r\n        var eqnLines = comps[i].outputFunction.split(\"\\n\");\r\n        for (var j = 0; j < eqnLines.length; j++) {\r\n            if (eqnLines[j] !== '') {\r\n-%>\r\n        <%- eqnLines[j] %>\r\n<%\r\n            }\r\n        }\r\n    }\r\n-%>\r\n\r\n        # Assign the value(s) to unknown(s)\r\n<%\r\n    for (var j = 0; j < comps[i].unknowns.length; j++) {\r\n-%>\r\n        unknowns['<%= comps[i].unknowns[j].name %>'] = <%= comps[i].unknowns[j].name %>\r\n<%\r\n    }\r\n-%>\r\n<%\r\n    // If the component is implicit, generate code for apply_nonlinear()\r\n    if (comps[i].type === 'Implicit') {\r\n        // TODO: Generate statements giving the values for residuals\r\n-%>\r\n\r\n    def apply_nonlinear(self, params, unknowns, resids):\r\n        print \"Provide the values of the residuals in apply_nonlinear() for <%= comps[i].name %>\"\r\n<%\r\n    }\r\n-%>\r\n<%\r\n    // If the force_fd is set to false, generate code for linearize()\r\n    if (comps[i].force_fd === false) {\r\n-%>\r\n\r\n    def linearize(self, params, unknowns, resids):\r\n        J = {}\r\n\r\n        # Assigning shorthand(s) to the parameter(s)\r\n<%\r\n        // Generate statements for dummy implementation of the method\r\n        for (var j = 0; j < comps[i].parameters.length; j++) {\r\n-%>\r\n        <%= comps[i].parameters[j].name %> = params['<%= comps[i].parameters[j].name %>']\r\n<%\r\n        }\r\n-%>\r\n\r\n        # This jecobian is defined by user using the embedded code editor in MOCA\r\n<%\r\n        // Print the user defined code snippet\r\n        var jecobianLines = comps[i].jacobian.split(\"\\n\");\r\n        for (var j = 0; j < jecobianLines.length; j++) {\r\n            if (jecobianLines[j] !== '') {\r\n-%>\r\n        <%- jecobianLines[j] %>\r\n<%\r\n            }\r\n        }\r\n-%>\r\n\r\n        # Return Jacobian (should not be empty)\r\n        return J\r\n<%\r\n    }\r\n-%>\r\n\r\n<%\r\n}\r\n-%>\r\n",
    "moca.groups.generated.py.ejs": "#!/usr/bin/python\r\n\r\n# Static imports\r\nfrom openmdao.api import Group\r\nimport components\r\nimport sys\r\n\r\n# Dynamic imports\r\n<%\r\nfor (var i = 0; i < groups.length; i++) {\r\n    if (groups[i].algebraicLoop) {\r\n-%>\r\nfrom openmdao.api import NLGaussSeidel, ScipyGMRES\r\n<%\r\n        break;\r\n    }\r\n}\r\n-%>\r\n\r\n<%\r\n// Generate the code for all the groups\r\nfor (var i = 0; i < groups.length; i++) {\r\n-%>\r\nclass <%= groups[i].name %>(Group):\r\n    def __init__(self):\r\n        super(<%= groups[i].name %>, self).__init__()\r\n\r\n<%\r\n    // Generate the code for add() statements for components -\r\n    // add instances of components\r\n    for (var j = 0; j < groups[i].compInstances.length; j++) {\r\n        promotesString = '';\r\n        for (var k = 0; k < groups[i].compInstances[j].promotes.length; k++) {\r\n            promotesString += \"'\" + groups[i].compInstances[j].promotes[k] + \"'\";\r\n            if (k != groups[i].compInstances[j].promotes.length - 1)\r\n                promotesString += ', ';\r\n        }\r\n-%>\r\n        self.add('<%= groups[i].compInstances[j].name %>', components.<%= groups[i].compInstances[j].base %>(), promotes=[<%- promotesString %>])\r\n<%\r\n    }\r\n-%>\r\n\r\n<%\r\n    // Generate the code for add() statements for groups -\r\n    // add instances of groups\r\n    for (var j = 0; j < groups[i].groupInstances.length; j++) {\r\n        var promotesString = '';\r\n        for (var k = 0; k < groups[i].groupInstances[j].promotes.length; k++) {\r\n            promotesString += \"'\" + groups[i].groupInstances[j].promotes[k] + \"'\";\r\n            if (k != groups[i].groupInstances[j].promotes.length - 1)\r\n                promotesString += ', ';\r\n        }\r\n-%>\r\n        self.add('<%= groups[i].groupInstances[j].name %>', <%= groups[i].groupInstances[j].base %>(), promotes=[<%- promotesString %>])\r\n<%\r\n    }\r\n-%>\r\n\r\n<%\r\n    // Generate the code for connect() statements for connections between ports\r\n    for (var j = 0; j < groups[i].connections.length; j++) {\r\n-%>\r\n        self.connect('<%= groups[i].connections[j].srcParent %>.<%= groups[i].connections[j].src %>', '<%= groups[i].connections[j].dstParent %>.<%= groups[i].connections[j].dst %>')\r\n<%\r\n    }\r\n-%>\r\n<%\r\n    // Change nl_solver and ln_driver in case of algebraic loop\r\n    if (groups[i].algebraicLoop) {\r\n-%>\r\n\r\n        # Special solvers for handling algebraic loops\r\n        self.nl_solver = NLGaussSeidel()\r\n        self.nl_solver.options['atol'] = 1.0e-12\r\n        self.ln_solver = ScipyGMRES()\r\n<%\r\n    }\r\n-%>\r\n\r\n<%\r\n}\r\n%>\r\n",
    "moca.parseutils.generated.py.ejs": "__author__ = 'Amogh'\r\n__doc__ = 'The utility class defined in this file gives the methods to access the sqlite database file' \\\r\n          'saved by OpenMDAO sqlite driver.'\r\n\r\nfrom sqlitedict import SqliteDict\r\n\r\nclass SqliteParseUtils:\r\n    def __init__(self):\r\n        super(SqliteParseUtils, self).__init__()\r\n\r\n    @staticmethod\r\n    def __getValues(filename, type, name):\r\n        values = []\r\n        db = SqliteDict(filename, 'openmdao')\r\n        keylist = db.keys()\r\n        for key in keylist:\r\n            if key != 'metadata':\r\n                data = db[key]\r\n                if type != 'timestamp':\r\n                    values.append(data[type][name])\r\n                else:\r\n                    values.append(data[type])\r\n        return values\r\n\r\n    @staticmethod\r\n    def getParamValues(filename, paramname):\r\n        return SqliteParseUtils.__getValues(filename, 'Parameters', paramname)\r\n\r\n    @staticmethod\r\n    def getUnknownValues(filename, unknownname):\r\n        return SqliteParseUtils.__getValues(filename, 'Unknowns', unknownname)\r\n\r\n    @staticmethod\r\n    def getTimestampValues(filename):\r\n        return SqliteParseUtils.__getValues(filename, 'timestamp', None)\r\n",
    "moca.problem.generated.ipynb.ejs": "{\r\n \"cells\": [\r\n  {\r\n   \"cell_type\": \"markdown\",\r\n   \"metadata\": {},\r\n   \"source\": [\r\n    \"# <%= name %> Notebook\\n\",\r\n    \"***\",\r\n    \"\\n\",\r\n    \"## Execution\\n\",\r\n    \"\\n\",\r\n    \"Import the problem (and optionally the parsing and/or plotting utilities).\"\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"code\",\r\n   \"execution_count\": null,\r\n   \"metadata\": {\r\n    \"collapsed\": true\r\n   },\r\n   \"outputs\": [],\r\n   \"source\": [\r\n    \"from src.<%= name %> import <%= name %>\"\r\n<%\r\nif (recorder === 'Specific') {\r\n-%>\r\n    ,\"\\n\"\r\n    ,\"from util.MOCAparseutils import SqliteParseUtils\"\r\n<%\r\n}\r\n-%>\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"markdown\",\r\n   \"metadata\": {},\r\n   \"source\": [\r\n    \"Instantiate the problem.\"\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"code\",\r\n   \"execution_count\": null,\r\n   \"metadata\": {\r\n    \"collapsed\": true\r\n   },\r\n   \"outputs\": [],\r\n   \"source\": [\r\n    \"top = <%= name %>()\"\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"markdown\",\r\n   \"metadata\": {},\r\n   \"source\": [\r\n    \"Run the problem.\"\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"code\",\r\n   \"execution_count\": null,\r\n   \"metadata\": {\r\n    \"collapsed\": true\r\n   },\r\n   \"outputs\": [],\r\n   \"source\": [\r\n    \"top.run()\"\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"markdown\",\r\n   \"metadata\": {},\r\n   \"source\": [\r\n    \"***\",\r\n    \"\\n\",\r\n    \"## Analysis\\n\"\r\n<%\r\nif (driver === 'ScipyOptimizer') {\r\n-%>\r\n    ,\"\\n\"\r\n    ,\"_**Optimization analysis**_\\n\"\r\n    ,\"\\n\"\r\n    ,\"**Objectives**\"\r\n<%\r\n}\r\n-%>\r\n   ]\r\n  }\r\n<%\r\nif (driver === 'ScipyOptimizer') {\r\n-%>\r\n  ,{\r\n   \"cell_type\": \"code\",\r\n   \"execution_count\": null,\r\n   \"metadata\": {\r\n    \"collapsed\": true\r\n   },\r\n   \"outputs\": [],\r\n   \"source\": [\r\n    \"# Print objectives' values\"\r\n    ,\"\\n\"\r\n<%\r\n    for (var i = 0; i < objectives.length; i++) {\r\n-%>\r\n    ,\"print(\\\"<%= objectives[i].connection[0].srcParent %>.<%= objectives[i].connection[0].src %> = %f \\\" % (top['<%= objectives[i].connection[0].srcParent %>.<%= objectives[i].connection[0].src %>']))\"\r\n<%\r\n        if (i != objectives.length - 1) {\r\n-%>\r\n    ,\"\\n\"\r\n<%\r\n        }\r\n    }\r\n-%>\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"markdown\",\r\n   \"metadata\": {},\r\n   \"source\": [\r\n    \"**Design Variables**\"\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"code\",\r\n   \"execution_count\": null,\r\n   \"metadata\": {\r\n    \"collapsed\": true\r\n   },\r\n   \"outputs\": [],\r\n   \"source\": [\r\n    \"# Print design variables' values\"\r\n    ,\"\\n\"\r\n<%\r\n    for (var i = 0; i < desvars.length; i++) {\r\n-%>\r\n    ,\"print(\\\"<%= desvars[i].connection[0].dstParent %>.<%= desvars[i].connection[0].dst %> = %f\\\" % (top['<%= desvars[i].connection[0].dstParent %>.<%= desvars[i].connection[0].dst %>']))\"\r\n<%\r\n        if (i != desvars.length - 1) {\r\n-%>\r\n    ,\"\\n\"\r\n<%\r\n        }\r\n    }\r\n-%>\r\n   ]\r\n  }\r\n<%\r\n} else if (driver === 'FullFactorialDOE' && recorder !== '(None)') {\r\n-%>\r\n  ,{\r\n   \"cell_type\": \"markdown\",\r\n   \"metadata\": {},\r\n   \"source\": [\r\n    \"_**Design-of-experiment analysis**_\"\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"code\",\r\n   \"execution_count\": null,\r\n   \"metadata\": {\r\n    \"collapsed\": true\r\n   },\r\n   \"outputs\": [],\r\n   \"source\": [\r\n<%\r\n    if (recorder === 'Dump') {\r\n-%>\r\n    \"# Give an example of using dump parser utility\"\r\n<%\r\n    } else if (recorder === 'Specific') {\r\n-%>\r\n    \"# Get the database filename.\\n\"\r\n    ,\"filename = top.driver.recorders._recorders[0].out.filename\\n\"\r\n    ,\"# Wait for analysis to finish.\\n\"\r\n    ,\"top.cleanup()\\n\"\r\n    ,\"\\n\"\r\n    ,\"# Get the list(s) of values which you wanted to record using SqliteParseUtils using -\\n\"\r\n    ,\"# getParamValues(), getUnknownValues() or getTimestampValues()\\n\"\r\n<%\r\n        // if (records.length > 0) {\r\n        for (var i = 0; i < records.length; i++) {\r\n-%>\r\n    ,\"<%= records[i].connection[0].srcParent %>_<%= records[i].connection[0].src %>__values = \"\r\n    ,\"SqliteParseUtils.get<%= records[i].type %>Values(filename, \"\r\n    ,\"'<%= records[i].connection[0].srcParent %>.<%= records[i].connection[0].src %>')\"\r\n    ,\"\\n\"\r\n<%\r\n        }\r\n-%>\r\n    ,\"timestamps = SqliteParseUtils.getTimestampValues(filename)\"\r\n<%\r\n    }\r\n-%>\r\n   ]\r\n  }\r\n<%\r\n} else {\r\n-%>\r\n  ,{\r\n   \"cell_type\": \"markdown\",\r\n   \"metadata\": {},\r\n   \"source\": [\r\n    \"No analysis / recorder selected.\"\r\n   ]\r\n  }\r\n<%\r\n}\r\n-%>\r\n ],\r\n \"metadata\": {\r\n  \"kernelspec\": {\r\n   \"display_name\": \"Python 2\",\r\n   \"language\": \"python\",\r\n   \"name\": \"python2\"\r\n  },\r\n  \"language_info\": {\r\n   \"codemirror_mode\": {\r\n    \"name\": \"ipython\",\r\n    \"version\": 2\r\n   },\r\n   \"file_extension\": \".py\",\r\n   \"mimetype\": \"text/x-python\",\r\n   \"name\": \"python\",\r\n   \"nbconvert_exporter\": \"python\",\r\n   \"pygments_lexer\": \"ipython2\",\r\n   \"version\": \"2.7.9\"\r\n  }\r\n },\r\n \"nbformat\": 4,\r\n \"nbformat_minor\": 0\r\n}\r\n",
    "moca.problems.generated.py.ejs": "#!/usr/bin/python\r\n\r\n# Static imports\r\nfrom openmdao.api import IndepVarComp, Group, Problem\r\nimport lib.components as components\r\nimport lib.groups as groups\r\n\r\n# Dynamic imports\r\n<%\r\nif (driver === 'ScipyOptimizer') {\r\n-%>\r\nfrom openmdao.api import ScipyOptimizer\r\n<%\r\n} else if (driver === 'FullFactorialDOE') {\r\n-%>\r\nfrom openmdao.api import FullFactorialDriver\r\n<%\r\n}\r\n-%>\r\n<%\r\nif (recorder === 'Dump') {\r\n-%>\r\nfrom openmdao.api import DumpRecorder\r\n<%\r\n} else if (recorder === 'Specific') {\r\n-%>\r\nfrom openmdao.api import SqliteRecorder\r\n<%\r\n}\r\n-%>\r\n<%\r\nif (algebraicLoop) {\r\n-%>\r\nfrom openmdao.api import NLGaussSeidel, ScipyGMRES\r\n<%\r\n}\r\n-%>\r\n\r\nclass RootGroup(Group):\r\n    def __init__(self):\r\n        super(RootGroup, self).__init__()\r\n\r\n<%\r\n// add() statements for design variables\r\nfor (var i = 0; i < desvars.length; i++) {\r\n    var valueString = desvars[i].value.toString();\r\n    if (valueString.indexOf('.') === -1) {\r\n        valueString += '.0';\r\n    }\r\n-%>\r\n        self.add('<%= desvars[i].name %>', IndepVarComp('<%= desvars[i].connection[0].dst %>', <%= valueString %>))\r\n<%\r\n}\r\n-%>\r\n<%\r\n// Generate the code for add() statements for components -\r\n// add instances of components\r\nfor (var j = 0; j < compInstances.length; j++) {\r\n    promotesString = '';\r\n    for (var k = 0; k < compInstances[j].promotes.length; k++) {\r\n        promotesString += \"'\" + compInstances[j].promotes[k] + \"'\";\r\n        if (k != compInstances[j].promotes.length - 1)\r\n            promotesString += ', ';\r\n    }\r\n-%>\r\n        self.add('<%= compInstances[j].name %>', components.<%= compInstances[j].base %>(), promotes=[<%- promotesString %>])\r\n<%\r\n}\r\n-%>\r\n<%\r\n// Generate the code for add() statements for groups -\r\n// add instances of groups\r\nfor (var j = 0; j < groupInstances.length; j++) {\r\n    var promotesString = '';\r\n    for (var k = 0; k < groupInstances[j].promotes.length; k++) {\r\n        promotesString += \"'\" + groupInstances[j].promotes[k] + \"'\";\r\n        if (k != groupInstances[j].promotes.length - 1)\r\n            promotesString += ', ';\r\n    }\r\n-%>\r\n        self.add('<%= groupInstances[j].name %>', groups.<%= groupInstances[j].base %>(), promotes=[<%- promotesString %>])\r\n<%\r\n}\r\n-%>\r\n\r\n<%\r\n// Generate the code for connect() statements for connections between ports\r\nfor (var j = 0; j < connections.length; j++) {\r\n-%>\r\n        self.connect('<%= connections[j].srcParent %>.<%= connections[j].src %>', '<%= connections[j].dstParent %>.<%= connections[j].dst %>')\r\n<%\r\n}\r\n-%>\r\n<%\r\n// Generate the code for connect() statements for connections\r\n// between IndepVarComps' ports and ports\r\nfor (var j = 0; j < desvars.length; j++) {\r\n-%>\r\n        self.connect('<%= desvars[j].name %>.<%= desvars[j].connection[0].dst %>', '<%= desvars[j].connection[0].dstParent %>.<%= desvars[j].connection[0].dst %>')\r\n<%\r\n}\r\n-%>\r\n<%\r\n// Change nl_solver and ln_driver in case of algebraic loop\r\nif (algebraicLoop) {\r\n-%>\r\n\r\n        # Special solvers for handling algebraic loops\r\n        self.nl_solver = NLGaussSeidel()\r\n        self.nl_solver.options['atol'] = 1.0e-12\r\n        self.ln_solver = ScipyGMRES()\r\n<%\r\n}\r\n-%>\r\n\r\nclass <%= name %>(Problem):\r\n    def __init__(self):\r\n        super(<%= name %>, self).__init__()\r\n\r\n        self.root = RootGroup()\r\n<%\r\n// Driver settings\r\nif (driver === 'ScipyOptimizer') {\r\n-%>\r\n\r\n        driver = ScipyOptimizer()\r\n        driver.options['optimizer'] = 'SLSQP'\r\n\r\n<%\r\n    for (var i = 0; i < constraints.length; i++) {\r\n        limitsString = '';\r\n        if (constraints[i].enableUpper) {\r\n            limitsString = 'upper=';\r\n            valueString = constraints[i].upper;\r\n            if (valueString.indexOf('.') === -1)\r\n                valueString += '.0';\r\n            limitsString += valueString;\r\n        }\r\n        if (constraints[i].enableLower) {\r\n            limitsString += ', lower=';\r\n            valueString = constraints[i].lower;\r\n            if (valueString.indexOf('.') === -1)\r\n                valueString += '.0';\r\n            limitsString += valueString;\r\n        }\r\n        if (!constraints[i].enableLower && !constraints[i].enableUpper)\r\n            break;\r\n-%>\r\n        driver.add_constraint('<%= constraints[i].connection[0].srcParent %>.<%= constraints[i].connection[0].src %>', <%= limitsString %>)\r\n<%\r\n    }\r\n-%>\r\n<%\r\n} else if (driver === 'FullFactorialDOE') {\r\n-%>\r\n\r\n        driver = FullFactorialDriver(<%= doeSamples %>)\r\n<%\r\n}\r\n-%>\r\n<%\r\n// add recorder\r\nif (recorder === 'Dump') {\r\n-%>\r\n\r\n        rec = DumpRecorder('out/<%= name %>_dumpfile')\r\n        rec.options['record_params'] = True\r\n        rec.options['record_unknowns'] = True\r\n        driver.add_recorder(rec)\r\n<%\r\n} else if (recorder === 'Specific') {\r\n        var incWord = \"'\" + \"includes\" + \"'\";\r\n        var incString = '';\r\n        for (var i = 0; i < records.length; i++) {\r\n            // construct incString\r\n            incString += \"'\" + records[i].connection[0].srcParent + \".\" + records[i].connection[0].src + \"'\";\r\n            if (i != records.length - 1)\r\n                incString += \", \";\r\n        }\r\n        if (incString === \"\")\r\n            incString = \"'\" + \"*\" + \"'\";\r\n-%>\r\n\r\n        rec = SqliteRecorder('out/<%= name %>_sqlitefile')\r\n        rec.options['record_params'] = True\r\n        rec.options['record_unknowns'] = True\r\n        rec.options[<%- incWord %>] = [<%- incString %>]\r\n        driver.add_recorder(rec)\r\n<%\r\n}\r\n-%>\r\n\r\n<%\r\n// add_desvar() statements for design variables\r\nfor (var i = 0; i < desvars.length; i++) {\r\n    var upperString = desvars[i].upper.toString(),\r\n        lowerString = desvars[i].lower.toString();\r\n    if (upperString.indexOf('.') === -1) {\r\n        upperString += '.0';\r\n    }\r\n    if (lowerString.indexOf('.') === -1) {\r\n        lowerString += '.0';\r\n    }\r\n-%>\r\n        driver.add_desvar('<%= desvars[i].name %>.<%= desvars[i].connection[0].dst %>', lower=<%= lowerString %>, upper=<%= upperString %>)\r\n<%\r\n}\r\n-%>\r\n\r\n<%\r\n// add_objective() statements for objectives\r\nfor (var i = 0; i < objectives.length; i++) {\r\n-%>\r\n        driver.add_objective('<%= objectives[i].connection[0].srcParent %>.<%= objectives[i].connection[0].src %>')\r\n<%\r\n}\r\n-%>\r\n\r\n        self.driver = driver\r\n        self.setup()\r\n\r\n\r\nif __name__ == \"__main__\":\r\n\r\n    top = <%= name %>()\r\n\r\n    print \"Running the MOCA problem <%= name %>\"\r\n\r\n    top.run()\r\n\r\n    print \"Result:\"\r\n    print \"------\"\r\n\r\n<%\r\n// Print result in case of optimizer\r\nif (driver === 'ScipyOptimizer') {\r\n-%>\r\n    print \"\\tObjective(s):\"\r\n    print \"\\t------------\"\r\n<%\r\n    for (var i = 0; i < objectives.length; i++) {\r\n-%>\r\n    print(\"\\t\\t<%= objectives[i].connection[0].srcParent %>.<%= objectives[i].connection[0].src %> = %f\" % (top['<%= objectives[i].connection[0].srcParent %>.<%= objectives[i].connection[0].src %>']))\r\n<%\r\n    }\r\n-%>\r\n    print \"\\tDesign variable(s):\"\r\n    print \"\\t------------------\"\r\n<%\r\n    for (var i = 0; i < desvars.length; i++) {\r\n-%>\r\n    print(\"\\t\\t<%= desvars[i].connection[0].dstParent %>.<%= desvars[i].connection[0].dst %> = %f\" % (top['<%= desvars[i].connection[0].dstParent %>.<%= desvars[i].connection[0].dst %>']))\r\n<%\r\n    }\r\n} else {\r\n-%>\r\n    print \"The DOE result is written in a file named <%= name %>_dumpfile or <%= name %>_sqlitefile in the parent folder.\"\r\n<%\r\n}\r\n-%>\r\n"
}});