/**
 * jQuery quickBar plugin
 * @author Jason Johnston jason@lojjic.com
 *
 * This plugin creates a "quick bar" which allows the user to quickly search through a customizable
 * set of commands and invoke them, entirely using the keyboard. It is similar to desktop products
 * such as Quicksilver or LaunchBar, but runs within the context of a web page.
 *
 * The quick bar is launched by invoking a special keystroke while the page has focus; by default this
 * keystroke is set to Shift+Ctrl+Space but can be customized. When the quick bar comes up the user can
 * immediately start typing characters into the search field and a list of known commands matching the
 * entered characters will be displayed in a dropdown.
 *
 * As the user types in the field, their entered characters will be used to search the available
 * commands in two ways: (1) as a simple case-insensitive beginning-substring match against each
 * command's name and aliases, and (2) using camel-cased groups of letters to match the beginnings
 * of separate words in each command's name and aliases. Some examples:
 *
 *     "go" will match commands named "Google Search" and "Go To URL"
 *     "se" will match a command named "Google Search" that has an alias "Search"
 *     "gTU" will match a command named "Go To URL"
 *
 * Once the list of available matching commands is presented to the user, they can then select one to
 * be executed. Some commands can require an extra argument from the user, for example a search command
 * will need the search term, so the quick bar will give the user an additional entry field to collect
 * the argument before invoking the command.
 *
 * Usage:
 *
 * To initialize the quick bar:
 *
 *     $.quickBar(config);
 *
 * Notice that the quickBar function is on the main jQuery ($) object, because it is attached to the
 * page as a whole rather than to any particular set of elements.
 *
 * The members of the 'config' object are copied onto the internal QuickBar object instance,
 * allowing any of its properties or methods to be overridden. Some of the more useful overrides are:
 *
 *     $().quickBar({
 *         // Sets the label for the main text entry field:
 *         mainLabel: 'What is thy bidding, master?',
 *
 *         // Allows customizing the global keystroke that launches the quick bar:
 *         keystroke: {
 *             which: 32, //spacebar
 *             modifiers: ['shift', 'ctrl']
 *         }
 *
 *         // Allows customizing how the quick bar UI is shown and hidden:
 *         showFn: function(box) {
 *             box.fadeIn();
 *         },
 *         hideFn: function(box) {
 *             box.fadeOut();
 *         }
 *
 *         // This is the real meat of the plugin, where you define the source(s) from which the
 *         // available commands are retrieved: (See below for more info.)
 *         sources: [
 *             { type: 'local', commands: [...] }
 *         ]
 *     });
 *
 * Defining command sources:
 *
 * In the example code above, the 'sources' configuration item is the most important piece; without it
 * there will be no available commands to search. One or more sources can be defined; each one is an
 * object config that must contain at least a 'type' property, which tells it what command source
 * implementation to use. There are two built-in command source implementations:
 *
 *     type: 'local' - This command source type maintains a static list of available commands, configured
 *         in the JavaScript when the page first loads. Since the available commands are all held in
 *         local memory, searching through them is very fast, but does require a finite list to be
 *         loaded with the page code.
 *
 *         To configure the local source, give it a 'commands' property which is an array of Command
 *         configuration objects (see below).
 *
 *     type: 'ajax' - Rather than defining a static set of commands in the page, this will perform an
 *         ajax request to a given URL, passing it the entered search characters, and will receive back
 *         a list of matching command configs. This allows a potentially greater set of data-dependent
 *         commands that don't have to be loaded with the page, but has the lag of a HTTP request.
 *
 *         To configure the ajax source, give its configuration object any of the properties recognized
 *         by the settings argument to the jQuery.ajax() function. The user's entered characters will
 *         be submitted as a parameter named 's', or you can customize the parameter name by defining a
 *         'paramName' property in the config.
 *
 * Defining commands:
 *
 * Each command defined in the local source's 'commands' list, or returned from the ajax source's ajax
 * request, is an object which will be used to initialize a Command object. The following properties
 * are recognized:
 *
 *     name - {String} The name of the command. This is what gets displayed in the selection list, and
 *         is used in pattern matching against the user's entered characters.
 *
 *     aliases - {Array} An optional set of additional names which will not be displayed, but will be
 *         used in addition to the name in pattern matching.
 *
 *     regexp - {RegExp} An optional regular expression which will be applied against the user's entered
 *         search characters to determine if this command is a match.
 *
 *     icon - {String} An optional icon image to be displayed alongside the command's name.
 *
 *     arg - {Boolean|String} Whether or not the command requires the user to enter an additional argument
 *         for its execution, e.g. the search term for a web search. If a String is supplied, then that
 *         will be used as an informative label for the argument's input field.
 *
 *     action - {Object|Function} Defines the action to be performed when the command is executed. By
 *         default this supports two action types: a JavaScript function to be called, or a redirect URL.
 *
 *         // Function action - the function will be passed the user-entered arg if it exists.
 *         action: { type: 'fn', fn: function(arg) { ... } }
 *
 *         // The above may also be shortened to just a single function object:
 *         action: function(arg) { ... }
 *
 *         // URL action - the {arg} token in the URL will be replaced with the user-entered arg if it exists.
 *         action: { type: 'url', url: 'http://the.url.to/go/to/with/{arg}' }
 *
 * Complete example:
 *
 *    $.quickBar({
 *        mainLabel: 'What is thy bidding, Master?',
 *
 *        sources: [
 *            // A local command source with some different command types:
 *            {
 *                type: 'local',
 *                commands: [{
 *                    name: 'Google Search',
 *                    aliases: ['Search', 'Find'],
 *                    arg: true,
 *                    icon: 'icons/search.png',
 *                    action: {
 *                        type: 'url',
 *                        url: 'http://www.google.com/search?q={arg}'
 *                    }
 *                }, {
 *                    name: 'Logout',
 *                    aliases: ['Sign Out'],
 *                    icon: 'icons/logout.png',
 *                    action: function() {
 *                        // Invokes a click on the Logout button on the screen
 *                        $('#logout').click();
 *                    }
 *                }, {
 *                    name: 'New Message',
 *                    regexp: /^((new|create)\s+)?(e?mail|message)/i,
 *                    arg: 'To',
 *                    icon: 'icons/message.png',
 *                    action: function(arg) {
 *                        location.href = 'mailto:' + arg;
 *                    }
 *                }, {
 *                    name: 'Go To URL',
 *                    aliases: ['Location'],
 *                    arg: 'Location',
 *                    argDefault: 'http://',
 *                    icon: 'icons/arrow_right.png',
 *                    action: {
 *                        type: 'url',
 *                        url: '{arg}'
 *                    }
 *                }]
 *            },
 *            // An ajax command source:
 *            {
 *                type: 'ajax',
 *                url: '/commands.php',
 *                dataType: 'json',
 *                paramName: 'search'
 *            }
 *        ],
 *
 *        // Override the show and hide functions to add a sliding animation:
 *        showFn: function(box) {
 *            box.slideDown(100);
 *        },
 *        hideFn: function(box) {
 *            box.slideUp(100);
 *        }
 *    });
 */
