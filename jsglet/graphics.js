jsglet.graphics = (function() {
    var _VERTEX_SHADER = "x-shader/x-vertex";
    var _FRAGMENT_SHADER = "x-shader/x-fragment";

    var module = {
        Shader: Class.$extend({
            __init__: function (gl, p_type, p_source) {
                if (p_type == _VERTEX_SHADER) {
                    var shaderType = gl.VERTEX_SHADER;
                }
                else if (p_type == _FRAGMENT_SHADER) {
                    var shaderType = gl.FRAGMENT_SHADER;
                }
                else {
                    console.error("Shader type " + p_type + " not known!");
                    return;
                }

                var shader = gl.createShader(shaderType);
                gl.shaderSource(shader, p_source);
                gl.compileShader(shader);

                var compiled = gl.getShaderParameter(
                    shader,
                    gl.COMPILE_STATUS
                );
                if(!compiled && !gl.isContextLost()) {
                    var error = gl.getShaderInfoLog(shader);
                    console.error("Error loading shader: " + error);
                    gl.deleteShader(shader);
                    return;
                }
                this._shader = shader;
            }
        }),

        Program: Class.$extend({
            __init__: function(gl, p_attribs) {
                this.gl = gl;
                this.program = gl.createProgram();
                this.shaders = [];
                this.attribs = p_attribs;
                this._mvpUniform = null;
            },

            attachShader: function(p_shader) {
                this.gl.attachShader(this.program, p_shader._shader);
                this.shaders.push(p_shader);
            },

            link: function() {
                var varNames = _.keys(this.attribs);
                this.attribIndices = {};
                for (var i = 0; i < varNames.length; i++){
                    this.gl.bindAttribLocation(this.program, i, varNames[i]);
                    this.attribIndices[this.attribs[varNames[i]]] = i;
                }
                this.gl.linkProgram(this.program);
                var linked = this.gl.getProgramParameter(
                    this.program, this.gl.LINK_STATUS);
                if (!linked && !this.gl.isContextLost()) {
                    var error = this.gl.getProgramInfoLog(this.program);
                    console.error("context: Program: error linking program; " + error);
                    this.gl.deleteProgram(program);
                    _.map(function(s){ this.gl.deleteProgram(s._shader) },
                          this.shaders);
                    return null;
                }

                this.gl.useProgram(this.program);
            },

            attribIndex: function(p_attrib) {
                return this.attribIndices[p_attrib];
            },

            uniformLocation: function(p_uniformName) {
                return this.gl.getUniformLocation(this.program, p_uniformName);
            },

            // Special-case attributes and uniforms

            mvpUniform: jsglet.property("mvpUniform", {
                get: function() {
                    return this.uniformLocation(this._mvpUniform);
                },
                set: "default"
            })
        }),

        AttribRole: {
            VERTEX: "vertex",
            COLOR: "color",
            NORMAL: "normal",
            TEXTURE: "texture",
            v: "vertex",
            c: "color",
            t: "texture"
        },

        // XXX actually look up the GL constants - is there a way to set
        // them w/out the context?
        AttribUsage: {
            STATIC: "static",
            DYNAMIC: "dynamic",
            STREAM: "stream"
        },

        AttribType: {
            f: "FLOAT"
        },

        /**

           This function only accepts 3-character attribute specifications,
           e.g. `c3f` or `v2i`.

           In OpenGL ES/WebGL there are no vertex buffer objects, simply
           buffer objects. Also, there are not separate functions for
           uploading different types of data; instead, you simply bind the
           data to the correct shader input parameter. This library needs a
           convention for the usage of the parameters/attributes.

         */
        createAttribute: function(p_attribute) {
            return {
                role: module.AttribRole[p_attribute.charAt(0)],
                count: parseInt(p_attribute.charAt(1), 10),
                type: module.AttribType[p_attribute.charAt(2)]
            };
        },

        /**
           Parses an attribute/usage pair for a buffer object.

           @example createAttributeUsagePair('v2i') = vertices, 2 integers

           @example createAttributeUsagePair('c3f/static') = color, 3 floats, static

         */
        createAttributeUsagePair: function(p_format) {
            var attributeUsage = p_format.split("/");
            if (attributeUsage.length == 1) {
                var attribute = module.createAttribute(p_format);
                attribute.usage = module.AttribUsage.STATIC;
                return attribute;
            }
            else if (attributeUsage.length == 2) {
                var attribute = module.createAttribute(attributeUsage[0]);
                attribute.usage = module.AttribUsage[
                    attributeUsage[1].toUpperCase()
                ];
                return attribute;
            }
            else {
                throw new jsglet.error("Invalid attribute/usage pair:", p_format);
            }
        },

        Batch: Class.$extend({}),

        MultiBufferObject: Class.$extend({
            __classvars__: {
                BUFFER_USAGE: {
                    "static": "STATIC_DRAW"
                }
            },

            __init__: function(gl, p_attributeIndices, p_renderingMethod) {
                this.gl = gl;
                this.attributeIndices = p_attributeIndices;
                this.bufferObjects = {};
                this.renderingMethod = p_renderingMethod;
                this.count = null;
            },

            addBuffer: function(p_attribute, p_data) {
                var attribute = module.createAttributeUsagePair(p_attribute);
                var buffer = this.gl.createBuffer();
                var handle = this.attributeIndices[attribute.role];

                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, p_data,
                                   this.bufferUsage(attribute.usage));
                this.bufferObjects[attribute.role] = {
                    buffer: buffer,
                    type: this.gl[attribute.type],
                    count: attribute.count,
                    handle: handle
                };

                var count = p_data.length / attribute.count;
                if (this.count !== null && count !== this.count) {
                    throw new jsglet.error(
                        "MultiBufferObject: buffer: data",
                        "counts do not match", this.count, count);
                }
                this.count = count;

                var update = "update" + jsglet.util.capitalize(attribute.role);
                this[update] = function(p_data) {
                    var newCount = p_data.length / attribute.count;
                    if (newCount != this.count) {
                        throw new jsglet.error(
                            "MultiBufferObject: buffer: data",
                            "counts do not match", this.count, newCount);
                    }
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
                    this.gl.bufferData(this.gl.ARRAY_BUFFER, p_data,
                                       this.bufferUsage(attribute.usage));
                };
            },

            draw: function() {
                for (var role in this.bufferObjects) {
                    if (this.bufferObjects.hasOwnProperty(role)) {
                        var data = this.bufferObjects[role];
                        this.gl.enableVertexAttribArray(data.handle);
                        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, data.buffer);
                        this.gl.vertexAttribPointer(
                            data.handle, data.count,
                            data.type, false, 0, 0);
                    }
                }
                this.gl.drawArrays(this.renderingMethod, 0, this.count);
            },

            bufferUsage: function(p_usage) {
                return this.gl[this.$class.BUFFER_USAGE[p_usage]];
            }
        }),

        buffer: function(p_program, p_renderingMethod, p_buffers) {
            var result = new module.MultiBufferObject(
                p_program.gl,
                p_program.attribIndices,
                p_renderingMethod
            );

            _.each(p_buffers, function(buffer) {
                result.addBuffer(buffer[0], buffer[1]);
            });

            return result;
        }
    };
    return module;
}());
