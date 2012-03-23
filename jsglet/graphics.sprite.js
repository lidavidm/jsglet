jsglet.graphics.sprite = module('jsglet.graphics.sprite', ['jsglet.graphics'], function(){
    var module = {
        Sprite: Class.$extend({
            __init__: function(gl, p_config) {
                this._x = 0;
                this._y = 0;
                this._width = 1;
                this._height = 1;
                this.gl = gl;
                this._buffer = jsglet.graphics.buffer(
                    this.gl,
                    this.gl.TRIANGLE_STRIP,
                    [['v2f', new Float32Array([
                        this._x, this._y,
                        this._x + this._width, this._y,
                        this._x + this._width, this._y + this._height,
                        this._x, this._y,
                        this._x, this._y + this._height
                    ])],
                     ['c3f', new Float32Array([
                         1, 1, 1,
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
                    this._updateVertexBuffer();
                }
            }),

            y: jsglet.property("y", {
                get: "default",
                set: function(p_y) {
                    this._y = p_y;
                    this._updateVertexBuffer();
                }
            }),

            width: jsglet.property("width", {
                get: "default",
                set: function(p_width) {
                    this._width = p_width;
                    this._updateVertexBuffer();
                }
            }),

            height: jsglet.property("height", {
                get: "default",
                set: function(p_height) {
                    this._height = p_height;
                    this._updateVertexBuffer();
                }
            }),

            widthDelta: jsglet.propertyDelta("width", true),

            heightDelta: jsglet.propertyDelta("height", true),

            size: jsglet.property("size", {
                get: function() {
                    return [this._width, this._height];
                },

                set: function(p_width, p_height) {
                    this._width = p_width;
                    this._height = p_height;
                    this._updateVertexBuffer();
                }
            }),

            sizeDelta: function(p_widthD, p_heightD) {
                this.size(this._width + p_widthD, this._height + p_heightD);
            },

            _updateVertexBuffer: function() {
                this._buffer.updateVertex(new Float32Array([
                    this._x, this._y,
                    this._x + this._width, this._y,
                    this._x + this._width, this._y + this._height,
                    this._x, this._y,
                    this._x, this._y + this._height
                ]));
            }
        })
    };

    return module;
});
