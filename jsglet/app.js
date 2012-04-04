define(["./common", "./clock"], function(common, clock) {
    _defaultEventLoop = null;
    _contexts = [];

    var module = {
        EventLoop: Class.$extend({
            __init__: function() {
                this.requestID = 0;
                this.running = false;
            },

            run: function() {
                this.requestID = this.requestAnimationFrame(this._loop);
                this.running = true;
            },

            exit: function() {
                if (this.requestID != 0) {
                    this.cancelAnimationFrame(this.requestID);
                    this.running = false;
                }
            },

            requestAnimationFrame: function(p_callback) {
                var _requestAnimationFrame = window.requestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.msRequestAnimationFrame;
                var self = this;
                return _requestAnimationFrame(function(p_timestamp) {
                    p_callback.call(self, p_timestamp);
                });
            },

            cancelAnimationFrame: function(p_requestID) {
                var _cancelAnimationFrame = window.cancelAnimationFrame ||
                    window.mozCancelAnimationFrame ||
                    window.webkitCancelAnimationFrame ||
                    window.msCancelAnimationFrame;
                _cancelAnimationFrame.call(window, p_requestID);
            },

            _loop: function(p_timestamp) {
                clock.getDefaultClock().tick(p_timestamp);
                _.each(_contexts, function(c) { c.doDraw(); });
                if (this.running) {
                    this.requestID = this.requestAnimationFrame(this._loop);
                }
            }
        }),

        run: function() {
            if (_defaultEventLoop === null) {
                _defaultEventLoop = new module.EventLoop();
            }

            _defaultEventLoop.run();
        },

        exit: function() {
            _defaultEventLoop.exit();
        },

        addContext: function(p_context) {
            _contexts.push(p_context);
        }
    };

    return module;
});
