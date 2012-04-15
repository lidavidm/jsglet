define(["./event"], function() {
    var module = {
        KeyStateManager: Class.$extend({
            __init__: function() {
                this._keyState = {};
                this._intercept = [];
            },

            isDown: function(p_keyCode) {
                return this._keyState[p_keyCode];
            },

            intercept: function() {
                this._intercept = this._intercept.concat(
                    _.flatten(_.toArray(arguments))
                );
            },

            onKeyUp: function(p_event) {
                this._keyState[p_event.keyCode] = false;
                if (_.contains(this._intercept, p_event.keyCode)) {
                    p_event.preventDefault();
                }
            },

            onKeyDown: function(p_event) {
                this._keyState[p_event.keyCode] = true;
                if (_.contains(this._intercept, p_event.keyCode)) {
                    p_event.preventDefault();
                }
            }
        }),

        KeyCode: {
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40
        }
    };

    return module;
});
