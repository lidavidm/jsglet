jsglet.clock = (function(){
    var _defaultClock = null;

    var module = {
        Clock: Class.$extend({
            __init__: function() {
                this.everyFrame = {};
                this.interval = {};
                this.justOnce = {};
                this.lastID = 0;
                this.lastTime = Date.now();
            },

            tick: function(p_timestamp) {
                _.each(_.values(this.everyFrame), function(f) { f() });

                var callbacks = _.values(this.interval);
                for (var i = 0; i < callbacks.length; i++) {
                    var callback = callbacks[i];

                    if ((p_timestamp - callback.lastRun) >= callback.interval) {
                        callback.callback();
                        callback.lastRun = p_timestamp;
                    }
                }

                for (var runOnceID in this.justOnce) {
                    var callback = this.justOnce[runOnceID];
                    if ((p_timestamp - callback.lastRun) >= callback.interval) {
                        callback.callback();
                        delete this.justOnce[runOnceID];
                    }
                }
            },

            schedule: function(p_callback, p_context) {
                if (undefined != p_context) {
                    var callback = function() {
                        p_callback.apply(p_context);
                    }
                }
                else {
                    var callback = p_callback;
                }

                this.everyFrame[this.lastID] = callback;
                this.lastID += 1;
                return this.lastID - 1;
            },

            scheduleInterval: function(p_callback, p_interval, p_context) {
                if (undefined != p_context) {
                    var callback = function() {
                        p_callback.apply(p_context);
                    }
                }
                else {
                    var callback = p_callback;
                }

                this.interval[this.lastID] = {
                    interval: p_interval,
                    callback: callback,
                    lastRun: Date.now()
                };
                this.lastID += 1;
                return this.lastID - 1;
            },

            scheduleOnce: function(p_callback, p_delay, p_context) {
                if (undefined != p_context) {
                    var callback = function() {
                        p_callback.apply(p_context);
                    }
                }
                else {
                    var callback = p_callback;
                }

                this.justOnce[this.lastID] = {
                    interval: p_delay,
                    lastRun: this.lastTime,
                    callback: callback
                };
                this.lastID += 1;
                return this.lastID - 1;
            },

            unschedule: function(p_callbackID) {
                if (this.interval.hasOwnProperty(p_callbackID)) {
                    delete this.interval[p_callbackID];
                    return true;
                }

                if (this.everyFrame.hasOwnProperty(p_callbackID)) {
                    delete this.everyFrame[p_callbackID];
                    return true;
                }

                if (this.justOnce.hasOwnProperty(p_callbackID)) {
                    delete this.justOnce[p_callbackID];
                    return true;
                }

                return false;
            }
        }),

        getDefaultClock: function() {
            if (_defaultClock === null) {
                _defaultClock = new module.Clock();
            }
            return _defaultClock;
        },

        schedule: function(p_callback, p_context) {
            return module.getDefaultClock().schedule(p_callback, p_context);
        },

        scheduleInterval: function(p_callback, p_interval, p_context) {
            return module.getDefaultClock().scheduleInterval(p_callback, p_interval, p_context);
        },

        scheduleOnce: function(p_callback, p_delay, p_context) {
            return module.getDefaultClock().scheduleOnce(p_callback, p_delay, p_context);
        },

        unschedule: function(p_callbackID) {
            return module.getDefaultClock().unschedule(p_callbackID);
        },
    };

    return module;
}());
