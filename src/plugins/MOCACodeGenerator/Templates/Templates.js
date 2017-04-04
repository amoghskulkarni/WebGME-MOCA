/* Generated file based on ejs templates */
define([], function() {
    return {
    "moca.components.generated.py.ejs": "#!/usr/bin/python\r\nfrom openmdao.api import Component\r\nimport sys\r\n\r\n<%\r\n// Generate the code the component\r\n-%>\r\nclass <%= name %>(Component):\r\n    def __init__(self):\r\n        super(<%= name %>, self).__init__()\r\n<%\r\n// Generate \"add_param\" statements\r\nfor (var j = 0; j < parameters.length; j++) {\r\n    valueString = parameters[j].value;\r\n    if (valueString.indexOf('.') === -1)\r\n        valueString += '.0';\r\n-%>\r\n        self.add_param('<%= parameters[j].name %>', val=<%= parameters[j].value %>)\r\n<%\r\n}\r\n-%>\r\n<%\r\n// Generate \"add_output\" and \"add_state\" statements\r\nfor (var j = 0; j < unknowns.length; j++) {\r\n    var unknown_type;\r\n    if (unknowns[j].type == 'Output') {\r\n        unknown_type = 'output';\r\n    } else {\r\n        unknown_type = 'state';\r\n    }\r\n    valueString = unknowns[j].value;\r\n    if (valueString.indexOf('.') === -1)\r\n        valueString += '.0';\r\n-%>\r\n        self.add_<%= unknown_type %>('<%= unknowns[j].name %>', val=<%= unknowns[j].value %>)\r\n<%\r\n}\r\n-%>\r\n<%\r\n// Generate statement configuring force_fd\r\nif (force_fd === true) {\r\n-%>\r\n        self.deriv_options['type'] = 'fd'\r\n<%\r\n}\r\n-%>\r\n\r\n    def solve_nonlinear(self, params, unknowns, resids):\r\n        # Assigning shorthand(s) to the parameter(s)\r\n<%\r\n// Generate statements for dummy implementation of the method\r\nfor (var j = 0; j < parameters.length; j++) {\r\n-%>\r\n        <%= parameters[j].name %> = params['<%= parameters[j].name %>']\r\n<%\r\n}\r\n-%>\r\n\r\n<%\r\n// Generate statements to give explicit equation between output(s) and input(s)\r\nif (outputFunction === '') {\r\n    // Print the dummy code snippet if the user hasn't given one\r\n    var dummyStatement = '';\r\n    for (var j = 0; j < parameters.length; j++) {\r\n        dummyStatement += parameters[j].name;\r\n        if (j != parameters.length - 1)\r\n            dummyStatement += ' + ';\r\n    }\r\n    for (var j = 0; j < unknowns.length; j++) {\r\n-%>\r\n        # Dummy function for the unknown <%= unknowns[j].name %>\r\n        <%= unknowns[j].name %> = <%= dummyStatement %>\r\n<%\r\n    }\r\n} else {\r\n-%>\r\n        # This code snippet is defined by user using the embedded code editor in MOCA\r\n<%\r\n    // Print the user defined code snippet\r\n    var eqnLines = outputFunction.split(\"\\n\");\r\n    for (var j = 0; j < eqnLines.length; j++) {\r\n        if (eqnLines[j] !== '') {\r\n-%>\r\n        <%- eqnLines[j] %>\r\n<%\r\n        }\r\n    }\r\n}\r\n-%>\r\n\r\n        # Assign the value(s) to unknown(s)\r\n<%\r\nfor (var j = 0; j < unknowns.length; j++) {\r\n-%>\r\n        unknowns['<%= unknowns[j].name %>'] = <%= unknowns[j].name %>\r\n<%\r\n}\r\n-%>\r\n<%\r\n// If the component is implicit, generate code for apply_nonlinear()\r\nif (type === 'Implicit') {\r\n    // TODO: Generate statements giving the values for residuals\r\n-%>\r\n\r\n    def apply_nonlinear(self, params, unknowns, resids):\r\n        print \"Provide the values of the residuals in apply_nonlinear() for <%= comps[i].name %>\"\r\n<%\r\n}\r\n-%>\r\n<%\r\n// If the force_fd is set to false, generate code for linearize()\r\nif (force_fd === false) {\r\n-%>\r\n\r\n    def linearize(self, params, unknowns, resids):\r\n        J = {}\r\n\r\n        # Assigning shorthand(s) to the parameter(s)\r\n<%\r\n    // Generate statements for dummy implementation of the method\r\n    for (var j = 0; j < parameters.length; j++) {\r\n-%>\r\n        <%= parameters[j].name %> = params['<%= parameters[j].name %>']\r\n<%\r\n    }\r\n-%>\r\n\r\n        # This jecobian is defined by user using the embedded code editor in MOCA\r\n<%\r\n    // Print the user defined code snippet\r\n    var jecobianLines = jacobian.split(\"\\n\");\r\n    for (var j = 0; j < jecobianLines.length; j++) {\r\n        if (jecobianLines[j] !== '') {\r\n-%>\r\n        <%- jecobianLines[j] %>\r\n<%\r\n        }\r\n    }\r\n-%>\r\n\r\n        # Return Jacobian (should not be empty)\r\n        return J\r\n<%\r\n}\r\n-%>\r\n",
    "moca.groups.generated.py.ejs": "#!/usr/bin/python\r\n\r\n# Static imports\r\nfrom openmdao.api import Group\r\n<%\r\n// Generate import statement for every component instance\r\nfor (var i = 0; i < compInstances.length; i++) {\r\n-%>\r\nfrom ..moca_components.<%= compInstances[i].base %> import <%= compInstances[i].base %>\r\n<%\r\n}\r\n-%>\r\nimport sys\r\n\r\n# Dynamic imports\r\n<%\r\nvar algebraicLoopImport = false;\r\nif (algebraicLoop && !algebraicLoopImport) {\r\n    algebraicLoopImport = true;\r\n-%>\r\nfrom openmdao.api import NLGaussSeidel, ScipyGMRES\r\n<%\r\n}\r\n-%>\r\n\r\n<%\r\n// Generate the code for the group\r\nvar promotedPorts = [];\r\n-%>\r\nclass <%= name %>(Group):\r\n    def __init__(self):\r\n        super(<%= name %>, self).__init__()\r\n\r\n<%\r\n// Generate the code for add() statements for components -\r\n// add instances of components\r\nfor (var j = 0; j < compInstances.length; j++) {\r\n    promotesString = '';\r\n    for (var k = 0; k < compInstances[j].promotes.length; k++) {\r\n        promotesString += \"'\" + compInstances[j].promotes[k] + \"'\";\r\n        promotedPorts.push(compInstances[j].name + \".\" + compInstances[j].promotes[k]);\r\n        if (k != compInstances[j].promotes.length - 1)\r\n            promotesString += ', ';\r\n    }\r\n-%>\r\n        self.add('<%= compInstances[j].name %>', <%= compInstances[j].base %>(), promotes=[<%- promotesString %>])\r\n<%\r\n}\r\n-%>\r\n\r\n<%\r\n// Generate the code for add() statements for groups -\r\n// add instances of groups\r\nfor (var j = 0; j < groupInstances.length; j++) {\r\n    var promotesString = '';\r\n    for (var k = 0; k < groupInstances[j].promotes.length; k++) {\r\n        promotesString += \"'\" + groupInstances[j].promotes[k] + \"'\";\r\n        promotedPorts.push(groupInstances[j].name + \".\" + groupInstances[j].promotes[k]);\r\n        if (k != groupInstances[j].promotes.length - 1)\r\n            promotesString += ', ';\r\n    }\r\n-%>\r\n        self.add('<%= groupInstances[j].name %>', <%= groupInstances[j].base %>(), promotes=[<%- promotesString %>])\r\n<%\r\n}\r\n-%>\r\n\r\n<%\r\n// Generate the code for connect() statements for connections between ports\r\nfor (var j = 0; j < connections.length; j++) {\r\n    var srcConnectString = connections[j].srcParent + \".\" + connections[j].src;\r\n    var dstConnectString = connections[j].dstParent + \".\" + connections[j].dst;\r\n    // Check whether these strings are in promotedPorts list, i.e. whether these ports are connected\r\n    if (promotedPorts.indexOf(srcConnectString) != -1)\r\n        srcConnectString = srcConnectString.split('.')[1];\r\n    if (promotedPorts.indexOf(dstConnectString) != -1)\r\n        dstConnectString = dstConnectString.split('.')[1];\r\n-%>\r\n        self.connect('<%= srcConnectString %>', '<%= dstConnectString %>')\r\n<%\r\n}\r\n-%>\r\n<%\r\n// Change nl_solver and ln_driver in case of algebraic loop\r\nif (algebraicLoop) {\r\n-%>\r\n\r\n        # Special solvers for handling algebraic loops\r\n        self.nl_solver = NLGaussSeidel()\r\n        self.nl_solver.options['atol'] = 1.0e-12\r\n        self.ln_solver = ScipyGMRES()\r\n<%\r\n}\r\n-%>\r\n",
    "moca.parseutils.generated.py.ejs": "__author__ = 'Amogh'\r\n__doc__ = 'The utility class defined in this file gives the methods to access the sqlite database file' \\\r\n          'saved by OpenMDAO sqlite driver.'\r\n\r\nfrom sqlitedict import SqliteDict\r\n\r\nclass SqliteParseUtils:\r\n    def __init__(self, top):\r\n        # Get the database filename.\r\n        self.filename = top.driver.recorders._recorders[0].out_iterations.filename\r\n\r\n        # Wait for analysis to finish.\r\n        top.cleanup()\r\n\r\n    def __getValues(self, vartype, name):\r\n        values = []\r\n        db = SqliteDict(self.filename, 'iterations')\r\n        keylist = db.keys()\r\n        for key in keylist:\r\n            if key != 'metadata':\r\n                data = db[key]\r\n                if vartype != 'timestamp':\r\n                    values.append(data[vartype][name])\r\n                else:\r\n                    values.append(data[vartype])\r\n        return values\r\n\r\n    def getParamValues(self, paramname):\r\n        return self.__getValues('Parameters', paramname)\r\n\r\n    def getUnknownValues(self, unknownname):\r\n        return self.__getValues('Unknowns', unknownname)\r\n\r\n    def getTimestampValues(self):\r\n        return self.__getValues('timestamp', None)\r\n",
    "moca.plotutils.generated.py.ejs": "__author__ = 'Amogh'\r\n__doc__ = 'The utility class defined in this file gives the methods to plot' \\\r\n          'the data points saved in the list on 2D and 3D plots.'\r\n\r\nfrom bokeh.models import HoverTool\r\nfrom bokeh.plotting import figure\r\nfrom bokeh.io import show, output_notebook, push_notebook\r\n\r\nfrom pandas import DataFrame\r\nfrom numpy import isclose\r\n\r\nfrom copy import deepcopy\r\n\r\nfrom ipywidgets import interact\r\nimport ipywidgets as widgets\r\n\r\n<%\r\nif (driver === 'FullFactorialDOE') {\r\n-%>\r\n\r\nclass <%= name %>_PlotUtils:\r\n    def __init__(self, parseutils):\r\n        timestamps = parseutils.getTimestampValues()\r\n<%\r\n    // generate __values statements for all the records connected to Unknowns only\r\n    for (var j = 0; j < records.length; j++) {\r\n        if (records[j].type === \"Unknown\") {\r\n-%>\r\n        <%= records[j].connection[0].srcParent %>_<%= records[j].connection[0].src %>__values = parseutils.getUnknownValues('<%= records[j].connection[0].srcParent %>.<%= records[j].connection[0].src %>')\r\n<%\r\n        }\r\n    }\r\n    // generate __values statements for all the desvars\r\n    // all desvars are recorded by default, and we access their values by taking the values of IndepVarComps\r\n    // Since, all IndepVarComps' outputs are Unknowns, we are using getUnknownValues\r\n    for (var j = 0; j < desvars.length; j++) {\r\n-%>\r\n        <%= desvars[j].connection[0].dstParent %>_<%= desvars[j].connection[0].dst %>__values = parseutils.getUnknownValues('<%= desvars[j].name %>.<%= desvars[j].connection[0].dst %>')\r\n<%\r\n    }\r\n-%>\r\n\r\n        # Dataframe construction\r\n        self.df = DataFrame({'timestamps': timestamps,\r\n<%\r\n    for (var j = 0; j < desvars.length; j++) {\r\n-%>\r\n                             '<%= desvars[j].connection[0].dstParent %>.<%= desvars[j].connection[0].dst %>': <%= desvars[j].connection[0].dstParent %>_<%= desvars[j].connection[0].dst %>__values,\r\n<%\r\n    }\r\n    for (var j = 0; j < records.length-1; j++) {\r\n        if (records[j].type === \"Unknown\") {\r\n-%>\r\n                             '<%= records[j].connection[0].srcParent %>.<%= records[j].connection[0].src %>':  <%= records[j].connection[0].srcParent %>_<%= records[j].connection[0].src %>__values,\r\n<%\r\n        }\r\n    }\r\n-%>\r\n                             '<%= records[records.length-1].connection[0].srcParent %>.<%= records[records.length-1].connection[0].src %>':  <%= records[records.length-1].connection[0].srcParent %>_<%= records[records.length-1].connection[0].src %>__values })\r\n        # step calculation\r\n<%\r\n    for (var j = 0; j < desvars.length; j++) {\r\n        if (desvars[j].setByDriver) {\r\n-%>\r\n        <%= desvars[j].connection[0].dstParent %>_<%= desvars[j].connection[0].dst %>__values__sorted = sorted(<%= desvars[j].connection[0].dstParent %>_<%= desvars[j].connection[0].dst %>__values)\r\n        self.<%= desvars[j].connection[0].dstParent %>_<%= desvars[j].connection[0].dst %>__step = <%= desvars[j].connection[0].dstParent %>_<%= desvars[j].connection[0].dst %>__values__sorted[<%= doeSamples %>] - <%= desvars[j].connection[0].dstParent %>_<%= desvars[j].connection[0].dst %>__values__sorted[0]\r\n<%\r\n        }\r\n    }\r\n-%>\r\n\r\n        # bokeh init\r\n        output_notebook()\r\n\r\n        # axes configuration\r\n<%\r\n    for (var j = 0; j < desvars.length; j++) {\r\n        if (desvars[j].setByDriver) {\r\n-%>\r\n        x_axis_values = <%= desvars[j].connection[0].dstParent %>_<%= desvars[j].connection[0].dst %>__values\r\n<%\r\n            break;\r\n        }\r\n    }\r\n-%>\r\n        y_axis_values = <%= records[0].connection[0].srcParent %>_<%= records[0].connection[0].src %>__values\r\n\r\n        # bokeh config\r\n        self.p = figure(title='<%= name %>')\r\n        self.p.add_tools(HoverTool())\r\n        self.base_scatter = self.p.circle(x_axis_values, y_axis_values, size=3, alpha=0.5)\r\n<%\r\n    var slider_desvars = [];\r\n    for (var j = 0; j < desvars.length; j++) {\r\n        if (desvars[j].setByDriver) {\r\n            slider_desvars.push({\r\n                dstParent: desvars[j].connection[0].dstParent,\r\n                dst: desvars[j].connection[0].dst,\r\n                upper: desvars[j].upper,\r\n                lower: desvars[j].lower,\r\n                value: desvars[j].value\r\n            });\r\n        }\r\n    }\r\n    // This string should include all the desvars for which sliders are to be generated\r\n    var desvar_function_signature_string = \"\";\r\n    for (var j = 0; j < slider_desvars.length; j++) {\r\n        var substring = slider_desvars[j].dst + \"_slider, \" + slider_desvars[j].dst + \"_all\";\r\n        desvar_function_signature_string += substring;\r\n        if (j < slider_desvars.length - 1)\r\n            desvar_function_signature_string += \", \";\r\n    }\r\n-%>\r\n\r\n    def update(self, x, y, <%= desvar_function_signature_string %>):\r\n        sliced_df = deepcopy(self.df)\r\n<%\r\n    // These two statements are for each slider_desvar, which check tick-box for it\r\n    for (var j = 0; j < slider_desvars.length; j++) {\r\n-%>\r\n\r\n        if not <%= slider_desvars[j].dst %>_all:\r\n            sliced_df = sliced_df.loc[isclose(sliced_df['<%= slider_desvars[j].dstParent %>.<%= slider_desvars[j].dst %>'], <%= slider_desvars[j].dst %>_slider)]\r\n<%\r\n    }\r\n-%>\r\n\r\n        self.base_scatter.data_source.data['x'] = sliced_df[x]\r\n        self.base_scatter.data_source.data['y'] = sliced_df[y]\r\n        push_notebook()\r\n\r\n    def plot (self):\r\n        self.handle = show(self.p, notebook_handle=True)\r\n<%\r\n    var domain_options_string = \"\";\r\n    var range_options_string = \"\";\r\n    for (var j = 0; j < records.length; j++) {\r\n        range_options_string += \"'\" + records[j].connection[0].srcParent + '.' + records[j].connection[0].src + \"'\";\r\n        if (j < records.length - 1) {\r\n            range_options_string += \", \";\r\n        }\r\n    }\r\n\r\n    for (var j = 0; j < slider_desvars.length; j++) {\r\n        domain_options_string += \"'\" + slider_desvars[j].dstParent + '.' + slider_desvars[j].dst + \"'\";\r\n        if (j < slider_desvars.length - 1) {\r\n            domain_options_string += \", \";\r\n        }\r\n    }\r\n-%>\r\n\r\n    def show_widgets(self):\r\n        domain_options = [<%- domain_options_string %>]\r\n        range_options = [<%- range_options_string %>]\r\n        interact(self.update,\r\n            x=widgets.Dropdown(options=domain_options, value=domain_options[0], description='Domain (X-axis)'),\r\n            y=widgets.Dropdown(options=range_options, value=range_options[0], description='Range (Y-axis)'),\r\n<%\r\n    for (var j = 0; j < slider_desvars.length; j++) {\r\n        var trailing_character;\r\n        if (j < slider_desvars.length - 1)\r\n            trailing_character = \",\";\r\n        else\r\n            trailing_character = \")\";\r\n-%>\r\n            <%= slider_desvars[j].dst %>_slider = widgets.FloatSlider(value=<%= slider_desvars[j].value %>, min=<%= slider_desvars[j].lower %>, max=<%= slider_desvars[j].upper %>, step=self.<%= slider_desvars[j].dstParent %>_<%= slider_desvars[j].dst %>__step, description='<%= slider_desvars[j].dstParent %>.<%= slider_desvars[j].dst %>'),\r\n            <%= slider_desvars[j].dst %>_all = widgets.Checkbox(description='<%= slider_desvars[j].dstParent %>.<%= slider_desvars[j].dst %> (all values)', value=True)<%= trailing_character %>\r\n<%\r\n    }\r\n}\r\n-%>\r\n",
    "moca.problem.generated.ipynb.ejs": "{\r\n \"cells\": [\r\n  {\r\n   \"cell_type\": \"markdown\",\r\n   \"metadata\": {},\r\n   \"source\": [\r\n      \"# <%= name %> Notebook\\n\",\r\n      \"***\",\r\n      \"\\n\",\r\n      \"## Instantiation and execution\\n\",\r\n      \"\\n\",\r\n      \"Import the problem.\"\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"code\",\r\n   \"execution_count\": null,\r\n   \"metadata\": {\r\n    \"collapsed\": true\r\n   },\r\n   \"outputs\": [],\r\n   \"source\": [\r\n      \"from src.<%= name %> import <%= name %>\"\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"markdown\",\r\n   \"metadata\": {},\r\n   \"source\": [\r\n      \"Instantiate the problem.\"\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"code\",\r\n   \"execution_count\": null,\r\n   \"metadata\": {\r\n    \"collapsed\": true\r\n   },\r\n   \"outputs\": [],\r\n   \"source\": [\r\n      \"top = <%= name %>()\"\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"markdown\",\r\n   \"metadata\": {},\r\n   \"source\": [\r\n      \"Run the problem.\"\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"code\",\r\n   \"execution_count\": null,\r\n   \"metadata\": {\r\n    \"collapsed\": true\r\n   },\r\n   \"outputs\": [],\r\n   \"source\": [\r\n      \"# Assign values to design variable(s).\"\r\n      ,\"\\n\"\r\n<%\r\nfor (var i = 0; i < desvars.length; i++) {\r\n    var valueString = desvars[i].value.toString();\r\n    if (valueString.indexOf('.') === -1) {\r\n        valueString += '.0';\r\n    }\r\n-%>\r\n      ,\"top['<%= desvars[i].name %>.<%= desvars[i].connection[0].dst %>'] = <%= valueString %>\"\r\n      ,\"\\n\"\r\n<%\r\n}\r\n-%>\r\n      ,\"# Execute the problem.\"\r\n      ,\"\\n\"\r\n      ,\"top.run()\"\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"markdown\",\r\n   \"metadata\": {},\r\n   \"source\": [\r\n      \"***\",\r\n      \"\\n\",\r\n      \"## Analysis\\n\"\r\n<%\r\nif (driver === 'ScipyOptimizer') {\r\n-%>\r\n      ,\"\\n\"\r\n      ,\"_**Optimization analysis**_\\n\"\r\n      ,\"\\n\"\r\n      ,\"**Objectives**\"\r\n<%\r\n}\r\n-%>\r\n   ]\r\n  }\r\n<%\r\nif (driver === 'ScipyOptimizer' || driver === 'Default (run once)') {\r\n    if (driver === 'ScipyOptimizer') {\r\n-%>\r\n  ,{\r\n   \"cell_type\": \"code\",\r\n   \"execution_count\": null,\r\n   \"metadata\": {\r\n    \"collapsed\": true\r\n   },\r\n   \"outputs\": [],\r\n   \"source\": [\r\n      \"# Print objectives' values\"\r\n      ,\"\\n\"\r\n<%\r\n        for (var i = 0; i < objectives.length; i++) {\r\n-%>\r\n      ,\"print(\\\"<%= objectives[i].connection[0].srcParent %>.<%= objectives[i].connection[0].src %> = %f \\\" % (top['<%= objectives[i].connection[0].srcParent %>.<%= objectives[i].connection[0].src %>']))\"\r\n<%\r\n            if (i != objectives.length - 1) {\r\n-%>\r\n      ,\"\\n\"\r\n<%\r\n            }\r\n        }\r\n-%>\r\n   ]\r\n  }\r\n<%\r\n    }\r\n-%>\r\n  ,{\r\n   \"cell_type\": \"markdown\",\r\n   \"metadata\": {},\r\n   \"source\": [\r\n      \"**Design Variables**\"\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"code\",\r\n   \"execution_count\": null,\r\n   \"metadata\": {\r\n    \"collapsed\": true\r\n   },\r\n   \"outputs\": [],\r\n   \"source\": [\r\n      \"# Print design variables' values\"\r\n      ,\"\\n\"\r\n<%\r\n    for (var i = 0; i < desvars.length; i++) {\r\n-%>\r\n      ,\"print(\\\"<%= desvars[i].connection[0].dstParent %>.<%= desvars[i].connection[0].dst %> = %f\\\" % (top['<%= desvars[i].connection[0].dstParent %>.<%= desvars[i].connection[0].dst %>']))\"\r\n<%\r\n        if (i != desvars.length - 1) {\r\n-%>\r\n      ,\"\\n\"\r\n<%\r\n        }\r\n    }\r\n-%>\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"markdown\",\r\n   \"metadata\": {},\r\n   \"source\": [\r\n      \"**Recorded/Monitored variables**\"\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"code\",\r\n   \"execution_count\": null,\r\n   \"metadata\": {\r\n      \"collapsed\": true\r\n   },\r\n   \"outputs\": [],\r\n   \"source\": [\r\n      \"# Print recorded/monitored variables' values\"\r\n      ,\"\\n\"\r\n<%\r\n    for (var i = 0; i < records.length; i++) {\r\n-%>\r\n      ,\"print(\\\"<%= records[i].connection[0].srcParent %>.<%= records[i].connection[0].src %> = %f\\\" % (top['<%= records[i].connection[0].srcParent %>.<%= records[i].connection[0].src %>']))\"\r\n<%\r\n        if (i != records.length - 1) {\r\n-%>\r\n      ,\"\\n\"\r\n<%\r\n        }\r\n    }\r\n-%>\r\n   ]\r\n  }\r\n<%\r\n} else if (driver === 'FullFactorialDOE' && recorder !== '(None)') {\r\n-%>\r\n  ,{\r\n   \"cell_type\": \"markdown\",\r\n   \"metadata\": {},\r\n   \"source\": [\r\n      \"_**Design-of-experiment analysis**_\\n\"\r\n      ,\"\\n\"\r\n      ,\"*Recording*\"\r\n   ]\r\n  }\r\n<%\r\n    if (recorder === 'Dump') {\r\n-%>\r\n  ,{\r\n   \"cell_type\": \"markdown\",\r\n   \"metadata\": {},\r\n   \"source\": [\r\n      \"The recorder used is dump recorder, which creates the dumpfile in /out directory.\\n\"\r\n      ,\"It contains all the values of parameters and unknowns in human readable format.\\n\"\r\n    ]\r\n  }\r\n<%\r\n    } else if (recorder === 'Specific') {\r\n-%>\r\n  ,{\r\n   \"cell_type\": \"markdown\",\r\n   \"metadata\": {},\r\n   \"source\": [\r\n      \"Use utilities to parse and plot the output.\\n\"\r\n    ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"code\",\r\n   \"execution_count\": null,\r\n   \"metadata\": {\r\n    \"collapsed\": true\r\n   },\r\n   \"outputs\": [],\r\n   \"source\": [\r\n      \"from utils.MOCAparseutils import SqliteParseUtils\\n\"\r\n      ,\"from utils.moca_plotutils.<%= name %>_plotutils import <%= name %>_PlotUtils\\n\"\r\n      ,\"plotutils = <%= name %>_PlotUtils(SqliteParseUtils(top))\\n\"\r\n      ,\"plotutils.plot()\"\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"markdown\",\r\n   \"metadata\": {},\r\n   \"source\": [\r\n      \"Use widgets to interact with the plot.\\n\"\r\n   ]\r\n  }\r\n  ,{\r\n   \"cell_type\": \"code\",\r\n   \"execution_count\": null,\r\n   \"metadata\": {\r\n      \"collapsed\": true\r\n   },\r\n   \"outputs\": [],\r\n   \"source\": [\r\n      \"plotutils.show_widgets()\"\r\n   ]\r\n  }\r\n<%\r\n    } // if the model has \"specific\" recorder (sqlite)\r\n} else { // if the recorder is neither \"dump\" nor \"specific\"\r\n-%>\r\n  ,{\r\n   \"cell_type\": \"markdown\",\r\n   \"metadata\": {},\r\n   \"source\": [\r\n    \"No recorder selected.\"\r\n   ]\r\n  }\r\n<%\r\n}\r\n-%>\r\n ],\r\n  \"metadata\": {\r\n  \"kernelspec\": {\r\n   \"display_name\": \"Python 2\",\r\n   \"language\": \"python\",\r\n   \"name\": \"python2\"\r\n  },\r\n  \"language_info\": {\r\n   \"codemirror_mode\": {\r\n    \"name\": \"ipython\",\r\n    \"version\": 2\r\n   },\r\n   \"file_extension\": \".py\",\r\n   \"mimetype\": \"text/x-python\",\r\n   \"name\": \"python\",\r\n   \"nbconvert_exporter\": \"python\",\r\n   \"pygments_lexer\": \"ipython2\",\r\n   \"version\": \"2.7.9\"\r\n  }\r\n },\r\n \"nbformat\": 4,\r\n \"nbformat_minor\": 0\r\n}\r\n",
    "moca.problems.generated.py.ejs": "#!/usr/bin/python\r\n\r\n# Static imports\r\nfrom openmdao.api import IndepVarComp, Group, Problem\r\n<%\r\n// Generate the code for import statement for components\r\nfor (var j = 0; j < compInstances.length; j++) {\r\n-%>\r\nfrom lib.moca_components.<%= compInstances[j].base %> import <%= compInstances[j].base %>\r\n<%\r\n}\r\nfor (var j = 0; j < groupInstances.length; j++) {\r\n-%>\r\nfrom lib.moca_groups.<%= groupInstances[j].base %> import <%= groupInstances[j].base %>\r\n<%\r\n}\r\n-%>\r\n\r\n# Dynamic imports\r\n<%\r\nif (driver === 'ScipyOptimizer') {\r\n-%>\r\nfrom openmdao.api import ScipyOptimizer\r\n<%\r\n} else if (driver === 'FullFactorialDOE') {\r\n-%>\r\nfrom openmdao.api import FullFactorialDriver\r\n<%\r\n}\r\n-%>\r\n<%\r\nif (recorder === 'Dump') {\r\n-%>\r\nfrom openmdao.api import DumpRecorder\r\n<%\r\n} else if (recorder === 'Specific') {\r\n-%>\r\nfrom openmdao.api import SqliteRecorder\r\n<%\r\n}\r\n-%>\r\n<%\r\nif (algebraicLoop) {\r\n-%>\r\nfrom openmdao.api import NLGaussSeidel, ScipyGMRES\r\n<%\r\n}\r\n-%>\r\n\r\nclass RootGroup(Group):\r\n    def __init__(self):\r\n        super(RootGroup, self).__init__()\r\n\r\n<%\r\n// add() statements for design variables\r\nfor (var i = 0; i < desvars.length; i++) {\r\n    var valueString = desvars[i].value.toString();\r\n    if (valueString.indexOf('.') === -1) {\r\n        valueString += '.0';\r\n    }\r\n-%>\r\n        self.add('<%= desvars[i].name %>', IndepVarComp('<%= desvars[i].connection[0].dst %>', <%= valueString %>))\r\n<%\r\n}\r\n-%>\r\n<%\r\n// Generate the code for add() statements for components -\r\n// add instances of components\r\nfor (var j = 0; j < compInstances.length; j++) {\r\n    promotesString = '';\r\n    for (var k = 0; k < compInstances[j].promotes.length; k++) {\r\n        promotesString += \"'\" + compInstances[j].promotes[k] + \"'\";\r\n        if (k != compInstances[j].promotes.length - 1)\r\n            promotesString += ', ';\r\n    }\r\n-%>\r\n        self.add('<%= compInstances[j].name %>', <%= compInstances[j].base %>(), promotes=[<%- promotesString %>])\r\n<%\r\n}\r\n-%>\r\n<%\r\n// Generate the code for add() statements for groups -\r\n// add instances of groups\r\nfor (var j = 0; j < groupInstances.length; j++) {\r\n    var promotesString = '';\r\n    for (var k = 0; k < groupInstances[j].promotes.length; k++) {\r\n        promotesString += \"'\" + groupInstances[j].promotes[k] + \"'\";\r\n        if (k != groupInstances[j].promotes.length - 1)\r\n            promotesString += ', ';\r\n    }\r\n-%>\r\n        self.add('<%= groupInstances[j].name %>', <%= groupInstances[j].base %>(), promotes=[<%- promotesString %>])\r\n<%\r\n}\r\n-%>\r\n\r\n<%\r\n// Generate the code for connect() statements for connections between ports\r\nfor (var j = 0; j < connections.length; j++) {\r\n-%>\r\n        self.connect('<%= connections[j].srcParent %>.<%= connections[j].src %>', '<%= connections[j].dstParent %>.<%= connections[j].dst %>')\r\n<%\r\n}\r\n-%>\r\n<%\r\n// Generate the code for connect() statements for connections\r\n// between IndepVarComps' ports and ports\r\nfor (var j = 0; j < desvars.length; j++) {\r\n-%>\r\n        self.connect('<%= desvars[j].name %>.<%= desvars[j].connection[0].dst %>', '<%= desvars[j].connection[0].dstParent %>.<%= desvars[j].connection[0].dst %>')\r\n<%\r\n}\r\n-%>\r\n<%\r\n// Change nl_solver and ln_driver in case of algebraic loop\r\nif (algebraicLoop) {\r\n-%>\r\n\r\n        # Special solvers for handling algebraic loops\r\n        self.nl_solver = NLGaussSeidel()\r\n        self.nl_solver.options['atol'] = 1.0e-12\r\n        self.ln_solver = ScipyGMRES()\r\n<%\r\n}\r\n-%>\r\n\r\nclass <%= name %>(Problem):\r\n    def __init__(self):\r\n        super(<%= name %>, self).__init__()\r\n\r\n        self.root = RootGroup()\r\n<%\r\n// Driver settings\r\nif (driver === 'ScipyOptimizer') {\r\n-%>\r\n\r\n        self.driver = ScipyOptimizer()\r\n        self.driver.options['optimizer'] = 'SLSQP'\r\n\r\n<%\r\n    for (var i = 0; i < constraints.length; i++) {\r\n        limitsString = '';\r\n        if (constraints[i].enableUpper) {\r\n            limitsString = 'upper=';\r\n            valueString = constraints[i].upper;\r\n            if (valueString.indexOf('.') === -1)\r\n                valueString += '.0';\r\n            limitsString += valueString;\r\n        }\r\n        if (constraints[i].enableLower) {\r\n            limitsString += ', lower=';\r\n            valueString = constraints[i].lower;\r\n            if (valueString.indexOf('.') === -1)\r\n                valueString += '.0';\r\n            limitsString += valueString;\r\n        }\r\n        if (!constraints[i].enableLower && !constraints[i].enableUpper)\r\n            break;\r\n-%>\r\n        self.driver.add_constraint('<%= constraints[i].connection[0].srcParent %>.<%= constraints[i].connection[0].src %>', <%= limitsString %>)\r\n<%\r\n    }\r\n-%>\r\n<%\r\n} else if (driver === 'FullFactorialDOE') {\r\n-%>\r\n\r\n        self.driver = FullFactorialDriver(<%= doeSamples %>)\r\n<%\r\n}\r\n-%>\r\n<%\r\n// add recorder\r\nif (recorder === 'Dump') {\r\n-%>\r\n\r\n        rec = DumpRecorder('out/<%= name %>_dumpfile')\r\n        rec.options['record_params'] = True\r\n        rec.options['record_metadata'] = True\r\n        self.driver.add_recorder(rec)\r\n<%\r\n} else if (recorder === 'Specific') {\r\n//        var incWord = \"'\" + \"includes\" + \"'\";\r\n//        var incString = '';\r\n//        for (var i = 0; i < desvars.length; i++) {\r\n//            if (desvars[i].setByDriver) {\r\n//                // construct incString\r\n//                incString += \"'\" + desvars[i].connection[0].dstParent + \".\" + desvars[i].connection[0].dst + \"'\";\r\n//                incString += \", \";\r\n//            }\r\n//        }\r\n//        for (var i = 0; i < records.length; i++) {\r\n//            // construct incString\r\n//            incString += \"'\" + records[i].connection[0].srcParent + \".\" + records[i].connection[0].src + \"'\";\r\n//            if (i != records.length - 1)\r\n//                incString += \", \";\r\n//        }\r\n//        if (incString === \"\")\r\n//            incString = \"'\" + \"*\" + \"'\";\r\n\r\n//        Add this to the generated code block if the above code is to be uncommented\r\n//        rec.options[ %= incWord % ] = [ %= incString % ]\r\n-%>\r\n\r\n        rec = SqliteRecorder('out/<%= name %>_sqlitefile')\r\n        rec.options['record_params'] = True\r\n        rec.options['record_metadata'] = True\r\n        self.driver.add_recorder(rec)\r\n<%\r\n}\r\n-%>\r\n\r\n<%\r\n// add_desvar() statements for design variables\r\nfor (var i = 0; i < desvars.length; i++) {\r\n    if (desvars[i].setByDriver) {\r\n        var upperString = desvars[i].upper.toString(),\r\n            lowerString = desvars[i].lower.toString();\r\n        if (upperString.indexOf('.') === -1) {\r\n            upperString += '.0';\r\n        }\r\n        if (lowerString.indexOf('.') === -1) {\r\n            lowerString += '.0';\r\n        }\r\n-%>\r\n        self.driver.add_desvar('<%= desvars[i].name %>.<%= desvars[i].connection[0].dst %>', lower=<%= lowerString %>, upper=<%= upperString %>)\r\n<%\r\n    }\r\n}\r\n-%>\r\n<%\r\n// add_objective() statements for objectives\r\nfor (var i = 0; i < objectives.length; i++) {\r\n-%>\r\n        self.driver.add_objective('<%= objectives[i].connection[0].srcParent %>.<%= objectives[i].connection[0].src %>')\r\n<%\r\n}\r\n-%>\r\n        self.setup()\r\n\r\n\r\nif __name__ == \"__main__\":\r\n\r\n    top = <%= name %>()\r\n\r\n    print \"Running the MOCA problem <%= name %>\"\r\n\r\n    top.run()\r\n\r\n    print \"Result:\"\r\n    print \"------\"\r\n\r\n<%\r\n// Print result in case of optimizer\r\nif (driver === 'ScipyOptimizer') {\r\n-%>\r\n    print \"\\tObjective(s):\"\r\n    print \"\\t------------\"\r\n<%\r\n    for (var i = 0; i < objectives.length; i++) {\r\n-%>\r\n    print(\"\\t\\t<%= objectives[i].connection[0].srcParent %>.<%= objectives[i].connection[0].src %> = %f\" % (top['<%= objectives[i].connection[0].srcParent %>.<%= objectives[i].connection[0].src %>']))\r\n<%\r\n    }\r\n-%>\r\n    print \"\\tDesign variable(s):\"\r\n    print \"\\t------------------\"\r\n<%\r\n    for (var i = 0; i < desvars.length; i++) {\r\n-%>\r\n    print(\"\\t\\t<%= desvars[i].connection[0].dstParent %>.<%= desvars[i].connection[0].dst %> = %f\" % (top['<%= desvars[i].connection[0].dstParent %>.<%= desvars[i].connection[0].dst %>']))\r\n<%\r\n    }\r\n} else {\r\n-%>\r\n    print \"The DOE result is written in a file named <%= name %>_dumpfile or <%= name %>_sqlitefile in the parent folder.\"\r\n<%\r\n}\r\n-%>\r\n",
    "moca.processflow.generated.ipynb.ejs": "<%= name %>\r\n    Simulation end time: <%= simend %>\r\n    Processes\r\n<%\r\nfor (var i=0, i < processes.length; i++) {\r\n-%>\r\n        <%= processes[i].name%>\r\n            Processing time: <%= processes[i].processingTime %>\r\n            Process shift OFF time: <%= processes[i].processShiftOffTime %>\r\n            Process shift ON time: <%= processes[i].processShiftOnTime %>\r\n<%\r\n}\r\n-%>\r\n    Buffers\r\n<%\r\nfor (var i=0, i < buffers.length; i++) {\r\n-%>\r\n        <%= buffers[i].name%>\r\n            Size: <%= buffers[i].size %>\r\n<%\r\n}\r\n-%>\r\n    Connections\r\n<%\r\nfor (var i=0; i < connections.length; i++) {\r\n-%>\r\n        <%= connections[i].name %>\r\n            Source: <%= connections[i].src %>\r\n            Destination: <%= connections[i].dst %>\r\n<%\r\n}\r\n-%>\r\n",
    "moca.processflows.generated.py.ejs": "# dummy file"
}});