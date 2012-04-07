define(["./common", "./graphics"], function(common, graphics) {

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

        getGroup: function() {
            if (this._group == null) {
                this._group = new graphics.TextureGroup(this);
            }
            return this._group;
        },

        getTexCoords: function() {
            return [[0, 0], [1,0], [1, 1], [0, 1]];
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

        getGroup: function() {
            return this._texture.getGroup();
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
            var x = (1 + p_x) / this._columns;
            var y = (1 + p_y) / this._rows;
            return new TextureView(this, [
                [0, 0],
                [x, 0],
                [x, y],
                [0, y]
            ]);
        },

        __repr__: function() {
            return "TextureGrid " + this._rows + " by " + this._columns + this._texture._name;
        }
    });

    var Animation = Class.$extend({
        /**
           @constructor
           @param {Animation|Texture2D[]} p_sequence An animation or
           sequence of textures to use as the animation.
         */
        __init__: function(p_sequence) {
        }
    });

    var loader = function(p_ctor) {
        return function(p_uniformLocation, p_src) {
            var image = new Image();
            var deferred = new $.Deferred();
            var args =  _.toArray(arguments);
            image.onload = function() {
                args[1] = image;
                console.log(args)
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
