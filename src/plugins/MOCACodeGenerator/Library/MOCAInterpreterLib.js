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

    /**
     * The method to get the data from a Parameter node (port)
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param parameterNode - The Parameter node
     * @returns {Promise} - Promise object resolving to the data of the Parameter node
     */
    MOCAInterpreterLib.prototype.getParameterData = function(MOCAPlugin, parameterNode) {
        var deferred = new Q.defer(),
            parameterData = {
                name: MOCAPlugin.core.getAttribute(parameterNode, 'name'),
                value: null
            };

        var valueString = MOCAPlugin.core.getAttribute(parameterNode, 'Value').toString();
        if (valueString.indexOf('.') === -1)
            valueString += ".0";

        parameterData.value = valueString;
        deferred.resolve(parameterData);

        return deferred.promise;
    };

    /**
     * The method to get the data from an Unknown node (port)
     * P.S. The type of the modeling entity itself is "Unknown", the node type is not unknown here.
     *
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param unknownNode - The Unknown node
     * @returns {Promise} - Promise object resolving to the data of the Unknown node
     */
    MOCAInterpreterLib.prototype.getUnknownData = function(MOCAPlugin, unknownNode) {
        var deferred = new Q.defer(),
            unknownData = {
                name: MOCAPlugin.core.getAttribute(unknownNode, 'name'),
                value: null,
                type: MOCAPlugin.core.getAttribute(unknownNode, 'Type')
            };

        var valueString = MOCAPlugin.core.getAttribute(unknownNode, 'Value').toString();
        if (valueString.indexOf('.') === -1)
            valueString += ".0";

        unknownData.value = valueString;
        deferred.resolve(unknownData);

        return deferred.promise;
    };

    return MOCAInterpreterLib.prototype;
});
