define(["./common", "./graphics", "./event"], function(common, graphics, event) {

    var Texture2D = Class.$extend({
        __init__: function(p_uniformLocation, p_browserImage) {
            this.gl = common.gl;
            var gl = common.gl;
            this._texture = gl.createTexture();
            this._textureHandle = p_uniformLocation;

            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            gl.bindTexture(gl.TEXTURE_2D, this._texture);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
                          p_browserImage);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);

            this._group = null;
            this._name = p_browserImage.src;
        },

        getTexture: function() {
            return this;
        },

        getGroup: function(p_new) {
            if (p_new) {
                return new graphics.TextureGroup(this);
            }
            if (this._group == null) {
                this._group = new graphics.TextureGroup(this);
            }
            return this._group;
        },

        getTexCoords: function() {
            return [[1, 1], [0, 1], [0, 0], [1, 0]];
        },

        bind: function() {
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
            this.gl.uniform1i(this._textureHandle, 0);
        },

        __repr__: function() {
            return "Texture2D " + this._name;
        }
    });

    var TextureView = Texture2D.$extend({
        __init__: function(p_texture, p_texcoords) {
            this._texture = p_texture;
            this._texcoords = p_texcoords;
        },

        getTexture: function() {
            return this._texture;
        },

        getGroup: function(p_new) {
            return this._texture.getGroup(p_new);
        },

        getTexCoords: function() {
            return this._texcoords;
        },

        bind: function() {
            this._texture.bind();
        },

        __repr__: function() {
            return "TextureView " + this._texture._name;
        }
    });

    var TextureGrid = Texture2D.$extend({
        __init__: function(
            p_uniformLocation, p_browserImage,
            p_rows, p_columns
        ) {
            this.$super(p_uniformLocation, p_browserImage);
            this._rows = p_rows;
            this._columns = p_columns;
            this._width = p_browserImage.width;
            this._height = p_browserImage.height;
            this._tileW = Math.floor(this._width / this._columns);
            this._tileH = Math.floor(this._height / this._rows);
        },

        getRegion: function(p_x, p_y) {
            /// TODO cache these views
            var x = (1 + p_x) / this._columns;
            var y = (1 + p_y) / this._rows;
            var w = 1 / this._columns;
            var h = 1 / this._rows;
            return new TextureView(this, [
                [x - w, y - h],
                [x, y - h],
                [x, y],
                [x - w, y]
            ]);
        },

        __repr__: function() {
            return "TextureGrid " + this._rows + " by " + this._columns + this._texture._name;
        }
    });

    var Animation = Class.$extend({
        __include__: [
            event.EventDispatcherMixin("frameChange")
        ],

        __init__: function(p_tgrid) {
            this.initEvent();
            this._tgrid = p_tgrid;
            this._x = 0;
            this._y = 0;
            this._maxX = p_tgrid._columns;
            this._maxY = p_tgrid._rows;
        },

        next: function() {
            this._x += 1;
            if (this._x >= this._maxX) {
                this._x = 0;
                this._y += 1;
            }
            if (this._y >= this._maxY) {
                this._y = 0;
            }
            this.doFrameChange();
        },

        prev: function() {
            this._x -= 1;
            if (this._x <= 0) {
                this._x = this._maxX - 1;
                this._y -= 1;
            }
            if (this._y <= 0) {
                this._y = this._maxY - 1;
            }
            this.doFrameChange();
        },

        reset: function() {
            this._x = 0;
            this._y = 0;
            this.doFrameChange();
        },

        current: function() {
            return this._tgrid.getRegion(this._x, this._y);
        }
    });

    var loader = function(p_ctor) {
        return function(p_uniformLocation, p_src) {
            var image = new Image();
            var deferred = new $.Deferred();
            var args =  _.toArray(arguments);
            image.onload = function() {
                args[1] = image;
                var texture = p_ctor.apply(null, args);
                deferred.resolve(texture);
            }
            image.src = p_src;
            return deferred.promise();
        }
    }

    return {
        Texture2D: Texture2D,
        TextureView: TextureView,
        TextureGrid: TextureGrid,
        Animation: Animation,

        load: loader(function(p_uniformLocation, p_image) {
            return new Texture2D(p_uniformLocation, p_image);
        }),

        loadGrid: loader(function(p_uL, p_image, p_rows, p_cols) {
            return new TextureGrid(p_uL, p_image, p_rows, p_cols);
        })
    }
});
