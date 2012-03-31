define(["./common"], function(common) {

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
        },

        getTexture: function() {
            return this;
        },

        bind: function() {
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
            this.gl.uniform1i(this._textureHandle, 0);
        }
    });

    return {
        Texture2D: Texture2D,

        load: function(p_uniformLocation, p_src) {
            var image = new Image();
            var deferred = new $.Deferred();
            image.onload = function() {
                var texture = new Texture2D(p_uniformLocation, image);
                deferred.resolve(texture);
            }
            image.src = p_src;
            return deferred.promise();
        }
    }
});
