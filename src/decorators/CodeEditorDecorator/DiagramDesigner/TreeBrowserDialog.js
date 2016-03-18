/**
 * @author Amogh Kulkarni  https://github.com/amoghskulkarni
 */

define(['js/util',
    '../Libs/jstree/dist/jstree.min',
    'text!./TreeBrowserDialog.html',
    'css!./TreeBrowserDialog.css',
    'css!../Libs/jstree/dist/themes/default/style.min.css'],
    function(Util,
        JsTree,
        TreeBrowserDialogTemplate){
        'use strict';

        var TreeBrowserDialog;

        /**
         * DocumentEditorDialog Constructor
         * Insert dialog modal into body and initialize editor with
         * customized options
         */
        TreeBrowserDialog = function () {
            // Get Modal Template node for Editor Dialog and append it to body
            this._dialog = $(TreeBrowserDialogTemplate);
            this._dialog.appendTo($(document.body));

            // Get element nodes
            this._btnSave = this._dialog.find('.btn-save').first();
            this._title = this._dialog.find('.modal-header').first();
            this._treearea = this._dialog.find('#treearea').first();

            // Default JSON data
            var jsonData = {
                'data' : [
                    {
                        "text" : "Expanded tree (because initially selected)",
                        "state" : { "opened" : true },
                        "children" : [
                            {
                                //"text" : "Initially selected leaf",
                                //"state" : { "selected" : true }
                                "text" : "Leaf"
                            },
                            {
                                "text" : "Initially open tree",
                                "children" : [
                                    "Leaf",
                                    "Another leaf"
                                ]
                            }
                        ]
                    },
                    {
                        "text" : "Another collapsed tree",
                        "children" : [
                            "Leaf"
                        ]
                    }
                ]
            };

            this._treearea.jstree({
                'plugins': ["wholerow"],
                'core': jsonData
            });

            this.ontologyElementID = ''; // Keep track modified text in editor
        };

        /**
         * Initialize TreeBrowserDialog by creating EpicEditor in Bootstrap modal
         * window and set event listeners on its subcomponents like save button. Notice
         * EpicEditor is created but not loaded yet. The creation and loading of editor
         * are seperated due to the reason decorator component is not appended to DOM within
         * its own domain.
         * @param  {String}     id           Text to be rendered in editor initially
         * @param  {Function}   saveCallback   Callback function after click save button
         * @return {void}
         */
        TreeBrowserDialog.prototype.initialize = function (id, saveCallback) {
            var self = this;
            this.ontologyElementID = id; // Initial text from Attribute documentation

            this._treearea.on('ready.jstree', function (e, data) {
                if (self.ontologyElementID !== '') {
                    var selectedNode = self._treearea.jstree(true).get_node(self.ontologyElementID);
                    self._treearea.jstree(true).select_node(selectedNode);
                }
            });


            // Initialize Modal and append it to main DOM
            this._dialog.modal({ show: false });

            // Initialize the title
            this._title.find('#title').text('Ontology browser');

            // Event listener on click for SAVE button
            this._btnSave.on('click', function (event) {
                // Invoke callback to deal with modified text, like save it in client.
                if (saveCallback) {
                    var selectedNodes = self._treearea.jstree(true).get_selected(true);
                    saveCallback.call(null, selectedNodes[0].id);
                }

                // Close dialog
                self._dialog.modal('hide');
                event.stopPropagation();
                event.preventDefault();
            });


            // Listener on event when dialog is hidden
            this._dialog.on('hidden.bs.modal', function () {
                self._dialog.empty();
                self._dialog.remove();
            });
        };


        /**
         * Show actual text editor in its container by loading EpicEditor, this method
         * must be put into listener's callback function because its container is not appended
         * into DOM at this point and load() cannot access other DOM elements.
         * @return {void}
         */
        TreeBrowserDialog.prototype.show = function () {
            var self = this;
            self._dialog.modal('show');
        };

        return TreeBrowserDialog;
});
