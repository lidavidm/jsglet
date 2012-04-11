define(["./common"], function(common) {
    var _VERTEX_SHADER = "x-shader/x-vertex";
    var _FRAGMENT_SHADER = "x-shader/x-fragment";

    var Group = Class.$extend({
        __init__: function(p_parent) {
            this.parent = p_parent || null;
        },

        __repr__: function() {
            return "Group";
        },

        set: function() {
        },

        unset: function() {
        }
    });

    var NullGroup = Group.$extend({
        __repr__: function() {
            return "NullGroup";
        }
    });

    var OrderedGroup = Group.$extend({
        __init__: function(p_order, p_parent) {
            this.$super(p_parent);
            this.order = p_order;
        },

        __repr__: function() {
            return "OrderedGroup " + this.order;
        }
    });

    var TextureGroup = Group.$extend({
        __init__: function(p_texture, p_parent) {
            this.$super(p_parent);
            this.texture = p_texture;
        },

        set: function() {
            this.texture.bind();
        },

        __repr__: function() {
            return "TextureGroup " + this.texture._name + " parent: " + this.parent;
        }
    });

    var NULL_GROUP = new NullGroup();

    var module = {
        VERTEX_SHADER: _VERTEX_SHADER,

        FRAGMENT_SHADER: _FRAGMENT_SHADER,

        Shader: Class.$extend({
            __init__: function (p_type, p_source) {
                var gl = common.gl;
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
                    gl.deleteShader(shader);
                    throw new common.error(
                        "shader: Error loading shader",
                        p_source,
                        ":",
                        error
                    );
                    return;
                }

                this._shader = shader;
            }
        }),

        Program: Class.$extend({
            __init__: function(p_attribs) {
                var gl = common.gl;
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
                _.each(varNames, function(attribute) {
                    this.gl.bindAttribLocation(
                        this.program,
                        this.attribs[attribute], attribute
                    );
                }, this);
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
            },

            uniformLocation: function(p_uniformName) {
                return this.gl.getUniformLocation(this.program, p_uniformName);
            },

            // Special-case attributes and uniforms

            mvpUniform: common.property("mvpUniform", {
                get: function() {
                    return this.uniformLocation(this._mvpUniform);
                },
                set: "default"
            }),

            textureUniform: common.property("textureUniform", {
                get: function() {
                    return this.uniformLocation(this._textureUniform);
                },
                set: "default"
            })
        }),

        CompositeProgram: Class.$extend({
            __init__: function() {
                this.gl = common.gl;
                this._programs = {};
                this._active = null;
            },

            addProgram: function(p_name, p_program) {
                this._programs[p_name] = p_program;
            },

            useProgram: function(p_name) {
                this.gl.useProgram(this._programs[p_name].program);
                this._active = this._programs[p_name];
            },

            mvpUniform: function() {
                return this._active.mvpUniform();
            },

            textureUniform: function() {
                return this._active.textureUniform();
            }
        }),

        AttribRole: {
            VERTEX: 0,
            COLOR: 1,
            TEXTURE: 2,
            v: "VERTEX",
            c: "COLOR",
            t: "TEXTURE"
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
                throw new common.error("Invalid attribute/usage pair:", p_format);
            }
        },

        MultiBufferObject: Class.$extend({
            __classvars__: {
                BUFFER_USAGE: {
                    "static": "STATIC_DRAW"
                }
            },

            __init__: function(p_renderingMethod) {
                this.gl = common.gl;
                this.bufferObjects = {};
                this.renderingMethod = p_renderingMethod;
                this.count = null;
                this.deleted = false;
            },

            addBuffer: function(p_attribute, p_data) {
                var attribute = module.createAttributeUsagePair(p_attribute);
                var buffer = this.gl.createBuffer();
                var handle = module.AttribRole[attribute.role];

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
                    throw new common.error(
                        "MultiBufferObject: buffer: data",
                        "counts do not match", this.count, count);
                }
                this.count = count;

                var update = "update" + common.util.capitalize(attribute.role.toLowerCase());
                this[update] = function(p_data) {
                    var newCount = p_data.length / attribute.count;
                    if (newCount != this.count) {
                        throw new common.error(
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
            },

            del: function() {
                for (var role in this.bufferObjects) {
                    if (this.bufferObjects.hasOwnProperty(role)) {
                        var data = this.bufferObjects[role];
                        this.gl.deleteBuffer(data.buffer);
                    }
                }
                this.bufferObjects = {};
                this.deleted = true;
            },

            __repr__: function() {
                return "MultiBufferObject" + this.$objectId;
            }
        }),

        Batch: Class.$extend({
            __init__: function() {
                this._mbos = [];
                this._groups = [];
                this._groups_top = [];
                this._group_children = {};
                this._group_buffers = {};
            },

            add: function(p_renderingMethod, p_buffers, p_group) {
                var buffer = module.buffer(p_renderingMethod, p_buffers);
                this._mbos.push(buffer);
                var group = this._addGroup(p_group);
                if (!_.include(_.keys(this._group_buffers), group.toString())) {
                    this._group_buffers[group] = [];
                }

                this._group_buffers[group].push(buffer);
                return buffer;
            },

            draw: function() {
                _.each(this._draw_list, function(f) { f(); });
            },

            build: function() {
                var visit = function(group) {
                    var buffers = this._group_buffers[group] || [];
                    var drawCalls = _.reject(_.map(
                        buffers,
                        common.proxy(function(bo, index) {
                            if (!bo.deleted) {
                                return function() {
                                    bo.draw();
                                };
                            }
                            else {
                                delete this._mbos[_.indexOf(this._mbos, bo)];
                                delete this._group_buffers[group][index];
                            }
                        }, this)
                    ), _.isUndefined);

                    var children = this._group_children[group];

                    if (children) {
                        _.each(children, common.proxy(function(c) {
                            Array.prototype.push.apply(drawCalls, visit.call(this, c));
                        }, this));
                    }
                    var calls = [function() { group.set(); }];
                    Array.prototype.push.apply(calls, drawCalls);
                    calls.push(function() { group.unset(); });
                    return calls;
                };

                this._draw_list = [];
                _.each(this._groups_top, function(g) {
                    Array.prototype.push.apply(this._draw_list, visit.call(this, g));
                }, this);
            },

            _addGroup: function(p_group) {
                if (p_group == null || undefined == p_group) {
                    p_group = NULL_GROUP;
                }
                if (!_.include(this._groups, p_group)) {
                    this._groups.push(p_group);
                    if (p_group.parent == null) {
                        this._groups_top.push(p_group);
                    }
                    else {
                        //this._addGroup(p_group.parent);
                    }
                }
                if (p_group.parent) {
                    if (!_.include(this._groups, p_group.parent)) {
                        this._addGroup(p_group.parent);
                    }
                    if (!_.has(this._group_children, p_group.parent)) {
                        this._group_children[p_group.parent] = [];
                    }
                    this._group_children[p_group.parent].push(p_group);
                }

                return p_group;
            }
        }),

        Group: Group,

        NullGroup: NullGroup,

        OrderedGroup: OrderedGroup,

        TextureGroup: TextureGroup,

        buffer: function(p_renderingMethod, p_buffers) {
            var result = new module.MultiBufferObject(p_renderingMethod);

            _.each(p_buffers, function(buffer) {
                result.addBuffer(buffer[0], buffer[1]);
            });

            return result;
        },

        loadShader: function(url, p_type) {
            var deferred = new $.Deferred();

            $.get(url, common.proxy(function(data){
                var shader = new module.Shader(p_type, data);
                deferred.resolve(shader);
            }, this));

            return deferred.promise();
        }
    };

    return module;
});
