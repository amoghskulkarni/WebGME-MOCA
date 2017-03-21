/*globals define, _*/
/*jshint browser: true, camelcase: false*/
/**
 * @author pmeijer / https://github.com/pmeijer
 */

define([
    // 'js/Decorators/DecoratorBase',
    'decorators/ModelDecorator/ModelDecorator',
    './DiagramDesigner/PortExporterDecorator.DiagramDesignerWidget',
    './PartBrowser/PortExporterDecorator.PartBrowserWidget'
], function (ModelDecorator, PortExporterDecoratorDiagramDesignerWidget, PortExporterDecoratorPartBrowserWidget) {

    'use strict';

    var PortExporterDecorator,
        DECORATOR_ID = 'PortExporterDecorator';

    PortExporterDecorator = function (params) {
        var opts = _.extend({loggerName: this.DECORATORID}, params);

        ModelDecorator.apply(this, [opts]);

        this.logger.debug('PortExporterDecorator ctor');
    };

    _.extend(PortExporterDecorator.prototype, ModelDecorator.prototype);
    PortExporterDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DecoratorBase MEMBERS **************************/

    PortExporterDecorator.prototype.initializeSupportedWidgetMap = function () {
        this.supportedWidgetMap = {
            DiagramDesigner: PortExporterDecoratorDiagramDesignerWidget,
            PartBrowser: PortExporterDecoratorPartBrowserWidget
        };
    };

    return PortExporterDecorator;
});