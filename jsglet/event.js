define(["./common"], function(common) {
    var module = {
        EventDispatcherMixin: function() {
            var args = Array.prototype.slice.call(arguments);
            var mixin = {
                initEvent: function() {
                    this.__eventHandlers = {};
                },

                addListener: function(event, callback) {
                    if (!this.__eventHandlers.hasOwnProperty(event)) {
                        this.__eventHandlers[event] = [];
                    }
                    this.__eventHandlers[event].push(callback);
                },

                // XXX follow the JS convention of listener IDs?
                removeListener: function(event, callback) {
                },

                triggerListener: function(event, args) {
                    var listeners = this.__eventHandlers[event];
                    if (undefined === listeners) return;
                    for (var i = 0; i < listeners.length; i++) {
                        if (event == "keyUp") a_ = listeners[0];
                        listeners[i].apply(listeners[i], args);
                    }
                },

                // To implement stacks we create a wrapper function that calls
                // all the functions in the stack level, and keep the stack
                // separately
                pushListeners: function() {
                    // Search each parameter for listeners
                    var objects = Array.prototype.slice.call(arguments);
                    var listeners = {};

                    for (var i = 0; i < objects.length; i++) {
                        for (var propName in objects[i]) {
                            // we want to search superclasses too
                            var prefix = propName.substring(0, 2);
                            var suffix = propName.substring(2);
                            suffix = common.util.uncapitalize(suffix);
                            if (prefix == "on" && _.include(args, suffix)) {
                                if (!_.has(listeners, suffix)) {
                                    listeners[suffix] = [];
                                }
                                listeners[suffix].push([
                                    objects[i],objects[i][propName]
                                ]);
                            }
                        }
                    }

                    var events = _.keys(listeners);

                    for (var i = 0; i < events.length; i++) {
                        var event = events[i];
                        var eventListeners = listeners[event];

                        var __stackLevel = function() {
                            var args = arguments;
                            _.each(this.__listeners, function(p_data) {
                                // each p_data is [object, function]
                                p_data[1].apply(p_data[0], args);
                            });
                        }

                        __stackLevel.__listeners = eventListeners;
                        __stackLevel.__event = event;

                        this.addListener(event, __stackLevel);
                    }
                }
            };

            for (var i = 0; i < args.length; i++) {
                var eventName = args[i];
                var eventNameC = common.util.capitalize(eventName);
                mixin["on" + eventNameC] = (function() {
                    var _eventName = eventName;
                    return function(p_callback) {
                        this.addListener(_eventName, p_callback);
                    }
                }());
                mixin["do" + eventNameC] = (function() {
                    var _eventName = eventName;
                    return function() {
                        var args = Array.prototype.slice.call(arguments);
                        this.triggerListener(_eventName, args);
                    }
                }());
            }

            return mixin;
        }
    };

    return module;
});
