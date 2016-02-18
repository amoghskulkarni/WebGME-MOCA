/*globals define, _, $*/
/*jshint browser: true, camelcase: false*/

define([
    'js/RegistryKeys',
    'js/Constants',
    '../Libs/EpicEditor/js/epiceditor',
    './DocumentEditorDialog',
    'decorators/ModelDecorator/DiagramDesigner/ModelDecorator.DiagramDesignerWidget'
  ], function (
    REGISTRY_KEYS,
    CONSTANTS,
    marked,
    DocumentEditorDialog,
    ModelDecoratorDiagramDesignerWidget) {

    'use strict';

    var CodeEditorDecorator,
        DECORATOR_ID = 'CodeEditorDecorator',
        TEXT_META_EDIT_BTN_BASE = $('<i class="glyphicon glyphicon-edit text-meta"/>');

    CodeEditorDecorator = function (options) {
        var opts = _.extend({}, options);

        ModelDecoratorDiagramDesignerWidget.apply(this, [opts]);

        this._skinParts = {};

        // Use default marked options
        marked.setOptions({
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: true,
            smartLists: true,
            smartypants: false
        });

        this.logger.debug('CodeEditorDecorator ctor');
    };

    CodeEditorDecorator.prototype = Object.create(ModelDecoratorDiagramDesignerWidget.prototype);
    CodeEditorDecorator.prototype.constructor = CodeEditorDecorator;
    CodeEditorDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE ModelDecoratorDiagramDesignerWidget MEMBERS **************************/

    CodeEditorDecorator.prototype.on_addTo = function () {
        var self = this,
            client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);

        //let the parent decorator class do its job first
        ModelDecoratorDiagramDesignerWidget.prototype.on_addTo.apply(this, arguments);

        //render text-editor based META editing UI piece
        this._skinParts.$EditorBtn = TEXT_META_EDIT_BTN_BASE.clone();
        this.$el.append('<br>');
        this.$el.append(this._skinParts.$EditorBtn);

        // onClick listener for the button
        this._skinParts.$EditorBtn.on('click', function () {
            if (self.hostDesignerItem.canvas.getIsReadOnlyMode() !== true &&
                nodeObj.getAttribute('OutputFunction') !== undefined) {
                self._showEditorDialog();
            }
            event.stopPropagation();
            event.preventDefault();
        });

    };

    CodeEditorDecorator.prototype._showEditorDialog = function () {
        var self = this;
        var client = this._control._client;
        var nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);
        var OutputFunctionText = nodeObj.getAttribute('OutputFunction');

        var editorDialog = new DocumentEditorDialog();

        // Initialize with OutputFunction attribute and save callback function
        editorDialog.initialize(OutputFunctionText, function (text) {
            try {
                client.setAttributes(self._metaInfo[CONSTANTS.GME_ID], 'OutputFunction', text);
            } catch (e) {
                self.logger.error('Saving META failed... Either not JSON object or something else went wrong...');
            }
        });

        editorDialog.show();
    };

    CodeEditorDecorator.prototype.destroy = function () {
        this._skinParts.$EditorBtn.off('click');
        ModelDecoratorDiagramDesignerWidget.prototype.destroy.apply(this, arguments);
    };

    CodeEditorDecorator.prototype.update = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]),
            newDoc = '';

        ModelDecoratorDiagramDesignerWidget.prototype.update.apply(this, arguments);

        if (nodeObj) {
            newDoc = nodeObj.getAttribute('OutputFunction') || '';
            // Update text in the editor when attribute "OutputFunction" changes
            // this.editorDialog.updateText(newDoc);
        }
    };

    return CodeEditorDecorator;
});
