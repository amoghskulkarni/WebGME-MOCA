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
    var ConnectionInterpreterLib = function () {};

    /**
     * The method to interpret a connection object. This method is generic, and does not depend upon the type of
     * the connection. The returned object's name encodes the type of the connection node which is interpreted.
     * Returns a promise to the connection data.
     *
     * @param MOCAPlugin - Reference of the MOCACodeGenerator plugin
     * @param connectionNode - The connection node
     * @returns {Promise} - Promise resolving to the data of the connection node
     */
    ConnectionInterpreterLib.prototype.getConnectionData = function (MOCAPlugin, connectionNode) {
        var deferred = Q.defer(),
            connectionData = {
                name: MOCAPlugin.core.getAttribute(MOCAPlugin.getMetaType(connectionNode), 'name'),
                src: null,
                srcMeta: null,
                srcParent: null,
                srcParentMeta: null,
                srcOnto: "",
                dst: null,
                dstMeta: null,
                dstParent: null,
                dstParentMeta: null,
                dstOnto: ""
            };

        MOCAPlugin.core.loadPointer(connectionNode, 'src', function (err, srcNode) {
            if (err) {
                deferred.reject(new Error(err))
            } else {
                var srcParent = MOCAPlugin.core.getParent(srcNode);
                var srcMeta = MOCAPlugin.getMetaType(srcNode);
                var srcParentMeta = MOCAPlugin.getMetaType(srcParent);

                connectionData.src = MOCAPlugin.core.getAttribute(srcNode, 'name');
                connectionData.srcMeta = MOCAPlugin.core.getAttribute(srcMeta, 'name');
                connectionData.srcParent = MOCAPlugin.core.getAttribute(srcParent, 'name');
                connectionData.srcParentMeta = MOCAPlugin.core.getAttribute(srcParentMeta, 'name');

                if (connectionData.name === 'DataConn') {
                    if (connectionData.srcMeta === 'Unknown' || connectionData.srcMeta === 'Parameter') {
                        connectionData.srcOnto = MOCAPlugin.core.getAttribute(srcNode, 'OntologyElementID');
                    }
                }

                MOCAPlugin.core.loadPointer(connectionNode, 'dst', function (err, dstNode) {
                    if (err) {
                        deferred.reject(new Error(err));
                    } else {
                        var dstParent = MOCAPlugin.core.getParent(dstNode),
                            dstMeta = MOCAPlugin.getMetaType(dstNode),
                            dstParentMeta = MOCAPlugin.getMetaType(dstParent);

                        connectionData.dst = MOCAPlugin.core.getAttribute(dstNode, 'name');
                        connectionData.dstMeta = MOCAPlugin.core.getAttribute(dstMeta, 'name');
                        connectionData.dstParent = MOCAPlugin.core.getAttribute(dstParent, 'name');
                        connectionData.dstParentMeta = MOCAPlugin.core.getAttribute(dstParentMeta, 'name');

                        if (connectionData.name === 'DataConn') {
                            if (connectionData.dstMeta === 'Unknown' || connectionData.dstMeta === 'Parameter') {
                                connectionData.dstOnto = MOCAPlugin.core.getAttribute(dstNode, 'OntologyElementID');
                            }
                        }

                        deferred.resolve(connectionData);
                    }
                });
            }
        });

        return deferred.promise;
    };

    return ConnectionInterpreterLib.prototype;
});