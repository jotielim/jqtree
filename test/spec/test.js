/* global $, describe, it, beforeEach, assert */

(function () {
    'use strict';

    describe('Jqtree without data', function () {
        var $tree = $('#tree').jqtree();
        var o = $tree.data();

        beforeEach(function () {
            // remove selection before each test
            o.instance._deselectAllNode();
        });

        describe('initialize', function () {
            it('should create an instance', function () {
                assert.isNotNull(o.instance, 'no instance created');
                assert.instanceOf(o.instance, $.Jqtree, 'it is an instance of Jqtree');
            });
            it('should not create additional instance', function () {
                var $t = $('#tree').jqtree();
                assert.equal($t.data().instance._instanceId, 1, 'it created another instance');
            });
        });

        describe('tree', function () {
            it('should has class jqtree-root', function () {
                assert.isTrue($tree.hasClass('jqtree-root'), 'class jqtree-root is missing');
            });
            it('should have 1 child ul.jqtree-branches', function () {
                assert.equal($tree.children().length, 1, 'more child than expected');
                assert.isTrue($tree.children().eq(0).hasClass('jqtree-branches'), 'class jqtree-branches is missing');
            });
        });

        describe('getSelection', function () {
            it('should return null if nothing is selected', function () {
                assert.isNull(o.getSelection(), 'not returning null if nothing is selected');
            });
        });

        describe('addNode', function () {
            it('should create a new node', function() {
                var selected = o.getSelection();
                o.addNode(selected);
                var $node = $tree.find('.jqtree-node');

                assert.equal($node.length, 1, 'one folder is created');
            });
        });

        describe('renameNode', function () {
            it('should rename the selected node', function () {
                var $node = $tree.find('.jqtree-node').eq(0).trigger('click');
                var selected = o.getSelection();

                o.renameNode(selected);
                $node.find('input.edit').val('Awesome').trigger('focusout');

                assert.equal($node.find('> div').text(), 'Awesome', 'successfully rename the node');
                assert.equal(o.instance._model[$node.attr('id')].name, 'Awesome', 'successfully updating the model');
            });
        });

        describe('exportJSON', function () {
            it('should return tree as object', function () {
                var root = o.exportJSON();
                var expected = [{
                    name: 'Awesome',
                    type: 'folder',
                    contents: []
                }];

                assert.deepEqual(root.contents, expected, 'export object is not as expected');
            });
        });

        describe('deleteNode', function () {
            it('should remove a node and its children', function () {
                $tree.find('.jqtree-node').eq(0).trigger('click');
                var selected = o.getSelection();
                o.deleteNode(selected);
                var root = o.exportJSON();

                assert.equal($tree.children().length, 1, 'more child than expected');
                assert.isTrue($tree.children().eq(0).hasClass('jqtree-branches'), 'class jqtree-branches is missing');
                assert.deepEqual(root.contents, [], 'Empty contents');
            });
        });
    });


    describe('Jqtree with init data', function () {
        var contents = [{
            id: '1',
            name: 'My Folder',
            type: 'folder',
            contents: [{
                id: '11',
                name: 'Folder 1',
                type: 'folder',
                contents: [{
                    id: '111',
                    name: 'File',
                    type: 'file',
                    contents: null
                }]
            }, {
                id: '12',
                name: 'Folder 2',
                type: 'folder',
                contents: []
            }]
        }, {
            id: '2',
            name: 'Folder 3',
            type: 'folder',
            contents: []
        }, {
            id: '3',
            name: 'File 2',
            type: 'file',
            contents: null
        }, {
            id: '4',
            name: 'File 3',
            type: 'file',
            contents: null
        }];

        var expected = [{
            name: 'Awesome',
            type: 'folder',
            contents: [{
                name: 'Folder 1',
                type: 'folder',
                contents: [{
                    name: 'jstree file',
                    type: 'file',
                    contents: null
                }]
            }, {
                name: 'Folder 2',
                type: 'folder',
                contents: []
            }, {
                name: 'New Folder',
                type: 'folder',
                contents: []
            }]
        }, {
            name: 'Folder 3',
            type: 'folder',
            contents: []
        }, {
            name: 'File 2',
            type: 'file',
            contents: null
        }, {
            name: 'File 3',
            type: 'file',
            contents: null
        }];

        var $tree = $('#tree2').jqtree({
            data: contents
        });
        var o = $tree.data();

        beforeEach(function () {
            // remove selection before each test
            o.instance._deselectAllNode();
        });

        describe('initialize', function () {
            it('should create an instance', function () {
                assert.isNotNull(o.instance, 'no instance created');
                assert.instanceOf(o.instance, $.Jqtree, 'it is an instance of Jqtree');
            });
            it('should not create additional instance', function () {
                var $t = $('#tree2').jqtree();
                assert.equal($t.data().instance._instanceId, 2, 'it created another instance');
            });
        });

        describe('tree', function () {
            it('should has class jqtree-root', function () {
                assert.isTrue($tree.hasClass('jqtree-root'), 'class jqtree-root is missing');
            });
            it('should have 1 child ul.jqtree-branches', function () {
                assert.equal($tree.children().length, 1, 'more child than expected');
                assert.isTrue($tree.children().eq(0).hasClass('jqtree-branches'), 'class jqtree-branches is missing');
            });
        });

        describe('getSelection', function () {
            it('should return null if nothing is selected', function () {
                assert.isNull(o.getSelection(), 'not returning null if nothing is selected');
            });
            it('should return jQuery DOM element of the selected node', function () {
                $tree.find('.jqtree-node').eq(0).trigger('click');
                var selected = o.getSelection();

                assert.equal(selected.attr('id'), '1', 'find the correct selected element');
                assert.equal(selected.find('> div').text(), 'My Folder', 'find the correct selected element');
                assert.isTrue(selected.hasClass('folder'), 'is a folder');
            });
            it('should return jQuery DOM element of the selected node', function () {
                $tree.find('.jqtree-node').eq(2).trigger('click');
                var selected = o.getSelection();

                assert.equal(selected.attr('id'), '111', 'find the correct selected element');
                assert.equal(selected.find('> div').text(), 'File', 'find the correct selected element');
                assert.isTrue(selected.hasClass('file'), 'is a file');
            });
        });

        describe('addNode', function () {
            it('should create a new node', function() {
                $tree.find('.jqtree-node').eq(0).trigger('click');
                var selected = o.getSelection();
                o.addNode(selected);
                var $node = $tree.find('.jqtree-node');

                assert.equal($node.length, 8, 'one additional folder is created');
            });

            it('should not create a new node under type file', function () {
                $tree.find('.jqtree-node').eq(7).trigger('click');
                var selected = o.getSelection();
                o.addNode(selected);
                var $node = $tree.find('.jqtree-node');

                assert.equal(selected.attr('id'), '4', 'find the correct selected element');
                assert.equal(selected.find('> div').text(), 'File 3', 'find the correct selected element');
                assert.isTrue(selected.hasClass('file'), 'is a file');
                assert.equal($node.length, 8, 'no additional folder is created');
            });
        });

        describe('renameNode', function () {
            it('should rename the selected node', function () {
                $tree.find('.jqtree-node').eq(0).trigger('click');
                var selected = o.getSelection();
                var $node = $tree.find('.jqtree-node').eq(0);
                o.renameNode(selected);
                $node.find('input.edit').val('Awesome').trigger('focusout');

                assert.equal($node.find('> div').text(), 'Awesome', 'successfully rename the node');
                assert.equal(o.instance._model[$node.attr('id')].name, 'Awesome', 'successfully updating the model');
            });

            it('should rename the selected node', function () {
                $tree.find('.jqtree-node').eq(2).trigger('click');
                var selected = o.getSelection();
                var $node = $tree.find('.jqtree-node').eq(2);
                o.renameNode(selected);
                $node.find('input.edit').val('jstree file').trigger('focusout');

                assert.equal($node.find('> div').text(), 'jstree file', 'successfully rename the node');
                assert.equal(o.instance._model[$node.attr('id')].name, 'jstree file', 'successfully updating the model');
            });
        });

        describe('exportJSON', function () {
            it('should return tree as object', function () {
                var root = o.exportJSON();

                assert.deepEqual(root.contents, expected, 'export object is not as expected');
            });
        });

        describe('deleteNode', function () {
            it('should remove a node and its children', function () {
                $tree.find('.jqtree-node').eq(0).trigger('click');
                var selected = o.getSelection();
                var tmp = $.extend(true, [], expected);
                tmp.splice(0, 1);

                o.deleteNode(selected);
                var root = o.exportJSON();

                assert.equal($tree.children().length, 1, 'more child than expected');
                assert.isTrue($tree.children().eq(0).hasClass('jqtree-branches'), 'class jqtree-branches is missing');
                assert.deepEqual(root.contents, tmp, 'Expected contents after deletion');
            });
        });
    });
})();
