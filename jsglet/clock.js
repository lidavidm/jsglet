jsglet.clock = (function(){
    var _defaultClock = null;

    var module = {
        Clock: Class.$extend({
            __init__: function() {
            },

            tick: function(p_timestamp) {
            }
        }),

        getDefaultClock: function() {
            if (_defaultClock === null) {
                _defaultClock = new module.Clock();
            }
            return _defaultClock;
        }
    };

    return module;
}());
