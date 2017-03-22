/*globals define, _*/
/*jshint browser: true, camelcase: false*/
/**
 * This decorator inherits from the ModelDecorator.DiagramDesignerWidget.
 * With no changes to the methods - it will functions just like the ModelDecorator.
 *
 * For more methods see the ModelDecorator.DiagramDesignerWidget.js in the webgme repository.
 *
 * @author pmeijer / https://github.com/pmeijer
 */

define([
    'js/RegistryKeys',
    'js/Constants',
    'js/Utils/GMEConcepts',
    'decorators/ModelDecorator/DiagramDesigner/ModelDecorator.DiagramDesignerWidget',
    'jquery',
    'underscore'
], function (
    REGISTRY_KEYS,
    CONSTANTS,
    GMEConcepts,
    ModelDecoratorDiagramDesignerWidget) {

    'use strict';

    var PortExporterDecorator,
        DECORATOR_ID = 'PortExporterDecorator';

    PortExporterDecorator = function (options) {
        var opts = _.extend({}, options);

        ModelDecoratorDiagramDesignerWidget.apply(this, [opts]);

        this.logger.debug('PortExporterDecorator ctor');
    };

    PortExporterDecorator.prototype = Object.create(ModelDecoratorDiagramDesignerWidget.prototype);
    PortExporterDecorator.prototype.constructor = PortExporterDecorator;
    PortExporterDecorator.prototype.DECORATORID = DECORATOR_ID;

    PortExporterDecorator.prototype.on_addTo = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);

        this.logger.debug('This node was added to the canvas', nodeObj);

        // Call the base-class method..
        ModelDecoratorDiagramDesignerWidget.prototype.on_addTo.apply(this, arguments);
    };

    PortExporterDecorator.prototype.destroy = function () {
        ModelDecoratorDiagramDesignerWidget.prototype.destroy.apply(this, arguments);
    };

    PortExporterDecorator.prototype.update = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);

        this.logger.debug('This node is on the canvas and received an update event', nodeObj);

        ModelDecoratorDiagramDesignerWidget.prototype.update.apply(this, arguments);
    };

    PortExporterDecorator.prototype.getTerritoryQuery = function () {
        var territoryRule = {},
            gmeID = this._metaInfo[CONSTANTS.GME_ID],
            client = this._control._client,
            nodeObj =  client.getNode(gmeID),
            hasAspect = this._aspect && this._aspect !== CONSTANTS.ASPECT_ALL && nodeObj &&
                nodeObj.getValidAspectNames().indexOf(this._aspect) !== -1;

        if (hasAspect) {
            territoryRule[gmeID] = client.getAspectTerritoryPattern(gmeID, this._aspect);
            territoryRule[gmeID].children = 1;
        } else {
            territoryRule[gmeID] = {children: 2};
        }

        return territoryRule;
    };

    PortExporterDecorator.prototype.getPortIDs = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]),
            childrenIDs = [],
            len,
            gmeID = this._metaInfo[CONSTANTS.GME_ID],
            hasAspect = this._aspect && this._aspect !== CONSTANTS.ASPECT_ALL &&
                nodeObj.getValidAspectNames().indexOf(this._aspect) !== -1;

        if (nodeObj) {
            childrenIDs = nodeObj.getChildrenIds().slice(0);
            len = childrenIDs.length;
            var grandChildrenIDs = [];
            while(len--) {
                var childrenNodeObj = client.getNode(childrenIDs[len]);
                grandChildrenIDs = grandChildrenIDs.concat(childrenNodeObj.getChildrenIds().slice(0));
            }
            childrenIDs = childrenIDs.concat(grandChildrenIDs);

            //filter out the ones that are not ports
            len = childrenIDs.length;
            while (len--) {
                if (!GMEConcepts.isPort(childrenIDs[len])) {
                    childrenIDs.splice(len, 1);
                }
            }

            //filter out the ones that are not part of the specified aspect
            if (hasAspect) {
                len = childrenIDs.length;
                while (len--) {
                    if (!GMEConcepts.isValidTypeInAspect(childrenIDs[len], gmeID, this._aspect)) {
                        childrenIDs.splice(len, 1);
                    }
                }
            }
        }

        return childrenIDs;
    };

    return PortExporterDecorator;
});