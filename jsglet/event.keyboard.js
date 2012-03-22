jsglet.event.keyboard = module('jsglet.event.keyboard', ['jsglet.event'], function() {
    var module = {
        KeyStateManager: Class.$extend({
            __init__: function() {

            }
        }),

        KeyCode: {
            UP: 38,
            DOWN: 40
        }
    };

    return module;
});
