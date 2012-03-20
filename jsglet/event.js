jsglet.event = (function() {
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

                removeListener: function(event, callback) {
                },

                triggerListener: function(event, args) {
                    var listeners = this.__eventHandlers[event];
                    if (undefined === listeners) return;
                    for (var i = 0; i < listeners.length; i++) {
                        listeners[i].apply(null, args);
                    }
                }
            };

            for (var i = 0; i < args.length; i++) {
                var eventName = args[i];
                var eventNameC = jsglet.util.capitalize(eventName);
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
        },

        KeyCode: {
            UP: 38,
            DOWN: 40
        }
    };

    return module;
}());
