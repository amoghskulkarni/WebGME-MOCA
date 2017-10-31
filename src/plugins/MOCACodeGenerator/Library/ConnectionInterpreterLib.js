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

    ConnectionInterpreterLib.prototype.getConnectionData = function (MOCACodeGen, connectionNode) {
        var deferred = Q.defer(),
            connectionData = {
                name: MOCACodeGen.core.getAttribute(MOCACodeGen.getMetaType(connectionNode), 'name'),
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

        MOCACodeGen.core.loadPointer(connectionNode, 'src', function (err, srcNode) {
            if (err) {
                deferred.reject(new Error(err))
            } else {
                var srcParent = MOCACodeGen.core.getParent(srcNode);
                var srcMeta = MOCACodeGen.getMetaType(srcNode);
                var srcParentMeta = MOCACodeGen.getMetaType(srcParent);

                connectionData.src = MOCACodeGen.core.getAttribute(srcNode, 'name');
                connectionData.srcMeta = MOCACodeGen.core.getAttribute(srcMeta, 'name');
                connectionData.srcParent = MOCACodeGen.core.getAttribute(srcParent, 'name');
                connectionData.srcParentMeta = MOCACodeGen.core.getAttribute(srcParentMeta, 'name');

                if (connectionData.name === 'DataConn') {
                    if (connectionData.srcMeta === 'Unknown' || connectionData.srcMeta === 'Parameter') {
                        connectionData.srcOnto = MOCACodeGen.core.getAttribute(srcNode, 'OntologyElementID');
                    }
                }

                MOCACodeGen.core.loadPointer(connectionNode, 'dst', function (err, dstNode) {
                    if (err) {
                        deferred.reject(new Error(err));
                    } else {
                        var dstParent = MOCACodeGen.core.getParent(dstNode),
                            dstMeta = MOCACodeGen.getMetaType(dstNode),
                            dstParentMeta = MOCACodeGen.getMetaType(dstParent);

                        connectionData.dst = MOCACodeGen.core.getAttribute(dstNode, 'name');
                        connectionData.dstMeta = MOCACodeGen.core.getAttribute(dstMeta, 'name');
                        connectionData.dstParent = MOCACodeGen.core.getAttribute(dstParent, 'name');
                        connectionData.dstParentMeta = MOCACodeGen.core.getAttribute(dstParentMeta, 'name');

                        if (connectionData.name === 'DataConn') {
                            if (connectionData.dstMeta === 'Unknown' || connectionData.dstMeta === 'Parameter') {
                                connectionData.dstOnto = MOCACodeGen.core.getAttribute(dstNode, 'OntologyElementID');
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