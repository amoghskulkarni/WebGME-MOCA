/* Generated file based on ejs templates */
define([], function() {
    return {
    "python.bat.ejs": "echo off\r\npython <%= OpenMDAOProblem.name %>.py\r\n",
    "python.generated.py.ejs": "#!/usr/bin/python\r\nprint \"<%= OpenMDAOProblem.name %>\"\r\n<%\r\nvar i;\r\nfor (i = 0; i < OpenMDAOProblem.children.length; i += 1) {\r\n%>\r\nprint \"child \" + \"<%= i %>: \" \\\r\n    + \"Name - \" + \"<%= OpenMDAOProblem.children[i].name %> \" \\\r\n    + \"Id - \" + \"<%= OpenMDAOProblem.children[i].id %> \" \\\r\n    + \"Meta - \" + \"<%= OpenMDAOProblem.children[i].meta %>\"\r\n<%\r\n}\r\n%>\r\n"
}});