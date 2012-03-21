jsglet.graphics.sprite = (function(){
    var module = {
        Sprite: Class.$extend({
            __init__: function(p_program, p_config) {
                this._x = 0;
                this._y = 0;
                this._modelMatrix = mat4.create();
                this.gl = p_program.gl;
                this._buffer = jsglet.graphics.buffer(
                    p_program,
                    this.gl.QUADS,
                    [['v2f', new Float32Array([
                        0, 0,
                        100, 0,
                        100, 100,
                        0, 100
                    ])],
                     ['c3f', new Float32Array([
                         1, 1, 1,
                         1, 1, 1,
                         1, 1, 1,
                         1, 1, 1
                     ])]]
                );
            },

            draw: function() {
                this._buffer.draw();
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
