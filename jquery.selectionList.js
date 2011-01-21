/**
 * jQuery selectionList plugin
 * @author Jason Johnston jason@lojjic.com
 *
 * This plugin gives any text input field a keyboard-navigable dropdown list. The plugin does not
 * populate the list itself, but exposes methods for adding/removing items and showing/hiding the
 * dropdown.
 *
 * Usage:
 *
 * To initialize the selection list on an element:
 *
 *     $('#myInput').selectionList(config);
 *
 * The members of the 'config' object are copied onto the internal SelectionList object instance,
 * allowing any of its properties or methods to be overridden. Some of the more useful overrides are:
 *
 *     $('#myInput').selectionList({
 *         // Customizes the markup for the main dropdown element:
 *         markup: '<ul class="selection-list"></ul>',
 *
 *         // Changes the class given to an item's li element when it is highlighted:
 *         highlightClass: 'highlight',
 *
 *         // Customizes the markup for each selection list item:
 *         renderItem: function(item) {
 *             return '';
 *         }
 *     });
 *
 * Once the selection list is initialized for a given element, you can then call methods on it. The
 * method name is the first argument to each call:
 *
 *     // Adds an item named 'My Item' to the selection list:
 *     $('#myInput').selectionList('addItem', 'My Item');
 *
 *     // Removes the item from the selection list:
 *     $('#myInput').selectionList('removeItem', 'My Item');
 *
 *     // Removes all items from the selection list:
 *     $('#myInput').selectionList('clear');
 *
 *     // Shows the dropdown:
 *     $('#myInput').selectionList('show', callback);
 *
 *     // Hides the dropdown:
 *     $('#myInput').selectionList('hide', callback);
 *
 * When the user selects one of the items in the selection list dropdown, a 'select' event is triggered
 * on the input element. You can bind to that event to handle the user's selection:
 *
 *     $('#myInput').bind('select', function(e, index, item) {
 *         alert('User chose item "' + item + '" at index ' + index);
 *     });
 */