(function($) {

    var id = 0,
        proxy = $.proxy;


    /**
     * @class QuickBar
     * @constructor
     * @param {Object} cfg The configuration for this QuickBar. The properties of this object will be copied
     * directly onto the instance, overriding any existing members of the same name (including methods,
     * allowing the implementation to be customized per instance.) The more useful properties are:
     *     sources - {Array} A collection of command source configurations. Each one must have a 'type'
     *         property, which determines which command source implementation will be used (see the CommandSources
     *         mapping object.) Each config is passed directly as the constructor argument for the command
     *         source implementation, so it may contain other properties specific to that implementation.
     *     mainLabel - {String} The label for the quick entry field in its initial state. May contain HTML
     *         markup. Defaults to 'Command:'.
     *     keystroke - {Object} Defines the keystroke for launching the QuickBar.
     *     showFn, hideFn - {Function} Overriding these functions allows customization of how the UI gets shown
     *         and hidden, for example using an animation such as slideDown or fadeIn.
     */
    function QuickBar(cfg) {
        var me = this;
        $.extend(me, cfg, {sources: []});

        // Init the command sources
        me.addSources(cfg.sources);

        // Init the parent container
        me.parent = $(me.parent);
        $(document).keydown(proxy(me.onGlobalKey, me));
    }
    $.extend(QuickBar.prototype, {
        /**
         * Selector for the element into which the QuickBar element will be inserted. Defaults to the body.
         */
        parent: 'body',

        /**
         * The markup used to generate the QuickBar element.
         */
        boxMarkup: '<div class="quick-bar" role="dialog">' +
                       '<label for="{inputId}">{label}</label>' +
                       '<input type="text" id="{inputId}" autocomplete="off" />' +
                   '</div>',

        /**
         * The label for the quick entry field in its initial state. May contain HTML markup.
         */
        mainLabel: 'Command:',

        /**
         * Defines the keystroke for launching the QuickBar. Allows specifying a character key and any
         * number of required modifier keys. Defaults to Ctrl+Shift+Space.
         */
        keystroke: {
            which: 32, //spacebar
            modifiers: ['shift', 'ctrl']
        },

        /**
         * Timeout in milliseconds between each key event and performing a search. Prevents excessive
         * searches while the user is typing.
         */
        inputBuffer: 200,


        /**
         * Add a command source to the QuickBar.
         * @param {Object} sourceCfg The configuration for the command source.
         */
        addSource: function(sourceCfg) {
            this.sources.push(new CommandSources[sourceCfg.type || 'local'](sourceCfg));
        },

        /**
         * Add multiple command sources.
         * @param {Array} sources
         */
        addSources: function(sources) {
            if ($.isArray(sources)) {
                var me = this;
                $.each(sources, function(i, sourceCfg) {
                    me.addSource(sourceCfg);
                });
            }
        },

        /**
         * Shows the QuickBar UI.
         */
        show: function() {
            if (!this._vis) {
                var box = this.getBox();
                this.showFn(box);
                box.find('input').focus();
                this._vis = 1;
            }
        },

        /**
         * Shows the main QuickBar element. Defaults to a simple show, but can be overridden e.g. to
         * implement animation effects.
         * @param {jQuery} box
         */
        showFn: function(box) {
            box.show();
        },

        /**
         * Hides everything and resets it to the initial clean slate.
         */
        hide: function() {
            if (this._vis) {
                var me = this,
                    box = me.getBox(),
                    input = box.find('input');
                me.hideFn(box);
                input.selectionList('clear');
                me.stopAskingForArg();
                input.val('');
                me._vis = 0;
            }
        },

        /**
         * Hides the main QuickBar element. Defaults to a simple hide, but can be overridden e.g. to
         * implement animation effects.
         * @param {jQuery} box
         */
        hideFn: function(box) {
            box.hide();
        },

        /**
         * Handles all key events on the document, calling the show method if the key event matches
         * the configured 'keystroke' configuration.
         */
        onGlobalKey: function(e) {
            var keystroke = this.keystroke,
                modifiers = keystroke.modifiers;
            // See if the key and modifiers match the config
            if (e.which === keystroke.which && (!modifiers ||
                    $.map(modifiers, function(mod) {
                        return e[mod + 'Key'] ? null : 1;
                    }).length < 1)) {
                this.show();
            }
        },

        /**
         * Handles all keyup events within the entry field.
         */
        onInputKey: function(e) {
            var me = this,
                inArgMode = !!me._askingForArg,
                timer = me._searchTimer;

            // Escape key cancels
            if (e.which === 27) {
                if (inArgMode) {
                    me.stopAskingForArg();
                } else {
                    me.hide();
                }
            }
            else if (!inArgMode) {
                // Buffer execution of the search to avoid excessive network/processing
                if (timer) {
                    clearTimeout(timer);
                }
                me._searchTimer = setTimeout(proxy(me.search, me), me.inputBuffer);
            }
        },

        /**
         * Creates and configures the dropdown selection list object.
         */
        initSelectionList: function(input) {
            input.selectionList({
                renderItem: function(command) {
                    return (command.icon ? '<img class="icon" src="' + command.icon + '" alt="" />' : '') +
                           '<span class="name">' + command.name + '</span>';
                }
            });
        },

        /**
         * Triggers a search of all configured command sources for commands that match the current
         * value entered in the input field. Searches are asynchronous, so nothing is returned from
         * this method but the handleResult method is called by each source when it finishes searching.
         */
        search: function() {
            var me = this,
                input = me.getBox().find('input'),
                chars = $.trim(input.val());
            this.initSelectionList(input);
            if (chars.length < 1) {
                input.selectionList('hide');
            }
            else if (chars !== me._lastChars) {
                input.selectionList('clear');
                $.each(me.sources, function(i, source) {
                    source.search(chars, proxy(me.handleResult, me));
                });
            }
            me._lastChars = chars;
        },

        /**
         * Handles the result of a search from a command source.
         * @param {Array} commands An array of Command objects that matched the search. If no matches were
         *        found then this will be an empty array.
         */
        handleResult: function(commands) {
            var input = this.getBox().find('input');
            this.initSelectionList(input);
            $.each(commands, function(i, command) {
                input.selectionList('addItem', command);
            });
            input.selectionList('show');
        },

        /**
         * Handles the user selecting an item from the dropdown selection list.
         * @param {jQuery.Event} e The event that triggered the selection
         * @param {Number} idx The selected item's index in the list
         * @param {Command} command The Command object corresponding to the selected item
         */
        itemSelected: function(e, idx, command) {
            var me = this;
            function execCommand(arg) {
                command.exec(arg);
                me.hide();
            }
            if (command.arg) {
                this.askForArg(command, execCommand);
            } else {
                execCommand();
            }
        },

        /**
         * Puts the UI into the mode where it is asking the user for an argument to the selected Command.
         * @param {Command} command The Command object whose argument is being requested
         * @param {Function} callback A callback function that will be called when the user submits the
         *        argument. It will be passed the entered string value.
         */
        askForArg: function(command, callback) {
            var me = this,
                box = me.getBox(),
                arg = command.arg,
                icon = command.icon,
                label = (icon ? '<img class="icon" src="' + icon + '" alt="" />' : '') +
                        command.name + (typeof arg === 'string' ? ' - ' + arg : '') + ':';

            box.find('label').html(label);

            box.find('input')
                .selectionList('clear')
                .val(command.argDefault || '')
                .bind('keypress.quickBarArg', function(e) {
                    if (e.which === 13) { //enter key finishes arg entry
                        callback(this.value);
                        e.stopPropagation();
                    }
                })
                .focus();

            me._askingForArg = 1;
        },

        /**
         * Takes the UI out of the argument mode (see the askForArg method), returning it to the initial state.
         */
        stopAskingForArg: function() {
            if (this._askingForArg) {
                var me = this,
                    box = me.getBox(),
                    label = box.find('label'),
                    input = box.find('input');

                label.html(me.mainLabel);
                input.val('').unbind('.quickBarArg');

                me._askingForArg = 0;
            }
        },

        /**
         * Returns the main outer element for the QuickBar UI, creating it first if necessary.
         * @return {jQuery} The jQuery instance for the main QuickBar element
         */
        getBox: function() {
            var me = this,
                box = me._box;
            if (!box) {
                box = me._box = $(me.boxMarkup.replace(/{inputId}/g, 'qbInp' + id++).replace(/{label}/g, me.mainLabel))
                                .hide().appendTo(me.parent);
                box.find('input').bind({
                    keyup: proxy(me.onInputKey, me),
                    blur: proxy(me.hide, me),
                    select: proxy(me.itemSelected, me)
                });
            }
            return box;
        }
    });


    /**
     * A command source implementation whose commands are specified locally in the page's JavaScript.
     * @constructor
     * @param {Object} cfg The configuration for the command source. Recognized properties:
     *     commands - {Array} An array of Command configuration objects
     */
    function LocalCommandSource(cfg) {
        $.extend(this, cfg, {commands: []});
        this.addCommands(cfg.commands);
    }
    $.extend(LocalCommandSource.prototype, {
        search: function(chars, callback) {
            var me = this,
                matches;

            matches = $.map(me.commands, function(command) {
                return command.isMatch(chars) ? command : null;
            });
            if (matches.length) {
                callback(matches);
            }
        },

        addCommand: function(commandCfg) {
            this.commands.push(new Command(commandCfg));
        },

        addCommands: function(commands) {
            if ($.isArray(commands)) {
                var me = this;
                $.each(commands, function(i, commandCfg) {
                    me.addCommand(commandCfg);
                });
            }
        }
    });


    /**
     * TODO this is incomplete and untested
     * A command source implementation that performs its search by making an ajax request to a given URL.
     * @constructor
     * @param {Object} cfg The configuration for the command source. This will be passed as the settings
     *        argument to the jQuery.ajax() call, and can therefore include all of that object's recognized
     *        properties. In addition, it can contain a 'paramName' property, which specifies the name of the
     *        submitted URL parameter that will contain the search value (defaults to 's'.)
     */
    function AjaxCommandSource(cfg) {
        $.extend(this, cfg);
    }
    $.extend(AjaxCommandSource.prototype, {
        search: function(chars, callback) {
            var me = this,
                ajaxParam = me.paramName || 's',
                ajaxData = me.data || {};

            if ($.isString(ajaxData)) {
                ajaxData += '&' + ajaxParam + '=' + chars;
            } else {
                ajaxData[ajaxParam] = chars;
            }
            me._xhr = $.ajax($.extend({}, me, {
                data: ajaxData,
                success: function(data, status, xhr) {
                    if (xhr === me._xhr) { //only use result if it's the most recent XHR
                        callback(me.processXhrData(data));
                    }
                }
            }));
        },

        processXhrData: function(data) {
            return data.commands;
        }
    });


    /**
     * Mapping of command source 'type' names to their corresponding implementations. New implementation
     * types can be registered by adding them to this mapping. Command source implementations are classes
     * with only one required method: a 'search' method with the following two arguments:
     *     chars - {String} The characters entered by the user which are being used as the search term
     *     callback - {Function} A function that will be called when the search is completed. It will be
     *         passed a single argument, an array of Command objects. If the search resulted in no matches,
     *         the array will be non-null but empty.
     */
    var CommandSources = {
        local: LocalCommandSource,
        ajax: AjaxCommandSource
    };



    /**
     * @class Command
     * Models a single command that can be searched for and selected in the QuickBar.
     * @constructor
     * @param {Object} cfg The configuration for this command. The properties of this object will be copied
     * directly onto the instance, overriding any existing properties of the same name (including methods,
     * allowing the implementation to be customized per instance.) The more useful properties are:
     *     name - {String} The name of the command. This is what gets displayed in the selection list, and
     *         is used in pattern matching against the user's entered characters.
     *
     *     aliases - {Array} An optional set of additional names which will not be displayed, but will be
     *         used in addition to the name in pattern matching.
     *
     *     regexp - {RegExp} An optional regular expression which will be applied against the user's entered
     *         search characters to determine if this command is a match.
     *
     *     icon - {String} An optional icon image to be displayed alongside the command's name.
     *
     *     arg - {Boolean|String} Whether or not the command requires the user to enter an additional argument
     *         for its execution, e.g. the search term for a web search. If a String is supplied, then that
     *         will be used as an informative label for the argument's input field.
     *
     *     action - {Object|Function} Defines the action to be performed when the command is executed. By
     *         default this supports two action types: a JavaScript function to be called, or a redirect URL.
     *
     *         // Function action - the function will be passed the user-entered arg if it exists.
     *         action: { type: 'fn', fn: function(arg) { ... } }
     *
     *         // The above may also be shortened to just a single function object:
     *         action: function(arg) { ... }
     *
     *         // URL action - the {arg} token in the URL will be replaced with the user-entered arg if it exists.
     *         action: { type: 'url', url: 'http://the.url.to/go/to/with/{arg}' }
     */
    function Command(cfg) {
        $.extend(this, cfg);
        this._matchCache = {};
    }
    Command._reCache = {};
    $.extend(Command.prototype, {
        /**
         * Determine whether this command is a match for the given input string. Caches the result.
         * @param {String} chars The string to match against.
         */
        isMatch: function(chars) {
            var me = this,
                cache = me._matchCache;
            if (!(chars in cache)) {
                cache[chars] = this.test(chars);
            }
            return cache[chars];
        },

        /**
         * Determine whether this command is a match for the given input string. The default implementation
         * performs the following checks:
         *     1) Tests the command's name and any aliases against the input string, allowing for matching by
         *        direct substring or by camel-cased word beginnings, e.g. 'gTU' will match 'Go To URL'.
         *     2) If a regexp was configured, then it is tested against the input string.
         * @param {String} chars The string to match against.
         */
        test: function(chars) {
            var me = this,
                re = me.getRE(chars),
                names = (me.aliases || []).concat(me.name),
                i, len;

            // Test names and aliases
            for(i = 0, len = names.length; i < len; i++) {
                if (re.test(names[i])) {
                    return true;
                }
            }

            // Test custom regular expression
            re = me.regexp;
            if (re && re.test(chars)) {
                return true;
            }

            return false;
        },

        /**
         * Generate a regular expression from the user's input characters, for use in matching against
         * the configured name and aliases. Handles matching camel-cased input against word beginnings.
         * @param chars
         */
        getRE: function(chars) {
            var cache = Command._reCache,
                re = cache[chars],
                frag;
            if (!re) {
                re = ['\\b'];
                while (frag = chars.match(/^[A-Za-z][^A-Z\s]*/)) {
                    frag = frag[0];
                    re.push(frag + '[a-z]*\\s*');
                    chars = chars.substring(frag.length).replace(/^\s+/, '');
                }
                re = new RegExp(re.join(''), 'i');
            }
            return re;
        },

        /**
         * Executes this command's configured action.
         * @param {String} arg An optional argument to the action.
         */
        exec: function(arg) {
            var actionCfg = this.action;
            // Special case standalone function action to 'fn' type
            if ($.isFunction(actionCfg)) {
                actionCfg = {
                    type: 'fn',
                    fn: actionCfg
                };
            }
            Command.Actions[actionCfg.type](actionCfg, arg);
        }
    });


    /**
     * The supported command action types. Each action type implementation is passed its configuration
     * object when executed, plus the user's supplied argument if the command requires it.
     */
    Command.Actions = {
        fn: function(cfg, arg) {
            cfg.fn(arg);
        },
        url: function(cfg, arg) {
            var url = cfg.url, undef;
            location.href = (url === undef ? url : url.replace(/\{arg\}/g, arg));
        }
    };



    // Expose jQuery.quickBar entry point
    $.quickBar = function(cfg) {
        return new QuickBar(cfg);
    };

    // Add the internal classes/objects as properties of the $.quickBar function, so they can be used
    // and/or modified by external code.
    $.extend($.quickBar, {
        QuickBar: QuickBar,
        CommandSources: CommandSources,
        Command: Command
    });


})(jQuery);
