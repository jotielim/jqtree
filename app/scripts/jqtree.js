/*global jQuery*/

(function ($) {
    'use strict';

    var CONFIG = {
        rootClassname: 'jqtree-root',
        branchesClassname: 'jqtree-branches',
        nodeClassname: 'jqtree-node',
        activeClassname: 'active',
        hoverClassname: 'hover',
        folderClassname: 'folder',
        fileClassname: 'file',
        editClassname: 'edit',
        folderNodeTemplate: {
            name: 'New Folder',
            type: 'folder',
            contents: []
        },
        fileNodeTemplate: {
            type: 'file',
            contents: null
        }
    };

    var instanceCounter = 0;

    var Jqtree = function (root, options) {
        this._instanceId = ++instanceCounter;
        this._countId = 0;
        this.config = $.extend({}, CONFIG);
        this.$root = $(root);
        this.options = $.extend({data: []}, options);

        var inst = {
            element: root,
            instance: this, // true,
            getSelection: $.proxy(this.getSelection, this),
            addNode: $.proxy(this.addNode, this),
            deleteNode: $.proxy(this.deleteNode, this),
            renameNode: $.proxy(this.renameNode, this),
            exportJSON: $.proxy(this.exportJSON, this)
        };
        this.$root.data(inst);
    };

    Jqtree.prototype = {

        init: function () {
            var data = this.options.data;
            if ($.type(data) !== 'object' && !$.isArray(data)) { return; }

            this._data= {};
            this._model= {
                '#': {
                    id: '#',
                    name: '#',
                    type: '#',
                    contents: data
                }
            };

            this.$root.addClass(this.config.rootClassname);
            this._updateModel(data);

            this._drawNode(this.$root, { contents: data });
            this._bind();
        },

        _createTree: function ($el, root) {
            if ($el.hasClass(this.config.rootClassname)) {
                $el.append(this._createBranches());
            }
            $el = $el.find('ul');

            var that = this,
                $domNode;
            $.each(root, function (index, node) {
                $domNode = that._createNode($el, node);
                $el.append($domNode);
                if (node.contents && node.contents.length) {
                    that._createTree($domNode, node.contents);
                }
            });
        },

        _createBranches: function () {
            var $branches = $('<ul></ul>', {
                'class': this.config.branchesClassname
            });
            this._makeSortable($branches);
            return $branches;
        },

        _createNode: function ($parent, data) {
            var $domNode = $('<li></li>', {
                'class': this.config.nodeClassname + ' ' + data.type,
                'id': data.id || this._getNewId()
            });
            var $name = $('<div></div>', {
                'class': data.type,
                'text': data.name
            });
            $name.prepend(this._createIcon(data));
            this._makeDroppable($domNode);
            return $domNode.append($name).append(this._createBranches());
        },

        _createIcon: function (data) {
            return $('<i></i>', {
                'class': 'jqtree-icon fa ' + ((data.type === 'folder') ? 'fa-folder-open' : 'fa-file')
            });
        },

        /*
         * flatten the model for easier access
         */
        _updateModel: function (data, parent) {
            parent = parent || null;
            for (var i = 0, node; i < data.length; i++) {
                node = data[i];
                if (!node.hasOwnProperty('id')) {
                    node.id = this._getNewId();
                }
                node.parent = parent;
                this._model[node.id] = node;
                if (node.contents && node.contents.length) {
                    this._updateModel(node.contents, node.id);
                }
            }
        },

        /*
         * Get auto generated id
         */
        _getNewId: function () {
            return 'n' + this._instanceId + '_' + (++this._countId);
        },

        /*
         * Toggle the selected node
         */
        _toggleNode: function ($el) {
            var node = this._getNode($el);
            var selected = node.selected;

            this._deselectAllNode();
            node.selected = !selected;
            if (node.selected) {
                this._data.selected = node.id;
                $el.addClass(this.config.activeClassname);
            } else {
                this._data.selected = null;
            }
        },

        /*
         * Deselect all node
         */
        _deselectAllNode: function () {
            for (var k in this._model) {
                if (this._model.hasOwnProperty(k)) {
                    this._model[k].selected = false;
                }
            }
            this.$root.find('.' + this.config.activeClassname).removeClass(this.config.activeClassname);
        },

        /*
         * Retrieve node object from dom element
         */
        _getNode: function ($el) {
            var id, node;
            if ($el && $el.jquery && $el.attr('id')) {
                id = $el.attr('id');
            } else if ($el && $el.id) {
                id = $el.id;
            } else {
                id = '#';
            }
            try {
                if (this._model[id]) {
                    node = this._model[id];
                } else if (this.$root.attr('id') === id) {
                    node = this._model['#'];
                }
                return node;
            } catch (e) {
                return false;
            }
        },

        /*
         * Draw node object to HTML
         */
        _drawNode: function ($dom, node) {
            // draw node and its children
            // e.g. draw from root (#) or draw from specific node
            if ($dom.hasClass(this.config.rootClassname)) {
                $dom.children('ul').remove();
            } else {
                $dom.children('ul').children().remove();
            }
            this._createTree($dom, node.contents);
        },

        /*
         * Create node object
         */
        addNode: function ($domNode, data, callback) {
            var node = $.extend(true, {}, this.config.folderNodeTemplate, data);
            $domNode = $domNode || this.$root;
            var parentNode = this._getNode($domNode);

            // get parent node and check if addition is permitted
            if (!this._opCheck('add', parentNode)) {
                if (callback) {
                    callback.call(this, parentNode);
                }
                return;
            }

            node.id = this._getNewId();
            node.parent = !$domNode.hasClass(this.config.rootClassname) ? $domNode.attr('id') : null;
            parentNode.contents.push(node);
            this._model[node.id] = node;
            this._drawNode($domNode, parentNode);
        },

        /*
         * Delete node
         */
        deleteNode: function ($domNode, callback) {
            var node = this._getNode($domNode),
                parentNode;

            if (!this._opCheck('delete', node)) {
                if (callback) {
                    callback.call(this, node);
                }
                return;
            }

            parentNode = node.parent ? this._model[node.parent] : this._model['#'];
            for (var i = 0, tempNode; i < parentNode.contents.length; i++) {
                tempNode = parentNode.contents[i];
                if (tempNode.id === node.id) {
                    parentNode.contents.splice(i, 1);
                    break;
                }
            }
            this._cleanNode(node);

            this._data.selected = null;
            $domNode.remove();
        },

        /*
         * Rename node
         */
        renameNode: function ($domNode) {
            var node = this._getNode($domNode);
            var $edit = this._createEdit(node);
            $domNode.find('> div').html($edit);
            $edit.trigger('focus');
            $edit.on('keyup focusout', function (e) {
                switch (e.type) {
                    case 'keyup':
                        if (e.keyCode === 13) {
                            node.name = $edit.val();
                            $edit.remove();
                            $domNode.find('> div').html(node.name);
                        } else if (e.keyCode === 27) {
                            $edit.remove();
                            $domNode.find('> div').html(node.name);
                        }
                        break;
                    case 'focusout':
                        node.name = $edit.val();
                        $edit.remove();
                        $domNode.find('> div').html(node.name);
                        break;
                    default:
                        break;
                }
            });
        },

        _createEdit: function (node) {
            var $input = $('<input>', {
                value: node.name,
                'class': this.config.editClassname
            });
            return $input;
        },

        /*
         * Clean _model
         */
        _cleanNode: function (root) {
            if (root.contents && root.contents.length) {
                for (var i = 0, node; i < root.contents.length; i++) {
                    node = root.contents[i];
                    this._cleanNode(node);
                }
            }
            delete this._model[root.id];
        },

        /*
         * Check if operation is permitted to a node
         */
        _opCheck: function (op, node) {
            switch (op) {
                case 'add':
                    if (!node || node.type === 'file') {
                        return false;
                    }
                    break;
                case 'delete':
                    if (node.id === '#') {
                        return false;
                    }
                    break;
                case 'move':
                    break;
                default:
                    return false;
            }
            return true;
        },

        /*
         * Get the selected node
         * return null if nothing is selected
         */
        getSelection: function () {
            return this._data.selected ? $('#' + this._data.selected) : null;
        },

        _bind: function () {
            var that = this;
            this.$root
                .on('click.jqtree', '.' + this.config.nodeClassname, function (e) {
                    e.stopPropagation();
                    that._toggleNode($(e.target).closest('li'));
                });

            // prevent default action when file is dropped
            $(document).on('dragover dragleave drop', function (e) {
                e.stopPropagation();
                e.preventDefault();
            });
        },

        /*
         * Make jqtree-branches as sortable
         */
        _makeSortable: function ($branches) {
            var that = this;
            $branches.nestedSortable({
                items: '> li',
                connectWith: '.jqtree-branches',
                forcePlaceholderSize: true,
                placeholder: 'ui-placeholder-highlight',
                helper: 'clone',
                isTree: true,
                doNotClear: true,
                listType: 'ul',
                disableNestingClass: 'file',
                update: function (e, ui) {
                    that._updateModelFromDOM(ui.item);
                }
            }).disableSelection();
        },

        /*
         * Event handler when sortable is updated
         */
        _updateModelFromDOM: function ($el) {
            var node = this._getNode($el),
                parentNode = node.parent ? this._model[node.parent] : this._model['#'],
                newParentNode,
                $branches,
                index;

            $branches = $el.parent();
            newParentNode = this._getNode($branches.parent());
            index = $branches.find('> .' + this.config.nodeClassname).index($el);

            // detach from parent
            for (var i = 0, tempNode; i < parentNode.contents.length; i++) {
                tempNode = parentNode.contents[i];
                if (tempNode.id === node.id) {
                    parentNode.contents.splice(i, 1);
                    break;
                }
            }

            // add to new parent node
            if (newParentNode.contents[index] !== node) {
                node.parent = newParentNode.id;
                newParentNode.contents.splice(index, 0, node);
            }

        },

        /*
         * Allow files to be dropped to jqtree-node
         */
        _makeDroppable: function ($node) {
            $node[0].addEventListener('dragover', $.proxy(this._dragHover, this), false);
            $node[0].addEventListener('dragleave', $.proxy(this._dragHover, this), false);
            $node[0].addEventListener('drop', $.proxy(this._fileHandler, this), false);
        },

        /*
         * Event handler when hover
         */
        _dragHover: function (e) {
            e.stopPropagation();
            e.preventDefault();
            var $dom = $(e.target).closest('.' + this.config.nodeClassname);
            if ($dom.hasClass(this.config.folderClassname)) {
                $(e.target).toggleClass(this.config.hoverClassname, (e.type === 'dragover'));
            }
        },

        /*
         * Event handler when files are dropped
         */
        _fileHandler: function (e) {
            this._dragHover(e);

            var $dom = $(e.target).closest('.' + this.config.nodeClassname);
            if ($dom.hasClass(this.config.folderClassname)) {
                var files = e.target.files || e.dataTransfer.files;

                for (var i = 0, f; i < files.length; i++) {
                    f = files[i];
                    this.addNode($dom, { type: 'file', name: f.name });
                }
            }
        },

        /*
         * Return the clean model as object
         */
        exportJSON: function () {
            var tree = $.extend(true, {}, this._model['#']);
            tree = Jqtree.cleanModelForExport(tree);

            return tree;
        }

    };


    /*
     * Function to clean model for export
     */
    Jqtree.cleanModelForExport = function (node) {
        for (var k in node) {
            if (node.hasOwnProperty(k)) {
                if ($.inArray(k, ['name', 'type', 'contents']) === -1) {
                    delete node[k];
                }
            }
        }
        if (node.contents && node.contents.length) {
            for (var i = 0, tempNode; i < node.contents.length; i++) {
                tempNode = node.contents[i];
                Jqtree.cleanModelForExport(tempNode);
            }
        }
        return node;
    };


    // Make this as jquery plugin
    $.fn.jqtree = function (options) {
        // `this` is a collection of dom
        this.each(function () {
            // check if instance already exist, then return that instance
            // otherwise, create new one
            var o = $(this).data();
            if (!o || o && !o.instance) {
                var jqtree = new Jqtree(this, options);
                jqtree.init();
            }
        });
        return this;
    };

    $.Jqtree = Jqtree;
})(jQuery);