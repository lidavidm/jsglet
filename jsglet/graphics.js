jsglet.graphics = (function() {
    var _VERTEX_SHADER = "x-shader/x-vertex";
    var _FRAGMENT_SHADER = "x-shader/x-fragment";

    var module = {
        Shader: Class.$extend({
            __init__: function (p_type, p_source, p_context) {
                if (p_type == _VERTEX_SHADER) {
                    var shaderType = p_context.VERTEX_SHADER;
                }
                else if (p_type == _FRAGMENT_SHADER) {
                    var shaderType = p_context.FRAGMENT_SHADER;
                }
                else {
                    console.error("Shader type " + p_type + " not known!");
                    return;
                }

                var shader = p_context.createShader(shaderType);
                p_context.shaderSource(shader, p_source);
                p_context.compileShader(shader);

                var compiled = p_context.getShaderParameter(
                    shader,
                    p_context.COMPILE_STATUS
                );
                if(!compiled && !p_context.isContextLost()) {
                    var error = p_context.getShaderInfoLog(shader);
                    console.error("Error loading shader: " + error);
                    p_context.deleteShader(shader);
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
                    console.error("context: Program: error linking program; " + error);
                    this.gl.deleteProgram(program);
                    _.map(function(s){ this.gl.deleteProgram(s._shader) },
                          this.shaders);
                    return null;
                }

                this.gl.useProgram(this.program);
            }
        }),

        /**

           In OpenGL ES/WebGL there are no vertex buffer objects, simply
           buffer objects. Also, there are not separate functions for
           uploading different types of data; instead, you simply bind the
           data to the correct shader input parameter. This library needs a
           convention for the usage of the parameters/attributes.

         */
        createAttribute: function(p_attribute) {
        },

        /**
           Parses an attribute/usage pair for a buffer object.

           @example createAttributeUsagePair('v2i') = vertices, 2 integers

           @example createAttributeUsagePair('c3f/static') = color, 3 floats, static

         */
        createAttributeUsagePair: function(p_format) {
        },

        VertexDomain: Class.$extend({
            __init__: function(p_attributeUsages) {
                for (var i = 0; i < p_attributeUsages.length; i++) {
                    var attributeUsage = p_attributeUsages[i];
                    this.buffers[attributeUsage.attribute] = module.VBO(
                        gl,
                        size,
                        attributeUsage.attribute,
                        attributeUsage.usage
                    );
                }
            }
        }),

        Batch: Class.$extend({}),

        VBO: Class.$extend({
            __init__: function(gl, size, target, usage) {
                this.size = size;
                this.target = target;
                this.usage = usage;
            }
        }),

        Renderer: Class.$extend({
            __init__: function(p_context) {
                this.gl = p_context.gl;
                this.program = new module.Program(
                    this.gl,
                    [ "vNormal", "vColor", "vPosition"]);
                // XXX above data needed for buffer objects - associates
                // vertex attribute indices with shader variable names
            }
        })
    };
    return module;
}());
