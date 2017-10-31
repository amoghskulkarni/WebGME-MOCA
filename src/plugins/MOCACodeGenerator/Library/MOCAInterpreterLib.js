/**
 * Created by Amogh on 10/31/2017.
 */

define([
    'q'
], function (Q) {
    /**
     * The class containing utilities to generate code
     * @constructor
     */
    var MOCAInterpreterLib = function () {};

    MOCAInterpreterLib.prototype.getParameterData = function(MOCACodegen, parameterNode) {
        var deferred = new Q.defer(),
            parameterData = {
                name: MOCACodegen.core.getAttribute(parameterNode, 'name'),
                value: null
            };

        var valueString = MOCACodegen.core.getAttribute(parameterNode, 'Value').toString();
        if (valueString.indexOf('.') === -1)
            valueString += ".0";

        parameterData.value = valueString;
        deferred.resolve(parameterData);

        return deferred.promise;
    };


    MOCAInterpreterLib.prototype.getUnknownData = function(MOCACodegen, unknownNode) {
        var deferred = new Q.defer(),
            unknownData = {
                name: MOCACodegen.core.getAttribute(unknownNode, 'name'),
                value: null,
                type: MOCACodegen.core.getAttribute(unknownNode, 'Type')
            };

        var valueString = MOCACodegen.core.getAttribute(unknownNode, 'Value').toString();
        if (valueString.indexOf('.') === -1)
            valueString += ".0";

        unknownData.value = valueString;
        deferred.resolve(unknownData);

        return deferred.promise;
    };

    return MOCAInterpreterLib.prototype;
});
