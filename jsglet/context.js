jsglet.context = (function() {
    var module = {
        Context: Class.$extend({
            __init__: function(p_canvas) {
                this._canvas = p_canvas;
                this._context = this.gl = p_canvas.getContext('experimental-webgl');
                this.width = this._canvas.getAttribute("width");
                this.height = this._canvas.getAttribute("height");
                this.program = new module.Program(this.gl, [ "vNormal", "vColor", "vPosition"]);
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
        }),

        Program: Class.$extend({
            __init__: function(gl, p_attribs) {
                this.gl = gl;
                this.program = gl.createProgram();
                this.shaders = [];
                this.attribs = p_attribs;
            },

            attachShader: function(p_shader) {
                this.gl.attachShader(this.program, p_shader._shader);
                this.shaders.push(p_shader);
            },

            link: function() {
                for (var i = 0; i < this.attribs.length; i++){
                    this.gl.bindAttribLocation(this.program, i, this.attribs[i]);
                }
                this.gl.linkProgram(this.program);
                var linked = this.gl.getProgramParameter(
                    this.program, this.gl.LINK_STATUS);
                if (!linked && !this.gl.isContextLost()) {
                    var error = this.gl.getProgramInfoLog(this.program);
                    this.gl.deleteProgram(program);
                    _.map(function(s){ this.gl.deleteProgram(s._shader) },
                          this.shaders);
                    throw new jsglet.error(
                        "context: Program: error linking program", error);
                }

                this.gl.useProgram(this.program);
            }
        })
    };
    return module;
}());
