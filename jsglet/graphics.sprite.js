jsglet.graphics.sprite = (function(){
    var module = {
        Sprite: Class.$extend({
            __init__: function(gl, p_config) {
                this._x = 0;
            },

            x: jsglet.property("x", {
                get: "default",
                set: function(p_x) {
                    this._x = p_x;
                }
            })
        })
    };

    return module;
}());
