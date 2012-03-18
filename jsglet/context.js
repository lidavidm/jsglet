jsglet.context = (function() {
    var module = {
        Context: Class.$extend({
            __init__: function(p_canvas) {
                this._canvas = p_canvas;
                this._context = this.gl = p_canvas.getContext('experimental-webgl');
                this.width = parseInt(this._canvas.getAttribute("width"), 10);
                this.height = parseInt(this._canvas.getAttribute("height"), 10);
                this.program = new jsglet.graphics.Program(this.gl, {
                    "a_Color": module.AttribRole.COLOR,
                    "a_Position": module.AttribRole.VERTEX
                });
                this.gl.clearColor(0, 0, 0, 1);
            },

            loadShader: function (p_shaderId) {
                var shaderEl = document.getElementById(p_shaderId);
                if (!shaderEl) {
                    throw new jsglet.error("shader: loadShader: Shader element",
                                           p_shaderId, "not found!");
                }
                return new jsglet.graphics.Shader(this.gl, shaderEl.type,
                                                  shaderEl.text);
            }
        }),

        Camera: Class.$extend({
            __init__: function(p_context, p_uniformLocation) {
                this.gl = p_context.gl;
                this.matrixUniformLocation = p_context.program.getUniformLocation(p_uniformLocation);

                this.left = 0;
                this.right = p_context.width;
                this.bottom = 0;
                this.top = p_context.height;
                this.near = 1.0;
                this.far = 10.0;

                this.eye = vec3.create([0, 0, 2]);
                this.eye[0] = 0;
                this.eye[1] = 0;
                this.eye[2] = 2;

                this.center = vec3.create([0, 0, -5]);

                this.up = vec3.create([0, 1, 0]);

                this.modelMatrix = mat4.create();
                mat4.identity(this.modelMatrix);

                this._projection = mat4.create();
                this._view = mat4.create();
            },

            makeProjectionMatrix: function() {
                mat4.ortho(this.left, this.right, this.bottom, this.top,
                           this.near, this.far, this._projection);
                return this._projection;
            },

            makeViewMatrix: function() {
                mat4.lookAt(this.eye, this.center, this.up, this._view);
                return this._view;
            },

            makeModelViewMatrix: function() {
                var result = mat4.create();
                mat4.multiply(this.makeViewMatrix(), this.modelMatrix, result);
                return result;
            },

            makeModelViewProjectionMatrix: function() {
                var result = mat4.create();
                mat4.multiply(this.makeProjectionMatrix(),
                              this.makeModelViewMatrix(), result);
                return result;
            },

            eyeAt: function(x, y, z) {
                this.eye[0] = x;
                this.eye[1] = y;
                this.eye[2] = z;
            }
        })
    };
    return module;
}());
