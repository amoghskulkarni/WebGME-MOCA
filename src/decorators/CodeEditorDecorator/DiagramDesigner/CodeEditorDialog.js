/**
 * @author Amogh Kulkarni  https://github.com/amoghskulkarni
 */

define(['js/util',
    // '../Libs/EpicEditor/js/epiceditor',
    '../Libs/CodeMirror/lib/codemirror',
    '../Libs/CodeMirror/mode/python/python',
    'text!./CodeEditorDialog.html',
    'css!./CodeEditorDialog.css',
    // 'css!../Libs/EpicEditor/themes/base/epiceditor.css',
    'css!../Libs/CodeMirror/js/codemirror.css'],
    function(Util,
        // marked,
        CodeMirror,
        CodeMirrorModePython,
        CodeEditorDialogTemplate){
        'use strict';

        var CodeEditorDialog;

        /**
         * DocumentEditorDialog Constructor
         * Insert dialog modal into body and initialize editor with
         * customized options
         */
        CodeEditorDialog = function () {
            // Get Modal Template node for Editor Dialog and append it to body
            this._dialog = $(CodeEditorDialogTemplate);
            this._dialog.appendTo($(document.body));

            // Get element nodes
            // this._el = this._dialog.find('.modal-body').first();
            this._btnSave = this._dialog.find('.btn-save').first();
            this._title = this._dialog.find('.modal-header').first();
            this._codearea = this._dialog.find('#codearea').first();
            // this._pMeta = this._el.find('#pMeta').first();
            // this._content = this._pMeta.find('div.controls').first();

            /* Create Markdown Editor with options, but load() function should be
             * invoked in callback function when container is rendered on DOM */
            // var mdeditorOptions = {
            //     container: this._content.get(0), // Get raw DOM element
            //     basePath: 'decorators/CodeEditorDecorator/Libs/EpicEditor/',
            //     autogrow: {
            //         minHeight: 300,
            //     },
            //     button: {
            //         fullscreen: true,
            //     },
            //     parser: marked,
            // };
            // this.editor = new EpicEditor(mdeditorOptions);
            var codemirrorEditorOptions = {
                lineNumbers: true,
                viewportMargin: Infinity,
                path: 'decorators/CodeEditorDecorator/Libs/CodeMirror/js/',
                mode: {
                    name: "python",
                    version: 2,
                    singleLineStringErrors: false,
                    indentUnit: 4,
                    matchBrackets: true
                }
            };
            this.editor = CodeMirror.fromTextArea(
                              this._codearea.get(0),
                              codemirrorEditorOptions);
            this.text = ''; // Keep track modified text in editor
        };

        /**
         * Initialize CodeEditorDialog by creating EpicEditor in Bootstrap modal
         * window and set event listeners on its subcomponents like save button. Notice
         * EpicEditor is created but not loaded yet. The creation and loading of editor
         * are seperated due to the reason decorator component is not appended to DOM within
         * its own domain.
         * @param  {String}     text           Text to be rendered in editor initially
         * @param  {Function}   saveCallback   Callback function after click save button
         * @return {void}
         */
        CodeEditorDialog.prototype.initialize = function (title, text, saveCallback) {
            var self = this;
            this.text = text; // Initial text from Attribute documentation

            // Initialize Modal and append it to main DOM
            this._dialog.modal({ show: false});

            // Initialize the title
            this._title.find('#title').text(title);

            // Event listener on click for SAVE button
            this._btnSave.on('click', function (event) {
                // Invoke callback to deal with modified text, like save it in client.
                if (saveCallback) {
                    saveCallback.call(null, self.editor.getValue());
                }

                // Close dialog
                self._dialog.modal('hide');
                event.stopPropagation();
                event.preventDefault();
            });

            // Listener on event when dialog is shown
            // Use callback to show editor after Modal window is shown.
            this._dialog.on('shown.bs.modal', function () {
                // self.editor.load();
                // Render text from params into Editor and store it in local storage
                // self.editor.importFile('epiceditor', self.text);
                self.editor.setOption('value', self.text);
            });

            // Listener on event when dialog is hidden
            this._dialog.on('hidden.bs.modal', function () {
                self._dialog.empty();
                self._dialog.remove();
                // self.editor.remove();
            });
        };

        /**
         * Update text in editor area
         * @param  {String} newtext [new text to replace old one]
         */
        CodeEditorDialog.prototype.updateText = function (newtext) {
            this.text = newtext;
        };

        /**
         * Show actual text editor in its container by loading EpicEditor, this method
         * must be put into listener's callback function because its container is not appended
         * into DOM at this point and load() cannot access other DOM elements.
         * @return {void}
         */
        CodeEditorDialog.prototype.show = function () {
            var self = this;
            self._dialog.modal('show');
        };

        return CodeEditorDialog;
});
