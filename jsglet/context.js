define(
    ["./common", "./event", "./app", "./graphics"],
    function(common, event, app, graphics) {
    var module = {
        Context: Class.$extend({
            __include__: [
                event.EventDispatcherMixin(
                    "draw", "keyUp", "keyDown", "mouseDown", "mouseUp"
                )
            ],

            __init__: function(p_canvas) {
                this.initEvent();
                this._canvas = p_canvas;
                this._context = this.gl = p_canvas.getContext('experimental-webgl', {
                    premultipliedAlpha: false,
                    alpha: false
                });
                common.gl = this.gl;
                this.width = parseInt(this._canvas.getAttribute("width"), 10);
                this.height = parseInt(this._canvas.getAttribute("height"), 10);
                this.program = new graphics.CompositeProgram(this.gl);
                this.gl.clearColor(0, 0, 0, 1);
                app.addContext(this);

                // Event handling
                $(this._canvas).on({
                    mousedown: common.proxy(function(e) {
                        this.doMouseDown(e);
                    }, this),

                    mouseup: common.proxy(function(e) {
                        this.doMouseUp(e);
                    }, this)
                });
                $(window).on({
                    keydown: common.proxy(function(e) {
                        this.doKeyDown(e);
                    }, this),

                    keyup: common.proxy(function(e) {
                        this.doKeyUp(e);
                    }, this)
                });
            }
        }),

        Camera: Class.$extend({
            __init__: function(p_context) {
                this.gl = p_context.gl;
                this.matrixHandle = p_context.program.mvpUniform();

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
                this._modelMatrixStack = [];

                this._projection = mat4.create();
                this._view = mat4.create();
                this.updateProjectionMatrix();
                this.updateViewMatrix();
            },

            updateProjectionMatrix: function() {
                mat4.ortho(this.left, this.right, this.bottom, this.top,
                           this.near, this.far, this._projection);
            },

            updateViewMatrix: function() {
                mat4.lookAt(this.eye, this.center, this.up, this._view);
            },

            makeModelViewMatrix: function() {
                var result = mat4.create();
                mat4.multiply(this._view, this.modelMatrix, result);
                return result;
            },

            makeModelViewProjectionMatrix: function() {
                var result = mat4.create();
                mat4.multiply(this._projection,
                              this.makeModelViewMatrix(), result);
                return result;
            },

            apply: function() {
                this.gl.uniformMatrix4fv(this.matrixHandle, false,
                                         this.makeModelViewProjectionMatrix());
            },

            pushModel: function() {
                this._modelMatrixStack.push(this.modelMatrix);
            },

            popModel: function() {
                this.modelMatrix = this._modelMatrixStack.pop();
                if (!this.modelMatrix) {
                    throw new common.error("Model matrix stack underflow");
                }
            },

            identityModel: function() {
                mat4.identity(this.modelMatrix);
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
});
