jsglet.context = (function() {
    var module = {
        Context: Class.$extend({
            __init__: function(p_canvas) {
                this._canvas = p_canvas;
                this._context = this.gl = p_canvas.getContext('experimental-webgl');
                this.width = this._canvas.getAttribute("width");
                this.height = this._canvas.getAttribute("height");
                this.renderer = new jsglet.graphics.Renderer(this);
                this.gl.clearColor(0, 0, 0, 1);
            },

            loadShader: function (p_shaderId) {
                var shaderEl = document.getElementById(p_shaderId);
                if (!shaderEl) {
                    throw new jsglet.error("shader: loadShader: Shader element",
                                           p_shaderId, "not found!");
                }
                return new jsglet.graphics.Shader(shaderEl.type,
                                                  shaderEl.text, this._context);
            }
        })
    };
    return module;
}());
