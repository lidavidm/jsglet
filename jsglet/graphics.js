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

        VBO: Class.$extend({
        });
    };
    return module;
}());
