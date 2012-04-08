define(["./common", "./graphics", "./image"], function(common, graphics, image) {
    var module = {
        Sprite: Class.$extend({
            __init__: function(p_texture, p_config) {
                if (p_texture instanceof image.Animation) {
                    this._animation = p_texture;
                    this._texture = p_texture.current();
                    this._animation.onFrameChange(common.proxy(function() {
                        this._texture = this._animation.current();
                        var tCoords = this._texture.getTexCoords();
                        this._buffer.updateTexture(new Float32Array(_.flatten([
                            tCoords[0],
                            tCoords[1],
                            tCoords[2],
                            tCoords[0],
                            tCoords[3]
                        ])));
                    }, this));
                }
                else {
                    this._texture = p_texture;
                }
                this._x = 0;
                this._y = 0;
                this._width = 1;
                this._height = 1;
                this.gl = common.gl;

                var tCoords = this._texture.getTexCoords();

                var vertexData = [
                    ['v2f', new Float32Array([
                        this._x, this._y,
                        this._x + this._width, this._y,
                        this._x + this._width, this._y + this._height,
                        this._x, this._y,
                        this._x, this._y + this._height])],
                    ['t2f', new Float32Array(_.flatten([
                         tCoords[0],
                         tCoords[1],
                         tCoords[2],
                         tCoords[0],
                         tCoords[3]
                     ]))]
                ];

                if (_.has(p_config, 'batch')) {
                    var group = this._texture.getGroup();

                    if (_.has(p_config, 'group')) {
                        group = this._texture.getGroup(true);
                        group.parent = p_config['group'];
                    }

                    this._buffer = p_config.batch.add(
                        this.gl.TRIANGLE_STRIP,
                        vertexData,
                        group
                    );
                }
                else {
                    this._buffer = graphics.buffer(
                        this.gl.TRIANGLE_STRIP, vertexData
                    );
                }
            },

            draw: function() {
                this._texture.bind();
                this._buffer.draw();
            },

            del: function() {
                this._buffer.del();
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
