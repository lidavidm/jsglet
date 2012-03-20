jsglet.context = (function() {
    var module = {
        Context: Class.$extend({
            __include__: [
                jsglet.event.EventDispatcherMixin(
                    "draw", "keyUp", "keyDown", "mouseDown", "mouseUp"
                )
            ],

            __init__: function(p_canvas) {
                this.initEvent();
                this._canvas = p_canvas;
                this._context = this.gl = p_canvas.getContext('experimental-webgl');
                this.width = parseInt(this._canvas.getAttribute("width"), 10);
                this.height = parseInt(this._canvas.getAttribute("height"), 10);
                this.program = new jsglet.graphics.Program(this.gl, {
                    "a_Color": jsglet.graphics.AttribRole.COLOR,
                    "a_Position": jsglet.graphics.AttribRole.VERTEX
                });
                this.gl.clearColor(0, 0, 0, 1);
                jsglet.app.addContext(this);

                // Event handling
                bean.add(this._canvas, {
                    mousedown: jsglet.proxy(function(e) {
                        this.doMouseDown(e);
                    }, this),

                    mouseup: jsglet.proxy(function(e) {
                        this.doMouseUp(e);
                    }, this)
                });

                bean.add(window, {
                    keydown: jsglet.proxy(function(e) {
                        this.doKeyDown(e);
                    }, this),

                    keyup: jsglet.proxy(function(e) {
                        this.doKeyUp(e);
                    }, this)
                });
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
                this.matrixHandle = p_context.program.
                    uniformLocation(p_uniformLocation);

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

            apply: function() {
                this.gl.uniformMatrix4fv(this.matrixHandle, false,
                                         this.makeModelViewProjectionMatrix());
            },

            eyeAt: function(x, y, z) {
                this.eye[0] = x;
                this.eye[1] = y;
                this.eye[2] = z;
            },

            rotateX: function(p_rads) {
                mat4.rotateX(this.modelMatrix, p_rads)
            },

            rotateZ: function(p_rads) {
                mat4.rotateZ(this.modelMatrix, p_rads)
            },

            rotateZAbout: function(p_rads, p_x, p_y) {
                this.translate2D(p_x, p_y);
                this.rotateZ(p_rads);
                this.translate2D(-p_x, -p_y);
            },

            translate2D: function(p_x, p_y) {
                mat4.translate(this.modelMatrix, vec3.create([p_x, p_y, 0]));
            }

        })
    };
    return module;
}());
