/**
 * @author Amogh Kulkarni  https://github.com/amoghskulkarni
 */

define(['js/util',
    '../Libs/vis/dist/vis.js',
    'text!./GraphBrowserDialog.html',
    'css!../Libs/vis/dist/vis.css'],
    function(Util,
        vis,
        GraphBrowserDialogTemplate){
        'use strict';

        var GraphBrowserDialog;

        /**
         * DocumentEditorDialog Constructor
         * Insert dialog modal into body and initialize editor with
         * customized options
         */
        GraphBrowserDialog = function () {
            var self = this;
            // Get Modal Template node for Editor Dialog and append it to body
            this._dialog = $(GraphBrowserDialogTemplate);
            this._dialog.appendTo($(document.body));

            // Get element nodes
            this._btnSave = this._dialog.find('.btn-save').first();
            this._title = this._dialog.find('.modal-header').first();
            this._grapharea = this._dialog.find('#grapharea').first();

            //var nodes = new vis.DataSet([
            //    {id: 1, label: 'Node 1'},
            //    {id: 2, label: 'Node 2'},
            //    {id: 3, label: 'Node 3'},
            //    {id: 4, label: 'Node 4'},
            //    {id: 5, label: 'Node 5'}
            //]);
            //
            //// create an array with edges
            //var edges = new vis.DataSet([
            //    {from: 1, to: 3},
            //    {from: 1, to: 2},
            //    {from: 2, to: 4},
            //    {from: 2, to: 5}
            //]);

            // TODO: This is very crude - the GET request is handled synchronously (blocking call). Make it async.
            $.ajaxSetup({
                async: false
            });

            $.getJSON('http://localhost:3000/users/data', function (data) {
                self._options = {
                    interaction: {
                        multiselect: true
                    },
                    nodes: {
                        color: {
                            highlight: {
                                border: "#CC0000",
                                background: "#FF3333"
                            }
                        }
                    },
                    layout: {
                        hierarchical: {
                            direction: "LR",
                            levelSeparation: 400
                        }
                    },
                    physics: false
                };

                var nodesList = [];
                var edgesList = [];

                for (var i = 0; i < data.nodes.length; i++) {
                    nodesList.push({id: data.nodes[i], label: data.nodes[i].split("#")[1]});
                }

                for (var i = 0; i < data.edges.length; i++) {
                    edgesList.push({from: data.edges[i].src, to: data.edges[i].dst, arrows: 'to'});
                }

                var nodes = new vis.DataSet(nodesList);
                var edges = new vis.DataSet(edgesList);

                self._d = {nodes: nodes, edges: edges};
            });

            $.ajaxSetup({
                async: true
            });

            this.ontologyElementIDs = []; // Keep track modified text in editor
        };

        /**
         * Initialize GraphBrowserDialog by creating EpicEditor in Bootstrap modal
         * window and set event listeners on its subcomponents like save button. Notice
         * EpicEditor is created but not loaded yet. The creation and loading of editor
         * are seperated due to the reason decorator component is not appended to DOM within
         * its own domain.
         * @param  {String}     id           Text to be rendered in editor initially
         * @param  {Function}   saveCallback   Callback function after click save button
         * @return {void}
         */
        GraphBrowserDialog.prototype.initialize = function (ids, saveCallback) {
            var self = this;
            this.ontologyElementIDs = ids.split(', '); // Initial text from Attribute documentation

            // Initialize Modal and append it to main DOM
            this._dialog.modal({ show: false });

            // Initialize the title
            this._title.find('#title').text('Ontology browser');

            // Initialize the network
            this._ontologyGraph = new vis.Network(self._grapharea[0], self._d, self._options);
            this._ontologyGraph.selectNodes(this.ontologyElementIDs);

            // Event listener on click for SAVE button
            this._btnSave.on('click', function (event) {
                // Get selected node's ID
                var ids = self._ontologyGraph.getSelectedNodes();
                var string_to_save = "";
                for (var i = 0; i < ids.length; i++) {
                    string_to_save += ids[i];
                    if (i < ids.length - 1) {
                        string_to_save += ", ";
                    }
                }

                // Invoke callback to deal with modified text, like save it in client.
                if (saveCallback) {
                    saveCallback.call(null, string_to_save);
                }

                // Close dialog
                self._dialog.modal('hide');
                event.stopPropagation();
                event.preventDefault();
            });
        };

        /**
         * Show actual text editor in its container by loading EpicEditor, this method
         * must be put into listener's callback function because its container is not appended
         * into DOM at this point and load() cannot access other DOM elements.
         * @return {void}
         */
        GraphBrowserDialog.prototype.show = function () {
            this._dialog.modal('show');
            this._ontologyGraph.redraw();
        };

        return GraphBrowserDialog;
});
