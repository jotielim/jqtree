/*global $, alert*/

(function () {
    'use strict';

    // instantiate to create empty tree
    $('#root').jqtree();

    $('#btns')
        .on('click', 'button', function (e) {
            if (!e.target || !e.target.id) { return; }

            var jqtree = $('#root').jqtree();
            var o = jqtree.data();
            var selected = o.getSelection();

            switch (e.target.id) {
                case 'btn-add':
                    // addNode creates folder by default
                    o.addNode(selected, {'type': 'folder'}, function () {
                        alert('Operation is not permitted. You cannot nest a file.');
                    });
                    break;
                case 'btn-remove':
                    o.deleteNode(selected);
                    break;
                case 'btn-rename':
                    o.renameNode(selected);
                    break;
                case 'btn-export':
                    var json = o.exportJSON();
                    json = JSON.stringify(json, null, 4);
                    $('#output').val(json);
                    break;
                default:
                    break;
            }
        });


    // instantiate to create tree from the given data
    $('#demo-root').jqtree({
        data: [{
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
        }]
    });

    $('#demo-btns')
        .on('click', 'button', function (e) {
            if (!e.target || !e.target.id) { return; }

            var jqtree = $('#demo-root').jqtree();
            var o = jqtree.data();
            var selected = o.getSelection();

            switch (e.target.id) {
                case 'demo-btn-add':
                    // addNode creates folder by default
                    o.addNode(selected, {}, function () {
                        alert('Operation is not permitted. You cannot nest a file.');
                    });
                    break;
                case 'demo-btn-remove':
                    o.deleteNode(selected);
                    break;
                case 'demo-btn-rename':
                    o.renameNode(selected);
                    break;
                case 'demo-btn-export':
                    var json = o.exportJSON();
                    json = JSON.stringify(json, null, 4);
                    $('#demo-output').val(json);
                    break;
                default:
                    break;
            }
        });
})();