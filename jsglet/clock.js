define(["./common"], function(common) {
    var _defaultClock = null;

    var module = {
        Clock: Class.$extend({
            __init__: function() {
                this.everyFrame = {};
                this.interval = {};
                this.justOnce = {};
                this.lastId = 0;
                this.lastTime = Date.now();
                this.fpsTime = Date.now();
                this.fps = [];
            },

            getFps: function() {
                return 1000 * (this.fps.length / (_.last(this.fps) - this.fpsTime));
            },

            tick: function(p_timestamp) {
                this.fps.push(p_timestamp);
                if ((p_timestamp - this.fpsTime) > 1000) {
                    var newTimes = _.filter(
                        this.fps,
                        function(t) {
                            return (t >= (p_timestamp - 1000));
                        });
                    this.fpsTime = this.fps[this.fps.length - newTimes.length];
                    this.fps = newTimes;
                }

                _.each(_.values(this.everyFrame), function(f) { f() });

                var callbacks = _.values(this.interval);
                for (var i = 0; i < callbacks.length; i++) {
                    var callback = callbacks[i];

                    if ((p_timestamp - callback.lastRun) >= callback.interval) {
                        callback.callback();
                        callback.lastRun = p_timestamp;
                    }
                }

                for (var runOnceId in this.justOnce) {
                    var callback = this.justOnce[runOnceId];
                    if ((p_timestamp - callback.lastRun) >= callback.interval) {
                        callback.callback();
                        delete this.justOnce[runOnceId];
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

                this.everyFrame[this.lastId] = callback;
                this.lastId += 1;
                return this.lastId - 1;
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

                this.interval[this.lastId] = {
                    interval: p_interval,
                    callback: callback,
                    lastRun: Date.now()
                };
                this.lastId += 1;
                return this.lastId - 1;
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

                this.justOnce[this.lastId] = {
                    interval: p_delay,
                    lastRun: this.lastTime,
                    callback: callback
                };
                this.lastId += 1;
                return this.lastId - 1;
            },

            unschedule: function(p_callbackId) {
                if (this.interval.hasOwnProperty(p_callbackId)) {
                    delete this.interval[p_callbackId];
                    return true;
                }

                if (this.everyFrame.hasOwnProperty(p_callbackId)) {
                    delete this.everyFrame[p_callbackId];
                    return true;
                }

                if (this.justOnce.hasOwnProperty(p_callbackId)) {
                    delete this.justOnce[p_callbackId];
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

        unschedule: function(p_callbackId) {
            return module.getDefaultClock().unschedule(p_callbackId);
        },
    };

    return module;
});