(function($) {

    var proxy = $.proxy;


    /**
     * @class SelectionList
     * Attaches a dropdown selection list widget to a text input field, exposes methods for adding/removing
     * items in the list and showing/hiding the dropdown, and handles keyboard navigation for selecting an
     * item. When an item is selected via the enter key, triggers a custom 'select' event on the input field.
     * @constructor
     * @param {Object} cfg The configuration for this instance. Members are copied directly onto the
     *        instance, which allows overriding any of its properties or methods.
     */
    function SelectionList(cfg) {
        var me = this;
        $.extend(me, cfg);
        me.field = $(cfg.field).bind({
            'keypress.selectionList': proxy(me.onKeypress, me),
            'keydown.selectionList': proxy(me.onKeydown, me)
        });
        me.items = [];
        if (cfg.items) {
            $.each(cfg.items, function(i, item) {
                me.addItem(item);
            });
        }
    }
    $.extend(SelectionList.prototype, {
        /**
         * The markup used to build the main dropdown element
         */
        markup: '<ul class="selection-list"></ul>',

        /**
         * The class applied to the currently highlighted li element
         */
        highlightClass: 'highlight',

        /**
         * Index of the currently highlighted item, or -1 if none is highlighted.
         */
        highlighted: -1,

        /**
         * Creates the HTML for a given item. Defaults to the item coerced to a String, but can
         * be overridden to handle more complex item objects, e.g. including icons, help text, etc.
         * @param {Mixed} item The item being added. The type and format of this value is application-specific.
         * @return {String} The item HTML
         */
        renderItem: function(item) {
            return '' + item;
        },

        /**
         * Add an item to the selection list.
         * @param {Mixed} item The item being added. The type and format of this value is application-specific.
         */
        addItem: function(item) {
            this.items.push(item);
            this.getEl().append($('<li>' + this.renderItem(item) + '</li>'));
        },

        /**
         * Remove an item from the selection list.
         * @param {Mixed} item The item being removed.
         */
        removeItem: function(item) {
            var me = this,
                items = me.items,
                idx = $.inArray(item, items);
            if (idx >= 0) {
                items.splice(idx, 1);
                $('li', me.getEl()).eq(idx).remove();
            }
            if (!items.length) {
                me.getEl().hide();
                me._vis = false;
            }
        },

        /**
         * Removes all items from the selection list.
         */
        clear: function() {
            this.getEl().empty();
            this.items = [];
        },

        /**
         * Highlight the previous item in the list.
         */
        prev: function() {
            var me = this,
                idx = me.highlighted;
            me.highlight(idx < 0 ? me.items.length - 1 : idx - 1);
        },

        /**
         * Highlight the next item in the list.
         */
        next: function() {
            var me = this,
                idx = me.highlighted;
            me.highlight(idx >= me.items.length - 1 ? -1 : idx + 1);
        },

        /**
         * Highlight the item at the given index in the list.
         * @param {Number} idx The index of the item to highlight. Passing -1 will remove all highlights.
         */
        highlight: function(idx) {
            var me = this,
                cls = me.highlightClass,
                oldIdx = me.highlighted,
                ul, lis, li;

            if (oldIdx !== idx) {
                ul = me.getEl();
                lis = ul.find('li');
                if (oldIdx >= 0) {
                    lis.eq(oldIdx).removeClass(cls);
                }
                if (idx >= 0) {
                    li = lis.eq(idx);
                    li.addClass(cls);
                    me.show();
                    me.scrollIntoView(li);
                }
            }

            me.highlighted = idx;
        },

        /**
         * Ensure the given li element is visible within the dropdown's scrollable area by scrolling
         * it if necessary.
         * @param {HTMLLIElement} li
         */
        scrollIntoView: function(li) {
            var ul = this.getEl(),
                ulTop = ul.offset().top,
                ulHeight = ul.outerHeight(),
                liTop = li.offset().top,
                liHeight = li.outerHeight(),
                scrollBy;
            if (liTop < ulTop) {
                scrollBy = liTop - ulTop;
            }
            else if (liTop + liHeight > ulTop + ulHeight) {
                scrollBy = liTop + liHeight - ulTop - ulHeight;
            }
            if (scrollBy) {
                ul.animate({scrollTop: ul.scrollTop() + scrollBy}, 'fast');
            }
        },

        /**
         * Triggers the 'select' event on the target input element, passing it the highlighted item's index
         * and value as extra arguments.
         */
        selectHighlighted: function() {
            var idx = this.highlighted;
            if (idx >= 0) {
                this.field.trigger('select', [idx, this.items[idx]]);
                this.hide();
            }
        },

        /**
         * Handles keypress events on the input field.
         */
        onKeypress: function(e) {
            var me = this,
                key = e.which;
            if (key === 27) { //esc
                me.hide();
            }
            else if (key === 13) { //enter
                me.selectHighlighted();
                e.stopPropagation();
                e.preventDefault();
            }
        },

        /**
         * Handles keydown events on the input field.
         */
        onKeydown: function(e) {
            var me = this,
                key = e.which;
            if (key === 38) { //up
                me.prev();
                e.preventDefault();
            }
            else if (key === 40) { //down
                me.next();
                e.preventDefault();
            }
        },

        /**
         * Handles clicking on the dropdown.
         */
        onClick: function(e) {
            this.onOver(e);
            this.selectHighlighted();
        },

        /**
         * Handles mouseovers on the dropdown.
         */
        onOver: function(e) {
            var li = $(e.target).parents('.dropdown>li');
            if (li) {
                this.highlight(li.index());
            }
        },

        /**
         * Hides the dropdown.
         * @param {Function} callback An optional callback function that will be called when the hiding finishes.
         */
        hide: function(callback) {
            var me = this;
            if (me._vis) {
                me.getEl().slideUp(100, callback);
                me._vis = 0;
                me.highlighted = -1;
            }
        },

        /**
         * Shows the dropdown.
         * @param {Function} callback An optional callback function that will be called when the showing finishes.
         */
        show: function(callback) {
            if (!this._vis) {
                var me = this,
                    field = me.field,
                    pos = field.position();
                me.getEl()
                    .css({left: pos.left, top: pos.top + field.outerHeight(), width: field.outerWidth()})
                    .slideDown(100, callback);
                me._vis = 1;
            }
        },

        /**
         * Returns a reference to the dropdown element, creating it if necessary.
         */
        getEl: function() {
            var me = this;
            return me._el || (
                me._el = $(this.markup)
                        .hide()
                        .click(proxy(me.onClick, me))
                        .mouseover(proxy(me.onOver, me))
                        .insertAfter(me.field)
            );
        },

        /**
         * Destroys the instance, removing all its event listeners etc.
         */
        destroy: function() {
            var me = this,
                el = me._el;
            if (el) {
                el.remove();
                delete me._el;
            }
            me.field.unbind('.selectionList');
            delete me.field;
        }
    });


    // Expose to jQuery method chain
    $.fn.selectionList = function() {
        var args = arguments,
            dataName = 'selectionList',
            instance, jq;

        this.each(function() {
            jq = $(this);
            instance = jq.data(dataName);

            // string as first argument -> calling method; requires prior initialization
            if (typeof args[0] === 'string') {
                if (instance) {
                    instance[args[0]].apply(instance, [].slice.call(args, 1));
                    if (args[0] === 'destroy') {
                        jq.data(dataName, null);
                    }
                }
            }
            // initialize the SelectionList for this element
            else if (!instance) {
                instance = new SelectionList($.extend({}, args[0], {field: this}));
                jq.data(dataName, instance);
            }
        });

        return this;
    };

    // Add the SelectionList class constructor to the public function; allows it to be
    // modified at runtime, just for kicks.
    $.fn.selectionList.cls = SelectionList;
    
})(jQuery);