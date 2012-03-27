define(["./common", "./graphics"], function(common, graphics) {
    var module = {
        Sprite: Class.$extend({
            __init__: function(gl, p_texture, p_config) {
                this._texture = p_texture;
                this._x = 0;
                this._y = 0;
                this._width = 1;
                this._height = 1;
                this.gl = gl;
                this._buffer = graphics.buffer(
                    this.gl,
                    this.gl.TRIANGLE_STRIP,
                    [['v2f', new Float32Array([
                        this._x, this._y,
                        this._x + this._width, this._y,
                        this._x + this._width, this._y + this._height,
                        this._x, this._y,
                        this._x, this._y + this._height
                    ])],
                     ['t2f', new Float32Array([
                         0, 0,
                         1, 0,
                         1, 1,
                         0, 0,
                         0, 1
                     ])]]
                );
            },

            draw: function() {
                this._texture.bind();
                this._buffer.draw();
            },

            x: common.property("x", {
                get: "default",
                set: function(p_x) {
                    this._x = p_x;
                    this._updateVertexBuffer();
                }
            }),

            y: common.property("y", {
                get: "default",
                set: function(p_y) {
                    this._y = p_y;
                    this._updateVertexBuffer();
                }
            }),

            position: common.property("position", {
                get: function() {
                    return [this._x, this._y];
                },

                set: function(p_x, p_y) {
                    this._x = p_x;
                    this._y = p_y;
                    this._updateVertexBuffer();
                }
            }),

            positionDelta: function(p_xD, p_yD) {
                this.position(this._x + p_xD, this._y + p_yD);
            },

            width: common.property("width", {
                get: "default",
                set: function(p_width) {
                    this._width = p_width;
                    this._updateVertexBuffer();
                }
            }),

            height: common.property("height", {
                get: "default",
                set: function(p_height) {
                    this._height = p_height;
                    this._updateVertexBuffer();
                }
            }),

            widthDelta: common.propertyDelta("width", true),

            heightDelta: common.propertyDelta("height", true),

            size: common.property("size", {
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
